import React, { useState } from "react";
import { Layout } from "../components/Layout";
import { SuccessStoryForm } from "../components/SuccessStoryForm";
// import { FormService } from "../utils/formService";
import { FormServiceFallback as FormService } from "../utils/formServiceFallback";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { Button } from "../components/Button";
import { apiClient } from "app";
import { ContentType } from "types";
import { Award, Users, TrendingUp } from "lucide-react";
import { trackEvent } from "../utils/analytics";

export default function ShareStory() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  
  // Track page view
  React.useEffect(() => {
    trackEvent({
      event_type: "page_view",
      component: "ShareStory",
      action: "view"
    });
  }, []);
  
  return (
    <Layout>
      {/* Hero Section - Simplified */}
      <section className="bg-gradient-to-r from-primary-900 to-primary-800 py-10 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1920')] opacity-5 bg-cover bg-center" />
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
            Share Your <span className="text-primary-400">Story</span>
          </h1>
          <p className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto mb-6 leading-relaxed">
            Every story inspires and encourages others. Share yours to make a difference.
          </p>
          <div className="max-w-4xl mx-auto bg-secondary-900/50 backdrop-blur-sm p-6 rounded-xl shadow-lg">
            {success ? (
              <motion.div 
                className="p-8 bg-secondary-800/50 backdrop-blur rounded-xl text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-primary-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-primary-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Your Story Has Been Shared!</h3>
                <p className="text-gray-300 mb-8">
                  Thank you for sharing your inspiring journey with our community. Your story will help motivate others and showcase the impact of our programs.
                </p>
                <p className="text-gray-400 mb-8">
                  We'll review your submission and may feature it on our platforms. We might reach out if we need any additional information.
                </p>
                <Button 
                  onClick={() => setSuccess(false)}
                  className="mx-auto"
                >
                  Share Another Story
                </Button>
              </motion.div>
            ) : (
              <SuccessStoryForm onSubmit={async (story) => {
                setLoading(true);
                setError("");
                
                try {
                  // Handle image upload if provided
                  let imageUrl = undefined;
                  
                  if (story.image) {
                    try {
                      // Create form data for image upload
                      const formData = new FormData();
                      formData.append('file', story.image);
                      
                      // Upload image
                      const uploadResponse = await apiClient.upload_image({
                        title: story.title,
                        category: "success-stories",
                        description: `Success story image for ${story.name}`
                      }, { file: story.image });
                      
                      const uploadData = await uploadResponse.json();
                      imageUrl = uploadData.image.url;
                    } catch (uploadError) {
                      console.error("Error uploading image:", uploadError);
                      // Continue with undefined imageUrl if upload fails
                    }
                  }
                  
                  // Use the moderation API instead of direct submission
                  const response = await apiClient.submit_content(
                    { content_type: ContentType.SuccessStory },
                    {
                      title: story.title,
                      story: story.story,
                      program: story.program,
                      impact: story.impact,
                      name: story.name,
                      email: story.email,
                      imageUrl: imageUrl,
                      tags: story.tags
                    }
                  );
                  
                  if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || "Failed to submit success story");
                  }
                  
                  // Also save to local storage for backup/fallback
                  await FormService.submitSuccessStory({
                    title: story.title,
                    story: story.story,
                    program: story.program,
                    impact: story.impact,
                    name: story.name,
                    email: story.email,
                    imageUrl: imageUrl,
                    tags: story.tags
                  });
                  
                  setSuccess(true);
                } catch (error) {
                  console.error("Error submitting story:", error);
                  setError("We encountered an issue while sharing your story. Please try again.");
                } finally {
                  setLoading(false);
                }
              }} 
              loading={loading}
              error={error}
            />
            )}
          </div>
        </div>
      </section>
      
    </Layout>
  );
}
