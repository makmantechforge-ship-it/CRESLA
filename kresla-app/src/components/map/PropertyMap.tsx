'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getProperties } from '@/utils/supabase/queries';
import Image from 'next/image';
import Link from 'next/link';
import { Bed, Bath, Square, MapPin } from 'lucide-react';

const createCustomIcon = (price: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div class="bg-[#1034A6] text-white font-semibold px-3 py-1.5 rounded-full shadow-lg border-2 border-white whitespace-nowrap text-sm hover:bg-[#1034A6]/90 transition-colors cursor-pointer">${price}</div>`,
    iconSize: [80, 40],
    iconAnchor: [40, 40],
    popupAnchor: [0, -40],
  });
};

export default function PropertyMap() {
  const [mounted, setMounted] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    setMounted(true);
    // Fix for Leaflet default icon issues in Next.js
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });

    // Detect user position for "Houses Near Me"
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.log('Location access denied or unavailable', err)
      );
    }

    const fetchProperties = async () => {
      const data = await getProperties();
      if (data && data.length > 0) {
        setProperties(data);
      } else {
        // Fallback to local properties if DB is fresh/empty
        const { properties: fallbackProps } = await import('@/data/properties');
        setProperties(fallbackProps as any[]);
      }
    };
    fetchProperties();
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full bg-slate-50 animate-pulse flex items-center justify-center">
        <div className="text-slate-400 font-medium">Loading Zimbabwe property map...</div>
      </div>
    );
  }

  // Default to Harare, Zimbabwe coordinates or User location
  const center: [number, number] = userLocation || [-17.8252, 31.0335];

  return (
    <MapContainer 
      center={center} 
      zoom={12} 
      className="w-full h-full z-0"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      
      {properties?.map((property) => {
        const lat = property.lat || center[0] + (Math.random() - 0.5) * 0.1;
        const lng = property.lng || center[1] + (Math.random() - 0.5) * 0.1;
        const priceStr = `R${(property.price >= 1000000 ? (property.price / 1000000).toFixed(1) + 'M' : (property.price / 1000).toFixed(0) + 'k')}`;
        
        return (
          <Marker 
            key={property.id} 
            position={[lat, lng]} 
            icon={createCustomIcon(priceStr)}
          >
            <Popup className="property-popup" maxWidth={320} minWidth={320}>
              <Link href={`/properties/${property.id}`} className="block flex flex-col gap-3 p-1 hover:opacity-95 transition-opacity">
                <div className="relative w-full h-40 rounded-xl overflow-hidden bg-slate-100">
                  <Image 
                    src={property.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'}
                    alt={property.title}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-semibold text-[#1034A6] shadow-sm">
                    {property.price_type === 'rent' ? 'For Rent' : 'For Sale'}
                  </div>
                </div>
                
                <div className="flex flex-col gap-1 px-1">
                  <h3 className="font-semibold text-base text-slate-900 line-clamp-1">{property.title}</h3>
                  <div className="flex items-center text-slate-500 text-sm">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span className="line-clamp-1">{property.suburb}, {property.city}</span>
                  </div>
                  <div className="font-bold text-lg text-[#1034A6] mt-1">
                    R{property.price.toLocaleString()}
                  </div>
                </div>
                
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-1 px-1 text-sm text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Bed className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">{property.bedrooms}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Bath className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">{property.bathrooms}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Square className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">{property.size} {property.size_unit}</span>
                  </div>
                </div>
              </Link>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
