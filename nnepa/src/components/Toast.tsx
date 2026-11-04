/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AnimatePresence, motion } from 'motion/react';

interface ToastProps {
  message: string | null;
}

export default function Toast({ message }: ToastProps) {
  return (
    <AnimatePresence>
      {message && (
        <aside
          aria-live="polite"
          className="fixed left-0 right-0 px-4 flex justify-center pointer-events-none z-[999999]"
          style={{
            top: 'calc(env(safe-area-inset-top, 0px) + 84px)'
          }}
        >
          <motion.div
            initial={{ y: -20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -16, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 24, stiffness: 260 }}
            className="pointer-events-auto w-full max-w-[330px] sm:max-w-md bg-[#1e082b]/98 text-white border border-lavender/40 px-4.5 py-3 rounded-xl shadow-[0_12px_40px_rgba(30,8,43,0.4)] text-center text-xs sm:text-sm font-medium leading-snug break-words mx-auto backdrop-blur-md flex items-center justify-center text-balance"
            style={{
              boxSizing: 'border-box',
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}
          >
            <span>{message}</span>
          </motion.div>
        </aside>
      )}
    </AnimatePresence>
  );
}
