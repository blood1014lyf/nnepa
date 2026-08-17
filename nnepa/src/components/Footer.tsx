/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Facebook, Instagram, Twitter } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon.tsx';

interface FooterProps {
  onScrollToSection: (sectionId: string) => void;
}

export default function Footer({ onScrollToSection }: FooterProps) {
  const socialLinks = [
    { title: 'WhatsApp', icon: <WhatsAppIcon className="w-3.5 h-3.5 fill-current text-emerald-400" />, href: 'https://wa.me/233246811210?text=Hello%20Nnepa%20Foriwaa!' },
    { title: 'Instagram', icon: <Instagram className="w-3.5 h-3.5" />, href: '#' },
    { title: 'Facebook', icon: <Facebook className="w-3.5 h-3.5" />, href: '#' },
    { title: 'Twitter', icon: <Twitter className="w-3.5 h-3.5" />, href: '#' },
  ];

  return (
    <footer className="bg-plum-dark text-white py-4 sm:py-6 md:py-8 px-4 sm:px-6 md:px-12 mt-auto w-full border-t border-lilac/10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 md:gap-8 pb-4 md:pb-6 border-b border-solid border-lilac/8">
          {/* Brand Information column */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between sm:block">
              <div className="font-serif text-lg sm:text-xl font-semibold tracking-wider text-lilac">
                NNEPA FORIWAA
              </div>
              {/* Social media connections for mobile */}
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
                    className="w-6.5 h-6.5 rounded-full border border-solid border-lilac/15 text-lilac/50 hover:text-lilac hover:border-lilac duration-300 flex items-center justify-center"
                    title={soc.title}
                  >
                    {soc.icon}
                  </a>
                ))}
              </div>
            </div>

            <p className="text-[0.72rem] sm:text-xs text-pearl-2/45 leading-relaxed max-w-sm my-2 font-light">
              Where African heritage meets modern luxury — crafting luxury pieces that celebrate African culture worldwide.
            </p>

            {/* Social media connections for desktop/tablet */}
            <div className="hidden sm:flex gap-2 mt-3">
              {socialLinks.map((soc, i) => (
                <a
                  key={i}
                  href={soc.href}
                  target={soc.href.startsWith('http') ? '_blank' : '_self'}
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (soc.href === '#') e.preventDefault();
                  }}
                  className="w-7 h-7 rounded-full border border-solid border-lilac/15 text-lilac/40 hover:text-lilac hover:border-lilac hover:bg-lilac/[0.07] duration-300 flex items-center justify-center cursor-pointer"
                  title={soc.title}
                >
                  {soc.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links 3-column grid container for mobile and desktop */}
          <div className="col-span-1 sm:col-span-1 lg:col-span-3 grid grid-cols-3 gap-2 sm:gap-4">
            {/* Shop Category directory */}
            <div>
              <div className="text-[0.58rem] font-bold tracking-[0.2em] uppercase text-lilac mb-1.5">
                Shop
              </div>
              <ul className="list-none m-0 p-0 flex flex-col gap-1">
                {['Women', 'Men', 'Kids', 'New In', 'Sale'].map((lk, i) => (
                  <li key={i}>
                    <a
                      href="#products"
                      onClick={(e) => {
                        e.preventDefault();
                        onScrollToSection('products');
                      }}
                      className="text-[0.68rem] sm:text-xs text-pearl-2/45 hover:text-lilac no-underline tracking-wide duration-300 font-light block py-0.5"
                    >
                      {lk}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Heritage sizing and history */}
            <div>
              <div className="text-[0.58rem] font-bold tracking-[0.2em] uppercase text-lilac mb-1.5">
                Heritage
              </div>
              <ul className="list-none m-0 p-0 flex flex-col gap-1">
                {['Custom', 'Size Guide', 'Fabrics', 'Our Story', 'Eco'].map((lk, i) => (
                  <li key={i}>
                    <a
                      href="#heritage"
                      onClick={(e) => {
                        e.preventDefault();
                        onScrollToSection('heritage');
                      }}
                      className="text-[0.68rem] sm:text-xs text-pearl-2/45 hover:text-lilac no-underline tracking-wide duration-300 font-light block py-0.5"
                    >
                      {lk}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support links section */}
            <div>
              <div className="text-[0.58rem] font-bold tracking-[0.2em] uppercase text-lilac mb-1.5">
                Support
              </div>
              <ul className="list-none m-0 p-0 flex flex-col gap-1">
                {['FAQ', 'Shipping', 'Returns', 'Tracking', 'Contact'].map((lk, i) => (
                  <li key={i}>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                      className="text-[0.68rem] sm:text-xs text-pearl-2/45 hover:text-lilac no-underline tracking-wide duration-300 font-light block py-0.5"
                    >
                      {lk}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright branding & merchant credentials footer */}
        <div className="pt-2.5 flex flex-col sm:flex-row justify-between items-center gap-1">
          <div className="text-[0.56rem] sm:text-[0.6rem] text-lilac/35 tracking-wider text-center sm:text-left font-light">
            © {new Date().getFullYear()} Nnepa Foriwaa. All rights reserved. Crafted from Africa to the world.
          </div>
        </div>
      </div>
    </footer>
  );
}
