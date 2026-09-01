'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { SaveButton } from './SaveButton';

interface PropertyCardProps {
  property: any;
  onSave?: (e: React.MouseEvent, id: string) => void;
  isSaved?: boolean;
}

export function PropertyCard({ property, onSave, isSaved = false }: PropertyCardProps) {
  const priceFormatted = '$' + new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(property.price);

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onSave) onSave(e, property.id);
  };

  return (
    <Link href={`/properties/${property.id}`} className="block group">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
        {/* Image Container */}
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <Image
            src={property.imageUrl || property.images?.[0] || '/placeholder-property.jpg'}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Overlays */}
          <div className="absolute top-3 right-3 z-10">
            <SaveButton saved={isSaved} onToggle={handleSaveToggle} />
          </div>

          <div className="absolute bottom-3 left-3 z-10">
            <div className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-full text-sm font-semibold text-slate-900 shadow-sm">
              {priceFormatted} {property.type === 'rent' ? '/mo' : ''}
            </div>
          </div>

          {property.verified && (
            <div className="absolute top-3 left-3 z-10">
              <div className="bg-emerald-500 text-white px-2.5 py-1 rounded-full text-xs font-medium shadow-sm">
                Verified
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 pt-4">
          <h3 className="font-semibold text-slate-900 line-clamp-1">{property.title}</h3>
          
          <div className="flex items-center gap-1 mt-1 text-sm text-slate-500">
            <MapPin className="w-3.5 h-3.5" />
            <span className="line-clamp-1">{property.city || property.location}</span>
          </div>

          <div className="text-xs text-slate-500 mt-2">
            {property.beds} beds &middot; {property.baths} baths &middot; {property.size || property.area}m&sup2;
          </div>
        </div>
      </div>
    </Link>
  );
}
