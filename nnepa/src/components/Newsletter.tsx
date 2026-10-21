/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';

interface NewsletterProps {
  onSubscribe: (email: string) => void;
}

export default function Newsletter({ onSubscribe }: NewsletterProps) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onSubscribe(email);
      setEmail('');
    }
  };

  return (
    <div id="newsletter" className="bg-gradient-to-br from-pearl-2 to-[#ede0f5] py-10 md:py-12 px-6 md:px-12 text-center relative overflow-hidden">
      {/* Absolute blurry visual circles vectors */}
      <div className="absolute top-[-150px] left-[-100px] w-[500px] h-[500px] rounded-full bg-radial from-lavender/18 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-[-120px] right-[-80px] w-[400px] h-[400px] rounded-full bg-radial from-lavender/18 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mauve-deep/10 border border-mauve-deep/20 text-mauve-deep text-[0.6rem] font-bold tracking-[0.3em] uppercase mb-2">
          Coming Soon • Stay Connected
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl md:text-[2rem] font-light text-plum-dark mt-1 mb-2">
          Join the <em className="font-serif italic text-lavender">Inner Circle</em>
        </h2>
        <p className="text-xs sm:text-sm text-text-muted leading-relaxed max-w-[440px] mb-6 font-normal">
          Be the first to discover new collections, editorial lookbooks, and private previews. Subscribe to get notified as soon as our newsletter launches.
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-[460px] flex flex-col sm:flex-row rounded-md overflow-hidden shadow-[0_8px_40px_rgba(92,61,110,0.14)]">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            required
            className="flex-1 px-6 py-4.5 bg-white text-plum-dark text-sm outline-none border-none font-sans placeholder:text-text-light font-medium"
          />
          <button
            type="submit"
            className="px-8 py-4.5 bg-gradient-to-br from-lavender to-mauve-deep text-white border-none cursor-pointer font-semibold text-xs tracking-[0.2em] uppercase hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Subscribe
          </button>
        </form>
      </div>
    </div>
  );
}
