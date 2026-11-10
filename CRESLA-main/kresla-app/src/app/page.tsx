'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Search, SlidersHorizontal, ArrowRight, Compass, Plus, Briefcase,
  Home, BedDouble, Trees, Calendar
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function HomePage() {
  const router = useRouter();

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

        {/* Minimalistic Clean Blue Advanced Search Bar */}
        <div className="relative z-20 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-10 sm:pb-14 mt-12 sm:mt-16">
          <Link
            href="/search"
            className="group block w-full bg-[#0B3B95]/95 hover:bg-[#0B3B95] backdrop-blur-md text-white rounded-full p-2.5 sm:p-3 sm:pl-7 shadow-2xl border border-white/20 transition-all duration-300 hover:scale-[1.01] hover:shadow-blue-900/40"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center shrink-0 text-white group-hover:bg-white/25 transition-colors">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                    <span>Advanced Search</span>
                    <span className="hidden sm:inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-white/20 text-blue-100">
                      Smart Filter
                    </span>
                  </div>
                  <div className="text-xs text-blue-100/80 font-medium truncate hidden sm:block">
                    Filter by city, purpose (rent/buy), budget, bedrooms, solar & boreholes...
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white text-[#0B3B95] px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-bold text-sm shrink-0 shadow-md group-hover:bg-blue-50 transition-colors">
                <Search className="w-4 h-4" />
                <span className="hidden xs:inline">Search</span>
              </div>
            </div>
          </Link>
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
            href="/properties?category=Homes"
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
            href="/properties?category=Stays"
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
            href="/properties?category=Business"
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
            href="/properties?category=Lands"
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
            href="/properties?category=Events"
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
