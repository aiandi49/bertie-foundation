import React, { useState } from "react";
import { Layout } from "../components/Layout";
import { FeedbackForm } from "../components/FeedbackForm";
import { FormServiceFallback as FormService } from "../utils/formServiceFallback";
import { motion } from "framer-motion";
import { apiClient } from "app";
import { ContentType } from "types";
import { trackEvent, ANALYTICS_EVENTS } from "../utils/analytics";
import { API_URL } from "app";

export default function Feedback() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  return (
    <Layout useWhiteBackground>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-900 via-secondary-900 to-primary-800 py-24 px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1920')] opacity-5 bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/50 via-transparent to-primary-800/50" />
        
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary-500/10 to-transparent rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div
            className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-500/10 to-transparent rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>

        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-7xl font-display font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-primary-100 to-white text-transparent bg-clip-text">Your Voice</span>
              <span className="text-primary-400"> Matters</span>
            </h1>
            <p className="text-2xl text-gray-300 max-w-3xl mx-auto">
              Help us improve and grow by sharing your experience with The Bertie Foundation.
              Your feedback shapes our future initiatives.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Feedback Content Section */}
      <div className="bg-white">
        <section className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto">
            {/* Form Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-blue-600 p-8 rounded-xl shadow-lg relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-purple-500/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                {success ? (
                  <motion.div
                    className="text-center py-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Feedback Submitted!</h3>
                    <p className="text-gray-300 mb-6">
                      Thank you for sharing your thoughts with us. Your feedback helps us improve our services.
                    </p>
                    <button
                      onClick={() => setSuccess(false)}
                      className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium
                              hover:bg-primary-600 transition-all duration-200"
                    >
                      Submit Another Feedback
                    </button>
                  </motion.div>
                ) : (
                  <FeedbackForm
                    onSubmit={async (feedback) => {
                      setLoading(true);
                      setError("");
                      
                      try {
                        // Store in local fallback as backup
                        await FormService.submitFeedback({
                          ...feedback,
                          createdAt: new Date().toISOString()
                        });
                        
                        // Submit directly to feedback API using brain client
                        try {
                          const response = await apiClient.submit_feedback({
                            rating: feedback.rating,
                            comment: feedback.comment,
                            category: feedback.category,
                            email: feedback.email || null
                          });
                          
                          const responseData = await response.json();
                          console.log("Feedback API response:", responseData);
                        } catch (submitError) {
                          console.error("Error submitting to API:", submitError);
                          throw new Error("Failed to submit feedback to API");
                        }
                        
                        // Track successful submission
                        await trackEvent({
                          event_type: ANALYTICS_EVENTS.FEEDBACK.SUBMIT_SUCCESS,
                          component: "FeedbackForm",
                          action: "submit_success",
                          metadata: { category: feedback.category }
                        });
                        
                        setSuccess(true);
                      } catch (error) {
                        console.error("Error submitting feedback:", error);
                        setError("There was an error submitting your feedback. Please try again.");
                        
                        // Track submission error
                        await trackEvent({
                          event_type: ANALYTICS_EVENTS.FEEDBACK.SUBMIT_ERROR,
                          component: "FeedbackForm",
                          action: "submit_error"
                        });
                      } finally {
                        setLoading(false);
                      }
                    }}
                    loading={loading}
                    error={error}
                  />
                )}
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
