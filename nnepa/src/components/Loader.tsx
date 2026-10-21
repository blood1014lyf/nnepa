/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

export default function Loader() {
  const [visible, setVisible] = useState(() => {
    try {
      // Only show full splash on first arrival in the session
      return !sessionStorage.getItem('nnepa_loader_shown');
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      setVisible(false);
      try {
        sessionStorage.setItem('nnepa_loader_shown', 'true');
      } catch {}
    }, 450); // Snappy luxury reveal (450ms vs 900ms)
    return () => clearTimeout(timer);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          id="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] bg-plum-dark flex flex-col items-center justify-center gap-4 sm:gap-6 px-4 text-center overflow-hidden select-none"
        >
          {/* Animated loading wave bars */}
          <div className="flex gap-1.5 sm:gap-2 items-center">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 sm:w-2.5 h-5 sm:h-7 bg-gradient-to-b from-lilac to-mauve rounded-full"
                animate={{
                  scaleY: [0.5, 1.2, 0.5],
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  duration: 1.0,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.12,
                }}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="font-serif text-xl sm:text-3xl md:text-4xl font-light tracking-[0.2em] sm:tracking-[0.4em] md:tracking-[0.55em] text-lilac selection:bg-transparent max-w-full truncate px-2"
          >
            NNEPA FORIWAA
          </motion.div>

          <div className="text-[0.55rem] sm:text-[0.65rem] font-light tracking-[0.3em] sm:tracking-[0.45em] uppercase text-mauve selection:bg-transparent">
            Luxury African Fashion
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
