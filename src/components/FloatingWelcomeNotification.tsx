/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Floating Welcome Notification & Seasonal Live Countdown
 * Compact, restrained luxury floating card above the chatbot launcher.
 * Features real-time occasion countdowns, non-repeating rotating greetings,
 * session persistence, and mobile-friendly non-intrusive positioning. Zero emojis.
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, Clock } from 'lucide-react';
import {
  getSeasonalGreetingPool,
  calculateLiveCountdown,
  getNextGreetingIndex,
  type SeasonalGreetingItem,
  type CountdownBreakdown
} from '../concierge/knowledge/seasonalGreetings.ts';

const SESSION_STORAGE_DISMISSED_KEY = 'nnepa_welcome_dismissed';
const ROTATION_INTERVAL_MS = 8000;

interface FloatingWelcomeNotificationProps {
  isOpen: boolean;
  onOpenChat: (actionPayload?: string) => void;
}

export default function FloatingWelcomeNotification({
  isOpen,
  onOpenChat
}: FloatingWelcomeNotificationProps) {
  // Session persistence: do not show if user already dismissed in this session
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(SESSION_STORAGE_DISMISSED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [pool] = useState<SeasonalGreetingItem[]>(() => getSeasonalGreetingPool(new Date()));
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Live countdown state (updated every 1 second)
  const currentGreeting = pool[currentIndex] || pool[0];
  const targetDate = currentGreeting.countdownTarget?.targetDate;

  const [countdown, setCountdown] = useState<CountdownBreakdown>(() => {
    return targetDate
      ? calculateLiveCountdown(targetDate, new Date())
      : { days: 0, hours: 0, minutes: 0, seconds: 0, formatted: '', isPast: true };
  });

  // 1. Live ticking countdown timer (1s interval)
  useEffect(() => {
    if (!targetDate || isDismissed || isOpen) return;

    const tick = () => {
      setCountdown(calculateLiveCountdown(targetDate, new Date()));
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [targetDate, isDismissed, isOpen]);

  // 2. Automatic non-repeating greeting rotation (8s interval)
  useEffect(() => {
    if (isDismissed || isOpen || isPaused || pool.length <= 1) return;

    const rotationTimer = setInterval(() => {
      setCurrentIndex((prev) => getNextGreetingIndex(prev, pool.length));
    }, ROTATION_INTERVAL_MS);

    return () => clearInterval(rotationTimer);
  }, [isDismissed, isOpen, isPaused, pool.length]);

  const handleDismiss = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsDismissed(true);
    try {
      sessionStorage.setItem(SESSION_STORAGE_DISMISSED_KEY, 'true');
    } catch {
      // Ignore private browsing storage restrictions
    }
  };

  const handleAction = (payload?: string) => {
    handleDismiss();
    onOpenChat(payload);
  };

  // Never render if chat is open or dismissed
  if (isDismissed || isOpen || !currentGreeting) {
    return null;
  }

  return (
    <aside
      role="status"
      aria-live="polite"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="concierge-root fixed z-[83] bottom-20 right-3 sm:right-6 sm:bottom-22 w-[calc(100vw-1.5rem)] max-w-[310px] sm:w-[310px] bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-lilac/30 p-3 sm:p-3.5 transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-2 select-none"
      style={{
        boxSizing: 'border-box',
        wordBreak: 'break-word'
      }}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-2 border-b border-zinc-100 pb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-5 h-5 rounded-full bg-plum-dark text-white flex items-center justify-center shrink-0 font-serif font-bold text-[9px] shadow-2xs">
            NF
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-plum-dark/85 truncate">
            {currentGreeting.tag}
          </span>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss seasonal notification"
          title="Dismiss"
          className="w-5 h-5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700 flex items-center justify-center border-none cursor-pointer transition-colors shrink-0"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Live Countdown Display (if applicable) */}
      {currentGreeting.showCountdown && !countdown.isPast && (
        <div className="mt-2 px-2 py-1 rounded bg-plum-dark/5 border border-plum/15 flex items-center justify-between text-[11px] font-mono text-plum-dark">
          <span className="flex items-center gap-1 font-semibold uppercase tracking-wider text-[9.5px] text-plum-dark/75">
            <Clock className="w-3 h-3 text-lavender" />
            <span>{currentGreeting.countdownTarget?.name || 'Occasion'}</span>
          </span>
          <span className="font-bold tracking-tight text-plum-dark">
            {countdown.formatted}
          </span>
        </div>
      )}

      {/* Headline & Body Message */}
      <h4 className="text-xs font-serif font-semibold text-plum-dark mt-1.5 leading-snug">
        {currentGreeting.headline}
      </h4>
      <p className="text-[11.5px] text-zinc-600 leading-relaxed mt-0.5 line-clamp-2">
        {currentGreeting.message}
      </p>

      {/* Compact Action Buttons Row */}
      <div className="mt-2.5 flex items-center gap-1.5">
        {currentGreeting.actionLabel && (
          <button
            type="button"
            onClick={() => handleAction(currentGreeting.actionPayload)}
            className="px-2.5 py-1 bg-plum-dark hover:bg-plum text-white text-[11px] font-semibold rounded-full shadow-2xs transition-colors cursor-pointer border-none flex items-center gap-1 shrink-0 active:scale-95"
          >
            <span>{currentGreeting.actionLabel}</span>
            <ChevronRight className="w-3 h-3 text-lavender" />
          </button>
        )}
        <button
          type="button"
          onClick={() => handleAction('open_chat')}
          className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[11px] font-medium rounded-full transition-colors cursor-pointer border-none shrink-0 active:scale-95"
        >
          Ask Foriwaa
        </button>
      </div>
    </aside>
  );
}
