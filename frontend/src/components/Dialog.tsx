import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Dialog({ isOpen, onClose, title, children }: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when dialog is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.removeEventListener('mousedown', handleClickOutside);
      // Restore body scroll when dialog is closed
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Dialog Content */}
          <motion.div
            ref={dialogRef}
            className="relative bg-secondary-900 rounded-xl overflow-hidden shadow-2xl w-full max-w-[95vw] sm:max-w-xl md:max-w-3xl max-h-[85vh] sm:max-h-[90vh] flex flex-col"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b border-secondary-700">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-white truncate pr-2">{title}</h2>
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 rounded-full hover:bg-secondary-700 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 overscroll-contain">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
