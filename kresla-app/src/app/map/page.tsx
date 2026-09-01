'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Search, Grid, Loader2, MapPin, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const PropertyMap = dynamic(() => import('@/components/map/PropertyMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
      <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
      <p className="text-slate-500 font-medium text-sm">Loading map experience...</p>
    </div>
  ),
});

export default function MapPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/properties?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <main className="relative w-full h-screen pt-16 font-sans overflow-hidden">
      
      {/* FLOATING TOP FILTER & SEARCH BAR */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 w-full max-w-xl px-4">
        <form
          onSubmit={handleSearchSubmit}
          className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-2 shadow-2xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-2"
        >
          <div className="flex-1 flex items-center px-3">
            <MapPin className="w-4 h-4 text-primary mr-2.5 shrink-0" />
            <input
              type="text"
              placeholder="Search area, city or suburb..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-sm text-slate-900 dark:text-white placeholder-slate-400"
            />
          </div>

          <Button variant="primary" size="sm" type="submit">
            <Search className="w-4 h-4" />
          </Button>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

          {/* List View Toggle */}
          <button
            type="button"
            onClick={() => router.push('/properties')}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0"
          >
            <Grid className="w-4 h-4" />
            <span className="hidden sm:inline">List View</span>
          </button>
        </form>
      </div>

      {/* FULLSCREEN MAP CONTAINER */}
      <div className="w-full h-full">
        <PropertyMap />
      </div>

    </main>
  );
}
