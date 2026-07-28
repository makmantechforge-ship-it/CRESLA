'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { properties } from '@/data/properties';
import { MapPin, Bed, Bath, Square, Heart, TrendingDown, ArrowRight, Home } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function FavoritesPage() {
  // Use first 4 properties as mock saved properties
  const [savedProperties, setSavedProperties] = useState(properties.slice(0, 4));

  const handleRemove = (id: string) => {
    setSavedProperties((prev) => prev.filter((p) => p.id !== id));
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      maximumFractionDigits: 0,
    }).format(price).replace('ZAR', currency);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
              Saved Properties
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              You have {savedProperties.length} {savedProperties.length === 1 ? 'property' : 'properties'} saved.
            </p>
          </div>
          
          {savedProperties.length > 0 && (
            <button className="inline-flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors px-6 py-2.5 font-medium text-sm shadow-sm">
              Compare Properties
            </button>
          )}
        </div>

        {/* Content Section */}
        {savedProperties.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {savedProperties.map((property, index) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.3 }}
                  key={property.id}
                  className="group relative flex flex-col bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <Image
                      src={property.images[0]}
                      alt={property.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    
                    {/* Glassmorphism Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                      <div className="flex flex-col gap-2">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-xs font-semibold text-primary dark:text-blue-400 shadow-sm">
                          {property.category}
                        </span>
                        {/* Mock Price Drop on the first item */}
                        {index === 0 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/90 backdrop-blur-md text-xs font-semibold text-white shadow-sm">
                            <TrendingDown className="w-3 h-3" />
                            Price dropped by R5,000
                          </span>
                        )}
                      </div>
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemove(property.id)}
                        className="p-2 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-red-500 hover:text-white hover:bg-red-500 transition-colors shadow-sm"
                        aria-label="Remove from favorites"
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  </div>

                  {/* Content Container */}
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="mb-2">
                      <div className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-1">
                        {formatPrice(property.price, property.currency)}
                        {property.priceType === 'rent' && (
                          <span className="text-sm font-normal text-slate-500 dark:text-slate-400">/mo</span>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-1 mb-1">
                      {property.title}
                    </h3>
                    
                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-4 line-clamp-1">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      {property.suburb}, {property.city}
                    </p>

                    {/* Divider */}
                    <div className="w-full h-px bg-slate-100 dark:bg-slate-800 my-4 mt-auto" />

                    {/* Features */}
                    <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300 text-sm">
                      <div className="flex items-center gap-1.5" title="Bedrooms">
                        <Bed className="w-4 h-4 text-slate-400" />
                        <span className="font-medium">{property.bedrooms}</span>
                      </div>
                      <div className="flex items-center gap-1.5" title="Bathrooms">
                        <Bath className="w-4 h-4 text-slate-400" />
                        <span className="font-medium">{property.bathrooms}</span>
                      </div>
                      <div className="flex items-center gap-1.5" title="Size">
                        <Square className="w-4 h-4 text-slate-400" />
                        <span className="font-medium">{property.size} {property.sizeUnit}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 px-4 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm"
          >
            <div className="w-24 h-24 mb-6 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
              <Home className="w-10 h-10 text-slate-300 dark:text-slate-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              No saved properties yet
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
              Properties you save will appear here. Start exploring and click the heart icon on properties you love to keep track of them.
            </p>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors shadow-sm hover:shadow-md"
            >
              Explore Properties
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
