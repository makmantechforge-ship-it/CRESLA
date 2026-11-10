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
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Sparkles,
  Sun,
  Droplets,
  Trees,
  Wifi,
  Key,
  Shield,
  GraduationCap,
  User,
  Users,
  Search,
  DollarSign,
  Maximize2,
  BedDouble,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { properties as mockProperties } from '@/data/properties';
import { getProperties } from '@/utils/supabase/queries';
import { ProgressDots } from '@/components/ui/ProgressDots';
import { Button } from '@/components/ui/Button';

// Dynamically import LocationPickerMap to avoid SSR issues with Leaflet
const LocationPickerMap = dynamic(
  () => import('@/components/map/LocationPickerMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[300px] flex items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-2xl">
        <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  }
);

function SearchWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [currentStep, setCurrentStep] = useState(1);
  const [allProperties, setAllProperties] = useState<any[]>(mockProperties || []);

  // Wizard Form State
  // Step 1: Purpose (rent or buy)
  const [intent, setIntent] = useState<'rent' | 'sale' | ''>('');
  
  // Step 2: Location
  const [location, setLocation] = useState('');
  
  // Step 3: Target Audience / Resident Type (student, individual, family)
  const [occupantType, setOccupantType] = useState<'' | 'student' | 'individual' | 'family'>('');
  
  // Step 4: Number of Rooms & Size (Optional)
  const [bedrooms, setBedrooms] = useState('');
  const [size, setSize] = useState('');
  
  // Step 5: Price Range (price + $25 and anything below)
  const [targetPrice, setTargetPrice] = useState('');
  
  // Step 6: Amenities Selection
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // Optional map visibility for Step 2 (Location)
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    // Load platform properties for dynamic options
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
    if (qMaxPrice) {
      // If maximum price was previously calculated as P + 25, we can show it directly
      setTargetPrice(qMaxPrice);
    }
  }, [searchParams]);

  const popularLocations = ['Borrowdale', 'Avondale', 'Highlands', 'Mount Pleasant', 'Bulawayo', 'Victoria Falls', 'Mutare', 'Gweru'];

  const popularAmenities = [
    { label: 'Solar Panels', icon: <Sun className="w-4 h-4" /> },
    { label: 'Borehole', icon: <Droplets className="w-4 h-4" /> },
    { label: 'Swimming Pool', icon: <Sparkles className="w-4 h-4" /> },
    { label: '24/7 Security', icon: <Shield className="w-4 h-4" /> },
    { label: 'Furnished', icon: <Key className="w-4 h-4" /> },
    { label: 'Fibre Internet', icon: <Wifi className="w-4 h-4" /> },
    { label: 'Garden', icon: <Trees className="w-4 h-4" /> },
  ];

  const handleToggleAmenity = (label: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(label) ? prev.filter((a) => a !== label) : [...prev, label]
    );
  };

  // Check if at least one filter has been selected to enable searching anytime
  const hasAnyFilterSelected = useMemo(() => {
    return Boolean(
      intent ||
      location.trim() ||
      occupantType ||
      bedrooms ||
      size ||
      targetPrice ||
      selectedAmenities.length > 0
    );
  }, [intent, location, occupantType, bedrooms, size, targetPrice, selectedAmenities]);

  // Execute Search Anytime
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
        // Requirement: Price range = price + $25 and anything below (maxPrice = entered price + 25)
        const ceiling = num + 25;
        params.set('maxPrice', ceiling.toString());
        params.set('targetPrice', num.toString());
      }
    }

    if (selectedAmenities.length > 0) {
      params.set('amenities', selectedAmenities.join(','));
    }

    // Save to localStorage recent searches
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
      // Ignore localStorage errors
    }

    router.push(`/properties?${params.toString()}`);
  };

  // Step 1 Choice Handler -> Moves to Step 2
  const handleSelectIntent = (val: 'rent' | 'sale') => {
    setIntent(val);
    setTimeout(() => setCurrentStep(2), 150);
  };

  // Step 2 Choice Handler -> Moves to Step 3
  const handleSelectLocation = (loc: string) => {
    setLocation(loc);
    setTimeout(() => setCurrentStep(3), 150);
  };

  // Step 3 Choice Handler -> Moves to Step 4
  const handleSelectOccupant = (val: 'student' | 'individual' | 'family') => {
    setOccupantType(val);
    setTimeout(() => setCurrentStep(4), 150);
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 pb-36 font-sans flex flex-col justify-between">
      <div className="max-w-2xl mx-auto px-4 w-full pt-6">
        
        {/* TOP WIZARD HEADER & SEARCH ANYTIME ACTION */}
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-200/70 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 bg-primary text-white rounded-full shadow-sm">
              Step {currentStep} of 6
            </span>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Choose your criteria or search anytime
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExecuteSearch}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                hasAnyFilterSelected
                  ? 'bg-primary text-white hover:bg-blue-800 hover:scale-105'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search Now</span>
            </button>
          </div>
        </div>

        {/* STEP CAROUSEL WITH ANIMATION */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 dark:border-slate-800 space-y-6"
          >
            
            {/* STEP 1: RENT OR BUY (Choice auto-moves to location) */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Are you looking to Rent or Buy?
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    Select an option to immediately continue to location selection.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {[
                    { id: 'rent', label: 'Rent', desc: 'Looking for a rental home, flat or room', icon: Home },
                    { id: 'sale', label: 'Buy', desc: 'Looking to purchase a property or stand', icon: Building2 },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = intent === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectIntent(item.id as any)}
                        className={`flex flex-col items-center justify-center p-7 rounded-2xl border-2 text-center transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary shadow-md scale-[1.02]'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:bg-blue-50/50'
                        }`}
                      >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${
                          isSelected ? 'bg-primary text-white' : 'bg-white dark:bg-slate-800 text-[#0B3B95] shadow-sm'
                        }`}>
                          <Icon className="w-7 h-7 stroke-[2.2]" />
                        </div>
                        <span className="font-extrabold text-xl">{item.label}</span>
                        <span className="text-xs text-slate-500 mt-1 font-medium">{item.desc}</span>
                        <div className="mt-3 text-xs font-bold text-primary flex items-center gap-1">
                          <span>Continue to Location</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: LOCATION (Choice moves on to Resident Type) */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Where are you looking?
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    Type a city or suburb, pick a popular location, or use the map to continue.
                  </p>
                </div>

                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && location.trim()) {
                        setCurrentStep(3);
                      }
                    }}
                    placeholder="e.g. Borrowdale, Avondale, Bulawayo..."
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-base outline-none focus:ring-2 focus:ring-primary/40 transition-all text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                    Popular Locations in Zimbabwe
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {popularLocations.map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => handleSelectLocation(loc)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          location === loc
                            ? 'bg-primary text-white border-primary shadow-sm scale-105'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 hover:bg-blue-50 hover:text-primary hover:border-blue-200'
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>

                {/* OPTIONAL LIVE MAP TOGGLE */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowMap((prev) => !prev)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border-2 text-sm font-bold transition-all cursor-pointer ${
                      showMap
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:border-blue-300 hover:bg-blue-50/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        showMap ? 'bg-primary text-white' : 'bg-white dark:bg-slate-700 text-[#0B3B95] shadow-sm'
                      }`}>
                        <Map className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <span className="block">{showMap ? 'Hide Map' : '📍 Pick on Map'}</span>
                        <span className="block text-[11px] font-medium text-slate-400 dark:text-slate-500">
                          {showMap ? 'Close the interactive map' : 'Browse Zimbabwe on a live interactive map'}
                        </span>
                      </div>
                    </div>
                    {showMap ? (
                      <ChevronUp className="w-5 h-5 text-primary" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </button>

                  {/* COLLAPSIBLE MAP PANEL */}
                  <AnimatePresence>
                    {showMap && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm" style={{ height: '320px' }}>
                          <LocationPickerMap
                            selectedLocation={location}
                            onSelectLocation={(cityName) => {
                              setLocation(cityName);
                              // Auto-advance to Step 3 after selecting on map
                              setTimeout(() => setCurrentStep(3), 350);
                            }}
                          />
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 text-center font-medium">
                          Tap a city marker to select it as your location
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {location.trim() && (
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow hover:bg-blue-800 transition-colors"
                    >
                      <span>Continue with &quot;{location}&quot;</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: OCCUPANT TYPE (Student / Individual / Family -> Choice moves to Rooms) */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Who is this place for?
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    Select your household type to see tailored matches.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  {[
                    {
                      id: 'student',
                      label: 'Student',
                      desc: 'Single rooms, campus boarding & budget flats',
                      icon: GraduationCap,
                    },
                    {
                      id: 'individual',
                      label: 'Individual',
                      desc: 'Bedsitters, 1-bed apartments & studios',
                      icon: User,
                    },
                    {
                      id: 'family',
                      label: 'Family',
                      desc: 'Spacious 2+ bed homes, gardens & yards',
                      icon: Users,
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = occupantType === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectOccupant(item.id as any)}
                        className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 text-center transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary shadow-md scale-[1.02]'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:bg-blue-50/50'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                          isSelected ? 'bg-primary text-white' : 'bg-white dark:bg-slate-800 text-[#0B3B95] shadow-sm'
                        }`}>
                          <Icon className="w-6 h-6 stroke-[2.2]" />
                        </div>
                        <span className="font-bold text-base">{item.label}</span>
                        <span className="text-xs text-slate-500 mt-1 font-medium">{item.desc}</span>
                        <div className="mt-3 text-xs font-bold text-primary flex items-center gap-1">
                          <span>Select</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 4: NUMBER OF ROOMS & (SIZE OPTIONAL) */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Rooms &amp; Space
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    Select number of rooms needed. Property size is completely optional.
                  </p>
                </div>

                {/* Rooms / Bedrooms Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2.5 flex items-center gap-1.5">
                    <BedDouble className="w-4 h-4 text-primary" />
                    <span>Number of Rooms</span>
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {['Any', '1', '2', '3', '4+'].map((r) => {
                      const isSelected = bedrooms === (r === 'Any' ? '' : r.replace('+', ''));
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setBedrooms(r === 'Any' ? '' : r.replace('+', ''))}
                          className={`py-3.5 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-primary text-white border-primary shadow-sm scale-105'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                          }`}
                        >
                          {r}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Size (Optional) */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      <Maximize2 className="w-4 h-4 text-primary" />
                      <span>Minimum Size</span>
                    </label>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      Optional
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      placeholder="e.g. 150"
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/40 text-slate-900 dark:text-white"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      m² (sqm)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Leave blank if you don&apos;t have a specific size requirement.
                  </p>
                </div>

                {/* IN-CARD NAVIGATION */}
                <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(5)}
                    className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md hover:bg-blue-800 transition-colors ml-auto cursor-pointer"
                  >
                    <span>Continue to Price</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: PRICE RANGE (Price + $25 and anything below) */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Price Range
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    Enter your budget. We will include listings at this price (plus up to <strong>+$25</strong>) and anything below.
                  </p>
                </div>

                <div className="space-y-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Your Budget / Target Price ($ USD)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                      <input
                        type="number"
                        placeholder="e.g. 500"
                        value={targetPrice}
                        onChange={(e) => setTargetPrice(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-lg font-bold outline-none focus:ring-2 focus:ring-primary/40 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {targetPrice && !isNaN(parseFloat(targetPrice)) && parseFloat(targetPrice) > 0 && (
                    <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800 text-xs text-[#0B3B95] dark:text-blue-200 font-medium flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <strong>Smart Price Range Active:</strong> We will search for all properties priced at <strong>${parseFloat(targetPrice) + 25} and anything below</strong> (includes a +$25 flexibility buffer for great deals).
                      </div>
                    </div>
                  )}

                  {/* Quick price presets */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Quick Suggestions
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {['250', '500', '800', '1200'].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setTargetPrice(p)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                            targetPrice === p
                              ? 'bg-primary text-white border-primary'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/60 hover:bg-slate-200'
                          }`}
                        >
                          ${p} / mo
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* IN-CARD NAVIGATION */}
                  <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(6)}
                      className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md hover:bg-blue-800 transition-colors ml-auto cursor-pointer"
                    >
                      <span>Continue to Amenities</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: AMENITIES SELECTION */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Choose Amenities
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    Select the key features and infrastructure you need.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {popularAmenities.map((item) => {
                    const isSelected = selectedAmenities.includes(item.label);
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => handleToggleAmenity(item.label)}
                        className={`px-4 py-3 rounded-2xl text-sm font-semibold border flex items-center gap-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-primary text-white border-primary shadow-md scale-[1.02]'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:bg-blue-50/30'
                        }`}
                      >
                        <div className={`p-1 rounded-lg ${isSelected ? 'bg-white/20 text-white' : 'text-primary'}`}>
                          {item.icon}
                        </div>
                        <span>{item.label}</span>
                        {isSelected && <Check className="w-4 h-4 ml-1 stroke-[2.5]" />}
                      </button>
                    );
                  })}
                </div>

                {/* IN-CARD FINISH ACTION */}
                <div className="pt-5 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(5)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteSearch}
                    className="px-6 py-3 bg-[#0B3B95] text-white text-sm font-bold rounded-xl flex items-center gap-2 shadow-lg hover:bg-blue-800 hover:scale-[1.02] active:scale-95 transition-all ml-auto cursor-pointer"
                  >
                    <span>See Matches</span>
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* BOTTOM CONTROL FOOTER WITH NEXT / PREV / SEARCH ANYTIME */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-3 px-4 sm:px-6 z-50 shadow-lg pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
          
          {/* Back button */}
          <div className="w-24">
            {currentStep > 1 ? (
              <Button 
                variant="secondary" 
                size="md" 
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="w-full cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            ) : null}
          </div>

          {/* Progress Dots (6 total) */}
          <ProgressDots total={6} current={currentStep} />

          {/* Next or Finish Search Button */}
          <div className="w-32 flex justify-end">
            {currentStep < 6 ? (
              <Button 
                variant="primary" 
                size="md" 
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="w-full flex items-center justify-center cursor-pointer"
              >
                Next <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button 
                variant="primary" 
                size="md" 
                onClick={handleExecuteSearch}
                className="w-full flex items-center justify-center bg-[#0B3B95] hover:bg-blue-800 shadow-md font-bold cursor-pointer"
              >
                See Matches <Sparkles className="w-4 h-4 ml-1.5" />
              </Button>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}

export default function SearchWizardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SearchWizardContent />
    </Suspense>
  );
}
