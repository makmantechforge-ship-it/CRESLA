'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Maximize, 
  Star, 
  ShieldCheck, 
  Heart, 
  Share2, 
  Flag, 
  Phone, 
  MessageSquare, 
  Calendar,
  Check,
  ChevronLeft,
  Sparkles,
  Loader2,
  Building2,
  Car
} from 'lucide-react';
import { getPropertyById, getProperties, getUserFavorites, addFavorite, removeFavorite, submitReport } from '@/utils/supabase/queries';
import { properties as mockProperties } from '@/data/properties';
import { createClient } from '@/utils/supabase/client';
import { SaveButton } from '@/components/ui/SaveButton';
import { PropertyCard } from '@/components/ui/PropertyCard';

const PropertyMap = dynamic(() => import('@/components/map/PropertyMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  ),
});

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [property, setProperty] = useState<any>(null);
  const [similarProperties, setSimilarProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [user, setUser] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const favs = await getUserFavorites(user.id);
        setIsSaved(favs.some((f: any) => f.id === id));
      }

      // Fetch target property
      const dbProp = await getPropertyById(id);
      if (dbProp) {
        setProperty(dbProp);
      } else {
        const mockMatch = mockProperties.find((p) => p.id === id);
        if (mockMatch) setProperty(mockMatch);
      }

      // Fetch similar properties
      const allProps = await getProperties({ limit: 4 });
      if (allProps && allProps.length > 0) {
        setSimilarProperties(allProps.filter((p) => p.id !== id).slice(0, 3));
      } else {
        setSimilarProperties(mockProperties.filter((p) => p.id !== id).slice(0, 3));
      }

      setLoading(false);
    };

    if (id) fetchData();
  }, [id]);

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to save properties.');
      return;
    }

    try {
      if (isSaved) {
        await removeFavorite(user.id, id);
        setIsSaved(false);
      } else {
        await addFavorite(user.id, id);
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Failed to toggle save', err);
    }
  };

  const handleReport = async () => {
    if (!user) {
      alert('Please sign in to report a property listing.');
      return;
    }
    setReporting(true);
    const reason = prompt('Please enter the reason for reporting this listing (e.g. Fraud, Incorrect Info):');
    if (reason) {
      try {
        await submitReport({
          property_id: id,
          reporter_id: user.id,
          reason: reason,
        });
        setReportSuccess(true);
      } catch (err) {
        alert('Could not submit report. Please try again.');
      }
    }
    setReporting(false);
  };

  const formatPrice = (price: number) => {
    return '$' + new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-16 text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Property Not Found</h2>
        <p className="text-slate-500 text-sm mt-2">The listing you requested does not exist or has been removed.</p>
        <Link href="/properties" className="mt-4 inline-block px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl">
          Back to Listings
        </Link>
      </div>
    );
  }

  const images = property.images && property.images.length > 0
    ? property.images
    : [property.imageUrl || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'];

  const landlord = property.profiles || property.landlord || {
    full_name: 'Tinashe Moyo',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    verified: true,
    rating: 4.9,
  };

  const priceType = property.price_type || property.priceType || 'rent';

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 pb-28 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* NAV & ACTION BAR */}
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Back to matches
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleReport}
              disabled={reporting || reportSuccess}
              className="text-xs font-medium text-slate-500 hover:text-red-500 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Flag className="w-3.5 h-3.5" />
              {reportSuccess ? 'Reported' : 'Report'}
            </button>

            <SaveButton saved={isSaved} onToggle={handleSaveToggle} />
          </div>
        </div>

        {/* 1. GALLERY SECTION */}
        <div className="space-y-3">
          <div className="relative aspect-[16/9] md:aspect-[21/9] w-full rounded-3xl overflow-hidden shadow-lg border border-slate-200/80 dark:border-slate-800">
            <Image
              src={images[selectedImage]}
              alt={property.title}
              fill
              className="object-cover transition-all duration-300"
              priority
            />
            {property.verified && (
              <div className="absolute top-4 left-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Listing
              </div>
            )}
          </div>

          {/* Image Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    selectedImage === idx ? 'border-primary scale-105 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt={`Thumbnail ${idx}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* MAIN DETAILS CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT 2 COLUMNS: ESSENTIAL FACTS, FEATURES, DESCRIPTION, AMENITIES */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 2. ESSENTIAL FACTS */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">{property.title}</h1>
                  <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm mt-1.5">
                    <MapPin className="w-4 h-4 text-primary mr-1 shrink-0" />
                    <span>{property.address ? `${property.address}, ` : ''}{property.suburb ? `${property.suburb}, ` : ''}{property.city}, Zimbabwe</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-xl text-xs font-bold shrink-0">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{property.rating?.toFixed(1) || '4.9'}</span>
                </div>
              </div>

              {/* Core Specs Pills */}
              <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300">
                {property.bedrooms > 0 && (
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl">
                    <Bed className="w-4 h-4 text-primary" /> {property.bedrooms} Bedrooms
                  </div>
                )}
                {property.bathrooms > 0 && (
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl">
                    <Bath className="w-4 h-4 text-primary" /> {property.bathrooms} Bathrooms
                  </div>
                )}
                {property.size > 0 && (
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl">
                    <Maximize className="w-4 h-4 text-primary" /> {property.size} {property.size_unit || 'm²'}
                  </div>
                )}
              </div>
            </div>

            {/* 3. WHY YOU'LL LIKE IT HIGHLIGHTS */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Why you&apos;ll like it</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {property.amenities.slice(0, 4).map((amenity: string, i: number) => (
                    <div key={i} className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl text-sm font-medium text-slate-800 dark:text-slate-200">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. DESCRIPTION */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">About this property</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* 5. FULL AMENITIES GRID */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Amenities & Features</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.amenities.map((amenity: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. LOCATION MAP */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Location</h3>
              <div className="h-64 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <PropertyMap />
              </div>
            </div>

          </div>

          {/* RIGHT 1 COLUMN: STICKY PRICE & AGENT CONTACT CARD */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-200/80 dark:border-slate-800 sticky top-24 space-y-6">
              
              {/* Price Header */}
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  {priceType === 'rent' ? 'Rental Price' : 'Asking Price'}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-primary">{formatPrice(property.price)}</span>
                  {priceType === 'rent' && <span className="text-sm font-medium text-slate-500">/ month</span>}
                </div>
              </div>

              {/* Agent / Landlord Info */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-slate-200">
                  <Image
                    src={landlord.avatar_url || landlord.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                    alt={landlord.full_name || landlord.name || 'Host'}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{landlord.full_name || landlord.name || 'Property Owner'}</h4>
                  <p className="text-xs text-slate-500">Verified Landlord · 5 Listings</p>
                </div>
              </div>

              {/* Primary Conversion CTAs */}
              <div className="space-y-3 pt-2">
                {user && (property.landlord_id === user.id || property.profiles?.id === user.id || property.landlord?.id === user.id) ? (
                  <Link
                    href={`/properties/${property.id}/edit`}
                    className="w-full py-3.5 bg-amber-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-amber-700 transition-all shadow-md"
                  >
                    <Sparkles className="w-4 h-4" /> Edit Your Listing
                  </Link>
                ) : (
                  <Link
                    href={`/messages?to=${property.landlord_id || property.profiles?.id || property.landlord?.id || 'cresla-concierge'}&property=${property.id}`}
                    className="w-full py-3.5 bg-primary text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-md"
                  >
                    <MessageSquare className="w-4 h-4" /> Message Owner
                  </Link>
                )}

                <a
                  href={`tel:${landlord.phone || '+263772000111'}`}
                  className="w-full py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  <Phone className="w-4 h-4" /> Call {landlord.phone || 'Agent (+263)'}
                </a>
              </div>

            </div>
          </div>

        </div>

        {/* 8. SIMILAR PROPERTIES RECOMMENDATIONS */}
        {similarProperties.length > 0 && (
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">More like this</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarProperties.map((simProp) => (
                <PropertyCard key={simProp.id} property={simProp} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* MOBILE STICKY BOTTOM ACTION BAR (Positioned above bottom nav) */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-3 px-6 z-40 flex items-center justify-between shadow-xl">
        <div>
          <span className="text-xl font-extrabold text-primary">{formatPrice(property.price)}</span>
          {priceType === 'rent' && <span className="text-xs text-slate-500 ml-1">/mo</span>}
        </div>

        {user && (property.landlord_id === user.id || property.profiles?.id === user.id || property.landlord?.id === user.id) ? (
          <Link
            href={`/properties/${property.id}/edit`}
            className="px-6 py-2.5 bg-amber-600 text-white rounded-xl font-bold text-xs shadow-md flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" /> Edit Listing
          </Link>
        ) : (
          <Link
            href={`/messages?to=${property.landlord_id || property.profiles?.id || property.landlord?.id || 'cresla-concierge'}&property=${property.id}`}
            className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-xs shadow-md flex items-center gap-1.5"
          >
            <MessageSquare className="w-4 h-4" /> Contact Owner
          </Link>
        )}
      </div>
    </main>
  );
}
