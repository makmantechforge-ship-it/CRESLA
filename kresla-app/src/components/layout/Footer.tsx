import Link from "next/link";
import { Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          {/* Column 1: Brand */}
          <div className="space-y-4 max-w-md">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20">
                C
              </div>
              <span className="font-bold text-2xl tracking-tight text-white">
                CRESLA
              </span>
            </Link>
            <p className="text-slate-400 leading-relaxed text-sm">
              Making Real Estate Simple, Secure, and Accessible across Zimbabwe. Find verified residential, luxury, and commercial properties on our premium marketplace.
            </p>
          </div>

          {/* Column 2: Explore */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4">Explore Platform</h3>
            <ul className="grid grid-cols-2 gap-3 text-sm">
              <li><Link href="/properties" className="text-slate-400 hover:text-white transition-colors">Houses</Link></li>
              <li><Link href="/properties" className="text-slate-400 hover:text-white transition-colors">Apartments</Link></li>
              <li><Link href="/properties" className="text-slate-400 hover:text-white transition-colors">Hotels & Lodges</Link></li>
              <li><Link href="/properties" className="text-slate-400 hover:text-white transition-colors">Guest Houses</Link></li>
              <li><Link href="/properties" className="text-slate-400 hover:text-white transition-colors">Luxury Villas</Link></li>
              <li><Link href="/map" className="text-slate-400 hover:text-white transition-colors">Map View</Link></li>
            </ul>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>
            © 2026 CRESLA Technologies. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
