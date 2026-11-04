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
        <div className="fixed top-5 inset-x-0 px-4 flex justify-center pointer-events-none z-[99999]">
          <motion.div
            initial={{ y: -30, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="pointer-events-auto max-w-sm sm:max-w-md w-full bg-[#1e082b] text-white border border-lilac/30 px-5 py-3.5 rounded-xl shadow-2xl text-center text-sm font-medium leading-snug break-words"
          >
            {message}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
