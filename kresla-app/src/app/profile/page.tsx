'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Star,
  Home,
  Heart,
  MessageSquare,
  Settings,
  CheckCircle,
  Moon,
  Sun,
  Camera,
  Mail,
  Phone,
  User,
  ShieldCheck,
  Building,
  Edit2
} from 'lucide-react';
import Image from 'next/image';

const mockUser = {
  name: 'Victoria Ndaba',
  role: 'Premium Landlord',
  verified: true,
  rating: 4.9,
  reviews: 24,
  properties: 12,
  location: 'Sandton, Johannesburg',
  bio: 'Providing luxury residential spaces in the heart of the city. Committed to excellent tenant experiences and premium property maintenance.',
  email: 'victoria.n@example.com',
  phone: '+27 82 555 0192',
  joinDate: 'Joined March 2021',
  avatarUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1bf98a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
  coverUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
};

const mockProperties = [
  {
    id: 1,
    title: 'Modern Glass Villa',
    price: 'R 25,000/mo',
    location: 'Camps Bay, Cape Town',
    beds: 4,
    baths: 3,
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    type: 'Villa',
  },
  {
    id: 2,
    title: 'Luxury Penthouse',
    price: 'R 18,500/mo',
    location: 'Sandton, Johannesburg',
    beds: 3,
    baths: 2,
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    type: 'Apartment',
  },
  {
    id: 3,
    title: 'Seaside Apartment',
    price: 'R 15,000/mo',
    location: 'Umhlanga, Durban',
    beds: 2,
    baths: 2,
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    type: 'Apartment',
  },
];

const mockFavorites = [
  {
    id: 4,
    title: 'Eco-Friendly Loft',
    price: 'R 12,000/mo',
    location: 'Maboneng, Johannesburg',
    beds: 1,
    baths: 1,
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1de2d5d852?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    type: 'Loft',
  }
];

const mockReviews = [
  {
    id: 1,
    author: 'Michael T.',
    rating: 5,
    date: '2 months ago',
    comment: 'Victoria is an amazing landlord. The property was in pristine condition, and any maintenance requests were handled within 24 hours. Highly recommend!',
  },
  {
    id: 2,
    author: 'Sarah L.',
    rating: 4.5,
    date: '5 months ago',
    comment: 'Beautiful apartment, very well maintained. The move-in process was seamless.',
  }
];

const TABS = [
  { id: 'properties', label: 'My Properties', icon: Home },
  { id: 'favorites', label: 'Saved Favorites', icon: Heart },
  { id: 'reviews', label: 'Reviews', icon: MessageSquare },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('properties');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toggle dark mode function (assuming global implementation would be added)
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 ${isDarkMode ? 'dark' : ''}`}>
      {/* Banner */}
      <div className="relative h-64 md:h-80 w-full bg-slate-300">
        <img 
          src={mockUser.coverUrl} 
          alt="Cover" 
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/40" />
        <button className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-all">
          <Camera size={20} />
        </button>
      </div>

      {/* Profile Header section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-24 sm:-mt-32 mb-8 bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-end gap-6">
          
          <div className="relative group">
            <div className="h-32 w-32 sm:h-40 sm:w-40 rounded-full border-4 border-white dark:border-slate-800 overflow-hidden bg-slate-200 relative z-10 shadow-lg">
              <img src={mockUser.avatarUrl} alt={mockUser.name} className="object-cover h-full w-full" />
            </div>
            <button className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={24} className="text-white" />
            </button>
            {mockUser.verified && (
              <div className="absolute bottom-2 right-2 z-30 bg-white rounded-full p-0.5 shadow-sm">
                <CheckCircle className="w-8 h-8 text-emerald-500 fill-emerald-100" />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-2 pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {mockUser.name}
                </h1>
                <p className="text-primary font-medium flex items-center gap-1.5 mt-1">
                  <ShieldCheck size={18} />
                  {mockUser.role}
                </p>
              </div>
              <div className="flex gap-3">
                <button className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium transition-all shadow-sm flex items-center gap-2">
                  <Edit2 size={16} />
                  Edit Profile
                </button>
                <button className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium transition-all shadow-md flex items-center gap-2 hover:scale-[1.02]">
                  <MessageSquare size={16} />
                  Message
                </button>
              </div>
            </div>
            
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl text-sm sm:text-base line-clamp-2">
              {mockUser.bio}
            </p>
            
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <MapPin size={16} />
                {mockUser.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail size={16} />
                {mockUser.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone size={16} />
                {mockUser.phone}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Properties', value: mockUser.properties, icon: Building },
            { label: 'Rating', value: mockUser.rating, icon: Star, color: 'text-amber-500' },
            { label: 'Reviews', value: mockUser.reviews, icon: MessageSquare },
            { label: 'Status', value: 'Verified', icon: ShieldCheck, color: 'text-emerald-500' },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-transform duration-300">
              <div className="mb-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-full">
                <stat.icon className={`w-6 h-6 ${stat.color || 'text-primary'}`} />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
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
                    {(activeTab === 'properties' ? mockProperties : mockFavorites).map(property => (
                      <motion.div
                        key={property.id}
                        whileHover={{ y: -5, scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-md overflow-hidden border border-slate-100 dark:border-slate-700 cursor-pointer group"
                      >
                        <div className="relative h-48 w-full overflow-hidden">
                          <img src={property.imageUrl} alt={property.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
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
                            <p className="text-primary font-bold whitespace-nowrap">{property.price}</p>
                          </div>
                          <div className="flex items-center text-slate-500 text-sm mb-4">
                            <MapPin className="w-4 h-4 mr-1 shrink-0" />
                            <span className="truncate">{property.location}</span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-300">
                            <div className="flex items-center bg-slate-50 dark:bg-slate-700/50 px-2 py-1 rounded-lg">
                              <Home className="w-4 h-4 mr-1.5 text-slate-400" />
                              <span>{property.beds} Beds</span>
                            </div>
                            <div className="flex items-center bg-slate-50 dark:bg-slate-700/50 px-2 py-1 rounded-lg">
                              <Building className="w-4 h-4 mr-1.5 text-slate-400" />
                              <span>{property.baths} Baths</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div className="space-y-6 max-w-3xl">
                    {mockReviews.map(review => (
                      <div key={review.id} className="p-6 bg-slate-50 dark:bg-slate-700/30 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                              {review.author.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 dark:text-white">{review.author}</h4>
                              <p className="text-xs text-slate-500">{review.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span className="text-sm font-bold text-amber-600 dark:text-amber-500">{review.rating}</span>
                          </div>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                  <div className="max-w-2xl space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Personal Information</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                          <input type="text" defaultValue={mockUser.name} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                          <input type="email" defaultValue={mockUser.email} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white" />
                        </div>
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
                          <input type="tel" defaultValue={mockUser.phone} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white" />
                        </div>
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Bio</label>
                          <textarea rows={4} defaultValue={mockUser.bio} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white resize-none" />
                        </div>
                      </div>
                      <div className="pt-4 flex justify-end">
                        <button className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium transition-all shadow-md hover:scale-[1.02]">
                          Save Changes
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-700/50 pt-8 space-y-4">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Preferences</h3>
                      <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                            {isDarkMode ? <Moon size={20} className="text-primary" /> : <Sun size={20} className="text-amber-500" />}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">Appearance</p>
                            <p className="text-sm text-slate-500">Toggle dark mode theme</p>
                          </div>
                        </div>
                        <button 
                          onClick={toggleDarkMode}
                          className={`w-12 h-6 rounded-full transition-colors relative ${isDarkMode ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}
                        >
                          <motion.div 
                            layout
                            className="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm"
                            initial={false}
                            animate={{ left: isDarkMode ? '1.5rem' : '0.125rem' }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        </button>
                      </div>
                    </div>
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
