/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * NNEPA FORIWAA — Dynamic Seasonal Greeting & Live Countdown Engine
 * 100% in-browser, privacy-first, zero-dependency seasonal calendar.
 * Calculates date-aware occasions, live ticking countdowns, and non-repeating rotating greetings.
 */

export interface OccasionTarget {
  id: string;
  name: string;
  targetDate: Date;
  badgeLabel: string;
  actionLabel: string;
  actionPayload: string;
}

export interface SeasonalGreetingItem {
  id: string;
  tag: string;
  headline: string;
  message: string;
  showCountdown?: boolean;
  countdownTarget?: OccasionTarget;
  actionLabel?: string;
  actionPayload?: string;
}

/**
 * Calculates Easter Sunday for any Gregorian calendar year using the Butcher/Meeus algorithm.
 */
export function getEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1; // 0-based: 2=March, 3=April
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month, day, 0, 0, 0));
}

/**
 * Calculates Black Friday (day after the 4th Thursday of November) for any year.
 */
export function getBlackFriday(year: number): Date {
  // First day of November (month index 10)
  const firstOfNov = new Date(Date.UTC(year, 10, 1));
  const dayOfWeek = firstOfNov.getUTCDay(); // 0=Sun, 4=Thu
  const firstThursday = 1 + ((4 - dayOfWeek + 7) % 7);
  const fourthThursday = firstThursday + 21;
  const blackFridayDate = fourthThursday + 1;
  return new Date(Date.UTC(year, 10, blackFridayDate, 0, 0, 0));
}

/**
 * Returns the primary upcoming occasion target for live countdown display.
 * Automatically switches to the next relevant occasion when current passes.
 */
export function getNextOccasionTarget(referenceDate: Date = new Date()): OccasionTarget {
  const year = referenceDate.getFullYear();
  const time = referenceDate.getTime();

  // Occasion candidates across current and next year
  const candidates: OccasionTarget[] = [
    // Valentine's
    {
      id: 'valentines',
      name: "Valentine's Day",
      targetDate: new Date(Date.UTC(year, 1, 14, 0, 0, 0)),
      badgeLabel: "Valentine's Countdown",
      actionLabel: 'Gift Guide',
      actionPayload: 'explore_collections'
    },
    {
      id: 'valentines_next',
      name: "Valentine's Day",
      targetDate: new Date(Date.UTC(year + 1, 1, 14, 0, 0, 0)),
      badgeLabel: "Valentine's Countdown",
      actionLabel: 'Gift Guide',
      actionPayload: 'explore_collections'
    },
    // Easter
    {
      id: 'easter',
      name: 'Easter',
      targetDate: getEasterSunday(year),
      badgeLabel: 'Easter Countdown',
      actionLabel: 'Easter Collection',
      actionPayload: 'explore_collections'
    },
    {
      id: 'easter_next',
      name: 'Easter',
      targetDate: getEasterSunday(year + 1),
      badgeLabel: 'Easter Countdown',
      actionLabel: 'Easter Collection',
      actionPayload: 'explore_collections'
    },
    // Black Friday (only surfaced within 28 days before event)
    {
      id: 'black_friday',
      name: 'Black Friday',
      targetDate: getBlackFriday(year),
      badgeLabel: 'Black Friday Release',
      actionLabel: 'View Collection',
      actionPayload: 'explore_collections'
    },
    // Christmas
    {
      id: 'christmas',
      name: 'Christmas',
      targetDate: new Date(Date.UTC(year, 11, 25, 0, 0, 0)),
      badgeLabel: 'Christmas Countdown',
      actionLabel: 'Shop Holiday Pieces',
      actionPayload: 'explore_collections'
    },
    {
      id: 'christmas_next',
      name: 'Christmas',
      targetDate: new Date(Date.UTC(year + 1, 11, 25, 0, 0, 0)),
      badgeLabel: 'Christmas Countdown',
      actionLabel: 'Shop Holiday Pieces',
      actionPayload: 'explore_collections'
    },
    // New Year
    {
      id: 'new_year',
      name: 'New Year',
      targetDate: new Date(Date.UTC(year + 1, 0, 1, 0, 0, 0)),
      badgeLabel: 'New Year Countdown',
      actionLabel: 'New Year Elegance',
      actionPayload: 'explore_collections'
    }
  ];

  // Filter to upcoming only
  const upcoming = candidates.filter((c) => {
    const diff = c.targetDate.getTime() - time;
    if (diff <= 0) return false;
    // If Black Friday is more than 28 days away, skip in favor of Christmas
    if (c.id === 'black_friday') {
      const diffDays = diff / 86400000;
      if (diffDays > 28) return false;
    }
    return true;
  });

  upcoming.sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime());

  return upcoming[0] || {
    id: 'christmas',
    name: 'Christmas',
    targetDate: new Date(Date.UTC(year, 11, 25, 0, 0, 0)),
    badgeLabel: 'Christmas Countdown',
    actionLabel: 'Shop Holiday Pieces',
    actionPayload: 'explore_collections'
  };
}

export interface CountdownBreakdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
  isPast: boolean;
}

/**
 * Calculates a live countdown breakdown from `now` to `target`.
 */
export function calculateLiveCountdown(target: Date, now: Date = new Date()): CountdownBreakdown {
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      formatted: '00d 00h 00m 00s',
      isPast: true
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const formatted = `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;

  return {
    days,
    hours,
    minutes,
    seconds,
    formatted,
    isPast: false
  };
}

/**
 * Builds the pool of dynamic greetings tailored to the current date and season.
 * Includes seasonal specials, live occasion countdowns, and everyday concierge services.
 */
export function getSeasonalGreetingPool(currentDate: Date = new Date()): SeasonalGreetingItem[] {
  const month = currentDate.getMonth(); // 0 = Jan, 11 = Dec
  const date = currentDate.getDate();
  const nextOccasion = getNextOccasionTarget(currentDate);

  const greetings: SeasonalGreetingItem[] = [];

  // 1. Primary Live Countdown Card (Christmas or next major event)
  greetings.push({
    id: `countdown_${nextOccasion.id}`,
    tag: nextOccasion.badgeLabel,
    headline: `${nextOccasion.name} at Nnepa Foriwaa`,
    message: 'Artisanal pieces take 3 to 7 working days to craft. Order early for guaranteed delivery.',
    showCountdown: true,
    countdownTarget: nextOccasion,
    actionLabel: nextOccasion.actionLabel,
    actionPayload: nextOccasion.actionPayload
  });

  // 2. Season-Specific Thematic Greetings
  if (month === 11 || (month === 10 && date >= 15)) {
    // Late November / December: Christmas and Festive season
    greetings.push({
      id: 'festive_gifting',
      tag: 'Festive Season',
      headline: 'Rooted, Refined & Regal Holidays',
      message: 'Discover handwoven Kente, pure silk boubous and tailored brocade ensembles.',
      actionLabel: 'Explore Pieces',
      actionPayload: 'explore_collections'
    });
    greetings.push({
      id: 'holiday_deadlines',
      tag: 'Accra Studio',
      headline: 'Holiday Tailoring Schedule',
      message: 'Need a custom outfit tailored for end-of-year gatherings? Connect with our stylist.',
      actionLabel: 'Chat with Stylist',
      actionPayload: 'contact_whatsapp'
    });
  } else if ((month === 11 && date >= 26) || (month === 0 && date <= 7)) {
    // New Year (Dec 26 - Jan 7)
    greetings.push({
      id: 'new_year_welcome',
      tag: 'New Year',
      headline: 'Step into the New Year in Regal Elegance',
      message: 'Explore our latest collection designed for milestone celebrations.',
      actionLabel: 'View Collection',
      actionPayload: 'explore_collections'
    });
  } else if (month === 1 && date <= 15) {
    // Valentine's Season (Feb 1 - Feb 15)
    greetings.push({
      id: 'valentines_special',
      tag: "Valentine's Season",
      headline: 'Heirloom Gifts of Enduring Heritage',
      message: 'Celebrate love with bespoke made-to-measure garments and artisanal clutches.',
      actionLabel: 'Find My Size',
      actionPayload: 'sizing_path_select'
    });
  } else if (month === 2 && date <= 10) {
    // Ghana Independence (early March)
    greetings.push({
      id: 'ghana_independence',
      tag: 'Heritage Celebration',
      headline: 'Celebrate Ghanaian Craftsmanship',
      message: 'Authentic handwoven Asante Kente and Northern Ghanaian Fugu crafted in Accra.',
      actionLabel: 'Explore Heritage',
      actionPayload: 'explore_collections'
    });
  } else if (month >= 2 && month <= 4) {
    // Easter / Spring season
    greetings.push({
      id: 'easter_spring',
      tag: 'Artisan Collection',
      headline: 'Vibrant Silks & Refined Silhouettes',
      message: 'Bespoke tailoring crafted individually to your exact measurements.',
      actionLabel: 'Size & Length Guide',
      actionPayload: 'size_guide'
    });
  }

  // 3. Everyday Ever-Present Bespoke Greetings (Between special occasions)
  greetings.push({
    id: 'everyday_akwaaba',
    tag: 'Personal Concierge',
    headline: 'Akwaaba! Need assistance?',
    message: 'Foriwaa is here to help with sizing, fabrics, delivery times, or styling recommendations.',
    actionLabel: 'Ask a Question',
    actionPayload: 'open_chat'
  });

  greetings.push({
    id: 'everyday_sizing',
    tag: 'Perfect Fit',
    headline: 'Tailored Sizing Guidance',
    message: 'Our Size and Length Guide ensures flawless proportions from high waist to hem.',
    actionLabel: 'Size Guide',
    actionPayload: 'size_guide'
  });

  greetings.push({
    id: 'everyday_stylist',
    tag: 'Direct Consultation',
    headline: 'Connect with our Stylist',
    message: 'Speak with our Accra boutique stylists on WhatsApp for custom measurements or bridal commissions.',
    actionLabel: 'WhatsApp Stylist',
    actionPayload: 'contact_whatsapp'
  });

  return greetings;
}

/**
 * Returns next greeting index without consecutive repeats.
 */
export function getNextGreetingIndex(currentIndex: number, totalGreetings: number): number {
  if (totalGreetings <= 1) return 0;
  return (currentIndex + 1) % totalGreetings;
}
