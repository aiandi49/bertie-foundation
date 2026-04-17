import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Components
import { Navigation } from "components/Navigation";
import { Footer } from "components/Footer";
import { OptimizedImage } from "components/OptimizedImage";

// Store & Utilities
import { useNotificationStore } from "utils/notificationStore";
import { getOptimizedAnimationConfig, getScrollBasedAnimationConfig } from "utils/performanceUtils";

export default function App() {
  const navigate = useNavigate();
  const { fetchNotifications } = useNotificationStore();
  const [animConfig] = useState(getOptimizedAnimationConfig());
  const [scrollAnim] = useState(getScrollBasedAnimationConfig());

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

            {/* Right Images */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: animConfig.duration, ease: animConfig.ease }}
              {...scrollAnim}
              className="grid grid-cols-2 gap-10 mt-1 sm:mt-0"
            >
              <OptimizedImage
                src="/public/6e585a83-81ae-4d9b-8d1e-2f72d5932a31/1.jpg"
                alt="Bertie Foundation volunteers"
                className="w-full h-auto object-cover rounded-lg shadow-lg"
                objectFit="cover"
                priority={true} 
              />
              <OptimizedImage
                src="/public/6e585a83-81ae-4d9b-8d1e-2f72d5932a31/2.jpg"
                alt="Bertie Foundation donation drive"
                className="w-full h-auto aspect-video rounded-lg shadow-lg object-cover"
                objectFit="cover"
              />
              <OptimizedImage
                src="/public/6e585a83-81ae-4d9b-8d1e-2f72d5932a31/3.jpg"
                alt="Community support program"
                className="w-full h-auto aspect-video rounded-lg shadow-lg object-cover"
                objectFit="cover" 
              />
              <OptimizedImage
                src="/public/6e585a83-81ae-4d9b-8d1e-2f72d5932a31/4.jpg"
                alt="Children receiving donations"
                className="w-full h-auto aspect-video rounded-lg shadow-lg object-cover" 
                objectFit="cover" 
              />
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
