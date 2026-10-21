/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { X, Instagram, Facebook } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { TikTokIcon } from './TikTokIcon.tsx';
import { WhatsAppIcon } from './WhatsAppIcon.tsx';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
  onPageChange: (page: string) => void;
  adminToken?: string | null;
}

export default function MobileMenu({ isOpen, onClose, currentPage, onPageChange, adminToken }: MobileMenuProps) {
  const menuLinks = [
    { label: 'Home Feed', page: 'home' },
    { label: 'Shop', page: 'shop' },
    { label: 'About Brand', page: 'about' },
    { label: 'Contact', page: 'contact' },
  ];

  const socialLinks = [
    { title: 'Instagram (@nnepaforiwaa)', icon: <Instagram className="w-4 h-4" />, href: 'https://www.instagram.com/nnepaforiwaa' },
    { title: 'TikTok (@nnepa.foriwaa)', icon: <TikTokIcon className="w-4 h-4 fill-current" />, href: 'https://www.tiktok.com/@nnepa.foriwaa' },
    { title: 'Facebook (nnepa foriwaa)', icon: <Facebook className="w-4 h-4" />, href: 'https://www.facebook.com/nnepaforiwaa' },
    { title: 'WhatsApp', icon: <WhatsAppIcon className="w-4 h-4 fill-current text-emerald-400" />, href: 'https://wa.me/233538795669?text=Hello%20Nnepa%20Foriwaa!' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '-100%' }}
          animate={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[850] bg-gradient-to-br from-plum-dark to-[#1e0c30] flex flex-col items-center justify-center gap-8 text-center px-6 overflow-y-auto py-16"
        >
          <button
            onClick={onClose}
            className="absolute top-7 right-8 bg-transparent border-none text-[rgba(228,218,245,0.6)] hover:text-lilac cursor-pointer transition-colors"
            aria-label="Close menu"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="flex flex-col gap-6">
            {menuLinks.map((link) => (
              <motion.button
                key={link.page}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                onClick={() => {
                  onPageChange(link.page);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  onClose();
                }}
                className={`font-serif text-2xl font-light border-none bg-transparent cursor-pointer tracking-wide transition-colors ${
                  currentPage === link.page
                    ? 'text-white font-extrabold underline decoration-lavender underline-offset-8 decoration-2'
                    : 'text-[rgba(228,218,245,0.7)] hover:text-lilac'
                }`}
              >
                {link.label}
              </motion.button>
            ))}
          </div>

          {/* Social Links Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="pt-6 border-t border-lilac/10 flex flex-col items-center gap-3"
          >
            <span className="text-[0.62rem] uppercase tracking-[0.2em] text-lilac/60">Follow & Connect</span>
            <div className="flex items-center gap-3">
              {socialLinks.map((s, idx) => (
                <a
                  key={idx}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-lilac/20 text-lilac/70 hover:text-white hover:border-lilac flex items-center justify-center transition-all bg-white/[0.03]"
                  title={s.title}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
