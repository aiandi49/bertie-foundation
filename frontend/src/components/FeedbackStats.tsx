import React, { useEffect, useState, useCallback } from "react";
import { Star, BarChart2, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { apiClient } from "app";
import { trackEvent, ANALYTICS_EVENTS } from "../utils/analytics";
import { FormServiceFallback } from "../utils/formServiceFallback";

interface FeedbackStats {
  total_feedback: number;
  average_rating: number;
  category_distribution: Record<string, number>;
  rating_distribution: Record<string, number>;
}

export function FeedbackStats() {
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      // Try to get stats from API first
      try {
        const response = await apiClient.get_feedback_stats();
        const data = await response.json();
        setStats(data);
      } catch (apiError) {
        console.error("Error fetching stats from API, falling back to local storage:", apiError);
        // Fallback to local storage if API fails
        const data = FormServiceFallback.getFeedbackStats();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching feedback stats:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    trackEvent(ANALYTICS_EVENTS.IMPACT.REFRESH, "FeedbackStats", "reset");
    
    // Reset all stats to 0
    setStats({
      total_feedback: 0,
      average_rating: 0,
      category_distribution: {
        general: 0,
        volunteer: 0,
        donation: 0,
        program: 0,
        website: 0
      },
      rating_distribution: {
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0
      }
    });
    
    setTimeout(() => setIsRefreshing(false), 500); // Add a small delay for visual feedback
  }, []);

  useEffect(() => {
    trackEvent(ANALYTICS_EVENTS.IMPACT.VIEW, "FeedbackStats", "view");
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="relative">
        <motion.div 
          className="flex justify-center items-center h-48"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-400" />
        </motion.div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const categoryColors: Record<string, string> = {
    general: "bg-blue-500",
    volunteer: "bg-green-500",
    donation: "bg-purple-500",
    program: "bg-yellow-500",
    website: "bg-pink-500"
  };

  const maxCategoryCount = Math.max(...Object.values(stats.category_distribution));
  const maxRatingCount = Math.max(...Object.values(stats.rating_distribution));

  return (
    <div className="relative">
      <motion.button
        className="absolute -top-2 -right-2 z-10 bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleRefresh}
        disabled={isRefreshing}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ rotate: isRefreshing ? 0 : 180 }}
        transition={{ duration: 0.3 }}
      >
        <RefreshCw
          className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}
        />
      </motion.button>

      <motion.div 
        className="grid md:grid-cols-2 gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="bg-blue-700 p-6 rounded-xl shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Star className="text-[#FF4C4C]" /> Rating Distribution
          </h3>
          <div className="space-y-4">
            {Object.entries(stats.rating_distribution).map(([rating, count]) => (
              <div key={rating} className="space-y-2">
                <div className="flex justify-between text-sm text-gray-300">
                  <span>{rating} Star{parseInt(rating) !== 1 ? "s" : ""}</span>
                  <span>{count} reviews</span>
                </div>
                <div className="h-2 bg-blue-800 rounded-full overflow-hidden">
                  {count > 0 && (
                    <motion.div
                      className="h-full bg-yellow-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / maxRatingCount) * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
          <motion.div 
            className="mt-4 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <div className="text-3xl font-bold text-white">{stats.average_rating.toFixed(1)}</div>
            <div className="text-sm text-gray-400">Average Rating</div>
          </motion.div>
        </motion.div>

        <motion.div 
          className="bg-blue-700 p-6 rounded-xl shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart2 className="text-[#FF4C4C]" /> Feedback Categories
          </h3>
          <div className="space-y-4">
            {Object.entries(stats.category_distribution).map(([category, count]) => (
              <div key={category} className="space-y-2">
                <div className="flex justify-between text-sm text-gray-300">
                  <span className="capitalize">{category}</span>
                  <span>{count} feedback{count !== 1 ? "s" : ""}</span>
                </div>
                <div className="h-2 bg-blue-800 rounded-full overflow-hidden">
                  {count > 0 && (
                    <motion.div
                      className={`h-full ${categoryColors[category]}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / maxCategoryCount) * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
          <motion.div 
            className="mt-4 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <div className="text-3xl font-bold text-white">{stats.total_feedback}</div>
            <div className="text-sm text-gray-400">Total Feedback</div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
