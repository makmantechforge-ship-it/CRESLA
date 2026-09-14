'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Search, MapPin, Home, BedDouble, Briefcase, 
  Trees, Calendar, ChevronDown, SlidersHorizontal, 
  ArrowRight, Compass, Plus, DollarSign
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function HomePage() {
  const router = useRouter();

  // Search Widget State
  const [whereQuery, setWhereQuery] = useState('');
  const [typeQuery, setTypeQuery] = useState('');
  const [budgetQuery, setBudgetQuery] = useState('');

  // Dropdown visibility states
  const [whereOpen, setWhereOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [budgetOpen, setBudgetOpen] = useState(false);

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
  }, [router]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (whereQuery) params.set('city', whereQuery);
    if (typeQuery) {
      if (typeQuery === 'Homes') params.set('type', 'House');
      else if (typeQuery === 'Stays') params.set('type', 'Lodge');
      else if (typeQuery === 'Business') params.set('purpose', 'commercial');
      else if (typeQuery === 'Lands') params.set('type', 'Land');
      else if (typeQuery === 'Events & Special Places') params.set('type', 'Venue');
      else params.set('type', typeQuery);
    }
    if (budgetQuery) {
      if (budgetQuery.includes('300')) params.set('maxPrice', '300');
      else if (budgetQuery.includes('800')) params.set('maxPrice', '800');
      else if (budgetQuery.includes('1500')) params.set('maxPrice', '1500');
      else if (budgetQuery.includes('5000')) params.set('maxPrice', '5000');
    }
    router.push(`/properties?${params.toString()}`);
  };

  const cities = ['Harare', 'Bulawayo', 'Mutare', 'Gweru', 'Masvingo', 'Victoria Falls'];
  const propertyTypes = ['Homes', 'Stays', 'Business', 'Lands', 'Events & Special Places'];
  const budgetRanges = [
    'Any Budget',
    'Under $300 / mo',
    '$300 - $800 / mo',
    '$800 - $2,000 / mo',
    '$2,000 - $5,000 / mo',
    '$5,000+ / mo',
    'Under $50,000 (Buy)',
    '$50,000 - $150,000 (Buy)',
    '$150,000+ (Buy)'
  ];

  return (
    <main className="min-h-screen bg-white pt-16 font-sans antialiased text-slate-900">

      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Matching Desktop & Mobile Mockups)                        */}
      {/* ========================================================================= */}
      <section className="relative w-full min-h-[560px] sm:min-h-[640px] lg:min-h-[720px] flex flex-col justify-between overflow-hidden">
        
        {/* Hero Background Image (Twilight Modern House with glowing lights & palms) */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=85"
            alt="Luxury modern villa at dusk"
            fill
            priority
            className="object-cover object-center scale-105"
          />
          {/* Subtle gradient overlay to match mockups */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/55 to-slate-900/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/20" />
        </div>

        {/* Top Hero Container (Headline & Desktop Floating Quick Links) */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 flex flex-col lg:flex-row justify-between items-start gap-8">
          
          {/* Left Hero Headline */}
          <div className="max-w-2xl text-white space-y-2 sm:space-y-3">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
              Find your place <br className="hidden sm:inline" />with us.
            </h1>
            <p className="text-base sm:text-lg text-blue-100 font-medium hidden sm:block">
              A place for everyone!
            </p>
            <p className="text-sm text-slate-200 font-medium sm:hidden">
              Homes, stays, business, land, events and more.
            </p>
          </div>

          {/* Desktop Floating Quick Links (Top Right of Hero) */}
          <div className="hidden lg:flex flex-col items-end gap-3.5 pt-2">
            <Link
              href="/search"
              className="flex items-center gap-2 text-white hover:text-blue-200 transition-colors text-sm font-semibold group bg-black/25 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-sm"
            >
              <Search className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
              <span>Advanced Search</span>
            </Link>
            <Link
              href="/properties"
              className="flex items-center gap-2 text-white hover:text-blue-200 transition-colors text-sm font-semibold group bg-black/25 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-sm"
            >
              <Compass className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
              <span>Explore</span>
            </Link>
            <Link
              href="/upload"
              className="flex items-center gap-2 text-white hover:text-blue-200 transition-colors text-sm font-semibold group bg-black/25 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-sm"
            >
              <Plus className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
              <span>Post a Property</span>
            </Link>
          </div>

        </div>

        {/* Bottom Floating Search Widget Card (Desktop & Mobile) */}
        <div className="relative z-20 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 mt-12 sm:mt-16">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-3 sm:p-4 border border-slate-100/80">
            
            {/* Desktop / Tablet Grid: 3 Selectors + Search Button */}
            <div className="hidden md:grid md:grid-cols-12 items-center gap-2 sm:gap-4">
              
              {/* Field 1: Where are you looking? */}
              <div className="col-span-4 relative">
                <button
                  type="button"
                  onClick={() => { setWhereOpen(!whereOpen); setTypeOpen(false); setBudgetOpen(false); }}
                  className="w-full flex items-center justify-between p-2.5 sm:p-3 rounded-2xl hover:bg-slate-50 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0B3B95] flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-[#0B3B95]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 leading-tight">Where are you looking?</div>
                      <div className="text-xs text-slate-400 font-medium truncate mt-0.5">
                        {whereQuery || 'e.g. Harare, Bulawayo...'}
                      </div>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ml-2 ${whereOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Where Dropdown */}
                {whereOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                    <button
                      onClick={() => { setWhereQuery(''); setWhereOpen(false); }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#0B3B95]"
                    >
                      All Locations (Zimbabwe)
                    </button>
                    {cities.map((city) => (
                      <button
                        key={city}
                        onClick={() => { setWhereQuery(city); setWhereOpen(false); }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#0B3B95]"
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="col-span-1 hidden md:flex justify-center">
                <div className="h-8 w-px bg-slate-200" />
              </div>

              {/* Field 2: What are you looking for? */}
              <div className="col-span-3 relative">
                <button
                  type="button"
                  onClick={() => { setTypeOpen(!typeOpen); setWhereOpen(false); setBudgetOpen(false); }}
                  className="w-full flex items-center justify-between p-2.5 sm:p-3 rounded-2xl hover:bg-slate-50 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0B3B95] flex items-center justify-center shrink-0">
                      <Home className="w-4 h-4 text-[#0B3B95]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 leading-tight">What are you looking for?</div>
                      <div className="text-xs text-slate-400 font-medium truncate mt-0.5">
                        {typeQuery || 'Select property type'}
                      </div>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ml-2 ${typeOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Type Dropdown */}
                {typeOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                    <button
                      onClick={() => { setTypeQuery(''); setTypeOpen(false); }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#0B3B95]"
                    >
                      All Types
                    </button>
                    {propertyTypes.map((t) => (
                      <button
                        key={t}
                        onClick={() => { setTypeQuery(t); setTypeOpen(false); }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#0B3B95]"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="col-span-1 hidden md:flex justify-center">
                <div className="h-8 w-px bg-slate-200" />
              </div>

              {/* Field 3: Budget */}
              <div className="col-span-3 relative">
                <button
                  type="button"
                  onClick={() => { setBudgetOpen(!budgetOpen); setWhereOpen(false); setTypeOpen(false); }}
                  className="w-full flex items-center justify-between p-2.5 sm:p-3 rounded-2xl hover:bg-slate-50 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0B3B95] flex items-center justify-center shrink-0">
                      <DollarSign className="w-4 h-4 text-[#0B3B95]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 leading-tight">Budget</div>
                      <div className="text-xs text-slate-400 font-medium truncate mt-0.5">
                        {budgetQuery || 'e.g. $100 - $5000'}
                      </div>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ml-2 ${budgetOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Budget Dropdown */}
                {budgetOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                    {budgetRanges.map((b) => (
                      <button
                        key={b}
                        onClick={() => { setBudgetQuery(b === 'Any Budget' ? '' : b); setBudgetOpen(false); }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#0B3B95]"
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Button & Advanced Search */}
              <div className="col-span-12 lg:col-span-12 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 mt-2">
                <Link
                  href="/search"
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[#0B3B95] transition-colors"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                  <span>Advanced Search</span>
                  <span className="text-slate-400 font-normal">›</span>
                </Link>

                <button
                  onClick={handleSearch}
                  className="w-full sm:w-auto px-8 py-3 bg-[#0B3B95] hover:bg-blue-800 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </button>
              </div>

            </div>

            {/* Mobile Layout (Matching Mobile Mockup Screenshot 1) */}
            <div className="md:hidden space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Mobile Where? */}
                <div className="relative border border-slate-200 rounded-xl p-2.5">
                  <button
                    type="button"
                    onClick={() => { setWhereOpen(!whereOpen); setTypeOpen(false); }}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-[#0B3B95] shrink-0" />
                      <div>
                        <div className="text-[11px] font-bold text-slate-900 leading-none">Where?</div>
                        <div className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                          {whereQuery || 'e.g. Harare, Bulawayo...'}
                        </div>
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  {whereOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50">
                      {cities.map((city) => (
                        <button
                          key={city}
                          onClick={() => { setWhereQuery(city); setWhereOpen(false); }}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50"
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mobile What are you looking for? */}
                <div className="relative border border-slate-200 rounded-xl p-2.5">
                  <button
                    type="button"
                    onClick={() => { setTypeOpen(!typeOpen); setWhereOpen(false); }}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <Home className="w-4 h-4 text-[#0B3B95] shrink-0" />
                      <div>
                        <div className="text-[11px] font-bold text-slate-900 leading-none">What are you looking for?</div>
                        <div className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                          {typeQuery || 'Select property type'}
                        </div>
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  {typeOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50">
                      {propertyTypes.map((t) => (
                        <button
                          key={t}
                          onClick={() => { setTypeQuery(t); setTypeOpen(false); }}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Search Button */}
              <button
                onClick={handleSearch}
                className="w-full py-3 bg-[#0B3B95] hover:bg-blue-800 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>

              {/* Mobile Advanced Search Link Bar */}
              <Link
                href="/search"
                className="w-full py-2.5 px-3 border border-slate-200 rounded-xl flex items-center justify-between text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2 text-[#0B3B95]">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Advanced Search</span>
                </div>
                <span className="text-slate-400 font-bold">›</span>
              </Link>
            </div>

          </div>
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 2. BROWSE BY CATEGORY / EXPLORE BY CATEGORY                               */}
      {/* ========================================================================= */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              <span className="hidden sm:inline">Browse by Category</span>
              <span className="sm:hidden">Explore by Category</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              Explore different types of places, all in one platform.
            </p>
          </div>
          <Link
            href="/properties"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#0B3B95] hover:text-blue-800 transition-colors shrink-0"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 5 Category Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          
          {/* Card 1: Homes */}
          <Link
            href="/properties?type=House"
            className="group bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-400/50 transition-all flex flex-col justify-between"
          >
            <div className="space-y-1 mb-4">
              <Home className="w-6 h-6 text-[#0B3B95] stroke-[2.2]" />
              <h3 className="font-extrabold text-base text-slate-900 pt-1">Homes</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Houses, apartments, rooms & more
              </p>
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100">
              <Image
                src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=600&q=80"
                alt="Homes in Zimbabwe"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </Link>

          {/* Card 2: Stays */}
          <Link
            href="/properties?type=Lodge"
            className="group bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-400/50 transition-all flex flex-col justify-between"
          >
            <div className="space-y-1 mb-4">
              <BedDouble className="w-6 h-6 text-[#0B3B95] stroke-[2.2]" />
              <h3 className="font-extrabold text-base text-slate-900 pt-1">Stays</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Hotels, lodges, short & long stays
              </p>
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100">
              <Image
                src="https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80"
                alt="Lodges and stays"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </Link>

          {/* Card 3: Business */}
          <Link
            href="/properties?purpose=commercial"
            className="group bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-400/50 transition-all flex flex-col justify-between"
          >
            <div className="space-y-1 mb-4">
              <Briefcase className="w-6 h-6 text-[#0B3B95] stroke-[2.2]" />
              <h3 className="font-extrabold text-base text-slate-900 pt-1">Business</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Shops, offices, retail spaces & more
              </p>
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100">
              <Image
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80"
                alt="Commercial properties"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </Link>

          {/* Card 4: Lands */}
          <Link
            href="/properties?type=Land"
            className="group bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-400/50 transition-all flex flex-col justify-between"
          >
            <div className="space-y-1 mb-4">
              <Trees className="w-6 h-6 text-[#0B3B95] stroke-[2.2]" />
              <h3 className="font-extrabold text-base text-slate-900 pt-1">Lands</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Residential, commercial, agricultural & more
              </p>
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100">
              <Image
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80"
                alt="Residential and agricultural lands"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </Link>

          {/* Card 5: Events & Special Places */}
          <Link
            href="/properties?type=Venue"
            className="group bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-400/50 transition-all flex flex-col justify-between"
          >
            <div className="space-y-1 mb-4">
              <Calendar className="w-6 h-6 text-[#0B3B95] stroke-[2.2]" />
              <h3 className="font-extrabold text-base text-slate-900 pt-1 leading-snug">
                Events &amp; Special Places
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Venues, halls, unique spaces & more
              </p>
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100">
              <Image
                src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80"
                alt="Event venues and wedding spaces"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </Link>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. POPULAR LOCATIONS                                                      */}
      {/* ========================================================================= */}
      <section className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Popular Locations
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              Discover great places in top cities and towns.
            </p>
          </div>
          <Link
            href="/properties"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#0B3B95] hover:text-blue-800 transition-colors shrink-0"
          >
            <span>View all locations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 5 City Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
          {[
            { 
              name: 'Harare', 
              image: 'https://images.unsplash.com/photo-1577975882846-431adc8c2009?auto=format&fit=crop&w=600&q=80'
            },
            { 
              name: 'Bulawayo', 
              image: 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?auto=format&fit=crop&w=600&q=80'
            },
            { 
              name: 'Mutare', 
              image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80'
            },
            { 
              name: 'Gweru', 
              image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80'
            },
            { 
              name: 'Masvingo', 
              image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80'
            }
          ].map((loc) => (
            <Link
              key={loc.name}
              href={`/properties?city=${encodeURIComponent(loc.name)}`}
              className="group bg-white rounded-3xl p-3 sm:p-3.5 border border-slate-200/90 shadow-sm hover:shadow-lg hover:border-blue-400/50 transition-all"
            >
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 mb-3">
                <Image
                  src={loc.image}
                  alt={`${loc.name}, Zimbabwe`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h4 className="font-bold text-sm text-slate-800 group-hover:text-[#0B3B95] transition-colors px-1">
                {loc.name}
              </h4>
            </Link>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. DO YOU HAVE A PLACE TO OFFER? (LANDLORD CTA BANNER)                    */}
      {/* ========================================================================= */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-blue-50/90 via-blue-50/50 to-white rounded-3xl border border-blue-200/80 p-6 sm:p-10 lg:p-12 overflow-hidden shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-12">
          
          {/* Left Text Content */}
          <div className="max-w-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0B3B95]/10 flex items-center justify-center text-[#0B3B95]">
              <Home className="w-6 h-6 text-[#0B3B95] stroke-[2.2]" />
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B3B95] tracking-tight">
              Do you have a place to offer?
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Whether it&apos;s a house, lodge, land, shop, office, or venue — list it on CRESLA and reach people looking for a place.
            </p>
            
            <div className="pt-2">
              <Link
                href="/upload"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#0B3B95] hover:bg-blue-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                <span>List Your Property</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Villa Image */}
          <div className="w-full lg:w-[480px] shrink-0">
            <div className="relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden shadow-md">
              <Image
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=85"
                alt="Modern luxury property for listing"
                fill
                className="object-cover"
              />
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. HOW CRESLA WORKS                                                      */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
        <div className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How CRESLA Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Getting your next place is simple.
          </p>
        </div>

        {/* 3 Steps in a Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 relative">
          
          {/* Step 1: Search */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-[#0B3B95] flex items-center justify-center text-[#0B3B95] shrink-0 font-bold text-base">
              <Search className="w-5 h-5 text-[#0B3B95] stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900">1</span>
                <h3 className="font-extrabold text-lg text-slate-900">Search</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Find what you need.
              </p>
            </div>
          </div>

          {/* Step 2: Explore */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-[#0B3B95] flex items-center justify-center text-[#0B3B95] shrink-0 font-extrabold text-base">
              2
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900">2</span>
                <h3 className="font-extrabold text-lg text-slate-900">Explore</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                View details, photos and prices.
              </p>
            </div>
          </div>

          {/* Step 3: Connect */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-[#0B3B95] flex items-center justify-center text-[#0B3B95] shrink-0 font-extrabold text-base">
              3
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900">3</span>
                <h3 className="font-extrabold text-lg text-slate-900">Connect</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Contact the owner or provider.
              </p>
            </div>
          </div>

        </div>
      </section>

    </main>
  );
}
