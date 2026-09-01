import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin } from 'lucide-react';

interface PropertyPreviewProps {
  property: any;
}

export function PropertyPreview({ property }: PropertyPreviewProps) {
  const priceFormatted = '$' + new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(property.price);

  return (
    <div className="w-64 bg-white rounded-xl shadow-lg overflow-hidden border border-slate-100">
      <div className="relative h-28 w-full">
        <Image
          src={property.imageUrl || property.images?.[0] || '/placeholder-property.jpg'}
          alt={property.title}
          fill
          className="object-cover rounded-t-xl"
          sizes="(max-width: 768px) 100vw, 256px"
        />
      </div>
      
      <div className="p-3">
        <h4 className="font-semibold text-sm text-slate-900 line-clamp-1" title={property.title}>
          {property.title}
        </h4>
        
        <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="line-clamp-1">{property.city || property.location}</span>
        </div>
        
        <div className="mt-2 flex items-center justify-between">
          <div className="text-primary font-bold text-sm">
            {priceFormatted} {property.type === 'rent' ? <span className="text-xs font-normal text-slate-500">/mo</span> : ''}
          </div>
          
          <Link 
            href={`/properties/${property.id}`}
            className="text-xs text-primary hover:text-primary-light font-medium transition-colors"
          >
            View property &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
