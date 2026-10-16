'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Building2, 
  MapPin, 
  Map, 
  Search, 
  DollarSign, 
  Maximize2, 
  BedDouble, 
  GraduationCap, 
  User, 
  Users, 
  Sparkles, 
  Sun, 
  Droplets, 
  Shield, 
  Key, 
  Wifi, 
  Trees, 
  Check, 
  X,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { properties as mockProperties } from '@/data/properties';
import { getProperties } from '@/utils/supabase/queries';

// Dynamically import LocationPickerMap to avoid Leaflet SSR issues
const LocationPickerMap = dynamic(
  () => import('@/components/map/LocationPickerMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[220px] flex items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-xl">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  }
);

function SearchFiltersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [allProperties, setAllProperties] = useState<any[]>(mockProperties || []);

  // Filter States
  const [intent, setIntent] = useState<'rent' | 'sale' | ''>('');
  const [location, setLocation] = useState('');
  const [occupantType, setOccupantType] = useState<'' | 'student' | 'individual' | 'family'>('');
  const [bedrooms, setBedrooms] = useState('');
  const [size, setSize] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    // Load platform properties for dynamic match counts
    getProperties().then((dbProps) => {
      if (dbProps && dbProps.length > 0) {
        setAllProperties(dbProps);
      }
    });

    // Read initial query params
    const qIntent = searchParams.get('intent') || searchParams.get('purpose');
    if (qIntent === 'sale' || qIntent === 'buy') setIntent('sale');
    else if (qIntent === 'rent') setIntent('rent');

    const qLoc = searchParams.get('location') || searchParams.get('city');
    if (qLoc) setLocation(qLoc);

    const qOcc = searchParams.get('occupant') || searchParams.get('resident');
    if (qOcc === 'student' || qOcc === 'individual' || qOcc === 'family') {
      setOccupantType(qOcc);
    }

    const qBeds = searchParams.get('bedrooms');
    if (qBeds) setBedrooms(qBeds);

    const qSize = searchParams.get('minSize');
    if (qSize) setSize(qSize);

    const qMaxPrice = searchParams.get('maxPrice');
    if (qMaxPrice) setTargetPrice(qMaxPrice);
  }, [searchParams]);

  const popularLocations = ['Borrowdale', 'Avondale', 'Highlands', 'Mount Pleasant', 'Bulawayo', 'Mutare'];

  const amenitiesList = [
    { label: 'Solar Panels', icon: <Sun className="w-3.5 h-3.5" /> },
    { label: 'Borehole', icon: <Droplets className="w-3.5 h-3.5" /> },
    { label: 'Swimming Pool', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { label: '24/7 Security', icon: <Shield className="w-3.5 h-3.5" /> },
    { label: 'Furnished', icon: <Key className="w-3.5 h-3.5" /> },
    { label: 'Fibre Internet', icon: <Wifi className="w-3.5 h-3.5" /> },
    { label: 'Garden', icon: <Trees className="w-3.5 h-3.5" /> },
  ];

  const handleToggleAmenity = (label: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(label) ? prev.filter((a) => a !== label) : [...prev, label]
    );
  };

  const handleClearAll = () => {
    setIntent('');
    setLocation('');
    setOccupantType('');
    setBedrooms('');
    setSize('');
    setTargetPrice('');
    setSelectedAmenities([]);
    setShowMap(false);
  };

  const hasAnyFilter = Boolean(
    intent ||
    location.trim() ||
    occupantType ||
    bedrooms ||
    size ||
    targetPrice ||
    selectedAmenities.length > 0
  );

  // Calculate live matching count
  const matchingCount = useMemo(() => {
    return allProperties.filter((p) => {
      if (intent && p.purpose && p.purpose.toLowerCase() !== intent.toLowerCase()) return false;
      if (location.trim()) {
        const loc = location.toLowerCase();
        const propLoc = (p.location || '').toLowerCase();
        const propCity = (p.city || '').toLowerCase();
        if (!propLoc.includes(loc) && !propCity.includes(loc)) return false;
      }
      if (occupantType && p.occupant_type && p.occupant_type.toLowerCase() !== occupantType.toLowerCase()) return false;
      if (bedrooms && p.bedrooms && p.bedrooms < parseInt(bedrooms, 10)) return false;
      if (size && p.area_sqm && p.area_sqm < parseFloat(size)) return false;
      if (targetPrice) {
        const ceiling = parseFloat(targetPrice) + 25;
        if (p.price && p.price > ceiling) return false;
      }
      if (selectedAmenities.length > 0 && p.amenities) {
        const hasAll = selectedAmenities.every((a) => p.amenities?.includes(a));
        if (!hasAll) return false;
      }
      return true;
    }).length;
  }, [allProperties, intent, location, occupantType, bedrooms, size, targetPrice, selectedAmenities]);

  const handleExecuteSearch = () => {
    const params = new URLSearchParams();
    if (intent) params.set('purpose', intent);
    if (location.trim()) params.set('search', location.trim());
    if (occupantType) params.set('occupant', occupantType);
    if (bedrooms && bedrooms !== 'Any') params.set('bedrooms', bedrooms);
    if (size) params.set('minSize', size);

    if (targetPrice) {
      const num = parseFloat(targetPrice);
      if (!isNaN(num) && num > 0) {
        const ceiling = num + 25;
        params.set('maxPrice', ceiling.toString());
        params.set('targetPrice', num.toString());
      }
    }

    if (selectedAmenities.length > 0) {
      params.set('amenities', selectedAmenities.join(','));
    }

    try {
      const recent = JSON.parse(localStorage.getItem('cresla_recent_searches') || '[]');
      const newEntry = {
        intent: intent || 'Any',
        location: location || 'All locations',
        bedrooms: bedrooms || 'Any',
        occupantType: occupantType || 'Any',
        timestamp: Date.now(),
      };
      const updated = [newEntry, ...recent.filter((r: any) => r.location !== newEntry.location).slice(0, 4)];
      localStorage.setItem('cresla_recent_searches', JSON.stringify(updated));
    } catch (e) {
      // Ignore localStorage issues
    }

    router.push(`/properties?${params.toString()}`);
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 dark:bg-slate-950 pt-20 pb-16 px-3 sm:px-6 flex flex-col items-center justify-start">
      <div className="w-full max-w-3xl">
        
        {/* COMPACT HEADER */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
                Advanced Search
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                All filters in one place • Search after any selection
              </p>
            </div>
          </div>

          {hasAnyFilter && (
            <button
              onClick={handleClearAll}
              className="text-xs font-semibold text-slate-500 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer py-1 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* MINIMAL FILTER CARD (Takes approx half page) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-200/80 dark:border-slate-800 space-y-3.5">
          
          {/* ROW 1: PURPOSE (RENT / BUY) & RESIDENT TYPE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Purpose */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Purpose
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
                {[
                  { id: '', label: 'Any' },
                  { id: 'rent', label: 'Rent' },
                  { id: 'sale', label: 'Buy' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setIntent(item.id as any)}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      intent === item.id
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Resident / Occupant Type */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Resident Type
              </label>
              <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
                {[
                  { id: '', label: 'Any' },
                  { id: 'student', label: 'Student' },
                  { id: 'individual', label: 'Individual' },
                  { id: 'family', label: 'Family' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setOccupantType(item.id as any)}
                    className={`py-1.5 text-[11px] font-bold rounded-lg transition-all truncate px-1 cursor-pointer ${
                      occupantType === item.id
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* ROW 2: LOCATION & OPTIONAL MAP TOGGLE */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Location
              </label>
              <button
                type="button"
                onClick={() => setShowMap((prev) => !prev)}
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors cursor-pointer ${
                  showMap 
                    ? 'bg-primary text-white' 
                    : 'bg-blue-50 text-primary dark:bg-blue-950/60 hover:bg-blue-100'
                }`}
              >
                <Map className="w-3 h-3" />
                <span>{showMap ? 'Hide Map' : '📍 Pick on Map'}</span>
              </button>
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleExecuteSearch();
                }}
                placeholder="City, suburb, e.g. Borrowdale, Avondale, Bulawayo..."
                className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-primary/40 text-slate-900 dark:text-white transition-all"
              />
              {location && (
                <button
                  type="button"
                  onClick={() => setLocation('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Location Chips */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Quick:</span>
              {popularLocations.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setLocation(location === loc ? '' : loc)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                    location === loc
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:text-primary'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>

            {/* COLLAPSIBLE LIVE MAP */}
            <AnimatePresence>
              {showMap && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden mt-2.5"
                >
                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm" style={{ height: '220px' }}>
                    <LocationPickerMap
                      selectedLocation={location}
                      onSelectLocation={(cityName) => {
                        setLocation(cityName);
                        setShowMap(false);
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 text-center mt-1 font-medium">
                    Tap a city marker to select it as your location
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ROW 3: ROOMS, SIZE (OPTIONAL), & BUDGET */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
            
            {/* Bedrooms */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                <BedDouble className="w-3.5 h-3.5 text-primary" />
                <span>Rooms</span>
              </label>
              <div className="grid grid-cols-5 gap-1">
                {['Any', '1', '2', '3', '4+'].map((r) => {
                  const isSelected = bedrooms === (r === 'Any' ? '' : r.replace('+', ''));
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setBedrooms(r === 'Any' ? '' : r.replace('+', ''))}
                      className={`py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer text-center ${
                        isSelected
                          ? 'bg-primary text-white border-primary shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                      }`}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Min Size (Optional) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Maximize2 className="w-3.5 h-3.5 text-primary" />
                  <span>Min Size</span>
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Optional</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  placeholder="e.g. 120"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/40 text-slate-900 dark:text-white"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                  m²
                </span>
              </div>
            </div>

            {/* Budget / Price (+ $25 buffer) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-primary" />
                  <span>Max Budget</span>
                </label>
                {targetPrice && (
                  <span className="text-[10px] text-primary font-bold">
                    +$25 deal buffer
                  </span>
                )}
              </div>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary" />
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-primary/40 text-slate-900 dark:text-white"
                />
              </div>
            </div>

          </div>

          {/* ROW 4: AMENITIES (Compact inline chips) */}
          <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Amenities
            </label>
            <div className="flex flex-wrap gap-1.5">
              {amenitiesList.map((item) => {
                const isSelected = selectedAmenities.includes(item.label);
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleToggleAmenity(item.label)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                    {isSelected && <Check className="w-3 h-3 ml-0.5 stroke-[2.5]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ROW 5: SEARCH ACTION */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-500 font-medium">
              {matchingCount > 0 ? (
                <span><strong>{matchingCount}</strong> {matchingCount === 1 ? 'property' : 'properties'} found</span>
              ) : (
                <span>Browse all properties</span>
              )}
            </span>

            <button
              type="button"
              onClick={handleExecuteSearch}
              className="px-6 py-2.5 bg-[#0B3B95] text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 shadow-md hover:bg-blue-800 hover:scale-[1.01] active:scale-98 transition-all cursor-pointer"
            >
              <Search className="w-4 h-4 stroke-[2.2]" />
              <span>Search Properties</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 flex items-center justify-center">
        <div className="w-7 h-7 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SearchFiltersContent />
    </Suspense>
  );
}
