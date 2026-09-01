'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Building2, 
  Briefcase, 
  MapPin, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Sparkles,
  Sun,
  Droplets,
  Trees,
  Wifi,
  Key,
  Shield
} from 'lucide-react';
import { properties as mockProperties } from '@/data/properties';
import { getProperties } from '@/utils/supabase/queries';
import { ProgressDots } from '@/components/ui/ProgressDots';
import { Button } from '@/components/ui/Button';

function SearchWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [currentStep, setCurrentStep] = useState(1);
  const [allProperties, setAllProperties] = useState<any[]>(mockProperties || []);

  // Wizard Form State
  const [intent, setIntent] = useState<'rent' | 'sale' | 'commercial'>('rent');
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('All');
  const [bedrooms, setBedrooms] = useState('Any');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

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
    else if (qIntent === 'commercial') setIntent('commercial');
    else if (qIntent === 'rent') setIntent('rent');

    const qLoc = searchParams.get('location') || searchParams.get('city');
    if (qLoc) setLocation(qLoc);
  }, [searchParams]);

  // Derived available locations from platform data
  const availableLocations = useMemo(() => {
    const locs = new Set<string>();
    allProperties.forEach((p) => {
      if (p.city) locs.add(p.city);
      if (p.suburb) locs.add(p.suburb);
    });
    return Array.from(locs).sort();
  }, [allProperties]);

  // Property types available
  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    allProperties.forEach((p) => {
      if (p.type) types.add(p.type);
    });
    return ['All', ...Array.from(types).sort()];
  }, [allProperties]);

  const popularLocations = ['Borrowdale', 'Avondale', 'Highlands', 'Mount Pleasant', 'Bulawayo', 'Victoria Falls'];

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

  const handleFinishSearch = () => {
    const params = new URLSearchParams();
    if (intent) params.set('purpose', intent);
    if (location.trim()) params.set('search', location.trim());
    if (propertyType !== 'All') params.set('type', propertyType);
    if (bedrooms !== 'Any') params.set('bedrooms', bedrooms);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (selectedAmenities.length > 0) params.set('amenities', selectedAmenities.join(','));

    // Save to localStorage recent searches
    try {
      const recent = JSON.parse(localStorage.getItem('cresla_recent_searches') || '[]');
      const newEntry = {
        intent,
        location: location || 'All locations',
        bedrooms,
        timestamp: Date.now(),
      };
      const updated = [newEntry, ...recent.filter((r: any) => r.location !== newEntry.location).slice(0, 4)];
      localStorage.setItem('cresla_recent_searches', JSON.stringify(updated));
    } catch (e) {
      // Ignore localStorage errors
    }

    router.push(`/properties?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 pb-28 font-sans flex flex-col justify-between">
      <div className="max-w-2xl mx-auto px-4 w-full pt-8">
        
        {/* TOP WIZARD NAVIGATION BAR */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 bg-primary/10 text-primary rounded-full">
              Step {currentStep} of 5
            </span>
          </div>

          <button
            onClick={handleFinishSearch}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Skip to results →
          </button>
        </div>

        {/* STEP CAROUSEL WITH ANIMATION */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-200/80 dark:border-slate-800 space-y-6"
          >
            
            {/* STEP 1: PURPOSE */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">What do you want to do?</h1>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Select your primary goal on CRESLA.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  {[
                    { id: 'rent', label: 'Rent', desc: 'Looking for a rental home', icon: Home },
                    { id: 'sale', label: 'Buy', desc: 'Looking to purchase property', icon: Building2 },
                    { id: 'commercial', label: 'Commercial', desc: 'Offices, retail & industrial', icon: Briefcase },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = intent === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setIntent(item.id as any)}
                        className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 text-center transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'border-primary bg-primary/5 text-primary shadow-md scale-[1.02]'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        <Icon className={`w-8 h-8 mb-3 ${isSelected ? 'text-primary' : 'text-slate-400'}`} />
                        <span className="font-bold text-base">{item.label}</span>
                        <span className="text-xs text-slate-500 mt-1">{item.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: LOCATION */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Where do you want to live?</h1>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Enter a city, suburb, or neighborhood in Zimbabwe.</p>
                </div>

                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Borrowdale, Harare or Bulawayo"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-base outline-none focus:ring-2 focus:ring-primary/30 transition-all text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Popular Locations</label>
                  <div className="flex flex-wrap gap-2">
                    {popularLocations.map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setLocation(loc)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                          location === loc
                            ? 'bg-primary text-white border-primary'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-transparent hover:bg-slate-200'
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: PROPERTY TYPE */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">What type of place?</h1>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Select the property category that fits your vision.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {availableTypes.map((type) => {
                    const isSelected = propertyType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setPropertyType(type)}
                        className={`p-4 rounded-2xl border text-center font-semibold text-sm transition-all cursor-pointer ${
                          isSelected
                            ? 'border-primary bg-primary text-white shadow-md'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        {type === 'All' ? 'All Types' : type}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 4: SIZE & BUDGET */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bedrooms & Budget</h1>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Specify space requirements and price bounds.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Bedrooms</label>
                  <div className="flex gap-2">
                    {['Any', '1', '2', '3', '4'].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setBedrooms(b)}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                          bedrooms === b
                            ? 'bg-primary text-white border-primary shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {b === 'Any' ? 'Any' : `${b}+`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Min Price ($)</label>
                    <input
                      type="number"
                      placeholder="e.g. 500"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Max Price ($)</label>
                    <input
                      type="number"
                      placeholder="e.g. 2000"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: PREFERENCES */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">What matters most?</h1>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Select key amenities and lifestyle preferences.</p>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {popularAmenities.map((item) => {
                    const isSelected = selectedAmenities.includes(item.label);
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => handleToggleAmenity(item.label)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium border flex items-center gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-primary text-white border-primary shadow-sm scale-[1.02]'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary/50'
                        }`}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                        {isSelected && <Check className="w-4 h-4 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* BOTTOM CONTROL FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-4 px-6 z-40">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            {currentStep > 1 ? (
              <Button variant="secondary" size="md" onClick={() => setCurrentStep((prev) => prev - 1)}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            ) : (
              <div />
            )}
          </div>

          <ProgressDots total={5} current={currentStep} />

          <div>
            {currentStep < 5 ? (
              <Button variant="primary" size="md" onClick={() => setCurrentStep((prev) => prev + 1)}>
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button variant="primary" size="md" onClick={handleFinishSearch}>
                See Matches <Sparkles className="w-4 h-4 ml-2" />
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
