'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { createClient } from '@/utils/supabase/client';
import { 
  createProperty, 
  updateProperty,
  getPropertyById,
  getUserProfile, 
  getUserPropertyCount, 
  DbProfile,
  DbProperty
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
  ArrowRight,
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
  CalendarDays,
  Lock,
  Layers,
  FileUp,
  AlertTriangle
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

export type PostCategory = 'House' | 'Land' | 'Short stay' | 'Event venues' | 'Business';
export type ListingIntent = 'rent' | 'sell';

const POST_CATEGORIES: { id: PostCategory; title: string; desc: string; icon: any; availableInPhase1: boolean }[] = [
  { id: 'House', title: 'House / Residential', desc: 'Standalone houses, townhouses, villas, apartments', icon: Home, availableInPhase1: true },
  { id: 'Land', title: 'Land / Stand', desc: 'Residential stands, farming & commercial plots', icon: Trees, availableInPhase1: false },
  { id: 'Short stay', title: 'Short stay / Stays', desc: 'Holiday lodges, safari camps, guest houses', icon: Compass, availableInPhase1: false },
  { id: 'Event venues', title: 'Event venues', desc: 'Wedding gardens, celebration halls, conference centres', icon: CalendarDays, availableInPhase1: false },
  { id: 'Business', title: 'Business / Commercial', desc: 'Offices, retail shops, warehouses, commercial buildings', icon: Building, availableInPhase1: false },
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

// Steps definition for progress bar
const RENT_STEPS = [
  { id: 1, name: 'Category & Type' },
  { id: 2, name: 'Photos' },
  { id: 3, name: 'Price & Deposit' },
  { id: 4, name: 'Location' },
  { id: 5, name: 'Specs & Amenities' },
  { id: 6, name: 'Role & Review' },
];

const SELL_STEPS = [
  { id: 1, name: 'Category & Type' },
  { id: 2, name: 'Photos' },
  { id: 3, name: 'Asking Price' },
  { id: 4, name: 'Location' },
  { id: 5, name: 'Deeds & Documents' },
  { id: 6, name: 'Specs & Review' },
];

function UploadPropertyWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftIdParam = searchParams.get('draftId');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Flow State
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [existingDraftId, setExistingDraftId] = useState<string | null>(draftIdParam);
  const [completedPropertyId, setCompletedPropertyId] = useState<string | null>(null);

  // User Profile
  const [userId, setUserId] = useState<string>('');
  const [userProfile, setUserProfile] = useState<DbProfile | null>(null);
  const [activeListingCount, setActiveListingCount] = useState<number>(0);

  // STEP 1: Category choice & Intent
  const [categoryChoice, setCategoryChoice] = useState<PostCategory>('House');
  const [intent, setIntent] = useState<ListingIntent>('rent');

  // Media
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Documents (Sell path only)
  const [documents, setDocuments] = useState<string[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Location pinning
  const [showMapPicker, setShowMapPicker] = useState(false);

  // Amenities
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'Solar Panels', 'Borehole', '24/7 Security Guard'
  ]);

  // Form Details
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
  const steps = intent === 'rent' ? RENT_STEPS : SELL_STEPS;

  // Initialize and check user profile requirement
  useEffect(() => {
    async function init() {
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

        setUserProfile(profile);
        setActiveListingCount(count);

        if (profile?.account_type === 'agent') {
          setForm(prev => ({ ...prev, poster_role: 'agent' }));
        } else if (profile?.account_type === 'landlord') {
          setForm(prev => ({ ...prev, poster_role: 'landlord' }));
        }

        // If resuming a draft from draftId query param
        if (draftIdParam) {
          const draftProp = await getPropertyById(draftIdParam);
          if (draftProp && draftProp.landlord_id === user.id) {
            setExistingDraftId(draftProp.id);
            setCategoryChoice(draftProp.type === 'Commercial' ? 'Business' : 'House');
            setIntent(draftProp.price_type === 'sale' ? 'sell' : 'rent');
            setImageUrls(draftProp.images || []);
            setDocuments(draftProp.documents || []);
            setSelectedAmenities(draftProp.amenities || []);
            setForm({
              title: draftProp.title || '',
              description: draftProp.description || '',
              type: draftProp.type || 'House',
              price: draftProp.price ? draftProp.price.toString() : '',
              currency: draftProp.currency || '$',
              price_negotiable: !!draftProp.price_negotiable,
              deposit_required: !!draftProp.deposit_required,
              deposit_amount: draftProp.deposit_amount ? draftProp.deposit_amount.toString() : '',
              availability_on: draftProp.available !== false,
              bedrooms: draftProp.bedrooms ? draftProp.bedrooms.toString() : '3',
              bathrooms: draftProp.bathrooms ? draftProp.bathrooms.toString() : '2',
              parking: draftProp.parking ? draftProp.parking.toString() : '2',
              size: draftProp.size ? draftProp.size.toString() : '250',
              size_unit: draftProp.size_unit || 'sqm',
              address: draftProp.address || '',
              suburb: draftProp.suburb || 'Borrowdale',
              city: draftProp.city || 'Harare',
              province: draftProp.province || 'Harare Province',
              country: draftProp.country || 'Zimbabwe',
              lat: draftProp.lat ? draftProp.lat.toString() : '-17.7511',
              lng: draftProp.lng ? draftProp.lng.toString() : '31.0967',
              available_date: draftProp.available_date || '',
              poster_role: (draftProp.poster_role as any) || 'landlord'
            });
            setCurrentStep(2); // Jump into the content
          }
        }
      } catch (e) {
        console.error('Error initializing post flow:', e);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [router, draftIdParam]);

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

  // Helper to build payload
  const buildPayload = (asDraft: boolean) => {
    return {
      title: form.title.trim() || (asDraft ? 'Untitled House Listing (Draft)' : ''),
      description: form.description.trim(),
      price: parseFloat(form.price) || 0,
      price_type: intent === 'rent' ? 'rent' : 'sale',
      currency: form.currency,
      type: form.type,
      category: 'Residential',
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
  };

  // Save as Draft (accessible on EVERY step)
  const handleSaveAsDraft = async () => {
    setSavingDraft(true);
    setFeedbackMessage(null);
    try {
      const payload = buildPayload(true);
      if (existingDraftId) {
        await updateProperty(existingDraftId, payload);
      } else {
        const created = await createProperty(payload);
        setExistingDraftId(created.id);
      }
      setFeedbackMessage('Draft saved! You can resume and finish anytime from your dashboard.');
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err: any) {
      console.error('Error saving draft:', err);
      alert('Could not save draft: ' + (err.message || 'Please check connection.'));
    } finally {
      setSavingDraft(false);
    }
  };

  // Validation before advancing step
  const validateStep = (stepNumber: number): boolean => {
    if (stepNumber === 1) {
      if (!categoryChoice) {
        alert('Please choose a category.');
        return false;
      }
      if (!form.title.trim()) {
        alert('Please provide a listing title.');
        return false;
      }
      return true;
    }

    if (stepNumber === 2) {
      if (imageUrls.length === 0) {
        const proceed = confirm('You have not uploaded any photos yet. Would you like to proceed anyway and add them before publishing?');
        return proceed;
      }
      return true;
    }

    if (stepNumber === 3) {
      if (!form.price || parseFloat(form.price) <= 0) {
        alert('Please specify a valid price.');
        return false;
      }
      return true;
    }

    if (stepNumber === 4) {
      if (!form.city) {
        alert('Please choose a city.');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 6));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Final Publish Handler
  const handlePublish = async () => {
    if (hasReachedListingLimit) {
      alert('You have reached the maximum allowed listings on the free plan (max 4). Upgrade to an Agent account for unlimited listings.');
      return;
    }

    if (!form.title.trim() || !form.price || !form.city) {
      alert('Please provide title, price, and city before publishing.');
      return;
    }

    if (imageUrls.length === 0) {
      alert('Please upload at least 1 photo before publishing.');
      setCurrentStep(2);
      return;
    }

    setSubmitting(true);
    try {
      const payload = buildPayload(false);
      let publishedId = existingDraftId;

      if (existingDraftId) {
        await updateProperty(existingDraftId, payload);
      } else {
        const created = await createProperty(payload);
        publishedId = created.id;
      }

      setCompletedPropertyId(publishedId);
    } catch (err: any) {
      console.error('Error publishing property:', err);
      alert('Error publishing listing: ' + (err.message || 'Please check your connection.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
        <p className="text-slate-500 text-sm font-medium">Loading listing wizard...</p>
      </div>
    );
  }

  // Success View after Publishing
  if (completedPropertyId) {
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
            Listing is Published & Live!
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed text-sm">
            Your {intent === 'rent' ? 'rental house' : 'house for sale'} <strong className="text-slate-900 dark:text-white">{form.title}</strong> is now live on CRESLA Zimbabwe with {imageUrls.length} photo(s).
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/properties/${completedPropertyId}`}
              className="flex-1 px-6 py-3.5 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-primary-dark transition-all shadow-md text-center"
            >
              View Live Listing
            </Link>
            <Link
              href="/dashboard"
              className="flex-1 px-6 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-center"
            >
              Go to Dashboard
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 pt-20 pb-28">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Top Header & Breadcrumb */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <button 
              onClick={() => router.push('/dashboard')} 
              className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-primary transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Exit to Dashboard
            </button>

            {/* Profile Check Indicator (Requirement: User must have a profile) */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                Logged in: {userProfile?.full_name || 'Landlord'}
              </span>
              {userProfile?.verified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-md">
                  Phase 1: House Listing Flow
                </span>
                {existingDraftId && (
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                    Editing Draft
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
                {intent === 'rent' ? 'List House for Rent' : 'List House for Sale'}
              </h1>
            </div>

            {/* Save as Draft Button (Always Available) */}
            <button
              type="button"
              disabled={savingDraft || submitting}
              onClick={handleSaveAsDraft}
              className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/50 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
            >
              {savingDraft ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 text-primary" />}
              <span>{savingDraft ? 'Saving Draft...' : 'Save Draft'}</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert for Draft */}
        {feedbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 font-semibold"
          >
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMessage}</span>
          </motion.div>
        )}

        {/* Progress Bar Indicator */}
        <div className="mb-8 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800 dark:text-white">
              Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.name}
            </span>
            <span className="text-xs font-semibold text-primary">
              {Math.round((currentStep / steps.length) * 100)}% Completed
            </span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <motion.div
              className="bg-primary h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Step Pill Navigation */}
          <div className="grid grid-cols-6 gap-1 pt-3">
            {steps.map(s => {
              const isActive = s.id === currentStep;
              const isPast = s.id < currentStep;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCurrentStep(s.id)}
                  className={`text-center py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer truncate px-1 ${
                    isActive
                      ? 'bg-primary text-white shadow-xs'
                      : isPast
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                >
                  {s.id}. {s.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            STEP 1: CATEGORY SELECTOR & HOUSE INTENT (RENT VS SELL)
            ========================================================================= */}
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Category Selection */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">1. Category Selection</span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">What do you want to list?</h2>
                <p className="text-xs text-slate-500">
                  Select a category. (Phase 1 scope activates <strong>House</strong>; other categories will unlock in Phase 2).
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
                {POST_CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  const isSelected = categoryChoice === cat.id;
                  const isAvailable = cat.availableInPhase1;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        if (!isAvailable) {
                          alert(`${cat.title} listing will be enabled in Phase 2. Please proceed with 'House' for Phase 1.`);
                          return;
                        }
                        setCategoryChoice(cat.id);
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between h-32 cursor-pointer ${
                        isSelected
                          ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20 shadow-xs'
                          : isAvailable
                            ? 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-slate-50/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200'
                            : 'border-slate-200/60 dark:border-slate-800/60 bg-slate-100/40 dark:bg-slate-800/30 opacity-60 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-xl ${isSelected ? 'bg-primary text-white' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        {!isAvailable && (
                          <span className="text-[9px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded">
                            Phase 2
                          </span>
                        )}
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
            </div>

            {/* Path Selection for House: Rent out vs Sell */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">2. House Listing Path</span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Rent out or Sell?</h2>
                <p className="text-xs text-slate-500">Choose the workflow tailored for rentals or outright sales</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setIntent('rent')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    intent === 'rent'
                      ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-slate-50/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${intent === 'rent' ? 'bg-primary text-white' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">Path A: Rent out</h3>
                      <p className="text-[11px] text-slate-400">Monthly lease, deposit options & availability control</p>
                    </div>
                  </div>
                  {intent === 'rent' && <Check className="w-5 h-5 text-primary stroke-[3]" />}
                </button>

                <button
                  type="button"
                  onClick={() => setIntent('sell')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    intent === 'sell'
                      ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-slate-50/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${intent === 'sell' ? 'bg-primary text-white' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">Path B: Sell</h3>
                      <p className="text-[11px] text-slate-400">Outright purchase, title deed / authorization docs</p>
                    </div>
                  </div>
                  {intent === 'sell' && <Check className="w-5 h-5 text-primary stroke-[3]" />}
                </button>
              </div>
            </div>

            {/* Property Type & Title */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Property Type & Listing Title</h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Listing Title *
                  </label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    placeholder={intent === 'rent' ? "e.g. Modern 3-Bed House in Borrowdale with Solar & Borehole" : "e.g. Executive 4-Bed Residence For Sale in Highlands"}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Property Sub-type
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
                  General Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Give an overview of the property layout, architectural finishings, garden, water, and neighborhood..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-xs resize-none"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* =========================================================================
            STEP 2: PHOTOS (UPLOAD PICTURES WITH PREVIEW)
            ========================================================================= */}
        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                  <ImagePlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Photos (Upload Pictures)</h2>
                  <p className="text-xs text-slate-500">Freemium limit: up to {maxImages} high-resolution pictures</p>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full">
                {imageUrls.length} / {maxImages}
              </span>
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
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
                  <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Uploading photos to storage...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2.5">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-white">
                    {imageUrls.length >= maxImages ? 'Maximum photos reached' : 'Click to select pictures or drag & drop'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    PNG, JPG, WEBP · First photo is set as primary cover image
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5">
              <span>Have an image URL link instead?</span>
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
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3">
                {imageUrls.map((url, idx) => (
                  <div key={idx} className="relative aspect-[4/3] rounded-2xl overflow-hidden group border border-slate-200 dark:border-slate-700 shadow-xs">
                    <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    {idx === 0 && (
                      <div className="absolute bottom-1.5 left-1.5 bg-slate-900/80 text-white text-[9px] font-bold px-2 py-0.5 rounded">
                        Cover Photo
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* =========================================================================
            STEP 3: PRICE, TERMS & DEPOSIT (RENT PATH) OR ASKING PRICE (SELL PATH)
            ========================================================================= */}
        {currentStep === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {intent === 'rent' ? 'Rental Price & Deposit Options' : 'Asking Price & Negotiation'}
                </h2>
                <p className="text-xs text-slate-500">
                  {intent === 'rent' ? 'Configure monthly rent, fixed vs negotiable, and security deposit terms' : 'Set outright asking price in USD and state whether price is negotiable'}
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
                    className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold"
                  />
                  {intent === 'rent' && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">/ month</span>
                  )}
                </div>
              </div>

              {/* Price Type: Negotiable / Fixed */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Price Terms (Negotiable or Fixed)
                </label>
                <div className="grid grid-cols-2 gap-2 h-11">
                  <button
                    type="button"
                    onClick={() => setForm(p => ({ ...p, price_negotiable: false }))}
                    className={`rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
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
                    className={`rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
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

            {/* RENT PATH ONLY: Options for Deposits */}
            {intent === 'rent' && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-white">Security Deposit Required?</h3>
                    <p className="text-[11px] text-slate-500">Enable if the tenant must pay a refundable holding/security deposit</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="deposit_required"
                      checked={form.deposit_required}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
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
                          className="w-full pl-7 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex items-end">
                      <p className="text-[11px] text-slate-400 pb-2">
                        Common practice in Zimbabwe is equal to 1 month rent ($ {form.price || '0'}).
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* =========================================================================
            STEP 4: LOCATION (PIN ON MAP OR SELECT ONE)
            ========================================================================= */}
        {currentStep === 4 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Location (Pin or Select Location)</h2>
                  <p className="text-xs text-slate-500">Pick city and suburb, or use the interactive Zimbabwe pin map</p>
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
                  Click any city marker to pin its exact coordinates to this listing.
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
          </motion.div>
        )}

        {/* =========================================================================
            STEP 5:
            - FOR RENT: PROPERTY SPECS & AMENITIES FILL-OUT PROCESS
            - FOR SELL: OWNERSHIP / SELLER AUTHORISATION DOCUMENTS
            ========================================================================= */}
        {currentStep === 5 && intent === 'sell' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Ownership / Seller Authorisation Real Estate Documents
                </h2>
                <p className="text-xs text-slate-500">
                  Upload Title Deed, Mandate to Sell, or Seller Authorisation letters for verified buyer confidence
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
                  <FileUp className="w-8 h-8 text-primary mb-2" />
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
          </motion.div>
        )}

        {currentStep === 5 && intent === 'rent' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Specs */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Property Features & Specs</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none"
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
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none"
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
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none"
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
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Amenities Form Fill-Out Process */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Amenities & Infrastructure (Form Fill-Out Process)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Tick all applicable amenities to match tenant searches
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
          </motion.div>
        )}

        {/* =========================================================================
            STEP 6:
            - FOR RENT: AVAILABILITY ON/OFF, POSTER ROLE & REVIEW
            - FOR SELL: SPECS + AMENITIES + POSTER ROLE & REVIEW
            ========================================================================= */}
        {currentStep === 6 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* If Sell path, render Specs & Amenities here */}
            {intent === 'sell' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Property Features & Specs</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none"
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
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none"
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
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none"
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
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Amenities Checklist</h2>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(AMENITY_CATEGORIES).flat().map(amenity => {
                      const isSelected = selectedAmenities.includes(amenity);
                      return (
                        <button
                          key={amenity}
                          type="button"
                          onClick={() => toggleAmenity(amenity)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-primary text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          <span>{amenity}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Poster Role: Owner or Agent */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Poster Role</h2>
                  <p className="text-xs text-slate-500">Are you listing as the Property Owner / Landlord or an Agent?</p>
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

            {/* Availability: On / Off (Mark as rented / sold) */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">Availability (On / Off)</h2>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      form.availability_on ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {form.availability_on ? 'Available for Inquiries' : (intent === 'rent' ? 'Marked as Rented' : 'Marked as Sold')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {intent === 'rent' ? 'Turn off availability to mark as rented and hide from active tenant searches' : 'Turn off availability when sold or under contract'}
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

            {/* Summary Review Card */}
            <div className="bg-blue-50 dark:bg-blue-950/40 rounded-3xl p-6 border border-blue-200 dark:border-blue-900 space-y-3">
              <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200">Listing Review Summary</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Path:</span>
                  <strong className="text-slate-800 dark:text-slate-200 capitalize">{intent === 'rent' ? 'For Rent' : 'For Sale'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Price:</span>
                  <strong className="text-slate-800 dark:text-slate-200">${form.price} {intent === 'rent' ? '/mo' : ''} ({form.price_negotiable ? 'Negotiable' : 'Fixed'})</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Location:</span>
                  <strong className="text-slate-800 dark:text-slate-200">{form.suburb}, {form.city}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Photos:</span>
                  <strong className="text-slate-800 dark:text-slate-200">{imageUrls.length} uploaded</strong>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* =========================================================================
            BOTTOM NAVIGATION BAR (BACK, NEXT, SAVE DRAFT, PUBLISH)
            ========================================================================= */}
        <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Previous
              </button>
            )}

            <button
              type="button"
              disabled={savingDraft || submitting}
              onClick={handleSaveAsDraft}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingDraft ? 'Saving...' : 'Save Draft to Finish Later'}</span>
            </button>
          </div>

          <div className="w-full sm:w-auto">
            {currentStep < 6 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="w-full sm:w-auto px-6 py-3 bg-[#0B3B95] hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Step {currentStep + 1}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting || hasReachedListingLimit}
                onClick={handlePublish}
                className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing Listing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Publish Listing</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <UploadPropertyWizard />
    </Suspense>
  );
}
