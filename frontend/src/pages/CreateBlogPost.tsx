import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Button } from "../components/Button";
import { Loader2, X, Tag as TagIcon } from "lucide-react";
import { apiClient } from "app";
import { trackEvent } from "../utils/analytics";
import { BlogPost } from "types";

export default function CreateBlogPost() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [recommendedTags, setRecommendedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    author: "",
    category: "News",
    tags: [] as string[],
    currentTag: "",
  });

  const categories = [
    "News",
    "Success Stories",
    "Community Updates",
    "Program Highlights",
    "Events",
    "Volunteer Stories",
  ];

  useEffect(() => {
    // Fetch existing blog posts to extract tags
    const fetchExistingTags = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get_blog_posts();
        if (response.ok) {
          const posts = await response.json() as BlogPost[];
          // Extract unique tags from all posts
          const allTags = posts.flatMap(post => post.tags || []);
          const uniqueTags = [...new Set(allTags)];
          setRecommendedTags(uniqueTags);
        }
      } catch (error) {
        console.error("Error fetching existing tags:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingTags();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await apiClient.create_blog_post({
        title: formData.title,
        content: formData.content,
        author: formData.author,
        category: formData.category,
        tags: formData.tags,
      });

      if (response.ok) {
        trackEvent({
          event_type: "blog",
          component: "create_post_form",
          action: "submit",
          metadata: {
            title: formData.title,
            category: formData.category,
          },
        });
        navigate("/news-and-stories");
      } else {
        const data = await response.json();
        throw new Error(data.detail || "Failed to create blog post");
      }
    } catch (error) {
      console.error("Error creating blog post:", error);
      setError("Failed to create blog post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (
      formData.currentTag &&
      !formData.tags.includes(formData.currentTag)
    ) {
      setFormData({
        ...formData,
        tags: [...formData.tags, formData.currentTag],
        currentTag: "",
      });
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  // Filter recommended tags that aren't already in the formData.tags
  const filteredRecommendedTags = recommendedTags.filter(
    tag => !formData.tags.includes(tag)
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-secondary-800 to-secondary-900 py-12 px-4">
        <div className="max-w-4xl mx-auto bg-secondary-800/80 backdrop-blur-sm rounded-xl p-8 shadow-xl border border-secondary-700/50">
          <h1 className="text-4xl font-bold text-white mb-8 border-b border-secondary-700/50 pb-4">Create Blog Post</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Title *
              </label>
              <input
                type="text"
                id="title"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg bg-secondary-700/70 text-white border border-secondary-600/80
                         focus:border-primary-500 focus:ring-1 focus:ring-primary-500 placeholder-gray-400"
                placeholder="Enter post title"
              />
            </div>

            {/* Author */}
            <div>
              <label
                htmlFor="author"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Author *
              </label>
              <input
                type="text"
                id="author"
                required
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg bg-secondary-700/70 text-white border border-secondary-600/80
                         focus:border-primary-500 focus:ring-1 focus:ring-primary-500 placeholder-gray-400"
                placeholder="Your name"
              />
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Category *
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg bg-secondary-700/70 text-white border border-secondary-600/80
                         focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label
                htmlFor="tags"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  id="tags"
                  value={formData.currentTag}
                  onChange={(e) =>
                    setFormData({ ...formData, currentTag: e.target.value })
                  }
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  className="flex-1 px-4 py-2 rounded-lg bg-secondary-700/70 text-white border border-secondary-600/80
                           focus:border-primary-500 focus:ring-1 focus:ring-primary-500 placeholder-gray-400"
                  placeholder="Add a custom tag"
                />
                <Button type="button" onClick={addTag}>
                  Add Tag
                </Button>
              </div>
              
              {/* Recommended Tags */}
              {filteredRecommendedTags.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-2 flex items-center">
                    <TagIcon className="w-4 h-4 mr-1" /> Recommended tags:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {filteredRecommendedTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          tags: [...formData.tags, tag]
                        })}
                        className="px-3 py-1 rounded-full text-xs
                                bg-primary-600/10 text-primary-400 hover:bg-primary-600/20
                                transition duration-200 border border-primary-600/20"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Selected Tags */}
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm
                             bg-primary-500/30 text-primary-300 shadow-md"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 hover:text-primary-100 transition duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Content */}
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Content *
              </label>
              <textarea
                id="content"
                required
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                rows={12}
                className="w-full px-4 py-2 rounded-lg bg-secondary-700/70 text-white border border-secondary-600/80
                         focus:border-primary-500 focus:ring-1 focus:ring-primary-500 placeholder-gray-400"
                placeholder="Write your post content here..."
              />
            </div>

            {error && <p className="text-red-500 text-sm font-medium px-3 py-2 bg-red-900/20 rounded-md border border-red-900/30">{error}</p>}

            <div className="flex justify-end gap-4 pt-4 mt-6 border-t border-secondary-700/30">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/news-and-stories")}
                disabled={isSubmitting}
                className="hover:bg-secondary-700/50"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  "Publish Post"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
