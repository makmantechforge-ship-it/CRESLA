import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-6 relative font-sans text-sm">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 opacity-50"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between gap-10 mb-10">
          {/* Brand */}
          <div className="space-y-4 max-w-sm">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-base shadow-sm">
                C
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                CRESLA
              </span>
            </Link>
            <p className="text-slate-400 leading-relaxed text-sm">
              Making Real Estate Simple, Secure, and Accessible across Zimbabwe. Find verified residential, luxury, and commercial properties.
            </p>
          </div>

          {/* Explore */}
          <div className="min-w-[200px]">
            <h3 className="text-white font-medium text-sm mb-4">Explore Platform</h3>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <li><Link href="/properties?purpose=sale" className="text-slate-400 hover:text-white transition-colors">Houses</Link></li>
              <li><Link href="/properties?purpose=rent" className="text-slate-400 hover:text-white transition-colors">Apartments</Link></li>
              <li><Link href="/properties" className="text-slate-400 hover:text-white transition-colors">Hotels & Lodges</Link></li>
              <li><Link href="/properties" className="text-slate-400 hover:text-white transition-colors">Guest Houses</Link></li>
              <li><Link href="/properties?purpose=commercial" className="text-slate-400 hover:text-white transition-colors">Commercial</Link></li>
              <li><Link href="/map" className="text-slate-400 hover:text-white transition-colors">Map View</Link></li>
            </ul>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CRESLA Technologies. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
