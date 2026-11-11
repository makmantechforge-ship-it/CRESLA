'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { createClient } from '@/utils/supabase/client';
import { 
  createProperty, 
  getUserProfile, 
  getUserPropertyCount, 
  DbProfile 
} from '@/utils/supabase/queries';
import { uploadPropertyImage, deletePropertyImage, uploadPropertyDocument } from '@/utils/supabase/storage';
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
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Info,
  Building,
  KeyRound,
  FileCheck,
  Check,
  Eye,
  Save,
  Trees,
  Compass,
  CalendarDays
} from 'lucide-react';
import Link from 'next/link';

// Dynamically import LocationPickerMap for SSR safety
const LocationPickerMap = dynamic(() => import('@/components/map/LocationPickerMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  ),
});

// Post categories as per paper
export type PostCategory = 'House' | 'Land' | 'Short stay' | 'Event venues' | 'Business';

const POST_CATEGORIES: { id: PostCategory; title: string; desc: string; icon: any }[] = [
  { id: 'House', title: 'House / Residential', desc: 'Standalone houses, townhouses, villas, apartments', icon: Home },
  { id: 'Land', title: 'Land / Stand', desc: 'Residential stands, farming & commercial plots', icon: Trees },
  { id: 'Short stay', title: 'Short stay / Stays', desc: 'Holiday lodges, safari camps, guest houses', icon: Compass },
  { id: 'Event venues', title: 'Event venues', desc: 'Wedding gardens, celebration halls, conference centres', icon: CalendarDays },
  { id: 'Business', title: 'Business / Commercial', desc: 'Offices, retail shops, warehouses, commercial buildings', icon: Building },
];

const HOUSE_TYPES = ['House', 'Apartment', 'Townhouse', 'Villa', 'Cottage', 'Duplex', 'Studio'];

const AMENITY_CATEGORIES: Record<string, string[]> = {
  'Utilities & Power': ['Solar Panels', 'Borehole', 'Backup Inverter', 'Municipal Water', 'ZESA Connected'],
  'Security & Grounds': ['24/7 Security Guard', 'Electric Fence', 'Gated Community', 'Walled & Gated', 'CCTV System', 'Garden', 'Staff Quarters'],
  'Living & Comfort': ['Fibre Internet', 'Swimming Pool', 'Air Conditioning', 'Furnished', 'Pet Friendly', 'Paved Driveway', 'Covered Parking']
};

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

const MAX_FREEMIUM_LISTINGS = 4;
const MAX_IMAGES_PER_LISTING = 5;

export default function UploadPropertyPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [createdPropertyId, setCreatedPropertyId] = useState<string | null>(null);
  const [savedAsDraft, setSavedAsDraft] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [userProfile, setUserProfile] = useState<DbProfile | null>(null);
  const [activeListingCount, setActiveListingCount] = useState<number>(0);

  // STEP 1: What do you want to post? (Paper: House, Land, Short stay, Event venues, Business)
  const [categoryChoice, setCategoryChoice] = useState<PostCategory>('House');

  // STEP 2: For House -> Rent out or sell
  const [intent, setIntent] = useState<'rent' | 'sell'>('rent');

  // Images state
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Documents state (Sell flow: Ownership / seller authorisation / real estate documents)
  const [documents, setDocuments] = useState<string[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Location pinning on map toggle
  const [showMapPicker, setShowMapPicker] = useState(false);

  // Form State
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'Solar Panels', 'Borehole', '24/7 Security Guard'
  ]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'House',
    price: '',
    currency: '$',
    price_negotiable: false,
    deposit_required: true,
    deposit_amount: '',
    availability_on: true,
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
    poster_role: 'landlord' as 'owner' | 'landlord' | 'agent'
  });

  const isAgent = userProfile?.account_type === 'agent' || userProfile?.account_type === 'admin';
  const hasReachedListingLimit = !isAgent && activeListingCount >= MAX_FREEMIUM_LISTINGS;
  const maxImages = isAgent ? 20 : MAX_IMAGES_PER_LISTING;

  // Initialize user profile check (Paper requirement: "They should have a profile")
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

      try {
        const [profile, count] = await Promise.all([
          getUserProfile(user.id),
          getUserPropertyCount(user.id)
        ]);

        // If user has no profile details, encourage them or set default role
        setUserProfile(profile);
        setActiveListingCount(count);

        if (profile?.account_type === 'agent') {
          setForm(prev => ({ ...prev, poster_role: 'agent' }));
        } else if (profile?.account_type === 'landlord') {
          setForm(prev => ({ ...prev, poster_role: 'landlord' }));
        }
      } catch (e) {
        console.error('Error fetching user details:', e);
      } finally {
        setLoading(false);
      }
    }

    initUser();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setForm(prev => {
      const updated: any = { 
        ...prev, 
        [name]: type === 'checkbox' ? checked : value 
      };

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
      alert(`The freemium plan allows a maximum of ${maxImages} pictures per listing. Please select fewer images.`);
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

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingDoc(true);
    const uploadedDocs: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const docUrl = await uploadPropertyDocument(file, userId);
        uploadedDocs.push(docUrl);
      } catch (err: any) {
        console.warn('Document storage upload error, using fallback:', err);
        const tempUrl = URL.createObjectURL(file);
        uploadedDocs.push(tempUrl);
      }
    }

    setDocuments(prev => [...prev, ...uploadedDocs]);
    setUploadingDoc(false);

    if (docInputRef.current) {
      docInputRef.current.value = '';
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

    if (urlToRemove && !urlToRemove.startsWith('blob:') && !urlToRemove.startsWith('http://images.unsplash.com')) {
      deletePropertyImage(urlToRemove).catch(console.warn);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  // Submit handler: support both "Save as draft to finish later" and "Continue & Publish"
  const handleSaveOrPublish = async (asDraft: boolean) => {
    if (!asDraft && hasReachedListingLimit) {
      alert('You have reached the maximum allowed listings on the free plan (max 4). Upgrade to an Agent account for unlimited listings.');
      return;
    }

    if (!form.title.trim() || !form.price || !form.city) {
      alert('Please provide at least a property title, price, and city.');
      return;
    }

    if (!asDraft && imageUrls.length === 0) {
      alert('Please upload at least 1 photo of the property.');
      return;
    }

    setSubmitting(true);
    try {
      const propertyPayload = {
        title: form.title.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price) || 0,
        price_type: intent === 'rent' ? 'rent' : 'sale',
        currency: form.currency,
        type: form.type,
        category: categoryChoice === 'House' ? 'Residential' : (categoryChoice === 'Business' ? 'Commercial' : (categoryChoice === 'Short stay' ? 'Hospitality' : 'Residential')),
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
        available: form.availability_on,
        available_date: form.available_date || new Date().toISOString().split('T')[0],
        landlord_id: userId,
        furnished: selectedAmenities.includes('Furnished'),
        pet_friendly: selectedAmenities.includes('Pet Friendly'),
        price_negotiable: form.price_negotiable,
        deposit_required: intent === 'rent' ? form.deposit_required : false,
        deposit_amount: intent === 'rent' && form.deposit_required && form.deposit_amount ? parseFloat(form.deposit_amount) : 0,
        poster_role: form.poster_role,
        documents: documents,
        status: asDraft ? 'draft' : (form.availability_on ? 'active' : (intent === 'rent' ? 'rented' : 'sold'))
      };

      const created = await createProperty(propertyPayload);
      setCreatedPropertyId(created.id);
      setSavedAsDraft(asDraft);
    } catch (err: any) {
      console.error('Error submitting property:', err);
      alert('Error saving property: ' + (err.message || 'Please check your connection and try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
        <p className="text-slate-500 text-sm font-medium">Loading post flow...</p>
      </div>
    );
  }

  // Success View
  if (createdPropertyId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 pt-20 pb-16">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-8 sm:p-12 text-center max-w-lg w-full"
        >
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
            {savedAsDraft ? 'Draft Saved Successfully!' : 'Property is Published!'}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed text-sm">
            {savedAsDraft ? (
              <>Your listing <strong className="text-slate-900 dark:text-white">{form.title}</strong> has been saved as a draft. You can finish editing and publish it anytime from your dashboard.</>
            ) : (
              <>Your {intent === 'rent' ? 'rental listing' : 'property for sale'} <strong className="text-slate-900 dark:text-white">{form.title}</strong> is now live in <strong>{form.city}</strong> with {imageUrls.length} photo(s).</>
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/properties/${createdPropertyId}`}
              className="flex-1 px-6 py-3.5 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-primary-dark transition-all shadow-md text-center"
            >
              View Listing
            </Link>
            <Link
              href="/dashboard"
              className="flex-1 px-6 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-center"
            >
              Go to Dashboard
            </Link>
          </div>
          <button
            onClick={() => {
              setCreatedPropertyId(null);
              setForm(prev => ({ ...prev, title: '', description: '', price: '', deposit_amount: '' }));
              setImageUrls([]);
              setDocuments([]);
            }}
            className="mt-6 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium"
          >
            Post another property
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 pt-24 pb-24">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <button 
            onClick={() => router.back()} 
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary transition-colors mb-3 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-md">
                  Phase 1 Post Flow
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500 font-medium">Zimbabwe & USD ($)</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
                Post a Property
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                Follow the paper-guided post flow: select your category, specify rent or sale terms, and publish or save as draft.
              </p>
            </div>
            
            {/* User Profile & Plan Status */}
            <div className="self-start sm:self-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs rounded-2xl p-3.5 flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${hasReachedListingLimit ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <span>{userProfile?.full_name || 'Landlord Profile'}</span>
                  {userProfile?.verified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />}
                </div>
                <div className="text-[11px] text-slate-500">
                  {isAgent ? 'Agent Unlimited Plan' : `${activeListingCount} of ${MAX_FREEMIUM_LISTINGS} free listings used`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reached Limit Warning */}
        {hasReachedListingLimit && (
          <div className="mb-6 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-900 dark:text-amber-200 text-xs">Freemium Limit Reached (Max 4 active)</h3>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                You have {activeListingCount} active properties. You can still save this listing as a <strong>draft</strong>, or upgrade to an Agent profile.
              </p>
            </div>
          </div>
        )}

        {/* =========================================================================
            SECTION 1: "Post Flow -> One has to choose what they want"
            Options from paper: House, Land, Short stay, Event venues, Business
            ========================================================================= */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xs border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Step 1</span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">What would you like to post?</h2>
              <p className="text-xs text-slate-500">Choose the property category you want to list</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
            {POST_CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const isSelected = categoryChoice === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryChoice(cat.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-28 ${
                    isSelected
                      ? 'border-primary bg-primary/5 text-primary shadow-xs ring-2 ring-primary/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-xl ${isSelected ? 'bg-primary text-white' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-primary stroke-[3]" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-xs">{cat.title}</h3>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{cat.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {categoryChoice !== 'House' && (
            <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl p-3 text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2">
              <Info className="w-4 h-4 text-primary shrink-0" />
              <span>
                <strong>Note:</strong> Paper instructions focus on <strong>For House (Phase 1)</strong> with full Rent vs Sell branches. Other categories adapt seamlessly using the same specifications.
              </span>
            </div>
          )}
        </div>

        {/* =========================================================================
            SECTION 2: "For House -> Rent out or sell"
            ========================================================================= */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xs border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Step 2</span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Rent out or sell?</h2>
              <p className="text-xs text-slate-500">Select whether this listing is for monthly rental or an outright sale</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => setIntent('rent')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                intent === 'rent'
                  ? 'border-primary bg-primary/5 text-primary shadow-xs ring-2 ring-primary/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-slate-50/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${intent === 'rent' ? 'bg-primary text-white' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Rent out</h3>
                  <p className="text-[11px] text-slate-400">Monthly lease, deposit options & tenant availability</p>
                </div>
              </div>
              {intent === 'rent' && <Check className="w-5 h-5 text-primary stroke-[3]" />}
            </button>

            <button
              type="button"
              onClick={() => setIntent('sell')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                intent === 'sell'
                  ? 'border-primary bg-primary/5 text-primary shadow-xs ring-2 ring-primary/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-slate-50/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${intent === 'sell' ? 'bg-primary text-white' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Sell</h3>
                  <p className="text-[11px] text-slate-400">Outright sale, deed/title documents & negotiation</p>
                </div>
              </div>
              {intent === 'sell' && <Check className="w-5 h-5 text-primary stroke-[3]" />}
            </button>
          </div>
        </div>

        {/* =========================================================================
            SECTION 3: FORM DETAILS BASED ON CHOSEN INTENT (Rent vs Sell)
            ========================================================================= */}
        <div className="space-y-6">

          {/* 3.1 PHOTOS (Upload pictures) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xs border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                  <ImagePlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Photos (Upload pictures)</h2>
                  <p className="text-xs text-slate-500">Freemium plan: upload up to {maxImages} high-resolution photos</p>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full">
                {imageUrls.length} / {maxImages}
              </span>
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                imageUrls.length >= maxImages 
                  ? 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-60' 
                  : 'border-slate-300 dark:border-slate-700 hover:border-primary hover:bg-primary/5 bg-slate-50/50 dark:bg-slate-800/40'
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
                  <Loader2 className="w-7 h-7 text-primary animate-spin mb-2" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Uploading photos to secure storage...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2.5">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-white">
                    {imageUrls.length >= maxImages ? 'Maximum photos reached' : 'Click to select pictures or drag & drop'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    PNG, JPG, WEBP · Max 5 photos for free landlords (up to 20 for agents)
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5">
              <span>Have an image link instead?</span>
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-primary font-semibold hover:underline cursor-pointer"
              >
                {showUrlInput ? 'Hide link input' : '+ Add via URL link'}
              </button>
            </div>

            {showUrlInput && (
              <div className="flex gap-2 pt-1">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="flex-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                />
                <button
                  type="button"
                  onClick={addImageUrl}
                  className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark transition-colors cursor-pointer"
                >
                  Add
                </button>
              </div>
            )}

            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2">
                {imageUrls.map((url, idx) => (
                  <div key={idx} className="relative aspect-[4/3] rounded-xl overflow-hidden group border border-slate-200 dark:border-slate-700 shadow-xs">
                    <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {idx === 0 && (
                      <div className="absolute bottom-1.5 left-1.5 bg-slate-900/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        Cover
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3.2 TYPE OF PROPERTY & PROPERTY DESCRIPTION */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xs border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Type & Property Description</h2>
                <p className="text-xs text-slate-500">Provide title, specific house type, and detailed description</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Property Title *
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  placeholder={intent === 'rent' ? "e.g. Spacious 3-Bed House in Borrowdale with Solar & Borehole" : "e.g. Modern Executive 4-Bed Residence For Sale in Highlands"}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Type of Property
                </label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-xs"
                >
                  {HOUSE_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Property Description *
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe layout, interior finishes, living spaces, water security (borehole/tanks), solar power, garden, staff quarters, and proximity to shopping centers and schools..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-xs resize-none"
              />
            </div>

            {/* Bedrooms, Bathrooms, Parking, Size */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <Bed className="w-3.5 h-3.5 text-primary" /> Bedrooms
                </label>
                <input
                  name="bedrooms"
                  type="number"
                  min="0"
                  value={form.bedrooms}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <Bath className="w-3.5 h-3.5 text-primary" /> Bathrooms
                </label>
                <input
                  name="bathrooms"
                  type="number"
                  min="0"
                  value={form.bathrooms}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <Car className="w-3.5 h-3.5 text-primary" /> Parking Bays
                </label>
                <input
                  name="parking"
                  type="number"
                  min="0"
                  value={form.parking}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <Maximize className="w-3.5 h-3.5 text-primary" /> Size (m²)
                </label>
                <input
                  name="size"
                  type="number"
                  min="0"
                  value={form.size}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none"
                />
              </div>
            </div>
          </div>

          {/* 3.3 PRICING TERMS: Fixed vs Negotiable & Deposit Options */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xs border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {intent === 'rent' ? 'Rental Price & Deposit Options' : 'Asking Price & Negotiation'}
                </h2>
                <p className="text-xs text-slate-500">
                  {intent === 'rent' ? 'Specify monthly rent, fixed vs negotiable, and deposit requirements' : 'Specify asking price and whether you accept offers / negotiation'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  {intent === 'rent' ? 'Monthly Rent (USD) *' : 'Asking Price (USD) *'}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={handleChange}
                    required
                    placeholder={intent === 'rent' ? "1200" : "280000"}
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-xs font-bold"
                  />
                  {intent === 'rent' && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">/ month</span>
                  )}
                </div>
              </div>

              {/* Fixed vs Negotiable Pill */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Price Terms (Negotiable / Fixed)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setForm(p => ({ ...p, price_negotiable: false }))}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                      !form.price_negotiable
                        ? 'border-primary bg-primary text-white shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Fixed Price
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(p => ({ ...p, price_negotiable: true }))}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                      form.price_negotiable
                        ? 'border-primary bg-primary text-white shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Negotiable
                  </button>
                </div>
              </div>
            </div>

            {/* RENT ONLY: Options for Deposits */}
            {intent === 'rent' && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-white">Security Deposit Required?</h3>
                    <p className="text-[11px] text-slate-500">Security deposit held against damage or utility reconciliations</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="deposit_required"
                      checked={form.deposit_required}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                {form.deposit_required && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Deposit Amount (USD)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">$</span>
                        <input
                          name="deposit_amount"
                          type="number"
                          value={form.deposit_amount}
                          onChange={handleChange}
                          placeholder={form.price || "1200"}
                          className="w-full pl-7 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex items-end">
                      <p className="text-[11px] text-slate-400 pb-2">
                        Common practice in Zimbabwe: 1 month security deposit refundable on exit.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3.4 LOCATION: Should be able to pin location or select one */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xs border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Location (Pin or Select Location)</h2>
                  <p className="text-xs text-slate-500">Select city and suburb, or use the interactive Zimbabwe pin map</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowMapPicker(!showMapPicker)}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5" />
                {showMapPicker ? 'Hide Map' : 'Pin on Map'}
              </button>
            </div>

            {/* Interactive Pinning Map */}
            {showMapPicker && (
              <div className="space-y-2">
                <div className="h-64 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                  <LocationPickerMap
                    selectedLocation={form.city}
                    onSelectLocation={(locName) => {
                      if (ZIM_CITIES[locName]) {
                        const cityData = ZIM_CITIES[locName];
                        setForm(p => ({
                          ...p,
                          city: locName,
                          province: cityData.province,
                          lat: cityData.lat.toString(),
                          lng: cityData.lng.toString(),
                          suburb: cityData.suburbs[0] || p.suburb
                        }));
                      }
                    }}
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Click any city marker on the map to pin its coordinates to this listing.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  City / Town *
                </label>
                <select
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-xs"
                >
                  {Object.keys(ZIM_CITIES).map(cityName => (
                    <option key={cityName} value={cityName}>{cityName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Suburb / Area
                </label>
                {ZIM_CITIES[form.city]?.suburbs?.length > 0 ? (
                  <select
                    name="suburb"
                    value={form.suburb}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-xs"
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-xs"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Street Address (Optional)
              </label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="e.g. 15 Kingsmead Road"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-xs"
              />
            </div>
          </div>

          {/* 3.5 SELL FLOW SPECIFIC: Ownership / Seller Authorisation & Real Estate Documents */}
          {intent === 'sell' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xs border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Ownership / Seller Authorisation Real Estate Documents
                  </h2>
                  <p className="text-xs text-slate-500">
                    Upload Title Deeds, Mandate to Sell, or Seller Authorisation letters for verified badge
                  </p>
                </div>
              </div>

              <div 
                onClick={() => docInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-800/40"
              >
                <input
                  ref={docInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  multiple
                  disabled={uploadingDoc}
                  onChange={handleDocUpload}
                  className="hidden"
                />

                {uploadingDoc ? (
                  <div className="flex flex-col items-center justify-center">
                    <Loader2 className="w-6 h-6 text-primary animate-spin mb-1.5" />
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Uploading documents...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <FileCheck className="w-8 h-8 text-primary mb-2" />
                    <p className="text-xs font-bold text-slate-800 dark:text-white">
                      Click to upload Title Deed / Seller Mandate Documents
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      PDF, JPG, PNG up to 15MB each · Confidential & used for fraud verification
                    </p>
                  </div>
                )}
              </div>

              {documents.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Attached Documents ({documents.length})</h4>
                  {documents.map((docUrl, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-primary shrink-0" />
                        <span className="truncate font-medium text-slate-700 dark:text-slate-200">
                          Real Estate Verification Document #{idx + 1}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDocuments(docs => docs.filter((_, i) => i !== idx))}
                        className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3.6 AMENITIES: "A form like fill-out process of amenities" */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xs border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Amenities & Infrastructure (Fill-out process)
                </h2>
                <p className="text-xs text-slate-500">
                  Select all applicable amenities to help tenants and buyers filter accurately
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              {Object.entries(AMENITY_CATEGORIES).map(([catName, list]) => (
                <div key={catName} className="space-y-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {catName}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {list.map(amenity => {
                      const isSelected = selectedAmenities.includes(amenity);
                      return (
                        <button
                          key={amenity}
                          type="button"
                          onClick={() => toggleAmenity(amenity)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-primary text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          <span>{amenity}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3.7 POSTER ROLE: Owner or landlord / Agent posted */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xs border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Poster Profile & Authorization</h2>
                <p className="text-xs text-slate-500">Who is posting this listing? (Owner, Landlord, or Registered Agent)</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {(['owner', 'landlord', 'agent'] as const).map(roleOption => {
                const isSelected = form.poster_role === roleOption;
                const label = roleOption === 'owner' ? 'Property Owner' : (roleOption === 'landlord' ? 'Landlord' : 'Agent Posted');
                return (
                  <button
                    key={roleOption}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, poster_role: roleOption }))}
                    className={`py-3 px-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium'
                    }`}
                  >
                    <span className="text-xs">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3.8 AVAILABILITY: On / Off, Mark as rented / turn off availability */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xs border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Availability (On / Off)</h2>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    form.availability_on ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {form.availability_on ? 'Available' : (intent === 'rent' ? 'Marked as Rented' : 'Marked as Sold')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {intent === 'rent' ? 'Mark as rented or toggle off availability when occupied' : 'Toggle off availability when sold or under offer'}
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="availability_on"
                  checked={form.availability_on}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>

          {/* =========================================================================
              SECTION 4: "Save as draft to finish later" OR "Continue & Publish"
              ========================================================================= */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xs border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Save as draft button */}
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSaveOrPublish(true)}
                className="w-full sm:w-1/2 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save as draft to finish later</span>
              </button>

              {/* Continue & Publish button */}
              <button
                type="button"
                disabled={submitting || hasReachedListingLimit}
                onClick={() => handleSaveOrPublish(false)}
                className="w-full sm:w-1/2 py-3.5 bg-[#0B3B95] hover:bg-blue-800 text-white rounded-2xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Listing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Continue & Publish</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-center text-slate-400">
              Drafts can be managed and published anytime from your landlord dashboard.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
