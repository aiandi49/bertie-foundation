import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "./Button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  story: {
    title?: string;
    story: string;
    author: string;
    program: string;
    image?: string;
  };
}

export function StoryDetailModal({ isOpen, onClose, story }: Props) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        className="bg-secondary-800 rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <div className="relative p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>

          <div className="flex items-center mb-6">
            {story.image && (
              <img
                src={story.image}
                alt={story.author}
                className="w-16 h-16 rounded-full mr-4 object-cover border-2 border-primary-500"
              />
            )}
            <div>
              <h3 className="text-2xl font-bold text-white">
                {story.title || "Success Story"}
              </h3>
              <p className="text-primary-400">{story.author}</p>
              <p className="text-gray-400 text-sm">{story.program}</p>
            </div>
          </div>

          <div className="prose prose-invert prose-primary max-w-none mt-6">
            {story.story.split("\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}