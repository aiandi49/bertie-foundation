import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "app";
import { Globe, Instagram, Linkedin, Mail, X, Youtube, CheckCircle, ArrowRight, User, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "components/Button";
import { SubscriptionSuccessModal } from "./SubscriptionSuccessModal";

export function Footer() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Email validation is handled by the backend

  const handleSubscribe = async () => {
    // Reset states
    setError('');
    setSuccess('');

    // Check if email is provided
    if (!email || !name) {
      setError('Name and email are required.');
      return;
    }

    // Start loading
    setIsLoading(true);

    try {
      // Call the backend API
      const response = await apiClient.subscribe_to_newsletter({
        name: name,
        email: email,
        source: 'footer'
      });
      
      const data = await response.json();
      console.log('Subscription response:', data);
      
      if (data.status === 'error') {
        setError(data.message);
        return;
      }
      
      // Clear form fields
      setName('');
      setEmail('');

      if (data.message.includes("already subscribed")) {
        // Set a specific success message for already subscribed users and do not show modal
        setSuccess(`You are already subscribed. Please check your inbox for confirmation.`);
        setShowSuccessModal(false); 
      } else {
        // Set a generic success message for new subscribers and show modal
        setSuccess('Successfully Subscribed!');
        setShowSuccessModal(true);
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      
      setError('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const navigate = useNavigate();

  return (
    <footer className="bg-[#8B0000] text-white py-12">
      <AnimatePresence>
        {showSuccessModal && (
          <SubscriptionSuccessModal onClose={() => setShowSuccessModal(false)} />
        )}
      </AnimatePresence>
      {/* Content */}
      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-12 mb-6 sm:mb-10 md:mb-16">
          {/* About Section */}
          <div className="sm:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-white mb-3 sm:mb-4 md:mb-5 text-center sm:text-left">Bertie Foundation</h2>
              <p className="text-sm sm:text-base md:text-lg text-white mb-4 sm:mb-5 md:mb-6 leading-relaxed text-center sm:text-left">
                Building stronger communities through compassion, connection, and meaningful action. 
                Join us in creating positive change that lasts.
              </p>
              <div className="flex flex-wrap gap-3 sm:gap-4 justify-center sm:justify-start">
                <motion.a 
                  href="https://www.instagram.com/bertie_foundation/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 sm:p-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-[#FF4C4C]
                           transition-all duration-300 group"
                  whileHover={{ scale: 1.1, y: -2 }}
                  aria-label="Instagram"
                >
                  <Instagram size={28} strokeWidth={2.5} className="transform group-hover:rotate-12 transition-transform duration-300" />
                </motion.a>
                <motion.a 
                  href="https://www.linkedin.com/company/bertie-foundation/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 sm:p-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-[#FF4C4C]
                           transition-all duration-300 group"
                  whileHover={{ scale: 1.1, y: -2 }}
                  aria-label="LinkedIn"
                >
                  <Linkedin size={28} strokeWidth={2.5} className="transform group-hover:rotate-12 transition-transform duration-300" />
                </motion.a>
                <motion.a 
                  href="https://x.com/BertieFndtn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 sm:p-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-[#FF4C4C]
                           transition-all duration-300 group"
                  whileHover={{ scale: 1.1, y: -2 }}
                  aria-label="X (Twitter)"
                >
                  <X size={28} strokeWidth={2.5} className="transform group-hover:rotate-12 transition-transform duration-300" />
                </motion.a>
                <motion.a 
                  href="https://www.youtube.com/@BertieFoundation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 sm:p-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-[#FF4C4C]
                           transition-all duration-300 group"
                  whileHover={{ scale: 1.1, y: -2 }}
                  aria-label="YouTube"
                >
                  <Youtube size={28} strokeWidth={2.5} className="transform group-hover:rotate-12 transition-transform duration-300" />
                </motion.a>
              </div>
            </motion.div>
          </div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-base sm:text-lg md:text-2xl font-display font-bold text-white mb-2 sm:mb-3 md:mb-4 text-center sm:text-left">Quick Links</h3>
            <ul className="space-y-1 sm:space-y-2 md:space-y-3 text-center sm:text-left">
              <li>
                <button
                  onClick={() => {
                    navigate("/impact");
                    window.scrollTo(0, 0);
                  }}
                  className="text-white hover:text-white/80 transition-colors
                           flex items-center space-x-2 group w-full text-left"
                >
                  <span className="w-1 h-1 bg-white rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-300" />
                  <span>Donate</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    navigate("/share-story");
                    window.scrollTo(0, 0);
                  }}
                  className="text-white hover:text-white/80 transition-colors
                           flex items-center space-x-2 group w-full text-left"
                >
                  <span className="w-1 h-1 bg-white rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-300" />
                  <span>Share Story</span>
                </button>
              </li>
              <li>
                <button
                  disabled
                  className="text-gray-500 cursor-not-allowed
                           flex items-center space-x-2 group w-full text-left"
                >
                  <span className="w-1 h-1 bg-white rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-300" />
                  <span>Admin</span>
                </button>
              </li>
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <h3 className="text-base sm:text-lg md:text-2xl font-display font-bold text-white mb-2 sm:mb-3 md:mb-4 text-center sm:text-left">Contact Us</h3>
            <div className="space-y-1 sm:space-y-2 md:space-y-4 flex flex-col items-center sm:items-start">
               <motion.a 
                href="tel:+66973432151"
                className="flex items-center space-x-2 sm:space-x-3 text-white hover:text-white/80
                         transition-all duration-300 group text-xs sm:text-sm md:text-base"
                whileHover={{ x: 4 }}
              >
                <Phone size={18} className="text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-xs sm:text-sm md:text-base">+66 97 343 2151</span>
              </motion.a>
              <motion.a 
                href="mailto:info@bertiefoundation.org"
                className="flex items-center space-x-2 sm:space-x-3 text-white hover:text-white/80
                         transition-all duration-300 group text-xs sm:text-sm md:text-base"
                whileHover={{ x: 4 }}
              >
                <Mail size={18} className="text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-xs sm:text-sm md:text-base">info@bertiefoundation.org</span>
              </motion.a>
              <motion.a 
                href="https://www.bertiefoundation.org"
                className="flex items-center space-x-2 sm:space-x-3 text-white hover:text-white/80
                         transition-all duration-300 group text-sm sm:text-base"
                whileHover={{ x: 4 }}
              >
                <Globe size={18} className="text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-xs sm:text-sm md:text-base">www.bertiefoundation.org</span>
              </motion.a>
            </div>
          </motion.div>
        </div>

        {/* Newsletter */}
        <motion.div 
          className="max-w-2xl mx-auto text-center mb-4 sm:mb-5 md:mb-8 lg:mb-10 p-3 sm:p-4 md:p-6 lg:p-8 rounded-xl border border-blue-400/50 bg-blue-950/30"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-base sm:text-lg md:text-2xl lg:text-3xl font-display font-bold text-white mb-1.5 sm:mb-2 md:mb-3">Stay Updated</h3>
          <p className="text-gray-300 text-xs sm:text-sm md:text-base mb-2 sm:mb-3 md:mb-5">Join our newsletter to receive updates about our programs, events, and success stories.</p>
          {!success ? (
            <div className="flex flex-col gap-2 sm:gap-3 md:gap-4 items-center justify-center">
              <form 
                className="flex flex-col sm:flex-row gap-1.5 sm:gap-3 md:gap-4 w-full max-w-xl justify-center"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!isLoading) {
                    handleSubscribe();
                  }
                }}
              >
                <div className="relative w-full sm:w-auto">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-200" />
                  <input 
                    type="text" 
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 rounded-lg bg-blue-800/50 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 text-sm sm:text-base"
                    aria-label="Your Name"
                  />
                </div>
                <div className="relative w-full sm:w-auto">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-200" />
                  <input 
                    type="email" 
                    placeholder="Your Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 rounded-lg bg-blue-800/50 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 text-sm sm:text-base"
                    aria-label="Email Address"
                  />
                </div>
                <motion.button 
                  onClick={handleSubscribe}
                  disabled={isLoading}
                  className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 rounded-lg bg-blue-600 text-white font-bold
                           hover:bg-blue-700 transition-all duration-300 flex items-center justify-center space-x-2
                           disabled:bg-gray-400 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className={`transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                    Subscribe
                  </span>
                  {isLoading && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                  )}
                </motion.button>
              </form>
              {error && (
                <p id="newsletter-error" className="text-red-500 text-xs sm:text-sm md:text-base mt-2 sm:mt-3" role="alert">{error}</p>
              )}
            </div>
          ) : (
            <motion.div 
              className="flex flex-col items-center gap-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-1 sm:gap-2 text-green-400">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                <p className="text-xs sm:text-sm md:text-base font-medium">{success}</p>
              </div>
              
              {!success.includes("already subscribed") && (
                <>
                  <div className="text-center space-y-0.5 sm:space-y-1 md:space-y-2">
                    <p className="text-gray-300 text-[10px] sm:text-xs md:text-sm">Thank you for joining our community!</p>
                    <p className="text-gray-300 text-[10px] sm:text-xs md:text-sm">Check your inbox for a welcome email with more details.</p>
                  </div>

                  <div className="space-y-1 sm:space-y-2 md:space-y-4 text-center">
                    <p className="text-gray-300 font-medium text-[10px] sm:text-xs md:text-sm">While you're here, why not:</p>
                    <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2 md:gap-4 justify-center">
                      <Button
                        size="md"
                        className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs md:text-sm lg:text-base"
                        onClick={() => {
                          navigate("/programs");
                          window.scrollTo(0, 0);
                        }}
                      >
                        <span>Explore Programs</span>
                        <ArrowRight className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4" />
                      </Button>
                      <Button
                        size="md"
                        className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs md:text-sm lg:text-base"
                        onClick={() => {
                          navigate("/volunteer");
                          window.scrollTo(0, 0);
                        }}
                      >
                        <span>Start Volunteering</span>
                        <ArrowRight className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-0.5 sm:space-y-1 md:space-y-2 text-center">
                    <p className="text-gray-300 text-[10px] sm:text-xs md:text-sm">Follow us on social media:</p>
                    <div className="flex justify-center space-x-1 sm:space-x-2 md:space-x-3">
                      <motion.a 
                        href="https://www.instagram.com/bertie_foundation/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 sm:p-2 rounded-lg bg-primary-900 hover:bg-primary-800 text-[#FF4C4C] hover:text-[#FF4C4C]/80
                                 transition-all duration-300 group"
                        whileHover={{ scale: 1.1, y: -2 }}
                      >
                        <Instagram size={16} className="transform group-hover:rotate-12 transition-transform duration-300" />
                      </motion.a>
                      <motion.a 
                        href="https://www.linkedin.com/company/bertie-foundation/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 sm:p-2 rounded-lg bg-primary-900 hover:bg-primary-800 text-[#FF4C4C] hover:text-[#FF4C4C]/80
                                 transition-all duration-300 group"
                        whileHover={{ scale: 1.1, y: -2 }}
                      >
                        <Linkedin size={16} className="transform group-hover:rotate-12 transition-transform duration-300" />
                      </motion.a>
                      <motion.a 
                        href="https://x.com/BertieFndtn"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 sm:p-2 rounded-lg bg-primary-900 hover:bg-primary-800 text-[#FF4C4C] hover:text-[#FF4C4C]/80
                                 transition-all duration-300 group"
                        whileHover={{ scale: 1.1, y: -2 }}
                      >
                        <X size={16} className="transform group-hover:rotate-12 transition-transform duration-300" />
                      </motion.a>
                      <motion.a 
                        href="https://www.youtube.com/@BertieFoundation"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 sm:p-2 rounded-lg bg-primary-900 hover:bg-primary-800 text-[#FF4C4C] hover:text-[#FF4C4C]/80
                                 transition-all duration-300 group"
                        whileHover={{ scale: 1.1, y: -2 }}
                      >
                        <Youtube size={16} className="transform group-hover:rotate-12 transition-transform duration-300" />
                      </motion.a>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/50 mt-6 sm:mt-10 md:mt-12 pt-4 sm:pt-6 md:pt-8 text-center text-xs sm:text-sm text-white px-4">
        <div className="flex flex-col items-center space-y-2">
          <p className="leading-relaxed flex items-center justify-center flex-wrap gap-2">
            A Nonprofit 501(c)(3) Organization. Copyright © Bertie Foundation. All Rights Reserved.
          </p>
          <button
            disabled 
            className="text-white/50 cursor-not-allowed hover:text-white/70 transition-colors"
            >
              Admin Access
          </button>
        </div>
      </div>
    </footer>
  );
}
