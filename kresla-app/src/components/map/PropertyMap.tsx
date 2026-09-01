'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getProperties } from '@/utils/supabase/queries';
import { properties as mockProperties } from '@/data/properties';
import { PropertyPreview } from '@/components/ui/PropertyPreview';

interface PropertyMapProps {
  filteredProperties?: any[];
}

export default function PropertyMap({ filteredProperties }: PropertyMapProps) {
  const [mounted, setMounted] = useState(false);
  const [propertiesList, setPropertiesList] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    if (filteredProperties && filteredProperties.length > 0) {
      setPropertiesList(filteredProperties);
    } else {
      getProperties().then((dbProps) => {
        if (dbProps && dbProps.length > 0) {
          setPropertiesList(dbProps);
        } else {
          setPropertiesList(mockProperties);
        }
      });
    }
  }, [filteredProperties]);

  if (!mounted) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-2xl">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Create custom price label Leaflet Icon
  const createPriceMarker = (price: number) => {
    const formattedPrice = '$' + new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(price);
    return L.divIcon({
      className: 'custom-price-marker',
      html: `<div class="bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg border border-white hover:scale-110 transition-transform cursor-pointer">${formattedPrice}</div>`,
      iconSize: [60, 24],
      iconAnchor: [30, 12],
    });
  };

  const defaultCenter: [number, number] = [-17.8292, 31.0522]; // Harare, Zimbabwe

  return (
    <MapContainer
      center={defaultCenter}
      zoom={6}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%', borderRadius: '1.5rem', zIndex: 10 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {propertiesList.map((property) => {
        const lat = property.lat || -17.8292;
        const lng = property.lng || 31.0522;
        return (
          <Marker
            key={property.id}
            position={[lat, lng]}
            icon={createPriceMarker(property.price)}
          >
            <Popup className="custom-property-popup">
              <PropertyPreview property={property} />
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
