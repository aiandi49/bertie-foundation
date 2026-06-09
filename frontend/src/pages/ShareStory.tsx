import React, { useState } from "react";
import { Layout } from "../components/Layout";
import { SuccessStoryForm } from "../components/SuccessStoryForm";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { Button } from "../components/Button";
import { trackEvent } from "../utils/analytics";
import { supabase } from "../utils/supabaseClient";

export default function ShareStory() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    trackEvent({
      event_type: "page_view",
      component: "ShareStory",
      action: "view",
    });
  }, []);

  return (
    <Layout>
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
                <Button onClick={() => setSuccess(false)} className="mx-auto">
                  Share Another Story
                </Button>
              </motion.div>
            ) : (
              <SuccessStoryForm
                onSubmit={async (story) => {
                  setLoading(true);
                  setError("");

                  try {
                    // Insert directly into Supabase — no backend needed
                    const { error: dbError } = await supabase
                      .from("success_stories")
                      .insert({
                        title: story.title,
                        story: story.story,
                        program: story.program,
                        impact: story.impact,
                        name: story.name,
                        email: story.email,
                        image_url: null, // image upload requires storage bucket setup
                        tags: story.tags,
                        status: "pending",
                        timestamp: new Date().toISOString(),
                      });

                    if (dbError) throw dbError;

                    await trackEvent({
                      event_type: "form_submit",
                      component: "ShareStory",
                      action: "submit_success",
                      metadata: { program: story.program },
                    });

                    setSuccess(true);
                  } catch (err: any) {
                    console.error("Error submitting story:", err);
                    setError(
                      "We encountered an issue while sharing your story. Please try again."
                    );
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
