'use client';

import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Zimbabwe cities with coordinates for location picking
const ZIM_CITIES: { name: string; lat: number; lng: number; province: string }[] = [
  { name: 'Harare', lat: -17.8292, lng: 31.0522, province: 'Harare' },
  { name: 'Borrowdale', lat: -17.7470, lng: 31.0930, province: 'Harare' },
  { name: 'Avondale', lat: -17.7870, lng: 31.0280, province: 'Harare' },
  { name: 'Mount Pleasant', lat: -17.7730, lng: 31.0440, province: 'Harare' },
  { name: 'Highlands', lat: -17.8050, lng: 31.0700, province: 'Harare' },
  { name: 'Glen Lorne', lat: -17.7250, lng: 31.1100, province: 'Harare' },
  { name: 'Greendale', lat: -17.8100, lng: 31.1000, province: 'Harare' },
  { name: 'Marlborough', lat: -17.7700, lng: 30.9800, province: 'Harare' },
  { name: 'Chitungwiza', lat: -18.0127, lng: 31.0755, province: 'Harare' },
  { name: 'Bulawayo', lat: -20.1325, lng: 28.6265, province: 'Bulawayo' },
  { name: 'Hillside (Bulawayo)', lat: -20.1600, lng: 28.6400, province: 'Bulawayo' },
  { name: 'Victoria Falls', lat: -17.9318, lng: 25.8325, province: 'Matabeleland North' },
  { name: 'Mutare', lat: -18.9707, lng: 32.6709, province: 'Manicaland' },
  { name: 'Gweru', lat: -19.4500, lng: 29.8167, province: 'Midlands' },
  { name: 'Masvingo', lat: -20.0639, lng: 30.8277, province: 'Masvingo' },
  { name: 'Chinhoyi', lat: -17.3622, lng: 30.2008, province: 'Mashonaland West' },
  { name: 'Kadoma', lat: -18.3333, lng: 29.9000, province: 'Mashonaland West' },
  { name: 'Kariba', lat: -16.5228, lng: 28.7986, province: 'Mashonaland West' },
  { name: 'Nyanga', lat: -18.2167, lng: 32.7500, province: 'Manicaland' },
];

interface LocationPickerMapProps {
  /** Callback fired when the user selects a location on the map */
  onSelectLocation: (locationName: string) => void;
  /** Currently selected location string (for highlighting) */
  selectedLocation?: string;
}

/** Creates a styled city marker icon for the map */
const createCityMarker = (cityName: string, isSelected: boolean) => {
  return L.divIcon({
    className: 'location-picker-marker',
    html: `<div style="
      background: ${isSelected ? '#0B3B95' : '#ffffff'};
      color: ${isSelected ? '#ffffff' : '#0B3B95'};
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 999px;
      border: 2px solid ${isSelected ? '#ffffff' : '#0B3B95'};
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      white-space: nowrap;
      cursor: pointer;
      transition: transform 0.15s;
    ">${cityName}</div>`,
    iconSize: [80, 28],
    iconAnchor: [40, 14],
  });
};

/**
 * A lightweight interactive Leaflet map for picking locations in Zimbabwe.
 * Shows city markers that the user can click to select a location.
 * Used as an optional companion in the search wizard's Location step.
 */
export default function LocationPickerMap({ onSelectLocation, selectedLocation }: LocationPickerMapProps) {
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-2xl">
        <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const defaultCenter: [number, number] = [-18.8, 29.8]; // Center of Zimbabwe
  const defaultZoom = 6;

  return (
    <MapContainer
      center={defaultCenter}
      zoom={defaultZoom}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%', borderRadius: '1rem', zIndex: 10 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {ZIM_CITIES.map((city) => {
        const isSelected = selectedLocation?.toLowerCase() === city.name.toLowerCase();
        return (
          <Marker
            key={city.name}
            position={[city.lat, city.lng]}
            icon={createCityMarker(city.name, isSelected)}
            eventHandlers={{
              click: () => {
                onSelectLocation(city.name);
              },
            }}
          >
            <Popup className="location-picker-popup">
              <div style={{ textAlign: 'center', padding: '4px 0' }}>
                <strong style={{ fontSize: '13px', color: '#0B3B95' }}>{city.name}</strong>
                <br />
                <span style={{ fontSize: '11px', color: '#64748b' }}>{city.province}</span>
                <br />
                <button
                  onClick={() => onSelectLocation(city.name)}
                  style={{
                    marginTop: '6px',
                    background: '#0B3B95',
                    color: '#fff',
                    border: 'none',
                    padding: '4px 14px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Select {city.name}
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
