import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { BlogSection } from "../components/BlogSection";
import { Layout } from "../components/Layout";
import { Button } from "../components/Button";
import { PenSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { trackEvent } from "../utils/analytics";

export default function NewsAndStories() {
  const navigate = useNavigate();

  useEffect(() => {
    trackEvent("news_stories_page", "view");
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-24 px-4 bg-gradient-to-br from-primary-900 via-secondary-900 to-primary-800 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80"
            alt="News & Stories"
            className="w-full h-full object-cover opacity-10"
          />
        </div>
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-8">
              Latest <span className="text-primary-400">News</span> & Stories
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
              Stay updated with our latest news, success stories, and community highlights.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <BlogSection />
    </Layout>
  );
}
