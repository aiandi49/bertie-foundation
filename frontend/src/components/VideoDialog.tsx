import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, ExternalLink, Calendar } from 'lucide-react';

interface Props {
  isOpen: boolean;
  videoUrl: string;
  title: string;
  date?: string;
  description?: string;
  onClose: () => void;
}

export function VideoDialog({ isOpen, videoUrl, title, date, description, onClose }: Props) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Handle ESC key to exit fullscreen
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
          {/* Overlay with blur effect */}
          <motion.div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />
          
          {/* Dialog Content */}
          <motion.div 
            className={`relative z-10 bg-secondary-800 rounded-lg shadow-2xl w-full max-w-5xl border border-secondary-700 overflow-hidden
                      ${isFullscreen ? 'fixed inset-0 rounded-none max-w-none' : ''}`}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Control Bar */}
            <div className="absolute top-0 left-0 right-0 p-3 flex items-center justify-between z-30 bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex items-center space-x-2 text-white overflow-hidden">
                <h3 className="text-xl font-semibold truncate">{title}</h3>
                {date && (
                  <div className="flex items-center text-sm text-gray-300">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{date}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-full bg-secondary-700/80 text-gray-300 hover:text-white hover:bg-secondary-600/80 transition-colors"
                  title="Toggle fullscreen"
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
                <a
                  href={videoUrl.replace('embed/', 'watch?v=')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-secondary-700/80 text-gray-300 hover:text-white hover:bg-secondary-600/80 transition-colors"
                  title="Open in YouTube"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full bg-secondary-700/80 text-gray-300 hover:text-white hover:bg-secondary-600/80 transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Video Container with gradient overlay */}
            <div className="relative aspect-video">
              <iframe
                src={`${videoUrl}?autoplay=1&controls=1&rel=0&modestbranding=1&showinfo=1&iv_load_policy=3&cc_load_policy=1`}
                title={title}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
              />
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" aria-hidden="true"></div>
            </div>
            
            {/* Description */}
            {description && (
              <div className="p-4 text-white">
                <p className="text-lg text-gray-300">{description}</p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
