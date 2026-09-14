'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Grid, 
  Map as MapIcon, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Building2, 
  Sparkles,
  Search,
  RotateCcw
} from 'lucide-react';
import { PropertyCard } from '@/components/ui/PropertyCard';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { FilterSummary } from '@/components/ui/FilterSummary';
import { FilterDrawer } from '@/components/ui/FilterDrawer';
import { properties as mockProperties } from '@/data/properties';
import { getProperties, getUserFavorites, addFavorite, removeFavorite } from '@/utils/supabase/queries';
import { createClient } from '@/utils/supabase/client';

function PropertiesResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [allProperties, setAllProperties] = useState<any[]>(mockProperties || []);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'rating'>('newest');

  // Filter States initialized from URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [purpose, setPurpose] = useState(searchParams.get('purpose') || 'All');
  const [city, setCity] = useState(searchParams.get('city') || 'All');
  const [suburb, setSuburb] = useState(searchParams.get('suburb') || 'All');
  const [type, setType] = useState(searchParams.get('type') || 'All');
  const [bedrooms, setBedrooms] = useState(searchParams.get('bedrooms') || 'Any');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    searchParams.get('amenities') ? searchParams.get('amenities')!.split(',') : []
  );

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const favs = await getUserFavorites(user.id);
        setFavorites(favs.map((f: any) => f.id));
      }

      const dbProps = await getProperties();
      // Combine DB properties with mock/catalog properties (deduplicating by ID)
      const combined = [...(dbProps || [])];
      const dbIds = new Set(combined.map((p: any) => p.id));
      mockProperties.forEach((p: any) => {
        if (!dbIds.has(p.id)) {
          combined.push(p);
        }
      });
      setAllProperties(combined);
      setLoading(false);
    };

    init();
  }, []);

  // Synchronize state with URL params when searchParams change
  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
    setCategory(searchParams.get('category') || 'All');
    setPurpose(searchParams.get('purpose') || 'All');
    setCity(searchParams.get('city') || 'All');
    setSuburb(searchParams.get('suburb') || 'All');
    setType(searchParams.get('type') || 'All');
    setBedrooms(searchParams.get('bedrooms') || 'Any');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setSelectedAmenities(
      searchParams.get('amenities') ? searchParams.get('amenities')!.split(',') : []
    );
  }, [searchParams]);

  // Derived filter options from platform properties
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    allProperties.forEach((p) => { if (p.city) set.add(p.city); });
    return ['All', ...Array.from(set).sort()];
  }, [allProperties]);

  const availableTypes = useMemo(() => {
    const set = new Set<string>();
    allProperties.forEach((p) => { if (p.type) set.add(p.type); });
    return ['All', ...Array.from(set).sort()];
  }, [allProperties]);

  const availableAmenities = useMemo(() => {
    const set = new Set<string>();
    allProperties.forEach((p) => {
      if (Array.isArray(p.amenities)) {
        p.amenities.forEach((a: string) => set.add(a));
      }
    });
    return Array.from(set).sort();
  }, [allProperties]);

  // Filtering Logic
  const filteredProperties = useMemo(() => {
    let result = allProperties.filter((property) => {
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = property.title?.toLowerCase().includes(q);
        const matchesCity = property.city?.toLowerCase().includes(q);
        const matchesSuburb = property.suburb?.toLowerCase().includes(q);
        const matchesDesc = property.description?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCity && !matchesSuburb && !matchesDesc) return false;
      }

      // Category Filter (Homes, Stays, Business, Lands, Events & Special Places)
      if (category !== 'All') {
        const c = category.toLowerCase();
        const pCat = (property.category || '').toLowerCase();
        const pType = (property.type || '').toLowerCase();
        const pPurpose = (property.priceType || property.price_type || '').toLowerCase();

        if (c.includes('home')) {
          if (!pCat.includes('home') && !pCat.includes('residential') && !['house', 'apartment', 'villa', 'townhouse'].includes(pType)) return false;
        } else if (c.includes('stay') || c.includes('lodge') || c.includes('hotel')) {
          if (!pCat.includes('stay') && !pCat.includes('hospitality') && !['lodge', 'hotel', 'guest house'].includes(pType)) return false;
        } else if (c.includes('business') || c.includes('commercial')) {
          if (!pCat.includes('business') && !pCat.includes('commercial') && pPurpose !== 'commercial' && !['office', 'shop', 'warehouse', 'commercial', 'retail'].includes(pType)) return false;
        } else if (c.includes('land')) {
          if (!pCat.includes('land') && pType !== 'land') return false;
        } else if (c.includes('event') || c.includes('venue')) {
          if (!pCat.includes('event') && pType !== 'venue') return false;
        } else {
          if (pCat !== c && pType !== c) return false;
        }
      }

      // Purpose Filter
      const pPurpose = (property.priceType || property.price_type || '').toLowerCase();
      if (purpose !== 'All') {
        const purp = purpose.toLowerCase();
        if (purp === 'commercial') {
          const pCat = (property.category || '').toLowerCase();
          const pType = (property.type || '').toLowerCase();
          if (pPurpose !== 'commercial' && pCat !== 'business' && pCat !== 'commercial' && !['office', 'shop', 'warehouse', 'commercial', 'retail'].includes(pType)) {
            return false;
          }
        } else if (pPurpose !== purp) {
          return false;
        }
      }

      // City Filter
      if (city !== 'All' && property.city !== city) return false;

      // Suburb Filter
      if (suburb !== 'All' && property.suburb !== suburb) return false;

      // Type Filter
      if (type !== 'All') {
        const t = type.toLowerCase();
        const pType = (property.type || '').toLowerCase();
        const pCat = (property.category || '').toLowerCase();
        if (t === 'land' || t === 'lands') {
          if (pType !== 'land' && !pCat.includes('land')) return false;
        } else if (t === 'venue' || t === 'events') {
          if (pType !== 'venue' && !pCat.includes('event')) return false;
        } else if (t === 'lodge' || t === 'stays') {
          if (!['lodge', 'hotel', 'guest house'].includes(pType) && !pCat.includes('stay')) return false;
        } else if (t === 'house' || t === 'homes') {
          if (!['house', 'villa', 'townhouse'].includes(pType) && !pCat.includes('home')) return false;
        } else if (pType !== t) {
          return false;
        }
      }

      // Bedrooms
      if (bedrooms !== 'Any') {
        const bedsInt = parseInt(bedrooms);
        if (property.bedrooms < bedsInt) return false;
      }

      // Min / Max Price
      if (minPrice && property.price < parseFloat(minPrice)) return false;
      if (maxPrice && property.price > parseFloat(maxPrice)) return false;

      // Amenities
      if (selectedAmenities.length > 0) {
        const pAmenities = property.amenities || [];
        const hasAll = selectedAmenities.every((a) => pAmenities.includes(a));
        if (!hasAll) return false;
      }

      return true;
    });

    // Sorting
    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return result;
  }, [allProperties, searchQuery, category, purpose, city, suburb, type, bedrooms, minPrice, maxPrice, selectedAmenities, sortBy]);

  // Active filters list for FilterSummary component
  const activeFilters = useMemo(() => {
    const items: { label: string; onRemove: () => void }[] = [];
    if (searchQuery) items.push({ label: `"${searchQuery}"`, onRemove: () => setSearchQuery('') });
    if (category !== 'All') items.push({ label: `Category: ${category}`, onRemove: () => setCategory('All') });
    if (purpose !== 'All') items.push({ label: purpose === 'rent' ? 'For Rent' : purpose === 'sale' ? 'For Sale' : purpose, onRemove: () => setPurpose('All') });
    if (city !== 'All') items.push({ label: city, onRemove: () => setCity('All') });
    if (suburb !== 'All') items.push({ label: suburb, onRemove: () => setSuburb('All') });
    if (type !== 'All') items.push({ label: type, onRemove: () => setType('All') });
    if (bedrooms !== 'Any') items.push({ label: `${bedrooms}+ beds`, onRemove: () => setBedrooms('Any') });
    if (minPrice) items.push({ label: `Min $${minPrice}`, onRemove: () => setMinPrice('') });
    if (maxPrice) items.push({ label: `Max $${maxPrice}`, onRemove: () => setMaxPrice('') });
    selectedAmenities.forEach((a) => {
      items.push({
        label: a,
        onRemove: () => setSelectedAmenities((prev) => prev.filter((item) => item !== a)),
      });
    });
    return items;
  }, [searchQuery, category, purpose, city, suburb, type, bedrooms, minPrice, maxPrice, selectedAmenities]);

  const handleClearAll = () => {
    setSearchQuery('');
    setCategory('All');
    setPurpose('All');
    setCity('All');
    setSuburb('All');
    setType('All');
    setBedrooms('Any');
    setMinPrice('');
    setMaxPrice('');
    setSelectedAmenities([]);
    router.push('/properties');
  };

  const handleSaveToggle = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to save properties.');
      return;
    }

    const isFav = favorites.includes(id);
    try {
      if (isFav) {
        await removeFavorite(user.id, id);
        setFavorites((prev) => prev.filter((fId) => fId !== id));
      } else {
        await addFavorite(user.id, id);
        setFavorites((prev) => [...prev, id]);
      }
    } catch (err) {
      console.error('Failed to toggle favorite', err);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* CONTROL HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Homes for you</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {filteredProperties.length} {filteredProperties.length === 1 ? 'property matches' : 'properties match'} your preferences.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none cursor-pointer shadow-xs"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Filter Drawer Toggle */}
            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-primary/50 transition-colors shadow-xs cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
              <span>Filters</span>
              {activeFilters.length > 0 && (
                <span className="bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {activeFilters.length}
                </span>
              )}
            </button>

            {/* Map Toggle Button */}
            <button
              onClick={() => router.push('/map')}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary-dark transition-colors shadow-sm cursor-pointer"
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map View</span>
            </button>
          </div>
        </div>

        {/* ACTIVE FILTER SUMMARY STRIP */}
        <FilterSummary filters={activeFilters} onClearAll={handleClearAll} />

        {/* RESULTS GRID */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          <EmptyState
            title="No matching homes found"
            description="We couldn't find properties matching your exact criteria. Try broadening your location, adjusting budget, or clearing filters."
            icon={<Building2 className="w-12 h-12 text-slate-300" />}
            actions={[
              { label: 'Clear All Filters', onClick: handleClearAll },
              { label: 'Modify Search', onClick: () => setIsFilterDrawerOpen(true) },
            ]}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onSave={handleSaveToggle}
                isSaved={favorites.includes(property.id)}
              />
            ))}
          </div>
        )}

      </div>

      {/* FILTER DRAWER SLIDE-OVER */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
      >
        <div className="space-y-6">
          {/* Keyword Search */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Keyword Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Title, suburb, address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Purpose</label>
            <div className="flex gap-2">
              {['All', 'rent', 'sale'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPurpose(p)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize border transition-all cursor-pointer ${
                    purpose === p
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {p === 'rent' ? 'For Rent' : p === 'sale' ? 'For Sale' : 'All'}
                </button>
              ))}
            </div>
          </div>

          {/* City */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">City / Region</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none text-slate-900 dark:text-white cursor-pointer"
            >
              {availableCities.map((c) => (
                <option key={c} value={c}>{c === 'All' ? 'All Cities' : c}</option>
              ))}
            </select>
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Property Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none text-slate-900 dark:text-white cursor-pointer"
            >
              {availableTypes.map((t) => (
                <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>
              ))}
            </select>
          </div>

          {/* Bedrooms */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Bedrooms</label>
            <div className="flex gap-1.5">
              {['Any', '1', '2', '3', '4'].map((b) => (
                <button
                  key={b}
                  onClick={() => setBedrooms(b)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    bedrooms === b
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {b === 'Any' ? 'Any' : `${b}+`}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Min Price ($)</label>
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Max Price ($)</label>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Amenities */}
          {availableAmenities.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {availableAmenities.map((a) => {
                  const isSel = selectedAmenities.includes(a);
                  return (
                    <button
                      key={a}
                      onClick={() =>
                        setSelectedAmenities((prev) =>
                          prev.includes(a) ? prev.filter((item) => item !== a) : [...prev, a]
                        )
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                        isSel
                          ? 'bg-primary text-white border-primary'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {a}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Clear & Apply Actions */}
          <div className="pt-4 flex gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleClearAll}
              className="flex-1 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-colors"
            >
              Reset All
            </button>
            <button
              onClick={() => setIsFilterDrawerOpen(false)}
              className="flex-1 py-3 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary-dark transition-colors shadow-sm"
            >
              Show {filteredProperties.length} Results
            </button>
          </div>
        </div>
      </FilterDrawer>

    </main>
  );
}

export default function PropertiesResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PropertiesResultsContent />
    </Suspense>
  );
}
