'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, Heart, User, Search, LogOut } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export default function Navbar() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then((res: any) => setUser(res.data?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setUserMenuOpen(false);
    router.push('/');
    router.refresh();
  };

  const navLinks = [
    { name: 'Explore', href: '/' },
    { name: 'Buy', href: '/properties?purpose=sale' },
    { name: 'Rent', href: '/properties?purpose=rent' },
    { name: 'Commercial', href: '/properties?purpose=commercial' },
    { name: 'Map', href: '/map' },
  ];

  return (
    <header
      className={`fixed top-0 w-full h-16 z-50 transition-all duration-300 flex items-center ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-base">
              C
            </div>
            <span className="hidden md:block font-bold text-lg text-slate-900 tracking-tight">
              CRESLA
            </span>
          </Link>

          {/* Desktop Center Links */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-slate-600 hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center space-x-5 flex-shrink-0">
            {user && (
              <Link href="/favorites" className="text-slate-600 hover:text-primary transition-colors">
                <Heart className="w-5 h-5" />
              </Link>
            )}
            
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-primary font-semibold text-sm hover:bg-slate-200 transition-colors"
                >
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-lg border border-slate-100 py-1 z-50">
                    <Link href="/profile" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Profile</Link>
                    <Link href="/dashboard" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Dashboard</Link>
                    <Link href="/favorites" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Saved</Link>
                    <Link href="/upload" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">List Property</Link>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth/login" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
                  Sign In
                </Link>
                <Link href="/auth/register" className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-full hover:bg-primary/90 transition-colors">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Right Actions */}
          <div className="flex md:hidden items-center space-x-4">
            <Link href="/search" className="text-slate-600">
              <Search className="w-5 h-5" />
            </Link>
            {user && (
              <Link href="/favorites" className="text-slate-600">
                <Heart className="w-5 h-5" />
              </Link>
            )}
            <button onClick={() => setMobileMenuOpen(true)} className="text-slate-600">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
          <div className="flex justify-between items-center h-16 px-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-base">C</div>
            <button onClick={() => setMobileMenuOpen(false)} className="text-slate-600">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
            <nav className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link key={link.name} href={link.href} onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-slate-900">
                  {link.name}
                </Link>
              ))}
            </nav>
            <div className="pt-6 border-t border-slate-100 flex flex-col space-y-4">
              {user ? (
                <>
                  <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="text-base text-slate-600">Profile</Link>
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-base text-slate-600">Dashboard</Link>
                  <Link href="/upload" onClick={() => setMobileMenuOpen(false)} className="text-base text-slate-600">List Property</Link>
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="text-left text-base text-red-600">Sign Out</button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-slate-900">Sign In</Link>
                  <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)} className="text-center bg-primary text-white px-4 py-3 rounded-xl font-medium">Get Started</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
