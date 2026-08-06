'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Star,
  Home,
  Heart,
  MessageSquare,
  Settings,
  CheckCircle,
  Camera,
  Mail,
  Phone,
  ShieldCheck,
  Building,
  Edit2,
  X,
  Save,
  LogOut
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { getUserProfile, updateUserProfile, DbProfile, getUserFavorites, getProperties } from '@/utils/supabase/queries';
import { useRouter } from 'next/navigation';

const TABS = [
  { id: 'properties', label: 'My Properties', icon: Home },
  { id: 'favorites', label: 'Saved Favorites', icon: Heart },
  { id: 'reviews', label: 'Reviews', icon: MessageSquare },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('properties');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userAuth, setUserAuth] = useState<any>(null);
  const [profile, setProfile] = useState<DbProfile | null>(null);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [myProperties, setMyProperties] = useState<any[]>([]);
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<DbProfile>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (!user || authError) {
        router.push('/auth/login');
        return;
      }
      
      setUserAuth(user);
      
      const [profileData, favoritesData, propertiesData] = await Promise.all([
        getUserProfile(user.id),
        getUserFavorites(user.id),
        getProperties() // We'll filter this client-side for simplicity, or we could add a landlord filter
      ]);

      setProfile(profileData);
      if (profileData) {
        setEditForm(profileData);
      }
      
      setFavorites(favoritesData);
      setMyProperties(propertiesData.filter(p => p.landlord_id === user.id));
      setLoading(false);
    }
    
    loadData();
  }, [router]);

  const handleSaveProfile = async () => {
    if (!profile || !userAuth) return;
    setSaving(true);
    try {
      await updateUserProfile(userAuth.id, editForm);
      setProfile({ ...profile, ...editForm } as DbProfile);
      setIsEditing(false);
    } catch (e) {
      alert("Error saving profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 ${isDarkMode ? 'dark' : ''}`}>
      {/* Banner */}
      <div className="relative h-64 md:h-80 w-full bg-slate-300">
        <img 
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
          alt="Cover" 
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/40" />
      </div>

      {/* Profile Header section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-24 sm:-mt-32 mb-8 bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-end gap-6">
          
          <div className="relative group">
            <div className="h-32 w-32 sm:h-40 sm:w-40 rounded-full border-4 border-white dark:border-slate-800 overflow-hidden bg-slate-200 relative z-10 shadow-lg">
              <img src={profile.avatar_url || 'https://via.placeholder.com/150'} alt={profile.full_name} className="object-cover h-full w-full" />
            </div>
            {profile.verified && (
              <div className="absolute bottom-2 right-2 z-30 bg-white rounded-full p-0.5 shadow-sm">
                <CheckCircle className="w-8 h-8 text-emerald-500 fill-emerald-100" />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-2 pb-2 w-full">
            {isEditing ? (
              <div className="space-y-4 w-full pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={editForm.full_name || ''} 
                      onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                      className="w-full rounded-lg border-gray-300 p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                    <input 
                      type="text" 
                      value={editForm.phone || ''} 
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                      className="w-full rounded-lg border-gray-300 p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                    <input 
                      type="text" 
                      value={editForm.city || ''} 
                      onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                      className="w-full rounded-lg border-gray-300 p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Avatar URL</label>
                    <input 
                      type="text" 
                      value={editForm.avatar_url || ''} 
                      onChange={(e) => setEditForm({...editForm, avatar_url: e.target.value})}
                      className="w-full rounded-lg border-gray-300 p-2"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                    <textarea 
                      value={editForm.bio || ''} 
                      onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                      className="w-full rounded-lg border-gray-300 p-2 h-24"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg">Cancel</button>
                  <button onClick={handleSaveProfile} disabled={saving} className="px-4 py-2 text-white bg-primary rounded-lg flex items-center gap-2">
                    {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {profile.full_name}
                    </h1>
                    <p className="text-primary font-medium flex items-center gap-1.5 mt-1 capitalize">
                      <ShieldCheck size={18} />
                      {profile.account_type}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setIsEditing(true)} className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium transition-all shadow-sm flex items-center gap-2">
                      <Edit2 size={16} />
                      Edit Profile
                    </button>
                    <button onClick={handleSignOut} className="px-5 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-medium transition-all shadow-sm flex items-center gap-2">
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </div>
                
                <p className="text-slate-600 dark:text-slate-300 max-w-2xl text-sm sm:text-base line-clamp-2">
                  {profile.bio || 'No bio provided yet.'}
                </p>
                
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-sm text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={16} />
                    {profile.city || 'Location unknown'}, {profile.country || ''}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Mail size={16} />
                    {userAuth.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone size={16} />
                    {profile.phone || 'No phone'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Properties', value: profile.properties_count, icon: Building },
            { label: 'Rating', value: profile.rating, icon: Star, color: 'text-amber-500' },
            { label: 'Replies', value: profile.response_time, icon: MessageSquare },
            { label: 'Status', value: profile.verified ? 'Verified' : 'Unverified', icon: ShieldCheck, color: profile.verified ? 'text-emerald-500' : 'text-slate-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-transform duration-300">
              <div className="mb-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-full">
                <stat.icon className={`w-6 h-6 ${stat.color || 'text-primary'}`} />
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
              <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs & Content */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden min-h-[500px]">
          {/* Tab Navigation */}
          <div className="flex overflow-x-auto hide-scrollbar border-b border-slate-100 dark:border-slate-700/50">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium text-sm sm:text-base whitespace-nowrap transition-colors relative
                    ${isActive ? 'text-primary' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                >
                  <Icon size={18} />
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6 sm:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                
                {/* Properties Tab */}
                {(activeTab === 'properties' || activeTab === 'favorites') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(activeTab === 'properties' ? myProperties : favorites).length === 0 ? (
                      <div className="col-span-full py-12 text-center text-gray-500">
                        {activeTab === 'properties' ? "You haven't listed any properties yet." : "You haven't saved any favorites yet."}
                      </div>
                    ) : (
                      (activeTab === 'properties' ? myProperties : favorites).map((property: any) => (
                        <motion.div
                          key={property.id}
                          whileHover={{ y: -5, scale: 1.01 }}
                          transition={{ duration: 0.2 }}
                          className="bg-white dark:bg-slate-800 rounded-2xl shadow-md overflow-hidden border border-slate-100 dark:border-slate-700 cursor-pointer group"
                          onClick={() => router.push(`/properties/${property.id}`)}
                        >
                          <div className="relative h-48 w-full overflow-hidden">
                            <img src={property.images?.[0] || 'https://via.placeholder.com/400'} alt={property.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md dark:bg-slate-900/90 px-3 py-1 rounded-full text-sm font-semibold text-primary shadow-sm">
                              {property.type}
                            </div>
                            {activeTab === 'favorites' && (
                              <button className="absolute top-4 left-4 p-2 bg-white/90 backdrop-blur-md dark:bg-slate-900/90 rounded-full shadow-sm">
                                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                              </button>
                            )}
                          </div>
                          <div className="p-5">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">{property.title}</h3>
                              <p className="text-primary font-bold whitespace-nowrap">R {property.price}</p>
                            </div>
                            <div className="flex items-center text-slate-500 text-sm mb-4">
                              <MapPin className="w-4 h-4 mr-1 shrink-0" />
                              <span className="truncate">{property.city}, {property.country}</span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-300">
                              <div className="flex items-center bg-slate-50 dark:bg-slate-700/50 px-2 py-1 rounded-lg">
                                <Home className="w-4 h-4 mr-1.5 text-slate-400" />
                                <span>{property.bedrooms} Beds</span>
                              </div>
                              <div className="flex items-center bg-slate-50 dark:bg-slate-700/50 px-2 py-1 rounded-lg">
                                <Building className="w-4 h-4 mr-1.5 text-slate-400" />
                                <span>{property.bathrooms} Baths</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div className="py-12 text-center text-gray-500">
                    No reviews yet.
                  </div>
                )}
                
                {/* Settings Tab */}
                {activeTab === 'settings' && (
                  <div className="py-12 text-center text-gray-500">
                    Settings coming soon.
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
