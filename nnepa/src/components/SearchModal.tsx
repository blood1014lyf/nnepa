/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { X, Search } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Product } from '../types.ts';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export default function SearchModal({
  isOpen,
  onClose,
  products = [],
  onSelectProduct,
  onAddToCart,
}: SearchModalProps) {
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.subcategory.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase())
      )
    : products.slice(0, 4); // default suggested items

  const formatPrice = (price: number) => {
    return `GH₵ ${price.toLocaleString()}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[900] flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="w-full max-w-2xl bg-pearl rounded-lg overflow-hidden shadow-2xl border border-solid border-lilac/30"
          >
            {/* Header input with search icon */}
            <div className="p-4 border-b border-solid border-lilac/20 flex items-center gap-3 bg-white">
              <Search className="text-mauve w-5 h-5 flex-shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Search collection (e.g. Ankara, Kente, Gown, Agbada...)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent border-none text-plum-dark text-base outline-none tracking-wide"
                id="search-input"
              />
              <button
                onClick={onClose}
                className="p-1 rounded-full border-none bg-transparent hover:bg-pearl-2 cursor-pointer transition-colors text-text-muted hover:text-plum-dark"
                aria-label="Close search modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results display panel */}
            <div className="max-h-[380px] overflow-y-auto p-6 bg-pearl">
              <div className="text-[0.62rem] font-semibold tracking-[0.2em] uppercase text-text-light mb-4">
                {query.trim() ? 'Search Results' : 'Suggested Classics'}
              </div>

              {filtered.length === 0 ? (
                <div className="py-12 text-center text-sm text-text-light font-sans">
                  No matches found for "<span className="text-plum">{query}</span>". Try another luxury fashion keyword.
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {filtered.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => {
                        onSelectProduct(product);
                        onClose();
                      }}
                      className="p-3 bg-white rounded-md flex items-center gap-4 border border-solid border-transparent hover:border-lilac/45 cursor-pointer transition-all hover:shadow-xs group"
                    >
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-14 h-18 object-cover rounded-sm flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="text-[0.55rem] tracking-[0.15em] uppercase text-text-light">
                          {product.category} · {product.subcategory}
                        </div>
                        <h5 className="font-serif text-base font-semibold text-plum-dark">
                          {product.name}
                        </h5>
                        <div className="text-xs text-lavender font-medium mt-1">
                          {formatPrice(product.price)}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (product.inStock) {
                            onAddToCart(product);
                          } else {
                            onSelectProduct(product);
                          }
                          onClose();
                        }}
                        className="opacity-0 group-hover:opacity-100 py-2.5 px-5 bg-gradient-to-br from-lavender to-mauve-deep text-white text-[0.6rem] font-bold tracking-[0.18em] uppercase rounded-[2px] cursor-pointer transition-all"
                        id={`btn-search-add-${product.id}`}
                      >
                        {product.inStock ? 'Add' : 'View'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
