'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { 
  createProperty, 
  getUserProfile, 
  getUserPropertyCount, 
  DbProfile 
} from '@/utils/supabase/queries';
import { uploadPropertyImage, deletePropertyImage } from '@/utils/supabase/storage';
import {
  Upload,
  ImagePlus,
  X,
  MapPin,
  Home,
  DollarSign,
  Bed,
  Bath,
  Car,
  Maximize,
  Tag,
  FileText,
  CheckCircle,
  Loader2,
  ArrowLeft,
  Plus,
  Trash2,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Info
} from 'lucide-react';
import Link from 'next/link';

const propertyTypes = ['House', 'Apartment', 'Townhouse', 'Villa', 'Hotel', 'Lodge', 'Studio', 'Office', 'Commercial'];
const categories = ['Residential', 'Commercial', 'Hospitality', 'Luxury'];
const commonAmenities = [
  'Solar Panels', 'Borehole', 'Security', 'Garden', 'Fibre Internet', 
  'Backup Power', 'Pool', 'Air Conditioning', 'Furnished', 'Pet Friendly', 
  'Tennis Court', 'Staff Quarters', 'BBQ Area'
];

const ZIM_CITIES: Record<string, { lat: number; lng: number; province: string; suburbs: string[] }> = {
  Harare: {
    lat: -17.8252,
    lng: 31.0335,
    province: 'Harare Province',
    suburbs: ['Borrowdale', 'Avondale', 'Highlands', 'Mount Pleasant', 'Glen Lorne', 'Chisipite', 'Gunhill', 'Alexandra Park', 'Vainona', 'Greendale', 'Marlborough', 'Westgate', 'Eastlea', 'Borrowdale Brooke']
  },
  Bulawayo: {
    lat: -20.1500,
    lng: 28.5833,
    province: 'Bulawayo Province',
    suburbs: ['Kumalo', 'Hillside', 'Matsheumhlope', 'Burnside', 'Ascot', 'Suburbs', 'Woodville', 'Bradfield']
  },
  'Victoria Falls': {
    lat: -17.9244,
    lng: 25.8364,
    province: 'Matabeleland North',
    suburbs: ['Zambezi Riverbank', 'Elephant Hills', 'Baobab', 'Chinotimba', 'Industrial Area']
  },
  Kariba: {
    lat: -16.5167,
    lng: 28.8000,
    province: 'Mashonaland West',
    suburbs: ['Kariba Heights', 'Breezes Harbour', 'Baobab Ridge', 'Nyamhunga']
  },
  Nyanga: {
    lat: -18.2833,
    lng: 32.7500,
    province: 'Manicaland',
    suburbs: ['Troutbeck', 'Juliasdale', 'Inyangani', 'National Park']
  },
  Mutare: {
    lat: -18.9667,
    lng: 32.6667,
    province: 'Manicaland',
    suburbs: ['Murambi Gardens', 'Vumba Heights', 'Morningside', 'Yeovil', 'Palmerstone']
  },
  Gweru: {
    lat: -19.4500,
    lng: 29.8167,
    province: 'Midlands',
    suburbs: ['Daylesford', 'Lundi Park', 'Southdowns', 'Kopje', 'CBD']
  },
  Masvingo: {
    lat: -20.0700,
    lng: 30.8300,
    province: 'Masvingo Province',
    suburbs: ['Rhodene', 'Great Zimbabwe', 'Target Kopje', 'CBD']
  },
  Chinhoyi: {
    lat: -17.3600,
    lng: 30.1900,
    province: 'Mashonaland West',
    suburbs: ['Chinhoyi West', 'Caves Area', 'Orange Grove', 'CBD']
  },
  Marondera: {
    lat: -18.1800,
    lng: 31.5500,
    province: 'Mashonaland East',
    suburbs: ['Marondera North', 'Paradise Park', 'Longlands', 'CBD']
  },
  Kadoma: {
    lat: -18.3300,
    lng: 29.9100,
    province: 'Mashonaland West',
    suburbs: ['CBD', 'Rimuka', 'Mornington']
  },
  Zvishavane: {
    lat: -20.3300,
    lng: 30.0700,
    province: 'Midlands',
    suburbs: ['Highfield', 'Mandava', 'CBD']
  }
};

const MAX_FREEMIUM_LISTINGS = 4; // strictly < 5 as requested
const MAX_IMAGES_PER_LISTING = 5; // 5 pictures per house in freemium plan

export default function UploadPropertyPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [createdPropertyId, setCreatedPropertyId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [userProfile, setUserProfile] = useState<DbProfile | null>(null);
  const [activeListingCount, setActiveListingCount] = useState<number>(0);

  // Images state
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Form State
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'Solar Panels', 'Borehole', 'Security'
  ]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    price_type: 'rent',
    currency: '$',
    type: 'House',
    category: 'Residential',
    bedrooms: '3',
    bathrooms: '2',
    parking: '2',
    size: '250',
    size_unit: 'sqm',
    address: '',
    suburb: 'Borrowdale',
    city: 'Harare',
    province: 'Harare Province',
    country: 'Zimbabwe',
    lat: '-17.7511',
    lng: '31.0967',
    available_date: '',
  });

  const isAgent = userProfile?.account_type === 'agent' || userProfile?.account_type === 'admin';
  const hasReachedListingLimit = !isAgent && activeListingCount >= MAX_FREEMIUM_LISTINGS;
  const maxImages = isAgent ? 20 : MAX_IMAGES_PER_LISTING;

  useEffect(() => {
    async function initUser() {
      setLoading(true);
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        router.push('/auth/login?redirect=/upload');
        return;
      }

      setUserId(user.id);

      // Fetch profile & existing listings count
      try {
        const [profile, count] = await Promise.all([
          getUserProfile(user.id),
          getUserPropertyCount(user.id)
        ]);
        setUserProfile(profile);
        setActiveListingCount(count);
      } catch (e) {
        console.error('Error fetching user details:', e);
      } finally {
        setLoading(false);
      }
    }

    initUser();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };

      // Auto-update province, lat, lng and default suburb if city changed
      if (name === 'city' && ZIM_CITIES[value]) {
        const cityData = ZIM_CITIES[value];
        updated.province = cityData.province;
        updated.lat = cityData.lat.toString();
        updated.lng = cityData.lng.toString();
        if (cityData.suburbs.length > 0) {
          updated.suburb = cityData.suburbs[0];
        }
      }

      return updated;
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (imageUrls.length + files.length > maxImages) {
      alert(`The freemium plan allows a maximum of ${maxImages} pictures per house. Please select fewer images.`);
      return;
    }

    setUploadingImage(true);
    const uploadedList: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const publicUrl = await uploadPropertyImage(file, userId);
        uploadedList.push(publicUrl);
      } catch (err: any) {
        console.warn('Storage upload error, using local fallback:', err);
        // If storage bucket isn't yet created on their Supabase, use an object URL or notify
        const tempUrl = URL.createObjectURL(file);
        uploadedList.push(tempUrl);
      }
    }

    setImageUrls(prev => [...prev, ...uploadedList].slice(0, maxImages));
    setUploadingImage(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addImageUrl = () => {
    if (newImageUrl.trim()) {
      if (imageUrls.length >= maxImages) {
        alert(`You can only add up to ${maxImages} images on the freemium plan.`);
        return;
      }
      if (!imageUrls.includes(newImageUrl.trim())) {
        setImageUrls(prev => [...prev, newImageUrl.trim()]);
        setNewImageUrl('');
        setShowUrlInput(false);
      }
    }
  };

  const removeImage = async (index: number) => {
    const urlToRemove = imageUrls[index];
    setImageUrls(imageUrls.filter((_, i) => i !== index));

    // Try deleting from storage in the background
    if (urlToRemove && !urlToRemove.startsWith('blob:') && !urlToRemove.startsWith('http://images.unsplash.com')) {
      deletePropertyImage(urlToRemove).catch(console.warn);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (hasReachedListingLimit) {
      alert('You have reached the maximum allowed listings on the free plan (max 4). Upgrade to an Agent account for unlimited listings.');
      return;
    }

    if (!form.title.trim() || !form.price || !form.city) {
      alert('Please provide at least a property title, price, and city.');
      return;
    }

    if (imageUrls.length === 0) {
      alert('Please upload at least 1 photo of the property.');
      return;
    }

    setSubmitting(true);
    try {
      const propertyPayload = {
        title: form.title.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        price_type: form.price_type,
        currency: form.currency,
        type: form.type,
        category: form.category,
        bedrooms: parseInt(form.bedrooms) || 0,
        bathrooms: parseInt(form.bathrooms) || 0,
        parking: parseInt(form.parking) || 0,
        size: form.size ? parseFloat(form.size) : 0,
        size_unit: form.size_unit,
        images: imageUrls,
        address: form.address.trim() || `${form.suburb}, ${form.city}`,
        suburb: form.suburb.trim(),
        city: form.city,
        province: form.province,
        country: form.country,
        lat: form.lat ? parseFloat(form.lat) : -17.8252,
        lng: form.lng ? parseFloat(form.lng) : 31.0335,
        amenities: selectedAmenities,
        available: true,
        available_date: form.available_date || new Date().toISOString().split('T')[0],
        landlord_id: userId,
        furnished: selectedAmenities.includes('Furnished'),
        pet_friendly: selectedAmenities.includes('Pet Friendly'),
      };

      const created = await createProperty(propertyPayload);
      setCreatedPropertyId(created.id);
    } catch (err: any) {
      console.error('Error submitting property:', err);
      alert('Error publishing listing: ' + (err.message || 'Please check your connection and try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
        <p className="text-slate-500 text-sm font-medium">Loading listing portal...</p>
      </div>
    );
  }

  // Success View
  if (createdPropertyId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 pt-20 pb-16">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 sm:p-12 text-center max-w-lg w-full"
        >
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Property is Live!</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Your property <strong className="text-slate-900">{form.title}</strong> has been successfully listed in <strong>{form.city}</strong> with {imageUrls.length} photo(s).
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/properties/${createdPropertyId}`}
              className="flex-1 px-6 py-3.5 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-primary-dark transition-all shadow-md text-center"
            >
              View Listing
            </Link>
            <Link
              href={`/properties/${createdPropertyId}/edit`}
              className="flex-1 px-6 py-3.5 bg-slate-100 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all text-center"
            >
              Edit Listing
            </Link>
          </div>
          <button
            onClick={() => {
              setCreatedPropertyId(null);
              setForm(prev => ({ ...prev, title: '', description: '', price: '' }));
              setImageUrls([]);
            }}
            className="mt-6 text-xs text-slate-400 hover:text-slate-600 font-medium"
          >
            Post another property
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <button 
            onClick={() => router.back()} 
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">List a Property</h1>
              <p className="text-slate-500 mt-1 text-sm">Publish your home, apartment, or hotel on Zimbabwe&apos;s premium real estate platform.</p>
            </div>
            
            {/* Freemium Plan Status Pill */}
            <div className="self-start sm:self-auto bg-white border border-slate-200 shadow-sm rounded-2xl p-3.5 flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${hasReachedListingLimit ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
              <div>
                <div className="text-xs font-bold text-slate-800">
                  {isAgent ? 'Agent Unlimited Plan' : 'Freemium Plan'}
                </div>
                <div className="text-[11px] text-slate-500">
                  {isAgent ? 'Unlimited active listings' : `${activeListingCount} of ${MAX_FREEMIUM_LISTINGS} listings used (< 5 limit)`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reached Limit Warning */}
        {hasReachedListingLimit && (
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-900 text-sm">Listing Limit Reached</h3>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                Non-agent accounts can list up to 4 active properties on the free plan. You currently have {activeListingCount} properties published. To post more, please update or remove an existing listing, or upgrade to an Agent account.
              </p>
              <Link 
                href="/dashboard"
                className="inline-block mt-3 px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-xl hover:bg-amber-700 transition-colors"
              >
                Manage My Properties in Dashboard →
              </Link>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* 1. PROPERTY IMAGES & PHOTO STORAGE */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-xl">
                  <ImagePlus className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Property Photos</h2>
                  <p className="text-xs text-slate-500">Upload up to {maxImages} high-resolution pictures for this listing</p>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
                {imageUrls.length} / {maxImages}
              </span>
            </div>

            {/* Upload Area */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                imageUrls.length >= maxImages 
                  ? 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-60' 
                  : 'border-slate-300 hover:border-primary hover:bg-primary/5 bg-slate-50/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                disabled={imageUrls.length >= maxImages || uploadingImage}
                onChange={handleFileUpload}
                className="hidden"
              />
              
              {uploadingImage ? (
                <div className="flex flex-col items-center justify-center py-2">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                  <p className="text-sm font-semibold text-slate-700">Uploading photos to storage...</p>
                  <p className="text-xs text-slate-400 mt-1">Compressing and securing listing assets</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-800">
                    {imageUrls.length >= maxImages ? 'Maximum photos reached' : 'Click to select pictures or drag and drop'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    PNG, JPG, WEBP up to 10MB each · Freemium limit: 5 pictures per house
                  </p>
                </div>
              )}
            </div>

            {/* Optional URL input toggle */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>Have an image link instead?</span>
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-primary font-semibold hover:underline"
              >
                {showUrlInput ? 'Hide link input' : '+ Add via URL link'}
              </button>
            </div>

            {showUrlInput && (
              <div className="flex gap-2 pt-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
                  placeholder="https://example.com/property-photo.jpg"
                  className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                />
                <button
                  type="button"
                  onClick={addImageUrl}
                  className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark transition-colors"
                >
                  Add Link
                </button>
              </div>
            )}

            {/* Image Preview Grid */}
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
                {imageUrls.map((url, idx) => (
                  <div key={idx} className="relative aspect-[4/3] rounded-2xl overflow-hidden group border border-slate-200 shadow-sm">
                    <img 
                      src={url} 
                      alt={`Photo ${idx + 1}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 p-1.5 bg-red-600/90 text-white rounded-full shadow-md hover:bg-red-700 transition-colors"
                      title="Remove photo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    {idx === 0 && (
                      <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                        Primary Cover
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. BASIC SPECIFICATIONS */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Property Details</h2>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Listing Title *
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="e.g. Modern 3-Bed House in Borrowdale with Solar & Borehole"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Detailed Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe the interior, architectural finishes, garden, water supply, security features, and neighborhood..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all resize-none"
              />
            </div>

            {/* Price & Type */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Price (USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={handleChange}
                    required
                    placeholder="1200"
                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Pricing Model
                </label>
                <select
                  name="price_type"
                  value={form.price_type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                >
                  <option value="rent">Monthly Rental ($/month)</option>
                  <option value="sale">For Sale (Outright Purchase)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Property Type
                </label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                >
                  {propertyTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bedrooms, Bathrooms, Parking, Size */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                  <Bed className="w-3.5 h-3.5 text-slate-400" /> Bedrooms
                </label>
                <input
                  name="bedrooms"
                  type="number"
                  min="0"
                  value={form.bedrooms}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                  <Bath className="w-3.5 h-3.5 text-slate-400" /> Bathrooms
                </label>
                <input
                  name="bathrooms"
                  type="number"
                  min="0"
                  value={form.bathrooms}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                  <Car className="w-3.5 h-3.5 text-slate-400" /> Parking Bays
                </label>
                <input
                  name="parking"
                  type="number"
                  min="0"
                  value={form.parking}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                  <Maximize className="w-3.5 h-3.5 text-slate-400" /> Area (sqm)
                </label>
                <input
                  name="size"
                  type="number"
                  min="0"
                  value={form.size}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                />
              </div>
            </div>
          </div>

          {/* 3. LOCATION & REGION IN ZIMBABWE */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Location in Zimbabwe</h2>
                <p className="text-xs text-slate-500">Auto-geocoded coordinates for map discovery</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  City / Town *
                </label>
                <select
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                >
                  {Object.keys(ZIM_CITIES).map(cityName => (
                    <option key={cityName} value={cityName}>{cityName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Suburb / Neighborhood
                </label>
                {ZIM_CITIES[form.city]?.suburbs?.length > 0 ? (
                  <select
                    name="suburb"
                    value={form.suburb}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                  >
                    {ZIM_CITIES[form.city].suburbs.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    name="suburb"
                    value={form.suburb}
                    onChange={handleChange}
                    placeholder="e.g. Central"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Street Address (Optional / Displayed to verified inquiries)
              </label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="e.g. 12 Borrowdale Road"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-sm"
              />
            </div>
          </div>

          {/* 4. AMENITIES SELECTION */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <Tag className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Amenities & Infrastructure</h2>
                <p className="text-xs text-slate-500">Highlight key features like Solar, Borehole, and Security</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {commonAmenities.map(amenity => {
                const isSelected = selectedAmenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-primary text-white shadow-sm shadow-primary/20 scale-102'
                        : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/60 border border-transparent'
                    }`}
                  >
                    {isSelected && <CheckCircle className="w-3.5 h-3.5" />}
                    {amenity}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. SUBMIT ACTION */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || hasReachedListingLimit}
              className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-base hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Publishing Listing & Verifying Photos...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Publish Property Listing
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
