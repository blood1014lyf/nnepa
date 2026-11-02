/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AnimatePresence, motion } from 'motion/react';

interface ToastProps {
  message: string | null;
}

export default function Toast({ message }: ToastProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ y: 80, opacity: 0, x: '-50%' }}
          animate={{ y: 0, opacity: 1, x: '-50%' }}
          exit={{ y: 40, opacity: 0, x: '-50%' }}
          transition={{ type: 'spring', damping: 18, stiffness: 150 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 max-w-[90vw] bg-white/95 backdrop-blur-md border border-solid border-lilac/45 md:px-8 px-5 py-3 rounded-full text-xs sm:text-sm font-semibold text-plum-dark shadow-xl z-[9000] text-center truncate"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
