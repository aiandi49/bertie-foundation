import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { trackEvent, ANALYTICS_EVENTS } from "../utils/analytics";
import { FormServiceFallback } from "../utils/formServiceFallback";
import { StoryDetailModal } from "./StoryDetailModal";
import { Button } from "./Button";

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  program: string;
  image: string;
  originalIndex?: number;
}

// For direct local fallback usage
interface SuccessStory {
  id?: string;
  title: string;
  story: string;
  program: string;
  impact: string;
  name: string;
  email: string;
  imageUrl?: string;
  tags?: string[];
  submittedAt?: Date;
  approved?: boolean;
}

// Fallback static testimonials if no approved stories are available
const STATIC_TESTIMONIALS: Testimonial[] = [
  {
    quote: "The youth mentoring program gave me the confidence and guidance I needed to pursue my dreams. Now I'm studying computer science at university!",
    author: "Sarah Chen",
    role: "Program Graduate",
    program: "Youth Mentoring",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150"
  },
  {
    quote: "Through the community garden initiative, I found purpose in retirement and made wonderful friends. We've grown over 3,000 pounds of produce!",
    author: "Robert Martinez",
    role: "Community Leader",
    program: "Community Garden",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150"
  },
  {
    quote: "The education support program helped my children excel in school. The tutoring and resources made all the difference.",
    author: "Lisa Johnson",
    role: "Parent",
    program: "Education Support",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150"
  }
];

export function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(STATIC_TESTIMONIALS);
  const [originalStories, setOriginalStories] = useState<SuccessStory[]>([]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<{title?: string; story: string; author: string; program: string; image?: string}>({ 
    title: "", 
    story: "", 
    author: "", 
    program: "",
    image: ""
  });

  useEffect(() => {
    // Track view event
    trackEvent({
      event_type: ANALYTICS_EVENTS.TESTIMONIAL.VIEW,
      component: "TestimonialCarousel",
      action: "view"
    });
    
    // Try to get real success stories from local storage
    try {
      const approvedStories = FormServiceFallback.getSuccessStories();
      
      if (approvedStories && approvedStories.length > 0) {
        // Store original stories for the detail view
        setOriginalStories(approvedStories);
        
        // Convert success stories to testimonial format
        const storyTestimonials = approvedStories.map((story: SuccessStory, index) => ({
          quote: story.story.substring(0, 180) + (story.story.length > 180 ? '...' : ''),
          author: story.name,
          role: "Community Member",
          program: story.program,
          image: story.imageUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150",
          originalIndex: index // Store the index to reference back to original story
        }));
        
        setTestimonials(storyTestimonials);
      }
    } catch (error) {
      console.error('Error getting approved stories:', error);
      // Keep using static testimonials as fallback
    }
    
    // Auto-rotate testimonials
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 8000);

    return () => clearInterval(timer);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    trackEvent({
      event_type: ANALYTICS_EVENTS.TESTIMONIAL.NAVIGATE,
      component: "TestimonialCarousel",
      action: "next"
    });
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    trackEvent({
      event_type: ANALYTICS_EVENTS.TESTIMONIAL.NAVIGATE,
      component: "TestimonialCarousel",
      action: "previous"
    });
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const openStoryDetail = (index: number) => {
    const currentTestimonial = testimonials[index];
    const originalIndex = 'originalIndex' in currentTestimonial ? currentTestimonial.originalIndex : undefined;
    
    let storyText = currentTestimonial.quote;
    let storyTitle = "";
    
    // If we have original stories with full content
    if (originalIndex !== undefined && originalStories[originalIndex]) {
      const original = originalStories[originalIndex];
      storyText = original.story;
      storyTitle = original.title;
    }
    
    setSelectedStory({
      title: storyTitle,
      story: storyText,
      author: currentTestimonial.author,
      program: currentTestimonial.program,
      image: currentTestimonial.image
    });
    
    setDetailModalOpen(true);
    
    trackEvent({
      event_type: ANALYTICS_EVENTS.TESTIMONIAL.VIEW,
      component: "StoryDetail",
      action: "open",
      metadata: { index }
    });
  };

  return (
    <div className="relative overflow-hidden">
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-4xl font-bold text-white mb-4">Voices of Impact</h2>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Real stories from our community of heroes making a difference every day
        </p>
      </motion.div>
      
      <motion.div 
        className="relative bg-gradient-to-r from-primary-500/10 via-secondary-800/50 to-primary-500/10 backdrop-blur rounded-xl p-12 overflow-hidden shadow-xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        whileHover={{ scale: 1.02 }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-secondary-800/30 to-primary-500/5 blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />

        <motion.div 
          className="absolute -top-10 -right-10 text-primary-500/10"
          animate={{ rotate: [12, 15, 12] }}
          transition={{ duration: 8, repeat: Infinity }}
        >
          <Quote size={120} />
        </motion.div>

        <div className="relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center text-center"
            >
              <motion.div
                className="relative"
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
              >
                <motion.div
                  className="absolute -inset-1 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full blur opacity-75"
                  animate={{
                    opacity: [0.5, 0.8, 0.5],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.img
                  src={testimonials[currentIndex].image}
                  alt={testimonials[currentIndex].author}
                  className="relative w-24 h-24 rounded-full border-4 border-primary-500 mb-8 shadow-lg object-cover"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                />
              </motion.div>
              <motion.div 
                className="flex flex-col items-center space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-2xl text-white mb-2 max-w-2xl leading-relaxed italic">
                  "{testimonials[currentIndex].quote}"
                </p>
                
                {testimonials[currentIndex].quote.endsWith('...') && (
                  <Button 
                    variant="secondary"
                    size="small"
                    onClick={() => openStoryDetail(currentIndex)}
                    className="flex items-center gap-2"
                  >
                    <BookOpen size={16} />
                    Read Full Story
                  </Button>
                )}
              </motion.div>
              <motion.div
                className="space-y-2 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-primary-400 font-semibold text-lg">
                  {testimonials[currentIndex].author}
                </p>
                <p className="text-gray-400 text-base">
                  {testimonials[currentIndex].role}
                </p>
                <p className="text-base text-primary-300 font-medium">
                  {testimonials[currentIndex].program}
                </p>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          <motion.div 
            className="flex justify-center mt-8 space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <motion.button
              onClick={prevTestimonial}
              className="p-3 rounded-full bg-secondary-700/50 text-primary-400 hover:bg-secondary-600/50 transition-all duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft size={24} />
            </motion.button>
            <motion.button
              onClick={nextTestimonial}
              className="p-3 rounded-full bg-secondary-700/50 text-primary-400 hover:bg-secondary-600/50 transition-all duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronRight size={24} />
            </motion.button>
          </motion.div>

          <motion.div 
            className="flex justify-center gap-2 mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {testimonials.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  trackEvent({
                    event_type: ANALYTICS_EVENTS.TESTIMONIAL.NAVIGATE,
                    component: "TestimonialCarousel",
                    action: "dot_navigation",
                    metadata: { index }
                  });
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex ? "bg-primary-500 w-6" : "bg-secondary-600 hover:bg-secondary-500"}`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </motion.div>
        </div>
      </motion.div>
      
      {/* Story Detail Modal */}
      <StoryDetailModal 
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        story={selectedStory}
      />
    </div>
  );
}
