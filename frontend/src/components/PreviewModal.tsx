import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, AlertTriangle, Share2 } from "lucide-react";
import { SocialShare } from "./SocialShare";
import { Button } from "./Button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => boolean;
  story: {
    title: string;
    story: string;
    program: string;
    impact: string;
    name: string;
    email: string;
    image?: File;
    tags: string[];
  };
}

export function PreviewModal({ isOpen, onClose, onSubmit, story }: Props) {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  const handleSubmit = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent any form submission
    e.stopPropagation(); // Stop event propagation
    
    setSubmitting(true);
    setError("");
    
    // Validate required fields
    if (!story.title || !story.story || !story.program || !story.impact || !story.name || !story.email) {
      setError("Please fill out all required fields before submitting.");
      setSubmitting(false);
      return;
    }
    
    // Submit the form
    const success = onSubmit();
    if (success) {
      onClose();
    } else {
      setError("There was a problem submitting your story. Please try again.");
    }
    setSubmitting(false);
  };
  return (
    <AnimatePresence>
      {isOpen && (

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-secondary-800 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col relative"
          >
            {/* X button outside scroll area - always visible */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white transition-colors duration-200 bg-secondary-800 rounded-full p-1"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1">
              <div className="p-8 space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6 pr-10">Preview Your Story</h2>

                <div className="bg-secondary-700/50 rounded-xl p-6 space-y-6">
                  {story.image && (
                    <div className="w-full h-64 rounded-lg overflow-hidden">
                      <img
                        src={URL.createObjectURL(story.image)}
                        alt={story.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <h3 className="text-xl font-semibold text-white">{story.title}</h3>

                  {story.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {story.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded-md text-sm"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-primary-400">
                    <span className="capitalize">{story.program.replace(/-/g, " ")}</span>
                  </div>

                  <p className="text-gray-300 whitespace-pre-wrap">{story.story}</p>

                  <div className="bg-secondary-800/50 p-4 rounded-lg">
                    <h4 className="text-white font-medium mb-2">Impact / Achievement</h4>
                    <p className="text-primary-300">{story.impact}</p>
                  </div>

                  <div className="flex items-center justify-between gap-4 text-sm">
                    <div className="text-primary-400 font-medium">{story.name}</div>
                    <div className="flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-gray-400" />
                      <SocialShare
                        title={story.title}
                        description={story.impact}
                        url={window.location.href}
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-lg mb-4 flex items-start">
                    <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                    <div>{error}</div>
                  </div>
                )}
                <div className="flex justify-end gap-4 mt-8">
                  <Button variant="secondary" onClick={onClose}>
                    Edit Story
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    className="flex items-center gap-1"
                    disabled={submitting}
                    type="button" // Explicitly set to button type
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center">
                        <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2" />
                        Submitting...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        Submit Story <ChevronRight size={16} />
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
