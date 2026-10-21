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
}

export default function Footer({ currentPage, onNavigate, onScrollToSection, adminToken }: FooterProps) {
  const socialLinks = [
    { title: 'Instagram (@nnepaforiwaa)', icon: <Instagram className="w-3.5 h-3.5" />, href: 'https://www.instagram.com/nnepaforiwaa' },
    { title: 'TikTok (@nnepa.foriwaa)', icon: <TikTokIcon className="w-3.5 h-3.5 fill-current" />, href: 'https://www.tiktok.com/@nnepa.foriwaa' },
    { title: 'Facebook (nnepa foriwaa)', icon: <Facebook className="w-3.5 h-3.5" />, href: 'https://www.facebook.com/nnepaforiwaa' },
    { title: 'WhatsApp (+233 53 879 5669)', icon: <WhatsAppIcon className="w-3.5 h-3.5 fill-current text-emerald-400" />, href: 'https://wa.me/233538795669?text=Hello%20Nnepa%20Foriwaa!' },
  ];

  return (
    <footer className="bg-plum-dark text-white py-4 sm:py-7 px-4 sm:px-8 md:px-12 mt-auto w-full border-t border-lilac/10 text-xs">
      <div className="max-w-7xl mx-auto">
        
        {/* Main Grid: Responsive and slimmed on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-8 pb-4 sm:pb-6 border-b border-lilac/10">
          
          {/* Brand Info & Motto Column */}
          <div className="md:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    onNavigate('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="font-serif text-lg sm:text-xl font-semibold tracking-wider text-lilac bg-transparent border-none p-0 cursor-pointer text-left"
                >
                  NNEPA FORIWAA
                </button>

                {/* Social icons visible next to brand title on mobile to save vertical height */}
                <div className="flex gap-2 sm:hidden">
                  {socialLinks.map((soc, i) => (
                    <a
                      key={i}
                      href={soc.href}
                      target={soc.href.startsWith('http') ? '_blank' : '_self'}
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        if (soc.href === '#') e.preventDefault();
                      }}
                      className="w-6 h-6 rounded-full border border-lilac/20 text-lilac/60 hover:text-lilac hover:border-lilac duration-200 flex items-center justify-center"
                      title={soc.title}
                    >
                      {soc.icon}
                    </a>
                  ))}
                </div>
              </div>

              <p className="text-[0.68rem] sm:text-xs text-pearl-2/50 leading-tight sm:leading-relaxed max-w-sm mt-1 sm:mt-2 mb-2 font-light">
                Rooted. Refined. Regal. Premium African fashion brand crafting clothing for women and men since 2015.
              </p>
            </div>

            {/* Social icons on desktop */}
            <div className="hidden sm:flex gap-2.5 mt-2">
              {socialLinks.map((soc, i) => (
                <a
                  key={i}
                  href={soc.href}
                  target={soc.href.startsWith('http') ? '_blank' : '_self'}
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (soc.href === '#') e.preventDefault();
                  }}
                  className="w-7 h-7 rounded-full border border-lilac/15 text-lilac/40 hover:text-lilac hover:border-lilac hover:bg-lilac/[0.07] duration-200 flex items-center justify-center cursor-pointer"
                  title={soc.title}
                >
                  {soc.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links 3-column grid container */}
          <div className="md:col-span-3 grid grid-cols-3 gap-2 sm:gap-6">
            
            {/* Column 1: Shop Collections */}
            <div>
              <div className="text-[0.6rem] sm:text-xs font-bold tracking-[0.18em] uppercase text-lilac mb-1 sm:mb-2">
                Shop
              </div>
              <ul className="list-none m-0 p-0 flex flex-col gap-0.5 sm:gap-1.5">
                <li>
                  <button
                    onClick={() => onNavigate('shop', 'women')}
                    className="bg-transparent border-none p-0 text-[0.65rem] sm:text-xs text-pearl-2/50 hover:text-lilac cursor-pointer font-light transition-colors text-left block"
                  >
                    Womenswear
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('shop', 'men')}
                    className="bg-transparent border-none p-0 text-[0.65rem] sm:text-xs text-pearl-2/50 hover:text-lilac cursor-pointer font-light transition-colors text-left block"
                  >
                    Menswear
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('shop', 'bags')}
                    className="bg-transparent border-none p-0 text-[0.65rem] sm:text-xs text-pearl-2/50 hover:text-lilac cursor-pointer font-light transition-colors text-left block"
                  >
                    Bags & Accessories
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('shop', 'all')}
                    className="bg-transparent border-none p-0 text-[0.65rem] sm:text-xs text-pearl-2/50 hover:text-lilac cursor-pointer font-light transition-colors text-left block"
                  >
                    All Outfits
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 2: Explore & Heritage */}
            <div>
              <div className="text-[0.6rem] sm:text-xs font-bold tracking-[0.18em] uppercase text-lilac mb-1 sm:mb-2">
                Explore
              </div>
              <ul className="list-none m-0 p-0 flex flex-col gap-0.5 sm:gap-1.5">
                <li>
                  <button
                    onClick={() => onNavigate('about')}
                    className="bg-transparent border-none p-0 text-[0.65rem] sm:text-xs text-pearl-2/50 hover:text-lilac cursor-pointer font-light transition-colors text-left block"
                  >
                    About Brand
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('contact')}
                    className="bg-transparent border-none p-0 text-[0.65rem] sm:text-xs text-pearl-2/50 hover:text-lilac cursor-pointer font-light transition-colors text-left block"
                  >
                    Schedule Fitting
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onScrollToSection('heritage')}
                    className="bg-transparent border-none p-0 text-[0.65rem] sm:text-xs text-pearl-2/50 hover:text-lilac cursor-pointer font-light transition-colors text-left block"
                  >
                    Our Heritage
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onScrollToSection('testimonials')}
                    className="bg-transparent border-none p-0 text-[0.65rem] sm:text-xs text-pearl-2/50 hover:text-lilac cursor-pointer font-light transition-colors text-left block"
                  >
                    Client Stories
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Policy & Client Care */}
            <div>
              <div className="text-[0.6rem] sm:text-xs font-bold tracking-[0.18em] uppercase text-lilac mb-1 sm:mb-2">
                Policies & Care
              </div>
              <ul className="list-none m-0 p-0 flex flex-col gap-0.5 sm:gap-1.5">
                <li>
                  <button
                    onClick={() => onNavigate('terms')}
                    className="bg-transparent border-none p-0 text-[0.65rem] sm:text-xs text-pearl-2/50 hover:text-lilac cursor-pointer font-light transition-colors text-left block"
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('privacy')}
                    className="bg-transparent border-none p-0 text-[0.65rem] sm:text-xs text-pearl-2/50 hover:text-lilac cursor-pointer font-light transition-colors text-left block"
                  >
                    Privacy Policy
                  </button>
                </li>
                {currentPage && currentPage !== 'home' && (
                  <li>
                    <button
                      onClick={() => onNavigate('size-chart')}
                      className="bg-transparent border-none p-0 text-[0.65rem] sm:text-xs text-lilac/90 hover:text-white cursor-pointer font-medium transition-colors text-left block"
                    >
                      Size Chart & Conversions
                    </button>
                  </li>
                )}
                <li>
                  <span
                    className="text-[0.65rem] sm:text-xs text-pearl-2/50 font-light block cursor-default select-none"
                  >
                    Alterations & Fees
                  </span>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('contact')}
                    className="bg-transparent border-none p-0 text-[0.65rem] sm:text-xs text-pearl-2/50 hover:text-lilac cursor-pointer font-light transition-colors text-left block"
                  >
                    Contact Support
                  </button>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Compact Bottom Bar */}
        <div className="pt-2.5 sm:pt-4 flex flex-col sm:flex-row justify-between items-center gap-1 text-[0.58rem] sm:text-[0.65rem] text-lilac/40 font-light">
          <div>
            © {new Date().getFullYear()} Nnepa Foriwaa. All rights reserved.
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('terms')}
              className="bg-transparent border-none p-0 text-lilac/40 hover:text-lilac cursor-pointer transition-colors"
            >
              No Refunds & Exchanges Policy
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigate('privacy')}
              className="bg-transparent border-none p-0 text-lilac/40 hover:text-lilac cursor-pointer transition-colors"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigate(adminToken ? 'admin-dashboard' : 'admin-login')}
              className="bg-transparent border-none p-0 text-lilac/40 hover:text-lilac cursor-pointer transition-colors"
            >
              {adminToken ? 'Admin Dashboard' : 'Admin Login'}
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
