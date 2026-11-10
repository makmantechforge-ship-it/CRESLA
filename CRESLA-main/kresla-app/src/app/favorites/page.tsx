'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Sparkles, Building2, Loader2, ArrowRight } from 'lucide-react';
import { PropertyCard } from '@/components/ui/PropertyCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { getUserFavorites, removeFavorite, getProperties } from '@/utils/supabase/queries';
import { createClient } from '@/utils/supabase/client';
import { properties as mockProperties } from '@/data/properties';

export default function SavedPropertiesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [savedProperties, setSavedProperties] = useState<any[]>([]);
  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setUser(user);

      // Fetch user's saved favorites
      const favs = await getUserFavorites(user.id);
      if (favs && favs.length > 0) {
        setSavedProperties(favs);
      }

      // Fetch all platform properties for smart recommendations
      const dbProps = await getProperties();
      if (dbProps && dbProps.length > 0) {
        setAllProperties(dbProps);
      } else {
        setAllProperties(mockProperties);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const handleRemoveSaved = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (!user) return;
    try {
      await removeFavorite(user.id, id);
      setSavedProperties((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to remove saved property', err);
    }
  };

  // Smart Recommendations based on saved properties attributes
  const recommendedProperties = useMemo(() => {
    if (savedProperties.length === 0) return [];
    
    // Extract saved cities and property types
    const savedCities = new Set(savedProperties.map((p) => p.city).filter(Boolean));
    const savedTypes = new Set(savedProperties.map((p) => p.type).filter(Boolean));

    const recs = allProperties.filter((p) => {
      const isSaved = savedProperties.some((s) => s.id === p.id);
      if (isSaved) return false;
      const matchesCity = savedCities.has(p.city);
      const matchesType = savedTypes.has(p.type);
      return matchesCity || matchesType;
    });

    return recs.slice(0, 3);
  }, [savedProperties, allProperties]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-16 flex items-center justify-center font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-16 font-sans">
        <div className="max-w-4xl mx-auto px-4">
          <EmptyState
            title="Sign in to view saved homes"
            description="Create an account or sign in to save your favorite properties and receive smart match recommendations."
            icon={<Heart className="w-12 h-12 text-slate-300" />}
            actions={[
              { label: 'Sign In', onClick: () => router.push('/auth/login') },
              { label: 'Create Account', onClick: () => router.push('/auth/register') },
            ]}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* HEADER */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Saved Properties</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {savedProperties.length} {savedProperties.length === 1 ? 'property saved to your collection' : 'properties saved to your collection'}.
          </p>
        </div>

        {/* SAVED PROPERTIES GRID */}
        {savedProperties.length === 0 ? (
          <EmptyState
            title="No saved homes yet"
            description="Explore verified listings across Zimbabwe and tap the heart icon on any property to save it here."
            icon={<Heart className="w-12 h-12 text-slate-300" />}
            actions={[
              { label: 'Start Exploring', onClick: () => router.push('/search') },
            ]}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onSave={handleRemoveSaved}
                isSaved={true}
              />
            ))}
          </div>
        )}

        {/* SMART RECOMMENDATIONS SECTION (INVESTMENT STAGE OF HOOKED MODEL) */}
        {recommendedProperties.length > 0 && (
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Recommended for you</h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Based on your saved homes and location preferences.
                </p>
              </div>

              <Link href="/properties" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendedProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
