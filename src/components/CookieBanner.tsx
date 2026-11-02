/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, Settings, Check, X, ChevronRight, Lock } from 'lucide-react';

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
}

const STORAGE_KEY = 'nnepa_foriwaa_cookie_consent';

interface CookieBannerProps {
  onOpenPrivacyPolicy: () => void;
  isOpenExternally?: boolean;
  onCloseExternal?: () => void;
}

export default function CookieBanner({
  onOpenPrivacyPolicy,
  isOpenExternally = false,
  onCloseExternal,
}: CookieBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
    timestamp: Date.now(),
  });

  // Check initial consent state
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences(parsed);
        setIsVisible(false);
      } else {
        // Slight delay so the page loads first without jarring popups
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      setIsVisible(true);
    }
  }, []);

  // Handle external open trigger (e.g., from Footer "Cookie Preferences" click)
  useEffect(() => {
    if (isOpenExternally) {
      setIsVisible(true);
      setIsCustomizeOpen(true);
    }
  }, [isOpenExternally]);

  const savePreferences = (updated: CookiePreferences) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    setPreferences(updated);
    setIsVisible(false);
    setIsCustomizeOpen(false);
    if (onCloseExternal) onCloseExternal();
  };

  const handleAcceptAll = () => {
    savePreferences({
      essential: true,
      analytics: true,
      marketing: true,
      timestamp: Date.now(),
    });
  };

  const handleEssentialOnly = () => {
    savePreferences({
      essential: true,
      analytics: false,
      marketing: false,
      timestamp: Date.now(),
    });
  };

  const handleSaveCustom = () => {
    savePreferences({
      ...preferences,
      essential: true,
      timestamp: Date.now(),
    });
  };

  if (!isVisible) return null;

  return (
    <aside
      id="cookie-consent-banner"
      aria-label="Cookie and privacy preferences"
      role="region"
      className="fixed bottom-3 left-3 right-3 sm:bottom-6 sm:right-6 sm:left-auto sm:max-w-md z-[850] animate-fade-in"
    >
      <div className="bg-white/95 backdrop-blur-md border border-lilac/30 rounded-lg shadow-[0_12px_40px_rgba(58,34,72,0.18)] p-5 text-plum-dark text-xs overflow-hidden">
        
        {/* Banner Top Bar */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-lavender/15 text-lavender flex items-center justify-center shrink-0">
              <Cookie className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-lavender block">
                Cookie Policy
              </span>
              <h2 className="font-serif text-base font-semibold text-plum-dark m-0 leading-tight">
                {isCustomizeOpen ? 'Cookie Preferences' : 'Cookie Policy'}
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              handleEssentialOnly();
            }}
            className="text-text-muted hover:text-plum-dark p-1 rounded-md transition-colors bg-transparent border-none cursor-pointer"
            aria-label="Dismiss and keep essential cookies only"
            title="Reject non-essential cookies"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Banner Description */}
        {!isCustomizeOpen ? (
          <div>
            <p className="text-text-light/90 leading-relaxed mb-4 text-[0.76rem]">
              We use cookies to improve your browsing experience, remember your preferences, and maintain your shopping bag.
            </p>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleAcceptAll}
                className="px-4 py-2.5 bg-gradient-to-r from-lavender via-mauve to-mauve-deep text-white font-medium text-[0.72rem] tracking-wider uppercase rounded-[3px] border-none cursor-pointer hover:opacity-95 transition-all text-center shadow-xs"
              >
                Accept
              </button>

              <button
                type="button"
                onClick={handleEssentialOnly}
                className="px-3.5 py-2.5 bg-pearl-2/60 hover:bg-pearl-2 text-plum-dark font-medium text-[0.72rem] tracking-wider uppercase rounded-[3px] border border-lilac/30 cursor-pointer transition-colors text-center"
              >
                Reject
              </button>

              <button
                type="button"
                onClick={() => setIsCustomizeOpen(true)}
                className="px-2 py-2 text-lavender hover:text-mauve-deep text-[0.72rem] font-medium tracking-wide border-none bg-transparent cursor-pointer transition-colors text-center inline-flex items-center justify-center gap-1"
              >
                <Settings className="w-3.5 h-3.5" />
                Preferences
              </button>
            </div>

            <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-end text-[0.68rem] text-text-muted">
              <button
                type="button"
                onClick={() => {
                  onOpenPrivacyPolicy();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-lavender hover:underline bg-transparent border-none p-0 cursor-pointer"
              >
                Read Cookie Policy
              </button>
            </div>
          </div>
        ) : (
          /* Granular Customization View */
          <div className="space-y-3 pt-1">
            <p className="text-[0.72rem] text-text-light leading-snug">
              Choose which categories of local storage and cookies you wish to enable. Essential storage is strictly required for website operations.
            </p>

            {/* Category 1: Essential */}
            <div className="p-2.5 rounded bg-pearl/70 border border-lilac/20 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 font-medium text-[0.75rem] text-plum-dark">
                  <Lock className="w-3.5 h-3.5 text-lavender" />
                  Essential & Functional
                </div>
                <div className="text-[0.66rem] text-text-muted">
                  Shopping bag, wishlist, local catalog caching & admin security.
                </div>
              </div>
              <span className="text-[0.64rem] font-bold text-lavender uppercase tracking-wider bg-lavender/10 px-2 py-0.5 rounded">
                Always On
              </span>
            </div>

            {/* Category 2: Analytics */}
            <label className="p-2.5 rounded bg-white border border-lilac/20 flex items-center justify-between gap-3 cursor-pointer hover:border-lavender/50 transition-colors">
              <div>
                <div className="font-medium text-[0.75rem] text-plum-dark">
                  Performance & Experience
                </div>
                <div className="text-[0.66rem] text-text-muted">
                  Anonymous diagnostics to optimize image load speeds and showroom flow.
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.analytics}
                onChange={(e) => setPreferences((prev) => ({ ...prev, analytics: e.target.checked }))}
                className="w-4 h-4 accent-lavender cursor-pointer rounded"
              />
            </label>

            {/* Category 3: Tailored Communications */}
            <label className="p-2.5 rounded bg-white border border-lilac/20 flex items-center justify-between gap-3 cursor-pointer hover:border-lavender/50 transition-colors">
              <div>
                <div className="font-medium text-[0.75rem] text-plum-dark">
                  Product Updates & Previews
                </div>
                <div className="text-[0.66rem] text-text-muted">
                  Remember custom size measurements and seasonal lookbook preferences.
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.marketing}
                onChange={(e) => setPreferences((prev) => ({ ...prev, marketing: e.target.checked }))}
                className="w-4 h-4 accent-lavender cursor-pointer rounded"
              />
            </label>

            {/* Save Custom Buttons */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setIsCustomizeOpen(false)}
                className="px-3 py-2 text-text-muted hover:text-plum-dark text-[0.72rem] bg-transparent border-none cursor-pointer"
              >
                Back
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleEssentialOnly}
                  className="px-3 py-2 bg-pearl-2/60 text-plum-dark text-[0.72rem] font-medium tracking-wide uppercase rounded-[3px] border border-lilac/30 cursor-pointer"
                >
                  Essential Only
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustom}
                  className="px-4 py-2 bg-gradient-to-r from-lavender to-mauve-deep text-white text-[0.72rem] font-medium tracking-wide uppercase rounded-[3px] border-none cursor-pointer hover:opacity-95 shadow-xs"
                >
                  Save Choices
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </aside>
  );
}
