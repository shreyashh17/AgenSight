import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const LoadingOverlay: React.FC = () => (
  <AnimatePresence>
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
      />
    </motion.div>
  </AnimatePresence>
);
