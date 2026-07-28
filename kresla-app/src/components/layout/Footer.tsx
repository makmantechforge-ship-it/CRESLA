import Link from "next/link";
import { Mail, Phone, MapPin, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Column 1: Brand */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20">
                C
              </div>
              <span className="font-bold text-2xl tracking-tight text-white">
                Kresla
              </span>
            </Link>
            <p className="text-slate-400 leading-relaxed text-sm">
              Making Real Estate Simple, Secure, and Accessible. Find your dream property with our premium marketplace.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-colors duration-300">
                <Globe className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-colors duration-300">
                <Globe className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-colors duration-300">
                <Globe className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-colors duration-300">
                <Globe className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Explore */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Explore</h3>
            <ul className="space-y-4">
              <li><Link href="/properties" className="text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Buy Property</Link></li>
              <li><Link href="/properties" className="text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Rent Property</Link></li>
              <li><Link href="/properties" className="text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Commercial</Link></li>
              <li><Link href="/properties" className="text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Student</Link></li>
              <li><Link href="/properties" className="text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Luxury</Link></li>
              <li><Link href="/properties" className="text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Land</Link></li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Company</h3>
            <ul className="space-y-4">
              <li><Link href="#" className="text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-300">About Us</Link></li>
              <li><Link href="#" className="text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Careers</Link></li>
              <li><Link href="#" className="text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Press</Link></li>
              <li><Link href="#" className="text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Blog</Link></li>
              <li><Link href="#" className="text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Contact</Link></li>
              <li><Link href="#" className="text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Partners</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact & Support */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Support & Contact</h3>
            <ul className="space-y-4 mb-6">
              <li><Link href="#" className="text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Help Center</Link></li>
              <li><Link href="#" className="text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Safety</Link></li>
            </ul>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <span className="text-slate-400 text-sm">123 Real Estate Blvd, Suite 100<br/>San Francisco, CA 94107</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-slate-400 text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-slate-400 text-sm">hello@kresla.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            © 2026 Kresla Technologies. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
