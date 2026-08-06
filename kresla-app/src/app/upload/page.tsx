'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
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
  Trash2
} from 'lucide-react';

const propertyTypes = ['Apartment', 'House', 'Penthouse', 'Villa', 'Townhouse', 'Studio', 'Flat', 'Office', 'Shop', 'Warehouse', 'Guest House', 'Lodge'];
const categories = ['Residential', 'Commercial', 'Industrial', 'Student', 'Luxury', 'Hospitality'];
const commonAmenities = ['Pool', 'Gym', 'Garden', 'Security', 'Parking', 'Balcony', 'Air Conditioning', 'Fibre Internet', 'Solar Panels', 'Borehole', 'CCTV', 'Pet Friendly', 'Furnished', 'Backup Power', 'Smart Home', 'Ocean View', 'BBQ Area', 'Laundry'];

export default function UploadPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    price_type: 'rent',
    currency: 'R',
    type: 'Apartment',
    category: 'Residential',
    bedrooms: '1',
    bathrooms: '1',
    parking: '0',
    size: '',
    size_unit: 'sqm',
    address: '',
    suburb: '',
    city: '',
    province: '',
    country: 'South Africa',
    lat: '',
    lng: '',
    available_date: '',
  });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/auth/login');
        return;
      }
      setUserId(user.id);
      setLoading(false);
    });
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addImageUrl = () => {
    if (newImageUrl.trim() && !imageUrls.includes(newImageUrl.trim())) {
      setImageUrls([...imageUrls, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.city) {
      alert('Please fill in at least the title, price, and city.');
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('properties').insert({
        title: form.title,
        description: form.description,
        price: parseFloat(form.price),
        price_type: form.price_type,
        currency: form.currency,
        type: form.type,
        category: form.category,
        bedrooms: parseInt(form.bedrooms),
        bathrooms: parseInt(form.bathrooms),
        parking: parseInt(form.parking),
        size: form.size ? parseFloat(form.size) : 0,
        size_unit: form.size_unit,
        images: imageUrls,
        address: form.address,
        suburb: form.suburb,
        city: form.city,
        province: form.province,
        country: form.country,
        lat: form.lat ? parseFloat(form.lat) : null,
        lng: form.lng ? parseFloat(form.lng) : null,
        amenities: selectedAmenities,
        available: true,
        available_date: form.available_date || null,
        landlord_id: userId,
        furnished: selectedAmenities.includes('Furnished'),
        pet_friendly: selectedAmenities.includes('Pet Friendly'),
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      alert('Error submitting property: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-md w-full"
        >
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Property Listed!</h2>
          <p className="text-slate-500 mb-8">Your property has been submitted successfully and is now live on CRESLA.</p>
          <div className="flex gap-3">
            <button onClick={() => router.push('/properties')} className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors">
              View Properties
            </button>
            <button onClick={() => { setSuccess(false); setForm({ ...form, title: '', description: '', price: '' }); setImageUrls([]); setSelectedAmenities([]); }} className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors">
              List Another
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button onClick={() => router.back()} className="flex items-center text-slate-500 hover:text-primary transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">List a New Property</h1>
          <p className="text-slate-500 mt-2">Fill in the details below to publish your property on CRESLA.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg"><FileText className="w-5 h-5 text-primary" /></div>
              <h2 className="text-xl font-bold text-slate-900">Basic Information</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Property Title *</label>
              <input name="title" value={form.title} onChange={handleChange} required placeholder="e.g. Luxury Penthouse in Sandton Central" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Describe the property in detail..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all resize-none" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Price *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input name="price" type="number" value={form.price} onChange={handleChange} required placeholder="0" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Sale / Rent</label>
                <select name="price_type" value={form.price_type} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all">
                  <option value="rent">For Rent</option>
                  <option value="sale">For Sale</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Property Type</label>
                <select name="type" value={form.type} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all">
                  {propertyTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1"><Bed className="w-3.5 h-3.5" /> Bedrooms</label>
                <input name="bedrooms" type="number" value={form.bedrooms} onChange={handleChange} min="0" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> Bathrooms</label>
                <input name="bathrooms" type="number" value={form.bathrooms} onChange={handleChange} min="0" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1"><Car className="w-3.5 h-3.5" /> Parking</label>
                <input name="parking" type="number" value={form.parking} onChange={handleChange} min="0" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1"><Maximize className="w-3.5 h-3.5" /> Size (sqm)</label>
                <input name="size" type="number" value={form.size} onChange={handleChange} min="0" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all" />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg"><MapPin className="w-5 h-5 text-primary" /></div>
              <h2 className="text-xl font-bold text-slate-900">Location</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Street Address</label>
              <input name="address" value={form.address} onChange={handleChange} placeholder="e.g. 42 Sandton Drive" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Suburb / Neighborhood</label>
                <input name="suburb" value={form.suburb} onChange={handleChange} placeholder="e.g. Sandton" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">City *</label>
                <input name="city" value={form.city} onChange={handleChange} required placeholder="e.g. Johannesburg" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Province / State</label>
                <input name="province" value={form.province} onChange={handleChange} placeholder="e.g. Gauteng" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Country</label>
                <input name="country" value={form.country} onChange={handleChange} placeholder="e.g. South Africa" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all" />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg"><ImagePlus className="w-5 h-5 text-primary" /></div>
              <h2 className="text-xl font-bold text-slate-900">Property Images</h2>
            </div>
            <p className="text-sm text-slate-500">Add image URLs for your property. You can use links from Unsplash, Imgur, or any public image host.</p>

            <div className="flex gap-2">
              <input
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
                placeholder="Paste image URL here..."
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
              />
              <button type="button" onClick={addImageUrl} className="px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative aspect-[4/3] rounded-xl overflow-hidden group border border-slate-200">
                    <img src={url} alt={`Property ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-2 left-2 text-xs bg-primary text-white px-2 py-0.5 rounded-full font-medium">Cover</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg"><Tag className="w-5 h-5 text-primary" /></div>
              <h2 className="text-xl font-bold text-slate-900">Amenities</h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {commonAmenities.map((amenity) => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    selectedAmenities.includes(amenity)
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-primary/50 hover:text-primary'
                  }`}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-4 bg-primary text-white rounded-xl font-semibold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Publish Property
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
