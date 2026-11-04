/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Facebook, Instagram } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon.tsx';
import { TikTokIcon } from './TikTokIcon.tsx';

interface FooterProps {
  currentPage?: string;
  onNavigate: (page: string, category?: 'all' | 'women' | 'men' | 'bags') => void;
  onScrollToSection: (sectionId: string) => void;
  adminToken?: string | null;
  onOpenCookieSettings?: () => void;
}

export default function Footer({
  onNavigate,
  onScrollToSection,
  onOpenCookieSettings
}: FooterProps) {
  const socialLinks = [
    { title: 'Instagram (@nnepaforiwaa)', icon: <Instagram className="w-3.5 h-3.5" />, href: 'https://www.instagram.com/nnepaforiwaa' },
    { title: 'TikTok (@nnepa.foriwaa)', icon: <TikTokIcon className="w-3.5 h-3.5 fill-current" />, href: 'https://www.tiktok.com/@nnepa.foriwaa' },
    { title: 'Facebook (nnepa foriwaa)', icon: <Facebook className="w-3.5 h-3.5" />, href: 'https://www.facebook.com/nnepaforiwaa' },
    { title: 'WhatsApp (+233 53 879 5669)', icon: <WhatsAppIcon className="w-3.5 h-3.5 fill-current text-emerald-400" />, href: 'https://wa.me/233538795669?text=Hello%20Nnepa%20Foriwaa!' },
  ];

  return (
    <footer className="bg-plum-dark text-white py-8 px-5 sm:px-8 md:px-12 mt-auto w-full border-t border-lilac/10">
      <div className="max-w-7xl mx-auto">
        {/* Main 4-column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 pb-8 border-b border-lilac/10">
          
          {/* Brand Info & Motto Column */}
          <div className="md:col-span-2 flex flex-col justify-between">
            <div>
              <button
                type="button"
                onClick={() => {
                  onNavigate('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="font-serif text-lg sm:text-xl font-semibold tracking-wider text-lilac bg-transparent border-none p-0 cursor-pointer text-left"
              >
                NNEPA FORIWAA
              </button>

              <p className="text-pearl-2/60 leading-relaxed max-w-sm mt-2 mb-4 font-light">
                Rooted. Refined. Regal. Premium African fashion brand creating bespoke pieces for women and men since 2015.
              </p>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 mt-2">
              {socialLinks.map((soc, i) => (
                <a
                  key={i}
                  href={soc.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-full border border-lilac/20 text-lilac/60 hover:text-lilac hover:border-lilac hover:bg-lilac/10 duration-200 flex items-center justify-center cursor-pointer no-underline"
                  title={soc.title}
                  aria-label={soc.title}
                >
                  {soc.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links Columns (3 Columns) */}
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* Column 1: Shop */}
            <div>
              <div className="footer-heading font-semibold tracking-wider uppercase text-lilac mb-3">
                Shop
              </div>
              <ul className="list-none m-0 p-0 flex flex-col gap-2">
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('shop', 'women')}
                    className="bg-transparent border-none p-0 text-pearl-2/65 hover:text-lilac cursor-pointer font-light transition-colors text-left block"
                  >
                    Womenswear
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('shop', 'men')}
                    className="bg-transparent border-none p-0 text-pearl-2/65 hover:text-lilac cursor-pointer font-light transition-colors text-left block"
                  >
                    Menswear
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('shop', 'bags')}
                    className="bg-transparent border-none p-0 text-pearl-2/65 hover:text-lilac cursor-pointer font-light transition-colors text-left block"
                  >
                    Accessories
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('shop', 'all')}
                    className="bg-transparent border-none p-0 text-pearl-2/65 hover:text-lilac cursor-pointer font-light transition-colors text-left block"
                  >
                    All Collections
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 2: About */}
            <div>
              <div className="footer-heading font-semibold tracking-wider uppercase text-lilac mb-3">
                About
              </div>
              <ul className="list-none m-0 p-0 flex flex-col gap-2">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate('about');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-transparent border-none p-0 text-pearl-2/65 hover:text-lilac cursor-pointer font-light transition-colors text-left block"
                  >
                    Brand Story
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onScrollToSection('heritage')}
                    className="bg-transparent border-none p-0 text-pearl-2/65 hover:text-lilac cursor-pointer font-light transition-colors text-left block"
                  >
                    Our Heritage
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onScrollToSection('testimonials')}
                    className="bg-transparent border-none p-0 text-pearl-2/65 hover:text-lilac cursor-pointer font-light transition-colors text-left block"
                  >
                    Client Stories
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate('contact');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-transparent border-none p-0 text-pearl-2/65 hover:text-lilac cursor-pointer font-light transition-colors text-left block"
                  >
                    Contact Support
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Policies & Client Care (Unique Links Only) */}
            <div>
              <div className="footer-heading font-semibold tracking-wider uppercase text-lilac mb-3">
                Client Care
              </div>
              <ul className="list-none m-0 p-0 flex flex-col gap-2">
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('size-chart')}
                    className="bg-transparent border-none p-0 text-pearl-2/65 hover:text-lilac cursor-pointer font-light transition-colors text-left block"
                  >
                    Size Guide
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('terms')}
                    className="bg-transparent border-none p-0 text-pearl-2/65 hover:text-lilac cursor-pointer font-light transition-colors text-left block"
                  >
                    Terms & Alterations
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('privacy')}
                    className="bg-transparent border-none p-0 text-pearl-2/65 hover:text-lilac cursor-pointer font-light transition-colors text-left block"
                  >
                    Privacy Policy
                  </button>
                </li>
                {onOpenCookieSettings && (
                  <li>
                    <button
                      type="button"
                      onClick={onOpenCookieSettings}
                      className="bg-transparent border-none p-0 text-pearl-2/65 hover:text-lilac cursor-pointer font-light transition-colors text-left block"
                    >
                      Cookie Preferences
                    </button>
                  </li>
                )}
              </ul>
            </div>

          </div>
        </div>

        {/* Clean Bottom Bar (No Duplicate Links) */}
        <div className="footer-bottom pt-5 flex flex-col sm:flex-row justify-between items-center gap-2 text-lilac/50 font-light">
          <div>
            © {new Date().getFullYear()} Nnepa Foriwaa. All rights reserved.
          </div>
          <div>
            <span>Accra, Ghana &bull; Worldwide Delivery</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
