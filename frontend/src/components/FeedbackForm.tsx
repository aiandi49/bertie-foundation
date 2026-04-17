import React, { useState } from "react";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { trackEvent, ANALYTICS_EVENTS } from "../utils/analytics";

interface Props {
  onSubmit: (feedback: {
    rating: number;
    comment: string;
    category: string;
    email?: string;
  }) => void;
  loading?: boolean;
  error?: string;
}

export function FeedbackForm({ onSubmit, loading = false, error = "" }: Props) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [category, setCategory] = useState("general");
  const [email, setEmail] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Don't submit if rating is 0 or comment is empty
    if (rating === 0 || !comment.trim()) {
      return;
    }
    
    try {
      await trackEvent({
        event_type: ANALYTICS_EVENTS.FEEDBACK.SUBMIT,
        component: "FeedbackForm",
        action: "submit",
        metadata: { rating, category }
      });
      
      onSubmit({ rating, comment, category, email });
      
      // Reset form
      setRating(0);
      setComment("");
      setCategory("general");
      setEmail("");
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    }
  };

  return (
    <motion.div 
      className="bg-secondary-800/50 backdrop-blur p-8 rounded-xl shadow-lg max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-2xl font-display font-bold text-white mb-6">Share Your Feedback</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <label className="block text-white mb-2">How was your experience?</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setRating(star);
                  trackEvent({
                    event_type: ANALYTICS_EVENTS.FEEDBACK.RATE,
                    component: "FeedbackForm",
                    action: "rate",
                    metadata: { rating: star }
                  });
                  // Blur the button to prevent focus jump on mobile
                  e.currentTarget.blur();
                }}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none"
              >
                <Star
                  size={24}
                  className={`${(hoverRating || rating) >= star
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-400"}
                    transition-colors duration-200`}
                />
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <label className="block text-white mb-2">Category</label>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              trackEvent({
                event_type: ANALYTICS_EVENTS.FEEDBACK.CATEGORY_SELECT,
                component: "FeedbackForm",
                action: "select_category",
                metadata: { category: e.target.value }
              });
            }}
            className="w-full px-4 py-2 rounded-lg bg-primary-600 text-white border border-primary-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-400 focus:outline-none transition-colors duration-200"
          >
            <option value="general">General Feedback</option>
            <option value="volunteer">Volunteer Experience</option>
            <option value="donation">Donation Process</option>
            <option value="program">Program Feedback</option>
            <option value="website">Website Experience</option>
          </select>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <label className="block text-white mb-2">Your Feedback</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts with us..."
            className="w-full px-4 py-2 rounded-lg bg-primary-600 text-white border border-primary-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-400 focus:outline-none transition-colors duration-200 min-h-[100px]"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <label className="block text-white mb-2">Email (optional)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-4 py-2 rounded-lg bg-primary-600 text-white border border-primary-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-400 focus:outline-none transition-colors duration-200"
          />
        </motion.div>

        {error && (
          <motion.div
            className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-2 rounded-lg mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.div>
        )}
        
        <motion.button
          type="submit"
          className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold
                   hover:bg-primary-700 transform hover:scale-105 transition-all duration-200
                   shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!rating || !comment || loading}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2" />
              Submitting...
            </span>
          ) : (
            "Submit Feedback"
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}
