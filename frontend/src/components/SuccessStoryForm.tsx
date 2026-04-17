import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "./Button";
import { Upload, Award, Users, TrendingUp, Eye, AlertTriangle, ChevronRight } from "lucide-react";
import { PreviewModal } from "./PreviewModal";
import { TagInput } from "./TagInput";
import { trackEvent } from "../utils/analytics";
import { Toast } from "./Toast";

const suggestedTags = [
  "inspiration",
  "community",
  "growth",
  "leadership",
  "education",
  "mentoring",
  "health",
  "environment",
  "arts",
  "technology",
  "youth",
  "seniors",
  "success",
  "transformation",
  "impact"
];

interface Props {
  onSubmit: (story: {
    title: string;
    story: string;
    program: string;
    impact: string;
    name: string;
    email: string;
    image?: File;
    tags: string[];
  }) => void;
  loading?: boolean;
  error?: string;
}

const programIcons = {
  "youth-mentoring": "👥",
  "community-garden": "🌱",
  "education-support": "📚",
  "elderly-care": "🤝",
  "skills-development": "💡",
  "mental-health": "🧠",
  "housing-stability": "🏠",
  "youth-arts": "🎨"
};

export function SuccessStoryForm({ onSubmit, loading = false, error = "" }: Props) {
  const [formData, setFormData] = useState({
    title: "",
    story: "",
    program: "",
    impact: "",
    name: "",
    email: "",
    tags: []
  });
  const [image, setImage] = useState<File | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    visible: false,
    message: '',
    type: 'info'
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ visible: true, message, type });
  };

  const handlePreview = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Stop any event propagation
    
    // Validate before preview
    if (!formData.title || !formData.story || !formData.program || !formData.impact || !formData.name || !formData.email) {
      showToast("Please fill in all required fields before previewing", "error");
      return;
    }

    await handleEvent("preview");
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
  };

  const handleEvent = async (action: string, metadata?: any) => {
    try {
      await trackEvent("success_story_form", action, metadata);

    } catch (error) {
      console.error("Error tracking event:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Stop any event propagation

    // Validate before submit/preview
    if (!formData.title || !formData.story || !formData.program || !formData.impact || !formData.name || !formData.email) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    await handleEvent("submit", { program: formData.program });
    // Only show preview - don't submit the form yet
    setIsPreviewOpen(true);
  };
  
  const submitForm = () => {
    // Validate form before submission
    if (!formData.title || !formData.story || !formData.program || !formData.impact || !formData.name || !formData.email) {
      showToast("Please fill in all required fields", "error");
      return false;
    }
    
    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showToast("Please enter a valid email address", "error");
      return false;
    }
    
    // Only now do we actually submit the form data
    onSubmit({ ...formData, image: image || undefined });
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === "program") {
      handleEvent("program_selected", { program: value });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      handleEvent("image_upload", { filename: e.target.files[0].name });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Hero Section */}
      <motion.div 
        className="text-center mb-10 py-10 relative overflow-hidden rounded-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary-800/70 via-secondary-800/70 to-primary-800/70 -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517486808906-6ca8b3f8e7a4?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 -z-20" />
        
        <motion.div 
          className="flex justify-center mb-4"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-20 h-20 rounded-full bg-primary-900/80 backdrop-blur-sm border-2 border-primary-500/30 flex items-center justify-center">
            <Award className="w-10 h-10 text-primary-400" />
          </div>
        </motion.div>
        
        <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-3">
          Share Your <span className="text-primary-400">Hero</span> Story
        </h1>
        
        <motion.div
          className="w-24 h-1 bg-primary-400 mx-auto rounded-full mb-4"
          initial={{ width: 0 }}
          animate={{ width: 96 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
        
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Every hero's journey inspires others. Share your story and join our
          community of changemakers making a real difference.
        </p>
        
        <div className="flex justify-center flex-wrap gap-6 mt-6">
          <motion.div
            className="flex items-center gap-2 bg-primary-500/10 backdrop-blur-sm px-4 py-2 rounded-full"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Award className="w-5 h-5 text-primary-400" />
            <span className="text-sm text-gray-300">Recognition</span>
          </motion.div>
          
          <motion.div
            className="flex items-center gap-2 bg-primary-500/10 backdrop-blur-sm px-4 py-2 rounded-full"
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Users className="w-5 h-5 text-primary-400" />
            <span className="text-sm text-gray-300">Community</span>
          </motion.div>
          
          <motion.div
            className="flex items-center gap-2 bg-primary-500/10 backdrop-blur-sm px-4 py-2 rounded-full"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <TrendingUp className="w-5 h-5 text-primary-400" />
            <span className="text-sm text-gray-300">Impact</span>
          </motion.div>
        </div>
      </motion.div>


      {/* Form */}
      <motion.form 
        onSubmit={handleSubmit} 
        className="relative bg-secondary-800/80 backdrop-blur-sm p-8 rounded-2xl border border-secondary-700/50 shadow-xl"
        onClick={(e) => e.stopPropagation()} // Prevent bubbling
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/30 via-secondary-800/30 to-primary-900/30 rounded-2xl -z-10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1571624436279-b272aff752b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center opacity-5 rounded-2xl -z-20" />

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left column */}
          <div className="flex-1 space-y-6">
            <div className="space-y-1">
              <label className="block text-white font-medium" htmlFor="title">
                Title of Your Story <span className="text-primary-400">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="E.g., How volunteering changed my life"
                className="w-full px-4 py-3 rounded-xl bg-secondary-700/70 text-white border border-secondary-600
                         focus:border-primary-500 focus:ring-2 focus:ring-primary-500/40 focus:outline-none
                         transition-colors duration-200 backdrop-blur-sm"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-white font-medium" htmlFor="story">
                Your Story <span className="text-primary-400">*</span> <span className="text-sm text-gray-400 ml-2">(500 words maximum)</span>
              </label>
              <div className="relative">
                <textarea
                  id="story"
                  name="story"
                  value={formData.story}
                  onChange={(e) => {
                    // Get current word count
                    const words = e.target.value.trim().split(/\s+/).filter(Boolean).length;
                    // Only update if under word limit or if deleting
                    if (words <= 500 || e.target.value.length < formData.story.length) {
                      handleChange(e);
                    }
                  }}
                  placeholder="Share your experience and how it impacted your life..."
                  className="w-full px-4 py-3 rounded-xl bg-secondary-700/70 text-white border border-secondary-600
                          focus:border-primary-500 focus:ring-2 focus:ring-primary-500/40 focus:outline-none
                          transition-colors duration-200 min-h-[180px] backdrop-blur-sm"
                  required
                />
                <div className="text-sm text-right mt-1 flex justify-between">
                  <span className="text-gray-400 italic">Be concise and focus on the impact</span>
                  <span className={`${formData.story.trim().split(/\s+/).filter(Boolean).length >= 450 ? 'text-amber-400' : 'text-gray-400'}`}>
                    {formData.story.trim().split(/\s+/).filter(Boolean).length} / 500 words
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-white font-medium" htmlFor="impact">
                Impact / Achievement <span className="text-primary-400">*</span>
              </label>
              <input
                type="text"
                id="impact"
                name="impact"
                value={formData.impact}
                onChange={handleChange}
                placeholder="E.g., Secured dream job, Improved grades by 50%"
                className="w-full px-4 py-3 rounded-xl bg-secondary-700/70 text-white border border-secondary-600
                         focus:border-primary-500 focus:ring-2 focus:ring-primary-500/40 focus:outline-none
                         transition-colors duration-200 backdrop-blur-sm"
                required
              />
            </div>
          </div>

          {/* Right column */}
          <div className="flex-1 space-y-6">
            <div className="space-y-1">
              <label className="block text-white font-medium" htmlFor="program">
                Program <span className="text-primary-400">*</span>
              </label>
              <select
                id="program"
                name="program"
                value={formData.program}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-secondary-700/70 text-white border border-secondary-600
                         focus:border-primary-500 focus:ring-2 focus:ring-primary-500/40 focus:outline-none
                         transition-colors duration-200 backdrop-blur-sm"
                required
              >
                <option value="">Select a program</option>
                {Object.entries(programIcons).map(([value, icon]) => (
                  <option key={value} value={value}>
                    {icon} {value.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-white font-medium" htmlFor="name">
                  First Name <span className="text-primary-400">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-xl bg-secondary-700/70 text-white border border-secondary-600
                           focus:border-primary-500 focus:ring-2 focus:ring-primary-500/40 focus:outline-none
                           transition-colors duration-200 backdrop-blur-sm"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-white font-medium" htmlFor="email">
                  Email <span className="text-primary-400">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-secondary-700/70 text-white border border-secondary-600
                           focus:border-primary-500 focus:ring-2 focus:ring-primary-500/40 focus:outline-none
                           transition-colors duration-200 backdrop-blur-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-white font-medium" htmlFor="tags">
                Tags <span className="text-sm text-gray-400 ml-2">(Optional)</span>
              </label>
              <TagInput
                value={formData.tags}
                onChange={(tags) => {
                  setFormData(prev => ({ ...prev, tags }));
                  handleEvent("tags_updated", { tags });
                }}
                suggestions={suggestedTags}
                placeholder="Add tags (e.g., inspiration, community)"
                className="relative"
              />
              <p className="text-xs text-gray-400 mt-1">Tags help others discover your story</p>
            </div>

            <div className="space-y-1">
              <label className="block text-white font-medium" htmlFor="image">
                Upload Your Photo <span className="text-sm text-gray-400 ml-2">(Optional)</span>
              </label>
              <div className="flex items-center justify-center w-full group">
                <label
                  htmlFor="image"
                  className={`flex flex-col items-center justify-center w-full border-2 border-dashed
                           border-secondary-600 rounded-xl cursor-pointer hover:border-primary-500
                           transition-all duration-300 group-hover:scale-[1.02] relative overflow-hidden
                           hover:bg-secondary-700/30 backdrop-blur-sm ${image ? '' : 'h-32'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {image ? (
                    <img
                      src={URL.createObjectURL(image)}
                      alt="Preview"
                      className="w-full object-contain rounded-xl max-h-64"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="text-primary-400 mb-2 animate-bounce-slow" />
                      <p className="text-sm text-gray-400 transition-all duration-300">
                        Click to upload or drag and drop
                      </p>
                    </div>
                  )}
                  {image && (
                    <div className="absolute bottom-2 left-2 bg-secondary-900/80 px-3 py-1 rounded text-sm text-gray-300">
                      {image.name}
                    </div>
                  )}
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    onClick={(e) => e.stopPropagation()}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <motion.div 
            className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-xl mt-6 flex items-start"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <div>{error}</div>
          </motion.div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={handlePreview}
            className="flex items-center justify-center gap-2 sm:w-auto"
            disabled={loading}
            size="lg"
          >
            <Eye className="w-4 h-4" />
            Preview Story
          </Button>
          <Button 
            type="button"
            onClick={handleSubmit}
            className="flex items-center justify-center sm:w-auto"
            disabled={loading}
            size="lg"
            variant="primary"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2" />
                Submitting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span>Submit Your Story</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <ChevronRight className="w-4 h-4" />
                </motion.div>
              </span>
            )}
          </Button>
        </div>

        <PreviewModal
          isOpen={isPreviewOpen}
          onClose={handleClosePreview}
          onSubmit={submitForm}
          story={{...formData, image: image || undefined}}
        />
      </motion.form>
      
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
      />
    </div>
  );
}
