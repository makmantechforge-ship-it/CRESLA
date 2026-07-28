'use client';

import dynamic from 'next/dynamic';
import { Search, Filter, SlidersHorizontal, Map as MapIcon, List } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

// Dynamically import the map component with SSR disabled
const PropertyMap = dynamic(() => import('@/components/map/PropertyMap'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-[#1034A6]/20 border-t-[#1034A6] rounded-full animate-spin mb-4" />
      <p className="text-slate-500 font-medium">Loading premium map experience...</p>
    </div>
  )
});

export default function MapPage() {
  return (
    <main className="relative w-full overflow-hidden" style={{ height: 'calc(100vh - 80px)' }}>
      {/* Map Container */}
      <div className="absolute inset-0 z-0">
        <PropertyMap />
      </div>

      {/* Floating Search & Filter Bar */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-4xl px-4 pointer-events-none">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl p-2.5 flex items-center gap-2 pointer-events-auto border border-white/60"
        >
          <div className="relative flex-1 flex items-center h-12 bg-slate-100/50 rounded-xl px-4 hover:bg-slate-100 transition-colors group">
            <Search className="w-5 h-5 text-slate-400 group-hover:text-[#1034A6] transition-colors" />
            <input 
              type="text" 
              placeholder="Search by neighborhood, city, or zip..."
              className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-slate-800 placeholder:text-slate-400 ml-3 text-sm font-medium"
            />
          </div>
          
          <button className="h-12 px-4 rounded-xl bg-slate-100/50 hover:bg-slate-100 flex items-center gap-2 text-slate-700 font-medium text-sm transition-colors whitespace-nowrap">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Price & Beds</span>
          </button>
          
          <button className="h-12 px-4 rounded-xl bg-slate-100/50 hover:bg-slate-100 flex items-center gap-2 text-slate-700 font-medium text-sm transition-colors whitespace-nowrap">
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">More Filters</span>
          </button>

          <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>

          <Link href="/properties">
            <button className="h-12 px-6 rounded-xl bg-[#1034A6] hover:bg-[#1034A6]/90 text-white flex items-center gap-2 font-semibold text-sm shadow-lg shadow-[#1034A6]/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">List View</span>
            </button>
          </Link>
        </motion.div>
      </div>

      {/* Map Action Buttons (Bottom Right) */}
      <div className="absolute bottom-8 right-8 z-10 flex flex-col gap-3">
        <motion.button 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-xl shadow-xl flex items-center justify-center text-slate-700 hover:text-[#1034A6] hover:bg-white transition-all hover:scale-[1.05] active:scale-[0.95]"
          title="Recenter Map"
        >
          <MapIcon className="w-5 h-5" />
        </motion.button>
      </div>
      
      {/* Global styles for Leaflet popups since they are mounted outside normal flow */}
      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-popup-content-wrapper {
          padding: 0;
          border-radius: 1rem;
          overflow: hidden;
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
        }
        .leaflet-popup-content {
          margin: 0;
          width: 100% !important;
        }
        .leaflet-popup-close-button {
          top: 12px !important;
          right: 12px !important;
          color: white !important;
          background: rgba(0,0,0,0.5) !important;
          border-radius: 50%;
          width: 24px !important;
          height: 24px !important;
          display: flex !important;
          align-items: center;
          justify-content: center;
          padding: 0 !important;
          z-index: 10;
          backdrop-filter: blur(4px);
        }
        .leaflet-popup-close-button:hover {
          background: rgba(0,0,0,0.7) !important;
        }
        .leaflet-popup-close-button span {
          margin-top: -2px;
        }
        .leaflet-popup-tip-container {
          margin-top: -1px;
        }
        /* Custom map control styles */
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1) !important;
          border-radius: 0.75rem !important;
          overflow: hidden;
          margin-right: 2rem !important;
          margin-bottom: 2rem !important;
        }
        .leaflet-control-zoom a {
          color: #334155 !important;
          background: rgba(255, 255, 255, 0.9) !important;
          backdrop-filter: blur(8px);
          width: 48px !important;
          height: 48px !important;
          line-height: 48px !important;
          font-size: 1.25rem !important;
        }
        .leaflet-control-zoom a:hover {
          color: #1034A6 !important;
          background: #ffffff !important;
        }
      `}} />
    </main>
  );
}
