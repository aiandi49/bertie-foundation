import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

// Components
import { Navigation } from "components/Navigation";
import { Footer } from "components/Footer";
import { OptimizedImage } from "components/OptimizedImage";

// Store & Utilities
import { useNotificationStore } from "utils/notificationStore";
import { getOptimizedAnimationConfig, getScrollBasedAnimationConfig } from "utils/performanceUtils";

const HERO_IMAGES = [
  { src: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/images/1.jpeg",  alt: "Bertie Foundation volunteers" },
  { src: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/images/2b.jpeg", alt: "Bertie Foundation donation drive" },
  { src: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/images/3.jpeg",  alt: "Community support program" },
  { src: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/images/4.jpeg",  alt: "Children receiving donations" },
];

function Lightbox({ index, onClose, onPrev, onNext }: { index: number; onClose: () => void; onPrev: () => void; onNext: () => void }) {
  const img = HERO_IMAGES[index];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, onPrev, onNext]);

  return (
    <motion.div
      key="lightbox-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: "rgba(5, 10, 25, 0.93)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-white bg-white/10 hover:bg-white/25 rounded-full p-2 transition-colors"
        aria-label="Close"
      >
        <X size={24} />
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-3 sm:left-6 text-white bg-white/10 hover:bg-white/25 rounded-full p-3 transition-colors"
        aria-label="Previous"
      >
        <ChevronLeft size={28} />
      </button>

      <motion.div
        key={index}
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={{ duration: 0.22 }}
        className="relative flex items-center justify-center px-14 sm:px-20 w-full h-full"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={img.src}
          alt={img.alt}
          className="max-w-[92vw] max-h-[88vh] w-auto h-auto rounded-xl shadow-2xl object-contain"
          style={{ boxShadow: "0 0 80px rgba(0,0,0,0.7)" }}
        />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm text-center">
          <span>{img.alt}</span>
          <span className="ml-3 text-white/40">{index + 1} / {HERO_IMAGES.length}</span>
        </div>
      </motion.div>

      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-3 sm:right-6 text-white bg-white/10 hover:bg-white/25 rounded-full p-3 transition-colors"
        aria-label="Next"
      >
        <ChevronRight size={28} />
      </button>

      <div className="absolute bottom-4 right-6 flex gap-1.5">
        {HERO_IMAGES.map((_, i) => (
          <span key={i} className={`w-2 h-2 rounded-full transition-colors ${i === index ? "bg-white" : "bg-white/30"}`} />
        ))}
      </div>
    </motion.div>
  );
}

export default function App() {
  const navigate = useNavigate();
  const { fetchNotifications } = useNotificationStore();
  const [animConfig] = useState(getOptimizedAnimationConfig());
  const [scrollAnim] = useState(getScrollBasedAnimationConfig());
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = useCallback((i: number) => setLightboxIndex(i), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevImage = useCallback(() => setLightboxIndex(i => i !== null ? (i - 1 + HERO_IMAGES.length) % HERO_IMAGES.length : 0), []);
  const nextImage = useCallback(() => setLightboxIndex(i => i !== null ? (i + 1) % HERO_IMAGES.length : 0), []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div className="min-h-screen bg-secondary-950 overflow-x-hidden">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative bg-white py-1 sm:py-3 md:py-6 lg:py-14 px-1 sm:px-3 md:px-6 lg:px-8 overflow-hidden">
        <div className="container mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: animConfig.duration, ease: animConfig.ease }}
              {...scrollAnim}
              className="space-y-1.5 sm:space-y-3 md:space-y-6 flex justify-center items-center"
            >
              <div className="space-y-1 sm:space-y-2 md:space-y-4 max-w-2xl mx-auto text-center">
                <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-display font-bold text-gray-900">
                  Bertie Foundation
                </h1>
                <div className="relative py-0.5 sm:py-1.5 md:py-3 w-full">
                  <div className="absolute w-full h-px bg-blue-600 top-1/2 -translate-y-1/2" />
                  <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 bg-white px-1 sm:px-4">
                    <span className="text-red-500 text-xl sm:text-3xl">♥</span>
                  </div>
                </div>
                <h2 className="text-base sm:text-xl md:text-3xl lg:text-4xl font-display font-bold text-gray-800 flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 md:gap-3">
                  <span className="text-red-500 text-sm sm:text-lg md:text-2xl">♥</span>
                  <span>We Help Those in Need</span>
                  <span className="text-red-500 text-sm sm:text-lg md:text-2xl">♥</span>
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed mt-1 sm:mt-2 md:mt-3">
                  The Bertie Foundation, formed by a dedicated group of expats in Pattaya, Thailand, is committed to helping those in need. Since January 2024, we've donated to various local organizations, supporting financially struggling individuals, women, children, the elderly, schools, orphanages, and people with disabilities.
                </p>
              </div>
            </motion.div>

            {/* Right Images — each is clickable */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: animConfig.duration, ease: animConfig.ease }}
              {...scrollAnim}
              className="grid grid-cols-2 gap-10 mt-1 sm:mt-0"
            >
              {HERO_IMAGES.map((img, i) => (
                <button
                  key={i}
                  onClick={() => openLightbox(i)}
                  className="relative group w-full rounded-lg overflow-hidden shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  aria-label={`View full image: ${img.alt}`}
                >
                  <OptimizedImage
                    src={img.src}
                    alt={img.alt}
                    className={`w-full h-auto ${i === 0 ? "object-cover" : "aspect-video object-cover"} rounded-lg transition-transform duration-300 group-hover:scale-105`}
                    objectFit="cover"
                    priority={i === 0}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center rounded-lg">
                    <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg" size={32} />
                  </div>
                </button>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            index={lightboxIndex}
            onClose={closeLightbox}
            onPrev={prevImage}
            onNext={nextImage}
          />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
