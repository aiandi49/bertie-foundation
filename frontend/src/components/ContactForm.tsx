import React, { useState } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import type { FC } from "react";
import { Send, Mail, User, MessageSquare } from "lucide-react";
import { trackEvent } from "../utils/analytics";
import { apiClient } from "app";
import { ContentType } from "types";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  category: string;
}

export function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
    category: "general"
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Submit through moderation API
      const response = await apiClient.submit_content({
        content_type: ContentType.Contact,
        content: {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          category: formData.category
        }
      });

      if (response.ok) {
        setSuccess(true);
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
          category: "general"
        });
        trackEvent("contact_form", "submit_success");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to submit form");
      }
    } catch (error) {
      console.error("Error submitting contact form:", error);
      setError("There was an error submitting your message. Please try again.");
      trackEvent("contact_form", "submit_error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12">
      <motion.div
        className="max-w-2xl mx-auto bg-secondary-800/50 backdrop-blur rounded-xl p-8 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-display font-bold text-white mb-4">
            Get in <span className="text-primary-400">Touch</span>
          </h2>
          <p className="text-gray-300">
            Have questions or feedback? We'd love to hear from you.
          </p>
        </div>

        {success ? (
          <motion.div
            className="text-center py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-primary-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
            <p className="text-gray-300 mb-6">
              Thank you for reaching out. We'll get back to you soon.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="text-primary-400 hover:text-primary-300 transition-colors"
            >
              Send another message
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white mb-2">Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-secondary-700 border border-secondary-600
                             text-white rounded-lg focus:ring-2 focus:ring-primary-500
                             focus:border-primary-500 transition-colors"
                    placeholder="Your name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-secondary-700 border border-secondary-600
                             text-white rounded-lg focus:ring-2 focus:ring-primary-500
                             focus:border-primary-500 transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-white mb-2">Subject</label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-2 bg-secondary-700 border border-secondary-600
                         text-white rounded-lg focus:ring-2 focus:ring-primary-500
                         focus:border-primary-500 transition-colors"
                placeholder="What's this about?"
              />
            </div>

            <div>
              <label className="block text-white mb-2">Category</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 bg-secondary-700 border border-secondary-600
                         text-white rounded-lg focus:ring-2 focus:ring-primary-500
                         focus:border-primary-500 transition-colors"
              >
                <option value="general">General Inquiry</option>
                <option value="volunteer">Volunteering</option>
                <option value="donation">Donations</option>
                <option value="program">Program Information</option>
                <option value="feedback">Feedback</option>
              </select>
            </div>

            <div>
              <label className="block text-white mb-2">Message</label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 bg-secondary-700 border border-secondary-600
                           text-white rounded-lg focus:ring-2 focus:ring-primary-500
                           focus:border-primary-500 transition-colors min-h-[120px]"
                  placeholder="Your message..."
                />
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm">{error}</div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-500 text-white py-3 rounded-lg font-semibold
                       hover:bg-primary-600 focus:ring-4 focus:ring-primary-500/50
                       transition-all duration-200 disabled:opacity-50
                       disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2" />
                  Sending...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Send className="w-5 h-5 mr-2" />
                  Send Message
                </span>
              )}
            </motion.button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
