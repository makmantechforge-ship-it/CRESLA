'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, PlusCircle, Heart, MessageSquare } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Home',
      href: '/',
      icon: Home,
      exact: true,
    },
    {
      label: 'Explore',
      href: '/properties',
      icon: Compass,
      exact: false,
    },
    {
      label: 'Post',
      href: '/upload',
      icon: PlusCircle,
      exact: false,
      isPrimary: true,
    },
    {
      label: 'Saved',
      href: '/favorites',
      icon: Heart,
      exact: false,
    },
    {
      label: 'Messages',
      href: '/messages',
      icon: MessageSquare,
      exact: false,
    },
  ];

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-5 h-16 items-center px-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = item.exact 
            ? pathname === item.href 
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          if (item.isPrimary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-5 group"
                aria-label={item.label}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform duration-200 active:scale-90 ${
                  isActive 
                    ? 'bg-[#0B3B95] text-white ring-4 ring-blue-100' 
                    : 'bg-[#0B3B95] text-white group-hover:scale-105'
                }`}>
                  <Icon className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className={`text-[10px] font-bold tracking-tight mt-1 ${
                  isActive ? 'text-[#0B3B95]' : 'text-slate-600'
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center h-full py-1 transition-colors duration-150 relative ${
                isActive 
                  ? 'text-[#0B3B95]' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-150 ${
                  isActive ? 'stroke-[2.4] scale-110' : 'stroke-[1.8]'
                }`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#0B3B95] rounded-full" />
                )}
              </div>
              <span className={`text-[10px] mt-1 tracking-tight ${
                isActive ? 'font-bold text-[#0B3B95]' : 'font-medium text-slate-500'
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
