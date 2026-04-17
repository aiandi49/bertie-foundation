import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "../components/Layout";
import { FormServiceFallback } from "../utils/formServiceFallback";
import { Award, User, Calendar, Star, Tag } from "lucide-react";
import { Button } from "../components/Button";
import { useNavigate } from "react-router-dom";
import { trackEvent } from "../utils/analytics";
import { apiClient } from "app";
import { TestimonialCarousel } from "../components/TestimonialCarousel";

export default function SuccessStories() {
  const navigate = useNavigate();
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // First try to get from API
        const response = await apiClient.get_success_stories();
        const apiStories = await response.json();
        
        if (apiStories && Array.isArray(apiStories) && apiStories.length > 0) {
          setStories(apiStories);
        } else {
          // Fallback to local storage if API returns empty results
          const localStories = FormServiceFallback.getSuccessStories();
          setStories(localStories);
        }
      } catch (err) {
        console.error("Error fetching success stories:", err);
        // Fallback to local storage on API error
        const localStories = FormServiceFallback.getSuccessStories();
        setStories(localStories);
        
        if (localStories.length === 0) {
          setError("No success stories found. Be the first to share your story!");
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchStories();
    trackEvent("success_stories_page", "view");
  }, []);
  
  // Helper function to format date
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-24 px-4 bg-gradient-to-br from-primary-900 via-secondary-900 to-primary-800 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1517486808906-6ca8b3f8e7a4?auto=format&fit=crop&q=80"
            alt="Success Stories"
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
              Success <span className="text-primary-400">Stories</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
              Real stories from our community members showcasing the impact of our programs.
            </p>
            <Button
              onClick={() => {
                trackEvent("success_stories_page", "share_story_click");
                navigate("/share-story");
              }}
              size="lg"
              className="flex items-center gap-2 mx-auto"
            >
              <Award className="w-5 h-5" />
              Share Your Story
            </Button>
          </motion.div>
        </div>
      </section>
      
      {/* Main Content */}
      <section className="py-20 px-4 bg-secondary-900">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              <span className="text-primary-400">Coming Soon</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Our success stories section is being updated to better showcase the incredible impact of our community members. 
              Check back soon to explore inspiring stories of transformation and hope.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {['Personal Growth', 'Community Support', 'Educational Success', 'Career Development'].map((tag) => (
                <div 
                  key={tag}
                  className="px-4 py-2 bg-secondary-800/40 backdrop-blur-sm rounded-full text-sm text-gray-300 border border-secondary-700"
                >
                  {tag}
                </div>
              ))}
            </div>
            {/* Duplicate button hidden as per request
            <div className="mt-8">
              <Button
                onClick={() => {
                  trackEvent("success_stories_page", "share_story_click");
                  navigate("/share-story");
                }}
                size="lg"
                className="flex items-center gap-2 mx-auto"
              >
                <Award className="w-5 h-5" />
                Share Your Story
              </Button>
            </div>
            */}
          </motion.div>
        </div>
      </section>
      
      {/* Voices of Impact Section - Hidden as per request */}
      {/* <section className="py-20 px-4 bg-secondary-800">
        <div className="container mx-auto">
          <TestimonialCarousel />
        </div>
      </section> */}
    </Layout>
  );
}
