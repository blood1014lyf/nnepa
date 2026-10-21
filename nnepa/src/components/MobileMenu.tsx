/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

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
    { label: 'Contact Fit', page: 'contact' },
    {
      label: adminToken ? 'Dashboard' : 'Login',
      page: adminToken ? 'admin-dashboard' : 'admin-login'
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '-100%' }}
          animate={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[850] bg-gradient-to-br from-plum-dark to-[#1e0c30] flex flex-col items-center justify-center gap-8 text-center"
        >
          <button
            onClick={onClose}
            className="absolute top-7 right-8 bg-transparent border-none text-[rgba(228,218,245,0.6)] hover:text-lilac cursor-pointer transition-colors"
            aria-label="Close menu"
          >
            <X className="w-8 h-8" />
          </button>

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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
