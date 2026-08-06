'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, Bed, Bath, Car, Heart, ShieldCheck, MapPin, X, Map } from 'lucide-react';
import { properties as importedProperties } from '@/data/properties';
import { getProperties } from '@/utils/supabase/queries';

import dynamic from 'next/dynamic';

const PropertyMap = dynamic(() => import('@/components/map/PropertyMap'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-3" />
      <p className="text-slate-500 font-medium text-sm">Loading map...</p>
    </div>
  )
});

const formatPrice = (price: number) => {
  return '$' + new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(price);
};

export default function PropertiesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('Any');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [allProperties, setAllProperties] = useState<any[]>(importedProperties || []);
  const [userAuth, setUserAuth] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserAuth(user);
        const { getUserFavorites } = await import('@/utils/supabase/queries');
        const userFavs = await getUserFavorites(user.id);
        setFavorites(userFavs.map(f => f.id));
      }
    };
    fetchUser();
    
    getProperties().then((dbProps) => {
      if (dbProps && dbProps.length > 0) {
        setAllProperties(dbProps.map((p) => ({
          ...p,
          priceType: p.price_type,
          sizeUnit: p.size_unit,
          petFriendly: p.pet_friendly,
          isVerified: p.verified,
          image: p.images?.[0],
        })));
      }
    });
  }, []);

  const propertyTypes = ['All', 'House', 'Apartment', 'Townhouse', 'Estate'];

  const toggleFavorite = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (!userAuth) {
      alert("Please log in to save favorites.");
      return;
    }
    
    const isFavorited = favorites.includes(id);
    const { addFavorite, removeFavorite } = await import('@/utils/supabase/queries');
    
    try {
      if (isFavorited) {
        await removeFavorite(userAuth.id, id);
        setFavorites(prev => prev.filter(fId => fId !== id));
      } else {
        await addFavorite(userAuth.id, id);
        setFavorites(prev => [...prev, id]);
      }
    } catch (error) {
      console.error("Failed to toggle favorite", error);
    }
  };

  const filteredProperties = useMemo(() => {
    return allProperties.filter((prop: any) => {
      const locationStr = `${prop.suburb || ''} ${prop.city || ''} ${prop.address || ''}`;
      const matchesSearch = locationStr.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (prop.title && prop.title.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = selectedType === 'All' || prop.type === selectedType;
      const matchesMinPrice = minPrice === '' || prop.price >= parseInt(minPrice);
      const matchesMaxPrice = maxPrice === '' || prop.price <= parseInt(maxPrice);
      const matchesBeds = bedrooms === 'Any' || prop.bedrooms >= parseInt(bedrooms);

      return matchesSearch && matchesType && matchesMinPrice && matchesMaxPrice && matchesBeds;
    });
  }, [searchTerm, selectedType, minPrice, maxPrice, bedrooms]);

  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] mt-16 bg-slate-50 dark:bg-slate-900 overflow-hidden text-slate-800 dark:text-slate-100">
      
      {/* LEFT PANEL: Listings & Filters */}
      <div className="flex-1 flex flex-col w-full lg:w-3/5 xl:w-1/2 h-full overflow-hidden relative z-10">
        
        {/* Search & Filter Header */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 p-4 md:p-6 z-20 sticky top-0">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4 tracking-tight">Find your perfect home</h1>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by location, neighborhood, or title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-400"
                />
              </div>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
                  showFilters 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span>Filters</span>
              </button>
            </div>

            {/* Expandable Filters Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                  animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Property Type</label>
                      <select 
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
                      >
                        {propertyTypes.map(type => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Min Price</label>
                      <input 
                        type="number"
                        placeholder="R 0"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Max Price</label>
                      <input 
                        type="number"
                        placeholder="Any"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bedrooms</label>
                      <select 
                        value={bedrooms}
                        onChange={(e) => setBedrooms(e.target.value)}
                        className="w-full p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
                      >
                        {['Any', '1', '2', '3', '4', '5'].map(num => (
                          <option key={num} value={num}>{num === 'Any' ? 'Any' : `${num}+ Beds`}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-4">
                    <button 
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedType('All');
                        setMinPrice('');
                        setMaxPrice('');
                        setBedrooms('Any');
                      }}
                      className="text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                    >
                      Clear all filters
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 lg:pb-6 custom-scrollbar">
          <div className="max-w-4xl mx-auto">
            <div className="mb-4 flex justify-between items-end">
              <p className="text-slate-500 font-medium">
                {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} found
              </p>
            </div>

            {filteredProperties.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">No properties found</h3>
                <p className="text-slate-500">Try adjusting your filters or search term to find what you're looking for.</p>
              </div>
            ) : (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {filteredProperties.map((property: any) => (
                  <motion.div key={property.id} variants={itemVariants}>
                    <Link href={`/properties/${property.id}`} className="block group">
                      <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-slate-100 dark:border-slate-700">
                        
                        {/* Image Section */}
                        <div className="relative aspect-[4/3] w-full overflow-hidden">
                          <Image
                            src={(property.images && property.images[0]) || property.image || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9'}
                            alt={property.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                          
                          <div className="absolute top-4 right-4 flex gap-2">
                            <button 
                              onClick={(e) => toggleFavorite(e, property.id)}
                              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/40 transition-colors"
                            >
                              <Heart className={`w-5 h-5 ${favorites.includes(property.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                            </button>
                          </div>
                          
                          {property.verified && (
                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-primary px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              VERIFIED
                            </div>
                          )}

                          <div className="absolute bottom-4 left-4 right-4 text-white">
                            <p className="text-2xl font-bold drop-shadow-md">
                              {formatPrice(property.price)}
                            </p>
                          </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-5">
                          <div className="mb-4">
                            <h3 className="font-bold text-lg mb-1 truncate text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors">
                              {property.title}
                            </h3>
                            <div className="flex items-center text-slate-500 text-sm">
                              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                              <span className="truncate">{property.suburb ? `${property.suburb}, ${property.city}` : property.location}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between py-4 border-t border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                              <Bed className="w-4 h-4 text-primary" />
                              <span className="font-semibold text-sm">{property.bedrooms} <span className="font-normal text-slate-400">Beds</span></span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                              <Bath className="w-4 h-4 text-primary" />
                              <span className="font-semibold text-sm">{property.bathrooms} <span className="font-normal text-slate-400">Baths</span></span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                              <Car className="w-4 h-4 text-primary" />
                              <span className="font-semibold text-sm">{property.parking} <span className="font-normal text-slate-400">Parking</span></span>
                            </div>
                          </div>
                          
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Map (Hidden on mobile) */}
      <div className="hidden lg:block lg:w-2/5 xl:w-1/2 h-full relative">
        <PropertyMap />
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.3);
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(71, 85, 105, 0.4);
        }
      `}</style>
    </div>
  );
}
