'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { 
  getPropertyById, 
  updateProperty, 
  deleteProperty,
  getUserProfile,
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
  Trash2,
  AlertTriangle,
  Save
} from 'lucide-react';
import Link from 'next/link';

const propertyTypes = ['House', 'Apartment', 'Townhouse', 'Villa', 'Hotel', 'Lodge', 'Studio', 'Office', 'Commercial'];
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
};

export default function EditPropertyPage() {
  const params = useParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const propertyId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [userProfile, setUserProfile] = useState<DbProfile | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  // Images state
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // Form State
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
  });

  const isAgent = userProfile?.account_type === 'agent' || userProfile?.account_type === 'admin';
  const maxImages = isAgent ? 20 : 5;

  useEffect(() => {
    async function loadData() {
      if (!propertyId) return;
      setLoading(true);

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push(`/auth/login?redirect=/properties/${propertyId}/edit`);
        return;
      }
      setUserId(user.id);

      const [prop, profile] = await Promise.all([
        getPropertyById(propertyId),
        getUserProfile(user.id)
      ]);

      setUserProfile(profile);

      if (!prop) {
        alert('Property listing not found.');
        router.push('/properties');
        return;
      }

      // Check ownership
      const ownerId = prop.landlord_id || prop.profiles?.id;
      if (ownerId && ownerId !== user.id) {
        setIsOwner(false);
        setLoading(false);
        return;
      }

      setIsOwner(true);
      setForm({
        title: prop.title || '',
        description: prop.description || '',
        price: prop.price?.toString() || '',
        price_type: prop.price_type || 'rent',
        currency: prop.currency || '$',
        type: prop.type || 'House',
        category: prop.category || 'Residential',
        bedrooms: (prop.bedrooms ?? 3).toString(),
        bathrooms: (prop.bathrooms ?? 2).toString(),
        parking: (prop.parking ?? 2).toString(),
        size: (prop.size ?? 250).toString(),
        size_unit: prop.size_unit || 'sqm',
        address: prop.address || '',
        suburb: prop.suburb || 'Borrowdale',
        city: prop.city || 'Harare',
        province: prop.province || 'Harare Province',
        country: prop.country || 'Zimbabwe',
        lat: prop.lat?.toString() || '-17.7511',
        lng: prop.lng?.toString() || '31.0967',
      });

      setImageUrls(prop.images || []);
      setSelectedAmenities(prop.amenities || []);
      setLoading(false);
    }

    loadData();
  }, [propertyId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
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
      alert(`Maximum ${maxImages} pictures allowed per property on this plan.`);
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
        console.warn('Storage upload error, using object URL fallback:', err);
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

  const removeImage = (index: number) => {
    const urlToRemove = imageUrls[index];
    setImageUrls(imageUrls.filter((_, i) => i !== index));
    if (urlToRemove && !urlToRemove.startsWith('blob:') && !urlToRemove.startsWith('http')) {
      deletePropertyImage(urlToRemove).catch(console.warn);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim() || !form.price || !form.city) {
      alert('Please fill in title, price, and city.');
      return;
    }

    if (imageUrls.length === 0) {
      alert('Please ensure at least 1 image is attached to the listing.');
      return;
    }

    setSaving(true);
    try {
      const updates = {
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
        lat: form.lat ? parseFloat(form.lat) : null,
        lng: form.lng ? parseFloat(form.lng) : null,
        amenities: selectedAmenities,
        furnished: selectedAmenities.includes('Furnished'),
        pet_friendly: selectedAmenities.includes('Pet Friendly'),
      };

      await updateProperty(propertyId, updates);
      alert('Property listing updated successfully!');
      router.push(`/properties/${propertyId}`);
    } catch (err: any) {
      console.error('Error updating property:', err);
      alert('Failed to update property: ' + (err.message || 'Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteProperty(propertyId);
      alert('Property listing has been deleted.');
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Error deleting property:', err);
      alert('Could not delete property: ' + (err.message || 'Please try again.'));
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
        <p className="text-slate-500 text-sm font-medium">Loading property details...</p>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 pt-20">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-lg border border-slate-200 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Unauthorized</h2>
          <p className="text-sm text-slate-500 mb-6">
            You do not have permission to edit this listing because you are not the registered owner.
          </p>
          <Link
            href={`/properties/${propertyId}`}
            className="inline-block w-full py-3 bg-primary text-white font-bold rounded-2xl text-sm hover:bg-primary-dark transition-all"
          >
            View Property Details
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <button 
              onClick={() => router.back()} 
              className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back
            </button>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Edit Property Listing</h1>
            <p className="text-slate-500 mt-1 text-sm">Modify pricing, images, amenities, and details for your listing.</p>
          </div>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="self-start sm:self-auto px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border border-red-200"
          >
            <Trash2 className="w-4 h-4" />
            Delete Listing
          </button>
        </div>

        <form onSubmit={handleUpdate} className="space-y-8">

          {/* 1. PROPERTY IMAGES & PHOTO STORAGE */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-xl">
                  <ImagePlus className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Listing Photos</h2>
                  <p className="text-xs text-slate-500">Manage photos (up to {maxImages} total on freemium plan)</p>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
                {imageUrls.length} / {maxImages}
              </span>
            </div>

            {/* Upload Area */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
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
                  <Loader2 className="w-6 h-6 text-primary animate-spin mb-2" />
                  <p className="text-xs font-semibold text-slate-700">Uploading new photo...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <Upload className="w-5 h-5 text-primary mb-2" />
                  <p className="text-xs font-bold text-slate-800">
                    {imageUrls.length >= maxImages ? 'Maximum photos reached' : 'Click to add more photos'}
                  </p>
                </div>
              )}
            </div>

            {/* Image Preview Grid */}
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
                {imageUrls.map((url, idx) => (
                  <div key={idx} className="relative aspect-[4/3] rounded-2xl overflow-hidden group border border-slate-200 shadow-sm">
                    <img 
                      src={url} 
                      alt={`Photo ${idx + 1}`} 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 transition-colors"
                      title="Remove photo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    {idx === 0 && (
                      <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
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
                  <Car className="w-3.5 h-3.5 text-slate-400" /> Parking
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

          {/* 3. LOCATION */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Location Details</h2>
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
                  Suburb
                </label>
                <input
                  name="suburb"
                  value={form.suburb}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Street Address
              </label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-sm"
              />
            </div>
          </div>

          {/* 4. AMENITIES */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <Tag className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Amenities & Infrastructure</h2>
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
                        : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/60'
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
          <div className="pt-2 flex gap-4">
            <Link
              href={`/properties/${propertyId}`}
              className="px-6 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold text-base hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>

        </form>

      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4"
          >
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Delete Property Listing?</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Are you sure you want to delete <strong>{form.title}</strong>? This action cannot be undone and will permanently remove this listing from CRESLA.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200 transition-colors"
              >
                Keep Listing
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-xs hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete Listing'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
