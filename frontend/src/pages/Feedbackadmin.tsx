import React from "react";
import { Layout } from "../components/Layout";
import { AdminSidebar } from "../components/AdminSidebar";
import { FeedbackStats } from "../components/FeedbackStats";
import { motion } from "framer-motion";

export default function FeedbackAdmin() {
  return (
    <Layout>
      <div className="flex min-h-screen bg-secondary-900">
        <AdminSidebar />
        <div className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                Feedback Management
              </h1>
              <p className="text-gray-400 mb-8">
                Monitor and analyze feedback submitted by users
              </p>
            </motion.div>
            
            {/* Feedback Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-secondary-800 p-6 rounded-xl shadow-lg mb-8"
            >
              <h2 className="text-2xl font-display font-bold text-white mb-6">
                Feedback Statistics
              </h2>
              <FeedbackStats />
            </motion.div>
            
            {/* This section can be expanded with a feedback management table that shows all feedback */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-secondary-800 p-6 rounded-xl shadow-lg"
            >
              <h2 className="text-2xl font-display font-bold text-white mb-6">
                Recent Feedback
              </h2>
              <p className="text-gray-400">
                A table for managing feedback submissions will be implemented here.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
