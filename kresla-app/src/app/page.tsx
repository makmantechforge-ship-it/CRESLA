'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { 
  MapPin, 
  Search, 
  Home, 
  Building2, 
  GraduationCap, 
  Briefcase, 
  Crown, 
  Factory, 
  Palmtree, 
  Mountain, 
  Heart, 
  Bed, 
  Bath, 
  Car, 
  Maximize, 
  Star, 
  MessageSquare, 
  Key,
  ShieldCheck
} from 'lucide-react';
import { properties, categories, popularCities } from '@/data/properties';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price).replace('ZAR', 'R');
};

const iconMap: Record<string, React.ReactNode> = {
  Home: <Home className="w-8 h-8" />,
  Building2: <Building2 className="w-8 h-8" />,
  GraduationCap: <GraduationCap className="w-8 h-8" />,
  Briefcase: <Briefcase className="w-8 h-8" />,
  Crown: <Crown className="w-8 h-8" />,
  Factory: <Factory className="w-8 h-8" />,
  Palmtree: <Palmtree className="w-8 h-8" />,
  Mountain: <Mountain className="w-8 h-8" />,
};

const getIcon = (iconName: string) => {
  return iconMap[iconName] || <Home className="w-8 h-8" />;
};

const fadeInUp: any = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const staggerContainer: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

export default function HomePage() {
  const [searchLocation, setSearchLocation] = useState('');
  const [searchType, setSearchType] = useState('buy');
  const featuredProperties = properties?.filter((p: any) => p.featured).slice(0, 6) || [];

  return (
    <main className="min-h-screen bg-slate-50">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex flex-col justify-center items-center px-4 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2000" 
            alt="Hero Background" 
            fill 
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/90 to-primary-dark/80 backdrop-blur-[2px]"></div>
        </div>

        <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center text-center mt-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6"
          >
            Find Your Perfect Place
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-2xl text-slate-200 mb-10 max-w-2xl font-light"
          >
            Discover verified properties across South Africa
          </motion.p>

          {/* SEARCH BAR */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full max-w-4xl bg-white/95 backdrop-blur-md rounded-2xl p-2 md:p-4 shadow-2xl flex flex-col md:flex-row items-center gap-3 border border-white/20"
          >
            <div className="flex-1 flex items-center w-full bg-slate-100/80 rounded-xl px-4 py-3 border border-transparent focus-within:border-primary/30 transition-colors">
              <MapPin className="text-slate-400 w-5 h-5 mr-3 flex-shrink-0" />
              <input 
                type="text"
                placeholder="City, neighborhood, or address"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-slate-700 placeholder-slate-400"
              />
            </div>
            
            <div className="w-full md:w-48 bg-slate-100/80 rounded-xl px-4 py-3 border border-transparent">
              <select 
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-slate-700 cursor-pointer"
              >
                <option value="buy">Buy</option>
                <option value="rent">Rent</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>

            <button className="w-full md:w-auto bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl px-8 py-3 font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
              <Search className="w-5 h-5" />
              <span>Search</span>
            </button>
          </motion.div>

          {/* STATS */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-8 md:gap-16 mt-16"
          >
            {[
              { label: 'Properties', value: '10,000+' },
              { label: 'Verified Landlords', value: '5,000+' },
              { label: 'Cities', value: '50+' },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</span>
                <span className="text-sm md:text-base text-slate-300 font-medium">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 2. CATEGORIES SECTION */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="mb-10 text-center md:text-left">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Browse by Category</h2>
          <p className="text-slate-500">Explore properties tailored to your specific needs</p>
        </div>
        
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="flex overflow-x-auto pb-8 -mx-4 px-4 md:grid md:grid-cols-4 md:overflow-visible md:pb-0 md:px-0 gap-6 hide-scrollbar"
        >
          {categories?.map((cat: any, index: number) => (
            <motion.div key={cat.id || index} variants={fadeInUp} className="min-w-[200px] md:min-w-0">
              <Link href={`/properties`}>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 flex flex-col items-center text-center cursor-pointer group">
                  <div className="w-16 h-16 bg-blue-50 text-primary rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    {getIcon(cat.icon)}
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">{cat.name}</h3>
                  <p className="text-sm text-slate-500">{cat.count} Properties</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 3. FEATURED PROPERTIES */}
      <section className="py-16 px-4 bg-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Featured Properties</h2>
              <p className="text-slate-500">Hand-picked premium selections just for you</p>
            </div>
            <Link href="/properties" className="text-primary font-semibold hover:text-primary-dark transition-colors flex items-center gap-2">
              View All Properties <span aria-hidden="true">→</span>
            </Link>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {featuredProperties?.map((property: any) => (
              <motion.div key={property.id} variants={fadeInUp}>
                <Link href={`/properties/${property.id}`} className="block">
                  <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group border border-slate-100">
                    {/* Image Container */}
                    <div className="relative aspect-video overflow-hidden">
                      <Image 
                        src={property.image || property.images?.[0] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80'} 
                        alt={property.title || 'Property Image'} 
                        fill 
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                      
                      {/* Top Overlay Badges */}
                      <div className="absolute top-3 w-full px-3 flex justify-between items-start">
                        {property.isVerified || property.verified ? (
                          <div className="bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                            <ShieldCheck className="w-3.5 h-3.5" /> Verified
                          </div>
                        ) : <div />}
                        
                        <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-white transition-colors shadow-sm" onClick={(e) => { e.preventDefault(); /* Handle favorite */ }}>
                          <Heart className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Bottom Overlay Price */}
                      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-lg shadow-lg">
                        <span className="font-bold text-lg text-primary">{formatPrice(property.price)}</span>
                        {property.type === 'rent' && <span className="text-xs text-slate-500 ml-1">/mo</span>}
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <h3 className="font-semibold text-slate-900 text-lg line-clamp-1 group-hover:text-primary transition-colors">
                          {property.title}
                        </h3>
                        <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-0.5 rounded text-xs font-medium shrink-0">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{property.rating?.toFixed(1) || '4.8'}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-slate-500 text-sm mb-4">
                        <MapPin className="w-4 h-4 mr-1.5 shrink-0 text-slate-400" />
                        <span className="truncate">{property.suburb ? `${property.suburb}, ${property.city}` : (property.location?.address || property.location || 'Johannesburg, South Africa')}</span>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-slate-600">
                        <div className="flex items-center gap-4 text-sm">
                          {property.bedrooms && (
                            <div className="flex items-center gap-1.5">
                              <Bed className="w-4 h-4 text-slate-400" /> <span>{property.bedrooms}</span>
                            </div>
                          )}
                          {property.bathrooms && (
                            <div className="flex items-center gap-1.5">
                              <Bath className="w-4 h-4 text-slate-400" /> <span>{property.bathrooms}</span>
                            </div>
                          )}
                          {property.parking && (
                            <div className="flex items-center gap-1.5" title="Parking">
                              <Car className="w-4 h-4 text-slate-400" /> <span>{property.parking}</span>
                            </div>
                          )}
                        </div>
                        {property.size && (
                          <div className="flex items-center gap-1.5 text-sm font-medium" title="Square Meters">
                            <Maximize className="w-4 h-4 text-slate-400" /> <span>{property.size}m²</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. POPULAR CITIES */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Popular Cities</h2>
          <p className="text-slate-500">Find properties in South Africa's most sought-after locations</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {popularCities?.map((city: any, i: number) => (
            <motion.div 
              key={city.id || i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Link href={`/properties`}>
                <div className="relative h-64 rounded-2xl overflow-hidden group shadow-lg cursor-pointer">
                  <Image 
                    src={city.image || 'https://images.unsplash.com/photo-1577943501625-f773426e7a2b?auto=format&fit=crop&q=80'} 
                    alt={city.name} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  
                  <div className="absolute bottom-6 left-6">
                    <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-blue-200 transition-colors">{city.name}</h3>
                    <p className="text-slate-200 text-sm font-medium">{city.count || '100+'} Properties</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section className="py-20 px-4 bg-white border-y border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">How Kresla Works</h2>
            <p className="text-slate-500">Your journey to finding the perfect property in three simple steps</p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Dotted line connecting steps (desktop only) */}
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 border-t-2 border-dashed border-slate-200 -z-10" style={{ width: '66%', left: '17%' }}></div>

            {[
              {
                icon: <Search className="w-8 h-8" />,
                title: 'Search Properties',
                desc: 'Browse through thousands of verified properties using our smart filters to find exactly what you need.',
              },
              {
                icon: <MessageSquare className="w-8 h-8" />,
                title: 'Connect & Visit',
                desc: 'Contact landlords directly through our secure platform and schedule a viewing effortlessly.',
              },
              {
                icon: <Key className="w-8 h-8" />,
                title: 'Secure & Move In',
                desc: 'Sign digital leases securely and move into your new dream home with complete peace of mind.',
              }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center relative bg-white"
              >
                <div className="w-24 h-24 rounded-full bg-blue-50 border-8 border-white shadow-xl flex items-center justify-center text-primary mb-6 relative">
                  {step.icon}
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-md">
                    {i + 1}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-500 leading-relaxed max-w-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CTA SECTION */}
      <section className="py-24 px-4 relative overflow-hidden">
        {/* Background gradient shapes */}
        <div className="absolute inset-0 bg-primary z-0" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-dark rounded-full mix-blend-multiply filter blur-3xl opacity-50 z-0"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 z-0"></div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            List Your Property Today
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Join thousands of verified landlords and property managers on Kresla. Reach a wider audience and manage your listings with our premium tools.
          </p>
          
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <Link 
              href="/dashboard" 
              className="bg-white text-primary px-8 py-4 rounded-xl font-bold text-lg shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] transition-all flex items-center gap-2"
            >
              Get Started <span aria-hidden="true">→</span>
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
}
