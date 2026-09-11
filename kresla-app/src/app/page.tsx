'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Search, MapPin, ArrowRight, Building2, Home, Briefcase, 
  Heart, Star, ShieldCheck, Bed, Bath, Maximize 
} from 'lucide-react';
import { properties as mockProperties } from '@/data/properties';
import { getProperties } from '@/utils/supabase/queries';
import { createClient } from '@/utils/supabase/client';

const formatPrice = (price: number) => {
  return '$' + new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(price);
};

function PropertyCard({ property }: { property: any }) {
  const imageUrl = property.image || property.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800';
  const isVerified = property.isVerified || property.verified;
  const priceType = property.priceType || property.price_type;

  return (
    <Link href={`/properties/${property.id}`} className="block group">
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 flex flex-col h-full">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image src={imageUrl} alt={property.title || 'Property'} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-80" />
          <div className="absolute top-3 w-full px-3 flex justify-between items-start">
            {isVerified ? (
              <div className="bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified
              </div>
            ) : <div />}
            <button className="bg-white/90 p-2 rounded-full shadow-sm hover:bg-white transition-colors" onClick={(e) => { e.preventDefault(); }}>
              <Heart className="w-4 h-4 text-slate-400 hover:text-red-500 transition-colors" />
            </button>
          </div>
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl shadow-sm">
            <span className="font-extrabold text-lg text-primary">{formatPrice(property.price)}</span>
            {priceType === 'rent' && <span className="text-xs text-slate-500 ml-1">/mo</span>}
          </div>
        </div>
        <div className="p-5 flex flex-col flex-1 justify-between">
          <div>
            <div className="flex justify-between items-start mb-2 gap-2">
              <h3 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-primary transition-colors">{property.title}</h3>
              <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md text-xs font-bold shrink-0">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{property.rating?.toFixed(1) || '4.9'}</span>
              </div>
            </div>
            <div className="flex items-center text-slate-500 text-xs mb-4">
              <MapPin className="w-3.5 h-3.5 mr-1 shrink-0 text-primary" />
              <span className="truncate">{property.suburb ? `${property.suburb}, ${property.city}` : property.city || 'Harare, Zimbabwe'}</span>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-slate-50 pt-3.5 text-slate-600 text-xs">
            <div className="flex items-center gap-3">
              {property.bedrooms > 0 && <div className="flex items-center gap-1"><Bed className="w-4 h-4 text-slate-400" /> <span>{property.bedrooms}</span></div>}
              {property.bathrooms > 0 && <div className="flex items-center gap-1"><Bath className="w-4 h-4 text-slate-400" /> <span>{property.bathrooms}</span></div>}
            </div>
            {property.size > 0 && <div className="flex items-center gap-1 font-medium"><Maximize className="w-3.5 h-3.5 text-slate-400" /> <span>{property.size}m²</span></div>}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [selectedIntent, setSelectedIntent] = useState<'rent' | 'buy' | 'commercial'>('rent');
  const [searchLocation, setSearchLocation] = useState('');
  const [recentSearch, setRecentSearch] = useState<string | null>(null);
  const [featuredProps, setFeaturedProps] = useState<any[]>([]);
  const [totalProps, setTotalProps] = useState(0);

  useEffect(() => {
    // Exchange OAuth code if returned to home page
    if (typeof window !== 'undefined' && window.location.search.includes('code=')) {
      const supabase = createClient();
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      if (code) {
        supabase.auth.exchangeCodeForSession(code).then(() => {
          window.history.replaceState({}, document.title, window.location.pathname);
          router.refresh();
        });
      }
    }

    const saved = localStorage.getItem('cresla_recent_search');
    if (saved) setRecentSearch(saved);

    const fetchFeatured = async () => {
      try {
        const dbProps = await getProperties({ featured: true, limit: 3 });
        if (dbProps && dbProps.length > 0) {
          setFeaturedProps(dbProps);
          // Optional: You might want to get actual total count from Supabase. We'll use mock for total stats fallback.
          setTotalProps(mockProperties.length);
        } else {
          setFeaturedProps(mockProperties.filter((p: any) => p.featured).slice(0, 3));
          setTotalProps(mockProperties.length);
        }
      } catch (e) {
        setFeaturedProps(mockProperties.filter((p: any) => p.featured).slice(0, 3));
        setTotalProps(mockProperties.length);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearch = () => {
    if (searchLocation.trim()) {
      localStorage.setItem('cresla_recent_search', `${searchLocation} · ${selectedIntent}`);
    }
    router.push(`/search?intent=${selectedIntent}&location=${encodeURIComponent(searchLocation)}`);
  };

  const handleRecentSearchClick = () => {
    if (recentSearch) {
      const [loc, intent] = recentSearch.split(' · ');
      if (loc) setSearchLocation(loc);
      if (intent && ['rent', 'buy', 'commercial'].includes(intent)) {
        setSelectedIntent(intent as any);
      }
    }
  };

  const setPopularLocation = (loc: string) => {
    setSearchLocation(loc);
  };

  return (
    <main className="min-h-screen font-sans bg-white">
      {/* SECTION 1: Hero */}
      <section className="min-h-[80vh] flex flex-col justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-white px-4 py-20">
        <div className="max-w-3xl mx-auto text-center w-full">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6">
            <span className="text-xs font-medium text-primary bg-primary/10 px-4 py-1.5 rounded-full inline-block">
              Zimbabwe's Premium Property Platform
            </span>
          </motion.div>
          
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tight">
            Find a place you'll love.
          </motion.h1>
          
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-lg text-slate-500 mt-4 max-w-lg mx-auto">
            Tell us what you're looking for. We'll narrow it down.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mt-10">
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
              {[
                { id: 'rent', label: 'Rent', icon: Home },
                { id: 'buy', label: 'Buy', icon: Building2 },
                { id: 'commercial', label: 'Commercial', icon: Briefcase },
              ].map((intent) => {
                const Icon = intent.icon;
                const isSelected = selectedIntent === intent.id;
                return (
                  <button
                    key={intent.id}
                    onClick={() => setSelectedIntent(intent.id as any)}
                    className={`flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border-2 transition-all font-semibold ${
                      isSelected 
                        ? 'border-primary bg-primary/5 text-primary shadow-sm' 
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" /> {intent.label}
                  </button>
                );
              })}
            </div>

            <div className="max-w-xl mx-auto">
              <div className="relative flex items-center bg-white border border-slate-200 shadow-lg shadow-slate-200/50 rounded-2xl p-2">
                <MapPin className="absolute left-5 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search city, suburb or neighborhood"
                  className="w-full pl-12 pr-4 py-3 bg-transparent text-slate-900 outline-none text-base placeholder:text-slate-400"
                />
                <button 
                  onClick={handleSearch}
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  Search <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
                <span>Popular:</span>
                {['Borrowdale', 'Avondale', 'Highlands', 'Bulawayo', 'Victoria Falls'].map((loc, i, arr) => (
                  <React.Fragment key={loc}>
                    <button onClick={() => setPopularLocation(loc)} className="hover:text-primary transition-colors">{loc}</button>
                    {i < arr.length - 1 && <span>·</span>}
                  </React.Fragment>
                ))}
              </div>

              {recentSearch && (
                <button 
                  onClick={handleRecentSearchClick}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary transition-colors bg-white/60 px-3 py-1.5 rounded-full border border-slate-200"
                >
                  <Search className="w-3 h-3" /> Recent: {recentSearch}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: Featured Properties */}
      <section className="py-20 bg-white px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold text-slate-900">Featured properties</h2>
            <p className="text-sm text-slate-500 mt-1">Hand-picked premium selections</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProps.map((property) => (
              <motion.div key={property.id} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
                <PropertyCard property={property} />
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/search" className="inline-flex items-center gap-2 text-primary font-medium hover:text-primary/80 transition-colors">
              View all properties <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 3: Trust bar */}
      <section className="py-12 border-t border-slate-100 bg-white">
        <div className="max-w-4xl mx-auto px-4 flex flex-wrap justify-center gap-12 sm:gap-16">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900 mb-1">{totalProps > 0 ? `${totalProps}+` : '50+'}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Properties</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900 mb-1">100%</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Verified Listings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900 mb-1">USD</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Pricing</div>
          </div>
        </div>
      </section>
    </main>
  );
}
