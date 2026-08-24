'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { 
  MapPin, 
  Search, 
  Filter,
  RotateCcw,
  Building2, 
  Heart, 
  Bed, 
  Bath, 
  Car, 
  Maximize, 
  Star, 
  ShieldCheck,
  Grid,
  Map as MapIcon,
  Loader2,
  Check
} from 'lucide-react';
import { properties as mockProperties } from '@/data/properties';
import { getProperties } from '@/utils/supabase/queries';

const PropertyMap = dynamic(() => import('@/components/map/PropertyMap'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-96 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-2xl">
      <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
      <p className="text-slate-500 font-medium text-sm">Loading map...</p>
    </div>
  )
});

const formatPrice = (price: number) => {
  return '$' + new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(price);
};

export default function HomePage() {
  const [allProperties, setAllProperties] = useState<any[]>(mockProperties || []);
  const [loading, setLoading] = useState(true);
  const [userAuth, setUserAuth] = useState<any>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedSuburb, setSelectedSuburb] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedPriceType, setSelectedPriceType] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('Any');
  const [bathrooms, setBathrooms] = useState('Any');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  useEffect(() => {
    const init = async () => {
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserAuth(user);
        const { getUserFavorites } = await import('@/utils/supabase/queries');
        const userFavs = await getUserFavorites(user.id);
        setFavorites(userFavs.map(f => f.id));
      }

      const dbProps = await getProperties();
      if (dbProps && dbProps.length > 0) {
        const mapped = dbProps.map((p) => ({
          ...p,
          priceType: p.price_type,
          sizeUnit: p.size_unit,
          petFriendly: p.pet_friendly,
          isVerified: p.verified,
          image: p.images?.[0],
          landlord: p.profiles ? {
            id: p.profiles.id,
            name: p.profiles.full_name,
            avatar: p.profiles.avatar_url,
            verified: p.profiles.verified,
            rating: p.profiles.rating,
            properties: p.profiles.properties_count,
            responseTime: p.profiles.response_time,
          } : undefined,
        }));
        setAllProperties(mapped);
      }
      setLoading(false);
    };

    init();
  }, []);

  // Dynamic Filter Options derived 100% from properties on platform
  const availableCities = useMemo(() => {
    const cities = new Set<string>();
    allProperties.forEach(p => { if (p.city) cities.add(p.city); });
    return ['All', ...Array.from(cities).sort()];
  }, [allProperties]);

  const availableSuburbs = useMemo(() => {
    const suburbs = new Set<string>();
    allProperties.forEach(p => {
      if (p.suburb && (selectedCity === 'All' || p.city === selectedCity)) {
        suburbs.add(p.suburb);
      }
    });
    return ['All', ...Array.from(suburbs).sort()];
  }, [allProperties, selectedCity]);

  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    allProperties.forEach(p => { if (p.type) types.add(p.type); });
    return ['All', ...Array.from(types).sort()];
  }, [allProperties]);

  const availableAmenities = useMemo(() => {
    const ams = new Set<string>();
    allProperties.forEach(p => {
      if (Array.isArray(p.amenities)) {
        p.amenities.forEach((a: string) => ams.add(a));
      }
    });
    return Array.from(ams).sort();
  }, [allProperties]);

  // Filter Execution
  const filteredProperties = useMemo(() => {
    return allProperties.filter((property) => {
      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesTitle = property.title?.toLowerCase().includes(term);
        const matchesDesc = property.description?.toLowerCase().includes(term);
        const matchesAddress = property.address?.toLowerCase().includes(term);
        const matchesCity = property.city?.toLowerCase().includes(term);
        const matchesSuburb = property.suburb?.toLowerCase().includes(term);
        if (!matchesTitle && !matchesDesc && !matchesAddress && !matchesCity && !matchesSuburb) {
          return false;
        }
      }

      // City filter
      if (selectedCity !== 'All' && property.city !== selectedCity) {
        return false;
      }

      // Suburb filter
      if (selectedSuburb !== 'All' && property.suburb !== selectedSuburb) {
        return false;
      }

      // Property Type filter
      if (selectedType !== 'All' && property.type !== selectedType) {
        return false;
      }

      // Price Type (Rent/Sale) filter
      const pPriceType = property.priceType || property.price_type;
      if (selectedPriceType !== 'All' && pPriceType?.toLowerCase() !== selectedPriceType.toLowerCase()) {
        return false;
      }

      // Min Price
      if (minPrice && property.price < parseFloat(minPrice)) {
        return false;
      }

      // Max Price
      if (maxPrice && property.price > parseFloat(maxPrice)) {
        return false;
      }

      // Bedrooms
      if (bedrooms !== 'Any') {
        const minBeds = parseInt(bedrooms);
        if (property.bedrooms < minBeds) return false;
      }

      // Bathrooms
      if (bathrooms !== 'Any') {
        const minBaths = parseInt(bathrooms);
        if (property.bathrooms < minBaths) return false;
      }

      // Amenities filter
      if (selectedAmenities.length > 0) {
        const propAmenities = property.amenities || [];
        const hasAllSelected = selectedAmenities.every((a: string) => propAmenities.includes(a));
        if (!hasAllSelected) return false;
      }

      return true;
    });
  }, [allProperties, searchTerm, selectedCity, selectedSuburb, selectedType, selectedPriceType, minPrice, maxPrice, bedrooms, bathrooms, selectedAmenities]);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCity('All');
    setSelectedSuburb('All');
    setSelectedType('All');
    setSelectedPriceType('All');
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('Any');
    setBathrooms('Any');
    setSelectedAmenities([]);
  };

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

  const activeFilterCount = (selectedCity !== 'All' ? 1 : 0) + 
    (selectedSuburb !== 'All' ? 1 : 0) + 
    (selectedType !== 'All' ? 1 : 0) + 
    (selectedPriceType !== 'All' ? 1 : 0) + 
    (minPrice ? 1 : 0) + 
    (maxPrice ? 1 : 0) + 
    (bedrooms !== 'Any' ? 1 : 0) + 
    (bathrooms !== 'Any' ? 1 : 0) + 
    selectedAmenities.length;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* PLATFORM HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-6 h-6 text-primary" />
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Platform Properties</h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Filter and search verified property listings in real-time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-3 py-1.5 bg-primary/10 text-primary rounded-full border border-primary/20">
              {filteredProperties.length} {filteredProperties.length === 1 ? 'Property Available' : 'Properties Available'}
            </span>

            <div className="flex items-center bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
              <button 
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
              >
                <Grid className="w-4 h-4" /> Grid
              </button>
              <button 
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === 'map' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
              >
                <MapIcon className="w-4 h-4" /> Map View
              </button>
            </div>
          </div>
        </div>

        {/* DYNAMIC FILTER PANEL (DERIVED 100% FROM PLATFORM INVENTORY) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-200/80 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Dynamic Platform Filters</h2>
              {activeFilterCount > 0 && (
                <span className="bg-primary text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </div>

            {activeFilterCount > 0 && (
              <button 
                onClick={clearAllFilters}
                className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear All Filters
              </button>
            )}
          </div>

          {/* Primary Filter Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Search Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Keyword Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Title, suburb, or details..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* City Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">City / Region ({availableCities.length - 1} on platform)</label>
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setSelectedSuburb('All');
                }}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all text-slate-900 dark:text-white cursor-pointer"
              >
                {availableCities.map(city => (
                  <option key={city} value={city}>{city === 'All' ? 'All Cities' : city}</option>
                ))}
              </select>
            </div>

            {/* Suburb Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Suburb / Neighborhood</label>
              <select
                value={selectedSuburb}
                onChange={(e) => setSelectedSuburb(e.target.value)}
                disabled={availableSuburbs.length <= 1}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all text-slate-900 dark:text-white cursor-pointer disabled:opacity-50"
              >
                {availableSuburbs.map(suburb => (
                  <option key={suburb} value={suburb}>{suburb === 'All' ? 'All Suburbs' : suburb}</option>
                ))}
              </select>
            </div>

            {/* Property Type Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Property Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all text-slate-900 dark:text-white cursor-pointer"
              >
                {availableTypes.map(t => (
                  <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Secondary Filter Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            
            {/* Listing Purpose (Rent/Sale) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Listing Purpose</label>
              <div className="flex gap-2">
                {['All', 'rent', 'sale'].map(pt => (
                  <button
                    key={pt}
                    onClick={() => setSelectedPriceType(pt)}
                    className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold capitalize border transition-all ${
                      selectedPriceType === pt 
                        ? 'bg-primary text-white border-primary shadow-sm' 
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary/50'
                    }`}
                  >
                    {pt === 'rent' ? 'For Rent' : pt === 'sale' ? 'For Sale' : 'All'}
                  </button>
                ))}
              </div>
            </div>

            {/* Bedrooms */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Bed className="w-3.5 h-3.5" /> Bedrooms
              </label>
              <div className="flex gap-1.5">
                {['Any', '1', '2', '3', '4'].map(b => (
                  <button
                    key={b}
                    onClick={() => setBedrooms(b)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      bedrooms === b 
                        ? 'bg-primary text-white border-primary shadow-sm' 
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary/50'
                    }`}
                  >
                    {b === 'Any' ? 'Any' : `${b}+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Min & Max */}
            <div className="col-span-1 sm:col-span-2 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Min Price ($)</label>
                <input
                  type="number"
                  placeholder="Min price"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Max Price ($)</label>
                <input
                  type="number"
                  placeholder="Max price"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Amenities Chips Filter */}
          {availableAmenities.length > 0 && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Filter by Platform Amenities
              </label>
              <div className="flex flex-wrap gap-2">
                {availableAmenities.map((amenity) => {
                  const isSelected = selectedAmenities.includes(amenity);
                  return (
                    <button
                      key={amenity}
                      onClick={() => toggleAmenity(amenity)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all ${
                        isSelected 
                          ? 'bg-primary text-white border-primary shadow-xs' 
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary/40'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      {amenity}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* PROPERTY LISTINGS RESULTS SECTION */}
        {viewMode === 'map' ? (
          <div className="h-[600px] rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800">
            <PropertyMap />
          </div>
        ) : loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
            <p className="text-slate-500 font-medium text-sm">Loading platform listings...</p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm max-w-lg mx-auto">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Matching Properties</h3>
            <p className="text-slate-500 text-sm mb-6">No active listings match your selected filter criteria on the platform.</p>
            <button
              onClick={clearAllFilters}
              className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-colors shadow-md"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property) => {
              const priceType = property.priceType || property.price_type;
              const isVerified = property.isVerified || property.verified;
              const imageUrl = property.image || property.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800';

              return (
                <motion.div 
                  key={property.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link href={`/properties/${property.id}`} className="block group">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-md hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 border border-slate-200/80 dark:border-slate-800 flex flex-col h-full">
                      
                      {/* Image Container */}
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <Image 
                          src={imageUrl} 
                          alt={property.title || 'Property Image'} 
                          fill 
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                        
                        {/* Top Badges */}
                        <div className="absolute top-3 w-full px-3 flex justify-between items-start">
                          {isVerified ? (
                            <div className="bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                              <ShieldCheck className="w-3.5 h-3.5" /> Verified
                            </div>
                          ) : <div />}
                          
                          <button 
                            className="bg-white/90 dark:bg-slate-900/90 p-2 rounded-full transition-colors shadow-md"
                            onClick={(e) => toggleFavorite(e, property.id)}
                          >
                            <Heart className={`w-4 h-4 ${favorites.includes(property.id) ? 'fill-red-500 text-red-500' : 'text-slate-400 hover:text-red-500'}`} />
                          </button>
                        </div>

                        {/* Bottom Overlay Price */}
                        <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl shadow-lg">
                          <span className="font-extrabold text-lg text-primary">{formatPrice(property.price)}</span>
                          {priceType === 'rent' && <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">/mo</span>}
                        </div>
                      </div>

                      {/* Content Details */}
                      <div className="p-5 flex flex-col flex-1 justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-2 gap-2">
                            <h3 className="font-bold text-slate-900 dark:text-white text-base line-clamp-1 group-hover:text-primary transition-colors">
                              {property.title}
                            </h3>
                            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md text-xs font-bold shrink-0">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <span>{property.rating?.toFixed(1) || '4.9'}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center text-slate-500 dark:text-slate-400 text-xs mb-4">
                            <MapPin className="w-3.5 h-3.5 mr-1 shrink-0 text-primary" />
                            <span className="truncate">{property.suburb ? `${property.suburb}, ${property.city}` : property.city || 'Harare, Zimbabwe'}</span>
                          </div>
                        </div>

                        {/* Specs Footer */}
                        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3.5 text-slate-600 dark:text-slate-400 text-xs">
                          <div className="flex items-center gap-3">
                            {property.bedrooms > 0 && (
                              <div className="flex items-center gap-1">
                                <Bed className="w-4 h-4 text-slate-400" /> <span>{property.bedrooms} Beds</span>
                              </div>
                            )}
                            {property.bathrooms > 0 && (
                              <div className="flex items-center gap-1">
                                <Bath className="w-4 h-4 text-slate-400" /> <span>{property.bathrooms} Baths</span>
                              </div>
                            )}
                            {property.parking > 0 && (
                              <div className="flex items-center gap-1">
                                <Car className="w-4 h-4 text-slate-400" /> <span>{property.parking} Park</span>
                              </div>
                            )}
                          </div>

                          {property.size > 0 && (
                            <div className="flex items-center gap-1 font-medium">
                              <Maximize className="w-3.5 h-3.5 text-slate-400" /> <span>{property.size}m²</span>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}
