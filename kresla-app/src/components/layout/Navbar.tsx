"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Heart, User, Moon, Sun, Search, MapPin, Building2 } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  const navLinks = [
    { name: "Explore", href: "/properties", icon: Search },
    { name: "Buy", href: "/properties", icon: Building2 },
    { name: "Rent", href: "/properties", icon: Building2 },
    { name: "Commercial", href: "/properties", icon: Building2 },
    { name: "Map", href: "/map", icon: MapPin },
  ];

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl shadow-sm dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl group-hover:scale-105 transition-transform shadow-lg shadow-primary/30">
                C
              </div>
              <span className="font-bold text-2xl tracking-tight text-slate-900 dark:text-white">
                Kresla
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-primary-light font-medium transition-colors text-sm"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link href="/favorites" className="p-2 rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
              <Heart className="w-5 h-5" />
            </Link>
            <Link href="/profile" className="p-2 rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
              <User className="w-5 h-5" />
            </Link>
            <Link
              href="/dashboard"
              className="bg-gradient-to-r from-primary to-primary-light text-white px-6 py-2.5 rounded-full font-medium shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300"
            >
              List Property
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 text-slate-600 dark:text-slate-300"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-600 dark:text-slate-300 hover:text-primary transition-colors p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden absolute top-full left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-all duration-300 overflow-hidden ${
          mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pt-2 pb-6 space-y-1 shadow-xl">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="flex items-center gap-3 px-3 py-3 text-base font-medium text-slate-700 dark:text-slate-200 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <link.icon className="w-5 h-5 text-slate-400" />
              {link.name}
            </Link>
          ))}
          <div className="border-t border-slate-100 dark:border-slate-800 mt-4 pt-4 px-3 space-y-4">
            <div className="flex items-center gap-4">
              <Link href="/favorites" className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium" onClick={() => setMobileMenuOpen(false)}>
                <Heart className="w-5 h-5" /> Saved
              </Link>
              <Link href="/profile" className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium" onClick={() => setMobileMenuOpen(false)}>
                <User className="w-5 h-5" /> Account
              </Link>
            </div>
            <Link
              href="/dashboard"
              className="flex justify-center w-full bg-primary text-white px-6 py-3 rounded-xl font-medium shadow-md shadow-primary/25"
              onClick={() => setMobileMenuOpen(false)}
            >
              List Property
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
