import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { apiClient } from "app";
import { BlogPost } from "types";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

export function BlogSection() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get_blog_posts();
        if (response.ok) {
          const data = await response.json();
          setPosts(data);
        } else {
          setError("Failed to load blog posts");
        }
      } catch (err) {
        console.error("Error fetching blog posts:", err);
        setError("Failed to load blog posts");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="py-20 px-4 bg-secondary-900 flex justify-center items-center">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (error || posts.length === 0) {
    return (
      <div className="bg-gradient-to-br from-primary-900 via-secondary-900 to-primary-800 w-full py-24 px-4 flex items-center justify-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <div className="w-[800px] h-[800px] rotate-45 flex flex-wrap gap-8">
            {[...Array(16)].map((_, i) => (
              <div 
                key={i} 
                className="w-32 h-32 rounded-2xl bg-white transform rotate-45"
                style={{
                  opacity: Math.random() * 0.5 + 0.1,
                  transform: `rotate(${Math.random() * 360}deg) scale(${Math.random() * 0.5 + 0.5})`
                }}
              />
            ))}
          </div>
        </div>

        {/* Glowing Circle Behind Text */}
        <div className="absolute w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />
        
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="relative mb-12">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg opacity-75 blur-lg"></div>
            <div className="relative bg-primary-900/90 border border-primary-500/20 rounded-lg px-8 py-12">
              <div className="w-20 h-20 mx-auto mb-6 bg-primary-500/20 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h2 className="text-4xl font-bold text-white mb-6">
                <span className="bg-gradient-to-r from-primary-400 to-secondary-400 text-transparent bg-clip-text">Blog Coming Soon</span>
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                We're working on bringing you inspiring stories and the latest news from our community.
                Check back soon for updates on our initiatives, impact stories, and more.
              </p>
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                {['Community Impact', 'Success Stories', 'Initiatives', 'Member Highlights'].map((tag) => (
                  <div 
                    key={tag}
                    className="px-4 py-2 bg-secondary-800/40 backdrop-blur-sm rounded-full text-sm text-gray-300 border border-secondary-700"
                  >
                    {tag}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-16 px-4 bg-secondary-900">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-secondary-800 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:transform hover:scale-105"
            >
              {post.image_url ? (
                <div className="h-48 overflow-hidden">
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-primary-800 to-secondary-700 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white opacity-30">
                    {post.category}
                  </span>
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center mb-4">
                  <span className="px-3 py-1 bg-primary-600/30 text-primary-400 text-xs font-semibold rounded-full">
                    {post.category}
                  </span>
                  <span className="ml-auto text-xs text-gray-500">
                    {format(new Date(post.published_at), "MMM d, yyyy")}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{post.title}</h3>
                <p className="text-gray-400 mb-4 line-clamp-3">{post.content}</p>

                <div className="flex items-center">
                  <div className="bg-secondary-700 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                    <span className="text-primary-400 font-semibold">
                      {post.author.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-gray-300">{post.author}</span>
                </div>

                {post.tags && post.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-secondary-700 text-gray-300 text-xs rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
