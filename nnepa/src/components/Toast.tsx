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
          className="fixed left-0 right-0 px-3 sm:px-4 flex justify-center pointer-events-none z-[99999]"
          style={{
            top: 'calc(env(safe-area-inset-top, 0px) + 16px)'
          }}
        >
          <motion.div
            initial={{ y: -30, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', damping: 22, stiffness: 220 }}
            className="pointer-events-auto w-auto max-w-[calc(100vw-1.5rem)] sm:max-w-md bg-[#1e082b]/98 text-white border border-lilac/35 px-4.5 py-3 rounded-2xl shadow-2xl text-center text-sm sm:text-base font-medium leading-snug break-words mx-auto"
            style={{
              boxSizing: 'border-box',
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}
          >
            {message}
          </motion.div>
        </aside>
      )}
    </AnimatePresence>
  );
}
