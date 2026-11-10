import Link from "next/link";

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" {...props}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

function YoutubeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" {...props}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-[#0B3B95] text-white pt-14 pb-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-blue-400/20">
          
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-2">
            <Link href="/" className="inline-block">
              <span className="font-extrabold text-2xl tracking-tight text-white">
                CRESLA
              </span>
            </Link>
            <p className="text-blue-100/90 italic text-sm font-medium">
              A place for everyone!
            </p>
          </div>

          {/* Links Columns & Socials */}
          <div className="md:col-span-8 flex flex-col justify-between">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
              
              {/* 1. Explore */}
              <div>
                <h4 className="text-white font-bold text-sm mb-4">Explore</h4>
                <ul className="space-y-2.5 text-xs sm:text-sm text-blue-100/80">
                  <li><Link href="/properties?type=House" className="hover:text-white transition-colors">Homes</Link></li>
                  <li><Link href="/properties?type=Lodge" className="hover:text-white transition-colors">Stays</Link></li>
                  <li><Link href="/properties?purpose=commercial" className="hover:text-white transition-colors">Business</Link></li>
                  <li><Link href="/properties?type=Land" className="hover:text-white transition-colors">Lands</Link></li>
                  <li><Link href="/properties?type=Venue" className="hover:text-white transition-colors">Events & Special Places</Link></li>
                </ul>
              </div>

              {/* 2. For Property Owners */}
              <div>
                <h4 className="text-white font-bold text-sm mb-4">For Property Owners</h4>
                <ul className="space-y-2.5 text-xs sm:text-sm text-blue-100/80">
                  <li><Link href="/upload" className="hover:text-white transition-colors">List Your Property</Link></li>
                  <li><Link href="/upload" className="hover:text-white transition-colors">Why List With Us</Link></li>
                </ul>
              </div>

              {/* 3. Support */}
              <div>
                <h4 className="text-white font-bold text-sm mb-4">Support</h4>
                <ul className="space-y-2.5 text-xs sm:text-sm text-blue-100/80">
                  <li><Link href="/messages" className="hover:text-white transition-colors">Help & Support</Link></li>
                  <li><Link href="/#how-it-works" className="hover:text-white transition-colors">FAQs</Link></li>
                  <li><Link href="/messages" className="hover:text-white transition-colors">Contact Us</Link></li>
                </ul>
              </div>

              {/* 4. About */}
              <div>
                <h4 className="text-white font-bold text-sm mb-4">About</h4>
                <ul className="space-y-2.5 text-xs sm:text-sm text-blue-100/80">
                  <li><Link href="/about" className="hover:text-white transition-colors">About CRESLA</Link></li>
                  <li><Link href="/terms" className="hover:text-white transition-colors">Terms & Privacy</Link></li>
                  <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                </ul>
              </div>

            </div>

            {/* Social Icons */}
            <div className="flex justify-end items-center gap-4 mt-8 pt-4">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-white/80 hover:text-white transition-colors p-1" aria-label="Facebook">
                <FacebookIcon className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-white/80 hover:text-white transition-colors p-1" aria-label="X">
                <XIcon className="w-4 h-4" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-white/80 hover:text-white transition-colors p-1" aria-label="Instagram">
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="text-white/80 hover:text-white transition-colors p-1" aria-label="YouTube">
                <YoutubeIcon className="w-5 h-5" />
              </a>
            </div>

          </div>

        </div>

        {/* Bottom Copyright Strip */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-blue-200/70">
          <p>© 2025 CRESLA. All rights reserved.</p>
          <p className="italic font-medium">A place for everyone!</p>
        </div>

      </div>
    </footer>
  );
}

