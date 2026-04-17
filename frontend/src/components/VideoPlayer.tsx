import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from "app";
import { motion } from 'framer-motion';
import { Play, Pause, Maximize2, Volume2, VolumeX } from 'lucide-react';

interface Props {
  title: string;
  description: string;
  date: string;
  thumbnailUrl?: string;
  videoUrl: string;
  category: string;
  tags: string[];
  isClickable?: boolean;
  showThumbnail?: boolean;
}

export function VideoPlayer({ title, description, date, thumbnailUrl, videoUrl, category, tags, isClickable = true, showThumbnail = true }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  const trackVideoEvent = useCallback(async (action: string) => {
    try {
      await apiClient.track_event({
        event_type: "video_interaction",
        component: "VideoPlayer",
        action,
        metadata: {
          title,
          category,
          tags: tags.join(","),
          videoUrl
        }
      });
    } catch (error) {
      console.error("Failed to track video event:", error);
    }
  }, [title, category, tags, videoUrl]);

  useEffect(() => {
    // Simulate loading time for iframe
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className="bg-blue-600 rounded-xl overflow-hidden shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative aspect-video overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
        
        {/* Thumbnail */}
        {thumbnailUrl && !isPlaying && showThumbnail && (
          <div className="absolute inset-0 z-10">
            <img
              src={thumbnailUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              {isClickable ? (
                <motion.button
                  className="p-6 rounded-full bg-primary-500/80 text-white hover:bg-primary-500 transition-colors"
                  onClick={() => {
                    setIsPlaying(true);
                    trackVideoEvent("play");
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Play className="w-8 h-8" />
                </motion.button>
              ) : (
                <div className="p-6 rounded-full bg-gray-500/50 text-gray-400 cursor-not-allowed">
                  <Play className="w-8 h-8" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 z-20 bg-secondary-900/80 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
          </div>
        )}

        {/* Video Player */}
        <div className="relative w-full h-full">
          <iframe
            src={`${videoUrl}?autoplay=${isPlaying ? '1' : '0'}&controls=0&mute=${isMuted ? '1' : '0'}`}
            title={title}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Custom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between z-20
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {isClickable ? (
            <motion.button
              className="p-2 rounded-full bg-primary-500/80 text-white
                       hover:bg-primary-500 transition-colors"
              onClick={() => {
                setIsPlaying(!isPlaying);
                trackVideoEvent(isPlaying ? "pause" : "play");
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </motion.button>
          ) : (
            <div className="p-2 rounded-full bg-gray-500/50 text-gray-400 cursor-not-allowed">
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            {isClickable ? (
              <>
                <motion.button
                  className="p-2 rounded-full bg-secondary-700/80 text-white
                           hover:bg-secondary-700 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <button
                    onClick={() => {
                      setIsMuted(!isMuted);
                      trackVideoEvent(isMuted ? "unmute" : "mute");
                    }}
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                </motion.button>
                <motion.button
                  className="p-2 rounded-full bg-secondary-700/80 text-white
                           hover:bg-secondary-700 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Maximize2 className="w-5 h-5" />
                </motion.button>
              </>
            ) : (
              <>
                <div className="p-2 rounded-full bg-gray-500/50 text-gray-400 cursor-not-allowed">
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </div>
                <div className="p-2 rounded-full bg-gray-500/50 text-gray-400 cursor-not-allowed">
                  <Maximize2 className="w-5 h-5" />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <span className="text-white font-bold text-sm whitespace-nowrap">{date}</span>
        </div>
        <p className="text-gray-300 text-sm line-clamp-2">{description}</p>
      </div>
    </motion.div>
  );
}
