/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';

interface StatItemProps {
  key?: React.Key;
  target: number;
  label: string;
  suffix?: string;
}

function StatItem({ target, label, suffix = '' }: StatItemProps) {
  const [value, setValue] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true;
          let start = 0;
          const duration = 1500;
          const stepTime = 16;
          const steps = duration / stepTime;
          const increment = target / steps;

          const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
              setValue(target);
              clearInterval(timer);
            } else {
              setValue(Math.floor(start));
            }
          }, stepTime);
        }
      },
      { threshold: 0.3 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [target]);

  return (
    <div
      ref={elementRef}
      className="p-10 md:p-12 text-center border-b md:border-b-0 md:border-r border-solid border-white/10 last:border-b-0 md:last:border-r-0 relative overflow-hidden group hover:bg-white/5 duration-300 select-none"
    >
      <div className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-lilac leading-none">
        {value.toLocaleString()}
        {suffix}
      </div>
      <div className="text-[0.6rem] sm:text-xs font-semibold tracking-[0.3em] uppercase text-pearl-2/50 mt-3.5">
        {label}
      </div>
    </div>
  );
}

export default function Stats() {
  const stats = [
    { target: 200, label: 'Happy Clients', suffix: '+' },
    { target: 30, label: 'Pieces Available', suffix: '' },
    { target: 10, label: 'Years of Craft', suffix: '+' },
  ];

  return (
    <div className="bg-gradient-to-r from-plum to-mauve-deep grid grid-cols-1 md:grid-cols-3">
      {stats.map((stat, i) => (
        <StatItem
          key={i}
          target={stat.target}
          label={stat.label}
          suffix={stat.suffix}
        />
      ))}
    </div>
  );
}
