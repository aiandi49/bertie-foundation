import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Instagram, Linkedin, X, Youtube } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./Button";

interface Props {
  onClose?: () => void;
}

export function SubscriptionSuccessModal({ onClose }: Props) {
  const navigate = useNavigate();
  
  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => {
        // Close the modal when clicking the overlay (outside the modal)
        // But only if the click is directly on the overlay, not on its children
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      <motion.div
        className="bg-primary-900 border border-white/20 max-w-lg w-full rounded-xl p-8 relative"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-white/60 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10"
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-display font-bold text-white mb-4">Stay Updated</h2>
          <p className="text-gray-300 mb-6">Join our newsletter to receive updates about our programs, events, and success stories.</p>
          
          <div className="flex items-center justify-center gap-2 text-green-400 mb-6">
            <CheckCircle className="w-6 h-6" />
            <p className="text-lg font-medium">Successfully Subscribed!</p>
          </div>
          
          <p className="text-gray-300 mb-4">Thank you for joining our community!</p>
          <p className="text-gray-300 mb-8">Check your inbox for a welcome email with more details.</p>
          
          <div className="space-y-2 text-center mb-8">
            <p className="text-gray-300 font-medium">While you're here, why not:</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="flex items-center gap-2"
                onClick={() => {
                  navigate("/programs");
                  window.scrollTo(0, 0);
                  if (onClose) onClose();
                }}
              >
                <span>Explore Programs</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                className="flex items-center gap-2"
                onClick={() => {
                  navigate("/volunteer");
                  window.scrollTo(0, 0);
                  if (onClose) onClose();
                }}
              >
                <span>Start Volunteering</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2 text-center">
            <p className="text-gray-300">Follow us on social media:</p>
            <div className="flex justify-center space-x-4">
              <motion.a 
                href="https://www.instagram.com/bertie_foundation/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-primary-900 hover:bg-primary-800 text-[#FF4C4C] hover:text-[#FF4C4C]/80
                        transition-all duration-300 group"
                whileHover={{ scale: 1.1, y: -2 }}
              >
                <Instagram size={24} className="transform group-hover:rotate-12 transition-transform duration-300" />
              </motion.a>
              <motion.a 
                href="https://www.linkedin.com/company/bertie-foundation/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-primary-900 hover:bg-primary-800 text-[#FF4C4C] hover:text-[#FF4C4C]/80
                        transition-all duration-300 group"
                whileHover={{ scale: 1.1, y: -2 }}
              >
                <Linkedin size={24} className="transform group-hover:rotate-12 transition-transform duration-300" />
              </motion.a>
              <motion.a 
                href="https://x.com/BertieFndtn"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-primary-900 hover:bg-primary-800 text-[#FF4C4C] hover:text-[#FF4C4C]/80
                        transition-all duration-300 group"
                whileHover={{ scale: 1.1, y: -2 }}
              >
                <X size={24} className="transform group-hover:rotate-12 transition-transform duration-300" />
              </motion.a>
              <motion.a 
                href="https://www.youtube.com/@BertieFoundation"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-primary-900 hover:bg-primary-800 text-[#FF4C4C] hover:text-[#FF4C4C]/80
                        transition-all duration-300 group"
                whileHover={{ scale: 1.1, y: -2 }}
              >
                <Youtube size={24} className="transform group-hover:rotate-12 transition-transform duration-300" />
              </motion.a>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
