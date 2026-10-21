/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShoppingBag, Heart, ArrowLeft, Star, MessageSquare, Shield, Scissors, Compass, Ruler, X, Info } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Product } from '../types.ts';
import SizeChart from './SizeChart.tsx';
import { WOMEN_SIZE_CHART, MEN_SIZE_CHART, SizingUnit } from '../sizeChartData.ts';

interface ProductDetailsViewProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, size?: string) => void;
  onToggleWishlist: (product: Product) => void;
  isWished: boolean;
}

export default function ProductDetailsView({
  product,
  onBack,
  onAddToCart,
  onToggleWishlist,
  isWished
}: ProductDetailsViewProps) {
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] || 'M');
  const [showSizeGuide, setShowSizeGuide] = useState<boolean>(false);
  const [previewUnit, setPreviewUnit] = useState<SizingUnit>('in');

  const isMen = product.category === 'men';
  const activeWomenRow = WOMEN_SIZE_CHART.find((r) => r.alphaSize === selectedSize) || WOMEN_SIZE_CHART[2];
  const activeMenRow = MEN_SIZE_CHART.find((r) => r.alphaSize === selectedSize) || MEN_SIZE_CHART[2];

  const formatPrice = (price: number) => {
    return `GH₵ ${price.toLocaleString()}`;
  };

  // Pre-filled WhatsApp direct ordering API setup
  const messageText = `Hello Nnepa Foriwaa! I am interested in ordering your exquisite tailored piece:
• Product Name: ${product.name}
• Style Category: ${product.subcategory}
• Selected Fitting Size: ${selectedSize}
• Catalog Price: ${formatPrice(product.price)}
• Availability Status: ${product.inStock ? 'In Stock Ready' : 'Out of Stock (Commission Required)'}

Please advise on custom measurements configuration and delivery times.`;

  const encodedMessage = encodeURIComponent(messageText);

  // Direct order line link
  const whatsappUrl = `https://wa.me/233538795669?text=${encodedMessage}`;

  return (
    <div className="pt-28 pb-20 bg-pearl" id="product-details-container">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        {/* Back Link Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 bg-white/50 border border-lilac/10 hover:bg-white text-xs font-bold tracking-[0.2em] uppercase text-mauve-deep mb-10 cursor-pointer rounded-[2px] transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-lavender" />
          Back to gallery
        </button>

        {/* Dynamic Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Block: Image Showcase (Count = 6 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="bg-white rounded-[4px] overflow-hidden shadow-[0_4px_30px_rgba(92,61,110,0.04)] border border-lilac/10 relative group aspect-[3/4]">
              <img
                src={product.imageUrl}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/20799228/pexels-photo-20799228.jpeg';
                }}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                loading="lazy"
              />
              {product.badge && (
                <span className="absolute top-4 left-4 px-3 py-1.5 bg-gradient-to-r from-lavender to-mauve text-white rounded-full text-[0.52rem] font-bold tracking-[0.18em] uppercase shadow-sm">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Custom fit stamp */}
            <div className="bg-lavender/5 p-4 rounded-md border border-lilac/5 text-center flex items-center justify-center gap-3.5 select-none">
              <Compass className="w-4 h-4 text-lavender" />
              <span className="text-[0.6rem] font-bold tracking-[0.25em] uppercase text-mauve-deep">
                Accra Master Tailor Certified Piece
              </span>
            </div>
          </div>

          {/* Right Block: Configuration Control Hub (Count = 6 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div>
              <span className="text-[0.58rem] font-bold tracking-[0.3em] uppercase text-text-light inline-block mb-2">
                Curated Collection · {product.category} · {product.subcategory}
              </span>
              <h1 className="font-serif text-3xl md:text-4xl text-plum-dark font-light leading-snug">
                {product.name}
              </h1>

              {/* Star Rating Info */}
              <div className="flex gap-4 items-center mt-3">
                <div className="flex gap-[1.5px] text-mauve">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < product.rating ? 'fill-mauve' : 'text-zinc-200'}`}
                    />
                  ))}
                </div>
                <span className="text-xs text-text-light font-medium">(24 reviews from Accra workshop)</span>
              </div>
            </div>

            {/* Price Line In Ghana Cedis */}
            <div className="py-4 border-y border-solid border-lilac/10 flex items-center justify-between">
              <div>
                <span className="text-[0.55rem] font-bold tracking-[0.2em] uppercase text-text-light block">Ghana Cedi Direct Price</span>
                <span className="text-2xl md:text-3xl font-serif text-lavender font-bold mt-1 inline-block">
                  {product.originalPrice && (
                    <del className="text-text-light font-serif font-normal text-base mr-3.5 line-through">
                      {formatPrice(product.originalPrice)}
                    </del>
                  )}
                  {formatPrice(product.price)}
                </span>
              </div>

              {/* Stock Tag */}
              <div className="text-right">
                <span className="text-[0.55rem] font-bold tracking-[0.2em] uppercase text-text-light block mb-1">Tailory Stock</span>
                <span
                  className={`px-3 py-1 rounded-full text-[0.55rem] font-extrabold tracking-[0.16em] uppercase border ${
                    product.inStock
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-400/20'
                      : 'bg-rose-50 text-rose-600 border-rose-400/20'
                  }`}
                >
                  {product.inStock ? 'In Stock Ready' : 'Out of Stock (Commission)'}
                </span>
              </div>
            </div>

            {/* Product Details & Narrative */}
            <div>
              <h3 className="text-[0.58rem] font-bold tracking-[0.2em] uppercase text-plum-dark mb-2.5">Product Details</h3>
              <p className="text-xs md:text-sm text-text-light leading-relaxed">
                {product.description || `${product.name} is handcrafted in Accra using authentic African fabrics and tailored with precise stitching. Designed for high occasions, celebrations, and daily elegance with breathable comfort and an easy fit.`}
              </p>
            </div>

            {/* Sizing Picker Option */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[0.58rem] font-bold tracking-[0.2em] uppercase text-plum-dark">Select Gown/Suit Size</h3>
                <button
                  type="button"
                  onClick={() => setShowSizeGuide(true)}
                  className="flex items-center gap-1.5 text-[0.62rem] font-bold tracking-[0.15em] uppercase text-lavender hover:text-mauve-deep transition-colors cursor-pointer bg-lavender/10 hover:bg-lavender/20 px-2.5 py-1 rounded-[2px]"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  Size Guide
                </button>
              </div>
              <div className="flex gap-2.5">
                {(product.sizes || ['S', 'M', 'L', 'XL', 'XXL']).map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`min-w-11 h-11 border text-xs font-bold tracking-widest rounded-[2px] transition-all cursor-pointer ${
                      selectedSize === sz
                        ? 'bg-gradient-to-br from-lavender to-mauve-deep text-white border-transparent shadow-md'
                        : 'bg-white text-plum-dark border-zinc-200 hover:border-lavender hover:text-lavender'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Sizing Guide with US/UK/EU Equivalents */}
            <div className="bg-zinc-50 p-5 rounded-md border border-lilac/5 text-plum-dark">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5 mb-3">
                <h4 className="text-[0.55rem] font-bold tracking-[0.2em] uppercase text-plum-dark flex items-center gap-1.5">
                  <Scissors className="w-3.5 h-3.5 text-lavender" />
                  Tailored Dimensions (Size {selectedSize})
                </h4>
                
                {/* Unit Switcher */}
                <div className="inline-flex bg-zinc-200/60 p-0.5 rounded text-[0.6rem] font-bold">
                  <button
                    type="button"
                    onClick={() => setPreviewUnit('in')}
                    className={`px-2 py-0.5 rounded-[2px] transition-all cursor-pointer border-none ${
                      previewUnit === 'in' ? 'bg-white text-plum-dark shadow-xs' : 'bg-transparent text-text-muted'
                    }`}
                  >
                    IN
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewUnit('cm')}
                    className={`px-2 py-0.5 rounded-[2px] transition-all cursor-pointer border-none ${
                      previewUnit === 'cm' ? 'bg-white text-plum-dark shadow-xs' : 'bg-transparent text-text-muted'
                    }`}
                  >
                    CM
                  </button>
                </div>
              </div>

              {/* Regional Conversion Pill */}
              <div className="flex items-center justify-between bg-white px-3 py-2 rounded border border-zinc-100 mb-3 text-xs">
                <span className="text-[0.55rem] font-bold tracking-wider uppercase text-text-light">
                  Standard Conversion:
                </span>
                <span className="font-mono text-xs font-bold text-mauve-deep">
                  {isMen
                    ? `${activeMenRow.usSize} · ${activeMenRow.ukSize} · ${activeMenRow.euSize}`
                    : `${activeWomenRow.usSize} · ${activeWomenRow.ukSize} · ${activeWomenRow.euSize}`}
                </span>
              </div>

              {/* Measurement Columns */}
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="bg-white p-2.5 rounded border border-zinc-100">
                  <span className="text-[0.52rem] font-bold tracking-wider uppercase text-text-light block">
                    {isMen ? 'Chest' : 'Bust'}
                  </span>
                  <span className="text-xs font-mono font-bold text-plum-dark block mt-1">
                    {isMen
                      ? (previewUnit === 'in' ? activeMenRow.chestIn : activeMenRow.chestCm)
                      : (previewUnit === 'in' ? activeWomenRow.bustIn : activeWomenRow.bustCm)}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded border border-zinc-100">
                  <span className="text-[0.52rem] font-bold tracking-wider uppercase text-text-light block">Waist</span>
                  <span className="text-xs font-mono font-bold text-plum-dark block mt-1">
                    {isMen
                      ? (previewUnit === 'in' ? activeMenRow.waistIn : activeMenRow.waistCm)
                      : (previewUnit === 'in' ? activeWomenRow.waistIn : activeWomenRow.waistCm)}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded border border-zinc-100">
                  <span className="text-[0.52rem] font-bold tracking-wider uppercase text-text-light block">Shoulder</span>
                  <span className="text-xs font-mono font-bold text-plum-dark block mt-1">
                    {isMen
                      ? (previewUnit === 'in' ? activeMenRow.shoulderIn : activeMenRow.shoulderCm)
                      : (previewUnit === 'in' ? activeWomenRow.shoulderIn : activeWomenRow.shoulderCm)}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded border border-zinc-100">
                  <span className="text-[0.52rem] font-bold tracking-wider uppercase text-text-light block">
                    {isMen ? 'Agbada' : 'Length'}
                  </span>
                  <span className="text-xs font-mono font-bold text-plum-dark block mt-1">
                    {isMen
                      ? (previewUnit === 'in' ? activeMenRow.agbadaLengthIn : activeMenRow.agbadaLengthCm)
                      : (previewUnit === 'in' ? activeWomenRow.dressLengthIn : activeWomenRow.dressLengthCm)}
                  </span>
                </div>
              </div>
              <p className="text-[0.55rem] text-text-light leading-normal select-none italic text-center mt-3.5">
                * Note: If standard coordinates do not fit, we make custom to-measure suits. WhatsApp custom sizes below.
              </p>
            </div>

            {/* Pre-order Delivery Notice */}
            <div className="text-[0.62rem] text-mauve-deep bg-lavender/10 px-3.5 py-2.5 rounded border border-lavender/20 font-medium flex items-center gap-2">
              <span>⏱️ Pre-order takes 3–7 working days for handcrafted bespoke tailoring.</span>
            </div>

            {/* Signature Actions */}
            <div className="flex flex-col gap-3 mt-4">
              {/* WhatsApp Checkout Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[2px] font-bold text-[0.65rem] tracking-[0.2em] uppercase border-none cursor-pointer transition-all flex items-center justify-center gap-2.5 shadow-md text-center active:scale-[0.99]"
                id="btn-whatsapp-order"
              >
                <MessageSquare className="w-4 h-4 fill-white text-emerald-600 border-none" />
                Place order via WhatsApp
              </a>

              <div className="flex gap-3 w-full">
                {/* Add to Bag */}
                <button
                  disabled={!product.inStock}
                  onClick={() => onAddToCart(product, selectedSize)}
                  className={`flex-1 py-4 text-[0.62rem] font-bold tracking-[0.2em] uppercase rounded-[2px] transition-all border-none ${
                    product.inStock
                      ? 'bg-zinc-900 text-white hover:bg-black cursor-pointer active:scale-95 shadow-md'
                      : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    {product.inStock ? 'Add to Bag' : 'Out of Stock'}
                  </span>
                </button>

                {/* Wishlist Link Toggle */}
                <button
                  onClick={() => onToggleWishlist(product)}
                  className={`w-14 h-14 bg-white border border-solid rounded-[2px] cursor-pointer flex items-center justify-center transition-all shrink-0 ${
                    isWished ? 'border-mauve text-mauve bg-mauve/5' : 'border-zinc-200 text-plum hover:border-lavender hover:text-lavender'
                  }`}
                  title={isWished ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  aria-label={isWished ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                  <Heart className={`w-5 h-5 ${isWished ? 'fill-mauve' : ''}`} />
                </button>
              </div>
            </div>

            {/* Authenticity guarantee guidelines footer block */}
            <div className="grid grid-cols-2 gap-4 border-t border-solid border-lilac/10 pt-6 text-plum-dark">
              <div className="flex gap-2.5 items-start">
                <Shield className="w-5 h-5 text-lavender shrink-0" />
                <div>
                  <h5 className="text-[0.6rem] font-bold tracking-[0.16em] uppercase">Ghana Fitting Guard</h5>
                  <p className="text-[0.620rem] text-text-light leading-normal mt-0.5">Complimentary alterations inside our Accra boutiques.</p>
                </div>
              </div>
              <div className="flex gap-2.5 items-start">
                <Scissors className="w-5 h-5 text-lavender shrink-0" />
                <div>
                  <h5 className="text-[0.6rem] font-bold tracking-[0.16em] uppercase">Option standard</h5>
                  <p className="text-[0.620rem] text-text-light leading-normal mt-0.5">Custom fabric matching with no additional base pricing.</p>
                </div>
              </div>
            </div>
            
          </div>

        </div>
      </div>

      {/* ═══ SIZE GUIDE MODAL ═══ */}
      <AnimatePresence>
        {showSizeGuide && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSizeGuide(false)}
              className="fixed inset-0 bg-plum-dark/75 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-pearl rounded-md shadow-2xl border border-lilac/20 p-5 sm:p-8 z-10"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowSizeGuide(false)}
                className="absolute top-4 right-4 p-2 text-text-light hover:text-plum-dark rounded-full hover:bg-black/5 transition-all cursor-pointer border-none z-20"
                aria-label="Close size guide"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="mb-4 pr-10">
                <div className="flex items-center gap-2 mb-1">
                  <Ruler className="w-4 h-4 text-lavender" />
                  <span className="text-[0.6rem] font-bold tracking-[0.3em] uppercase text-mauve-deep">
                    Size Guide
                  </span>
                </div>
                <h3 className="font-serif text-2xl text-plum-dark font-light">
                  Garment & Body Measurement Guide
                </h3>
                <p className="text-xs text-text-light mt-1">
                  Verified research-backed conversions across US, UK, and EU tailoring standards.
                </p>
              </div>

              {/* Full Interactive Size Chart with US/UK/EU Filters */}
              <SizeChart
                defaultCategory={product.category === 'men' ? 'men' : 'women'}
                defaultRegion="US"
                highlightAlpha={selectedSize}
                onSelectSize={(sz) => setSelectedSize(sz)}
                isModal={true}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
