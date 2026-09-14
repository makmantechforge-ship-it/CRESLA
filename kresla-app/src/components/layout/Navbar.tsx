'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Menu, X, Search, Plus, Compass, ShoppingCart, 
  HelpCircle, User as UserIcon, LogOut, LayoutDashboard 
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export default function Navbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then((res: any) => setUser(res.data?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setMenuOpen(false);
    router.push('/');
    router.refresh();
  };

  const handleHowItWorks = () => {
    setMenuOpen(false);
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push('/#how-it-works');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-[#0B3B95] z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        
        {/* Brand Logo & Tagline */}
        <Link href="/" className="flex items-center gap-3 sm:gap-4 group">
          <div className="flex flex-col">
            <span className="font-extrabold text-2xl tracking-tight text-white leading-none">
              CRESLA
            </span>
            <span className="text-[11px] sm:text-xs text-blue-100/90 italic font-medium tracking-wide mt-1">
              A place for everyone!
            </span>
          </div>
        </Link>

        {/* Right Controls: Search Icon & Hamburger Menu */}
        <div className="relative flex items-center gap-3 sm:gap-4" ref={menuRef}>
          <Link
            href="/properties"
            className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            title="Search Properties"
          >
            <Search className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
          </Link>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {menuOpen ? (
              <X className="w-6 h-6 stroke-[2.4]" />
            ) : (
              <Menu className="w-6 h-6 stroke-[2.4]" />
            )}
          </button>

          {/* Floating Popup Menu matching reference design */}
          {menuOpen && (
            <div className="absolute right-0 top-12 mt-2 w-64 sm:w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 px-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="space-y-1">
                {/* 1. Post a Property */}
                <Link
                  href="/upload"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-800 hover:bg-blue-50/70 hover:text-[#0B3B95] text-sm font-semibold transition-colors group"
                >
                  <Plus className="w-4 h-4 text-[#0B3B95] stroke-[2.8]" />
                  <span>Post a Property</span>
                </Link>

                {/* 2. Explore */}
                <Link
                  href="/properties"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-800 hover:bg-blue-50/70 hover:text-[#0B3B95] text-sm font-semibold transition-colors"
                >
                  <Compass className="w-4 h-4 text-[#0B3B95] stroke-[2.2]" />
                  <span>Explore</span>
                </Link>

                {/* 3. Buy Properties */}
                <Link
                  href="/properties?purpose=sale"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-800 hover:bg-blue-50/70 hover:text-[#0B3B95] text-sm font-semibold transition-colors"
                >
                  <ShoppingCart className="w-4 h-4 text-[#0B3B95] stroke-[2.2]" />
                  <span>Buy Properties</span>
                </Link>

                {/* 4. How it Works */}
                <button
                  onClick={handleHowItWorks}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-800 hover:bg-blue-50/70 hover:text-[#0B3B95] text-sm font-semibold transition-colors text-left cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 text-[#0B3B95] stroke-[2.2]" />
                  <span>How it Works</span>
                </button>

                <div className="my-1.5 border-t border-slate-100"></div>

                {/* 5. Sign In / Register / Account */}
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-800 hover:bg-blue-50/70 hover:text-[#0B3B95] text-sm font-semibold transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#0B3B95] stroke-[2.2]" />
                      <span>My Dashboard</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 text-sm font-semibold transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 stroke-[2.2]" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <Link
                    href="/auth/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-800 hover:bg-blue-50/70 hover:text-[#0B3B95] text-sm font-semibold transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-[#0B3B95] stroke-[2.2]" />
                    <span>Sign In / Register</span>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
