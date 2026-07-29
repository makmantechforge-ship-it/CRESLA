'use client';

import React, { useState, useEffect } from 'react';
import { properties as importedProperties } from '@/data/properties';
import { getPropertyById } from '@/utils/supabase/queries';
import { 
  MapPin, 
  Heart, 
  Share, 
  Bed, 
  Bath, 
  Car, 
  Maximize, 
  CheckCircle2, 
  Star, 
  MessageSquare, 
  Phone, 
  Clock, 
  ShieldCheck,
  ChevronLeft,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

export default function PropertyPage({ params }: { params: { id: string } }) {
  const [property, setProperty] = useState<any>(importedProperties.find((p) => p.id === params.id) || null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPropertyById(params.id).then((dbProp) => {
      if (dbProp) {
        setProperty({
          ...dbProp,
          priceType: dbProp.price_type,
          sizeUnit: dbProp.size_unit,
          petFriendly: dbProp.pet_friendly,
          isVerified: dbProp.verified,
          availableDate: dbProp.available_date,
          landlord: dbProp.profiles ? {
            id: dbProp.profiles.id,
            name: dbProp.profiles.full_name,
            avatar: dbProp.profiles.avatar_url,
            verified: dbProp.profiles.verified,
            rating: dbProp.profiles.rating,
            properties: dbProp.profiles.properties_count,
            responseTime: dbProp.profiles.response_time,
          } : {
            name: 'Unknown',
            avatar: '',
            verified: false,
            rating: 0,
            properties: 0,
            responseTime: '',
          },
        });
      }
      setLoading(false);
    });
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 font-sans">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Property not found</h2>
          <p className="text-gray-500 dark:text-gray-400">The property you're looking for doesn't exist or has been removed.</p>
          <Link href="/properties" className="inline-block px-6 py-3 bg-primary text-white rounded-xl hover:opacity-90 transition-opacity">
            Browse Properties
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 lg:pb-12 font-sans selection:bg-primary/20">
      {/* Top Navigation */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span>Back to search</span>
          </Link>
          <div className="flex items-center space-x-3">
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300">
              <Share className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300 hover:text-red-500">
              <Heart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left Content Area (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Header section */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {property.type}
                </span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full text-sm font-medium capitalize">
                  For {property.priceType}
                </span>
                {property.verified && (
                  <span className="flex items-center text-sm font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full">
                    <ShieldCheck className="w-4 h-4 mr-1" />
                    Verified
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                {property.title}
              </h1>
              
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <MapPin className="w-5 h-5 mr-2 text-primary" />
                <span className="text-lg">{property.address}, {property.suburb}, {property.city}</span>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-[16/9] w-full relative rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-800 shadow-lg group">
                <img 
                  src={property.images[activeImageIndex]} 
                  alt={property.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
              
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 sm:gap-4">
                {property.images?.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`relative aspect-[4/3] rounded-xl overflow-hidden transition-all duration-200 
                      ${activeImageIndex === index 
                        ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-900' 
                        : 'opacity-70 hover:opacity-100 hover:scale-[1.02]'}`}
                  >
                    <img 
                      src={image} 
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Key Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-y border-gray-100 dark:border-gray-800">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <Bed className="w-5 h-5 mr-2" />
                  <span className="font-medium">Bedrooms</span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white pl-7">
                  {property.bedrooms > 0 ? property.bedrooms : 'Studio'}
                </span>
              </div>
              <div className="flex flex-col space-y-1">
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <Bath className="w-5 h-5 mr-2" />
                  <span className="font-medium">Bathrooms</span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white pl-7">
                  {property.bathrooms}
                </span>
              </div>
              <div className="flex flex-col space-y-1">
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <Car className="w-5 h-5 mr-2" />
                  <span className="font-medium">Parking</span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white pl-7">
                  {property.parking}
                </span>
              </div>
              <div className="flex flex-col space-y-1">
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <Maximize className="w-5 h-5 mr-2" />
                  <span className="font-medium">Size</span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white pl-7">
                  {property.size} <span className="text-sm font-normal text-gray-500">{property.sizeUnit}</span>
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4 pt-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">About this property</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                {property.description}
              </p>
            </div>

            {/* Amenities */}
            <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-gray-800">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.amenities?.map((amenity: string, index: number) => (
                  <div key={index} className="flex items-center space-x-3 text-gray-700 dark:text-gray-200">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="font-medium">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Landlord Profile */}
            <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700/50">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Listed by</h2>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center space-x-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-white dark:border-gray-700 shadow-md">
                    <img 
                      src={property.landlord.avatar} 
                      alt={property.landlord.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{property.landlord.name}</h3>
                      {property.landlord.verified && (
                        <ShieldCheck className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="flex items-center mt-1 space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1 fill-yellow-400" />
                        <span className="font-medium text-gray-700 dark:text-gray-300">{property.landlord.rating}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>Replies {property.landlord.responseTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full sm:w-auto flex space-x-3">
                  <button className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-5 py-2.5 bg-primary/10 text-primary hover:bg-primary/20 transition-colors rounded-xl font-medium">
                    <MessageSquare className="w-4 h-4" />
                    <span>Message</span>
                  </button>
                  <button className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors rounded-xl font-medium">
                    <Phone className="w-4 h-4" />
                    <span>Call</span>
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Right Sidebar (1/3) */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700/50 space-y-6 hidden lg:block">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
                  {property.priceType === 'rent' ? 'Monthly Rent' : 'Asking Price'}
                </p>
                <div className="flex items-end">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {formatPrice(property.price)}
                  </span>
                  {property.priceType === 'rent' && (
                    <span className="text-gray-500 dark:text-gray-400 ml-1 mb-1">/mo</span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <button className="w-full py-3.5 bg-primary text-white rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center space-x-2 shadow-lg shadow-primary/20">
                  <Calendar className="w-5 h-5" />
                  <span>Book a Viewing</span>
                </button>
                <button className="w-full py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  Make an Offer
                </button>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-700/50">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Available from</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(property.availableDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Mobile Floating Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 p-4 lg:hidden z-50 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-between max-w-7xl mx-auto gap-4">
          <div className="flex-shrink-0">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {property.priceType === 'rent' ? 'Rent' : 'Price'}
            </p>
            <div className="flex items-baseline">
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {formatPrice(property.price)}
              </span>
            </div>
          </div>
          <button className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 max-w-[200px]">
            Book Viewing
          </button>
        </div>
      </div>
      
    </div>
  );
}
