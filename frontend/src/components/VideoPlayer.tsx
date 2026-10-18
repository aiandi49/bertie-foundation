import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from "../utils/supabaseClient";
import { motion } from 'framer-motion';

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

export function VideoPlayer({ title, description, date, thumbnailUrl, videoUrl, category, tags, isClickable = true }: Props) {
  const [isLoading, setIsLoading] = useState(true);

  const trackVideoEvent = useCallback(async (action: string) => {
    try {
      await supabase.from("analytics_events").insert({
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

  // YouTube's own player, with its own controls, so one tap plays the video on any phone or computer.
  // (The earlier version covered the player with a dark layer and custom buttons that only showed on
  // mouse-hover, and switched YouTube's controls off, so nothing could be played on a phone.)
  const separator = videoUrl.includes('?') ? '&' : '?';
  const embedSrc = `${videoUrl}${separator}playsinline=1&rel=0`;

  // Counts the first time someone starts this video (a tap into the player moves focus to the iframe).
  useEffect(() => {
    let sent = false;
    const onBlur = () => {
      if (!sent && document.activeElement instanceof HTMLIFrameElement && document.activeElement.title === title) {
        sent = true;
        trackVideoEvent("play");
      }
    };
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, [title, trackVideoEvent]);

  return (
    <motion.div
      className="bg-blue-600 rounded-xl overflow-hidden shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative aspect-video overflow-hidden bg-secondary-900">
        {isClickable ? (
          <>
            {isLoading && (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-secondary-900/80">
                <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
              </div>
            )}
            <iframe
              src={embedSrc}
              title={title}
              loading="lazy"
              onLoad={() => setIsLoading(false)}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </>
        ) : (
          thumbnailUrl && <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover" />
        )}
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
