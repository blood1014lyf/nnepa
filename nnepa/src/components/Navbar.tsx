/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { Search, ShoppingBag, Menu, Heart } from 'lucide-react';

interface NavbarProps {
  onOpenCart: () => void;
  onOpenMobileMenu: () => void;
  cartCount: number;
  wishlistCount: number;
  onScrollToSection: (sectionId: string) => void;
  onOpenSearch: () => void;
  currentPage: string;
  onPageChange: (page: string) => void;
  adminToken?: string | null;
}

export default function Navbar({
  onOpenCart,
  onOpenMobileMenu,
  cartCount,
  wishlistCount,
  onScrollToSection,
  onOpenSearch,
  currentPage,
  onPageChange,
  adminToken
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', page: 'home' },
    { label: 'Shop', page: 'shop' },
    { label: 'About Brand', page: 'about' },
    { label: 'Contact', page: 'contact' },
    {
      label: adminToken ? 'Dashboard' : 'Login',
      page: adminToken ? 'admin-dashboard' : 'admin-login'
    },
  ];

  const showScrolledStyle = scrolled || currentPage !== 'home';

  return (
    <nav
      id="nav"
      className={`fixed top-0 left-0 right-0 z-[800] h-[78px] flex items-center justify-between px-6 md:px-12 transition-all duration-500 ${
        showScrolledStyle
          ? 'bg-pearl/90 backdrop-blur-md shadow-[0_1px_0_rgba(155,132,204,0.18)] text-plum-dark'
          : 'bg-transparent text-white'
      }`}
    >
      <button
        onClick={() => {
          onPageChange('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className="font-serif text-xl md:text-[1.35rem] font-semibold tracking-[0.28em] no-underline whitespace-nowrap bg-transparent border-none cursor-pointer text-left"
      >
        NNEPA <span className={showScrolledStyle ? 'text-lavender' : 'text-lilac'}>FORIWAA</span>
      </button>

      {/* Desktop Links */}
      <ul className="hidden md:flex items-center gap-7 lg:gap-10 list-none m-0 p-0">
        {navLinks.map((link) => (
          <li key={link.label}>
            <button
              onClick={() => {
                onPageChange(link.page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`text-[0.66rem] font-bold tracking-[0.2em] uppercase border-none bg-transparent cursor-pointer relative py-2 transition-colors duration-300 group ${
                showScrolledStyle ? 'text-mauve-deep hover:text-lavender' : 'text-white/85 hover:text-lilac'
              } ${currentPage === link.page ? 'text-lavender font-extrabold' : ''}`}
            >
              {link.label}
              <span className={`absolute bottom-0 left-0 h-[1.5px] bg-gradient-to-r from-lavender to-mauve transition-all duration-350 w-0 group-hover:w-full ${currentPage === link.page ? 'w-full' : ''}`} />
            </button>
          </li>
        ))}
      </ul>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenSearch}
          className={`w-10 h-10 flex items-center justify-center border-none bg-transparent cursor-pointer rounded-full transition-all ${
            showScrolledStyle ? 'hover:bg-plum-dark/5 text-plum-dark' : 'hover:bg-white/10 text-white'
          }`}
          title="Search Inventory"
          id="btn-search"
        >
          <Search className="w-[18px] h-[18px]" />
        </button>

        {wishlistCount > 0 && (
          <button
            onClick={() => {
              onPageChange('shop');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`w-10 h-10 flex items-center justify-center border-none bg-transparent cursor-pointer rounded-full transition-all relative ${
              showScrolledStyle ? 'hover:bg-plum-dark/5 text-plum-dark' : 'hover:bg-white/10 text-white'
            }`}
            title="Wishlist"
          >
            <Heart className="w-[18px] h-[18px] text-mauve fill-mauve" />
            <span className="absolute top-[6px] right-[6px] min-w-3.5 h-3.5 px-1 rounded-full bg-gradient-to-br from-lavender to-mauve text-[0.55rem] font-bold text-white flex items-center justify-center">
              {wishlistCount}
            </span>
          </button>
        )}

        <button
          onClick={onOpenCart}
          className={`w-10 h-10 flex items-center justify-center border-none bg-transparent cursor-pointer rounded-full transition-all relative ${
            showScrolledStyle ? 'hover:bg-plum-dark/5 text-plum-dark' : 'hover:bg-white/10 text-white'
          }`}
          title="View Cart"
          id="btn-nav-cart"
        >
          <ShoppingBag className="w-[18px] h-[18px]" />
          {cartCount > 0 ? (
            <span className="absolute top-[6px] right-[6px] min-w-4 h-4 px-1 rounded-full bg-gradient-to-br from-lavender to-mauve text-[0.55rem] font-bold text-white flex items-center justify-center">
              {cartCount}
            </span>
          ) : null}
        </button>

        <button
          onClick={onOpenMobileMenu}
          className={`md:hidden w-10 h-10 flex items-center justify-center border-none bg-transparent cursor-pointer rounded-full ${
            showScrolledStyle ? 'text-plum-dark' : 'text-white'
          }`}
          id="btn-hamburger"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
}
