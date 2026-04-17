import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { VideoPlayer } from '../components/VideoPlayer';
import { Play } from 'lucide-react';
import { Layout } from '../components/Layout';

interface Video {
  title: string;
  description: string;
  date: string;
  videoUrl: string;
  thumbnailUrl?: string;
  category: string;
  tags: string[];
  isClickable?: boolean;
  showThumbnail?: boolean;
}

// Helper function to extract video ID from YouTube URL
const getYouTubeID = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export const VIDEOS: Video[] = [
  {
    "title": "Bertie and Take Care Kids Foundation go to Underwater World Pattaya",
    "description": "Bertie Foundation Event #3 of 2025 - Bertie Foundation had out first ever field trip. We took the children of Take Care Kids Foundation to the aquarium at Underwater World Pattaya. We also hosted a pizza party for them with the help of Dank Pizza and gave them treat bags to take home.",
    "date": "March 2025",
    "videoUrl": "https://www.youtube.com/embed/XohHEfowLYs",
    "thumbnailUrl": "https://i.ytimg.com/vi/XohHEfowLYs/hqdefault.jpg",
    "category": "Donation Event",
    "tags": ["children", "protection", "education"],
    "showThumbnail": true
  },
  {
    "title": "Pizza Party for Anti human Trafficking and Child abuse Centre (ATCC) with the Bertie Foundation",
    "description": "Bertie Foundation Event #2 - The Bertie Foundation donated food items and toys, as well as pcv plumbing pipes and fixtures that were requested for their garden",
    "date": "February 2025",
    "videoUrl": "https://www.youtube.com/embed/FbnaBUAUXbQ",
    "thumbnailUrl": "https://i.ytimg.com/vi/FbnaBUAUXbQ/hqdefault.jpg",
    "category": "Donation Event",
    "tags": ["children", "protection"],
    "showThumbnail": true
  },
  {
    "title": "Bertie's First Event of 2025 - Human Help Network Foundation",
    "description": "Bertie Foundation Event #1 - Bertie Foundation donated food items and toys, as well as backpacks and school supplies",
    "date": "January 2025",
    "videoUrl": "https://www.youtube.com/embed/fS5U73D7yQ8",
    "thumbnailUrl": "https://i.ytimg.com/vi/fS5U73D7yQ8/hqdefault.jpg",
    "category": "Donation Event",
    "tags": ["children", "protection", "education"],
    "showThumbnail": true
  },
  {
    "title": "Redemptorist Center Christmas Stocking Handout",
    "description": "Supporting education and empowerment at the Redemptorist School. Bertie Foundation Event #13",
    "date": "December 2024",
    "videoUrl": "https://www.youtube.com/embed/UGX0j8FGYqA",
    "category": "Donation Event",
    "tags": ["education", "community"],
    "showThumbnail": true
  },
  {
    "title": "Appreciation Events-A Christmas Gift To The Bertie Foundation",
    "showThumbnail": true,
    "description": "The Redemptorist Foundation for People with Disabilities (unofficial events Fountain of Life Women’s Center, Fountain of Life Children’s Center, Glory Hut, and Take Care Kids)",
    "date": "December 2024",
    "videoUrl": "https://www.youtube.com/embed/mU1e9QCyomI",
    "thumbnailUrl": "https://i.ytimg.com/vi/mU1e9QCyomI/hqdefault.jpg",
    "category": "Merry Christmas",
    "tags": ["disability", "inclusion"]
  },
  {
    "title": "58:12 Global-Giving Food Directly To Families",
    "description": "Hosting a Pizza Night For Kids, Bertie Foundation Event #11",
    "showThumbnail": true,
    "date": "October 2024",
    "videoUrl": "https://www.youtube.com/embed/5hQbCBUD83U",
    "thumbnailUrl": "https://i.ytimg.com/vi/5hQbCBUD83U/hqdefault.jpg",
    "category": "Donation Event",
    "tags": ["children"]
  },
  {
    "title": "CPR Training & Bang Lamung Hospital Donation",
    "description": "Bertie Foundation Event #12",
    "date": "September-November 2024",
    "videoUrl": "https://www.youtube.com/embed/kDvTm_6miCo",
    "category": "Donation Event",
    "tags": ["children"],
    "showThumbnail": true
  },
  {
    "title": "Baan Jing Jai",
    "description": "Supporting our community with care and compassion, Bertie Foundation Event #10",
    "date": "September 2024",
    "videoUrl": "https://www.youtube.com/embed/tow_Bj-Ay_Y",
    "category": "Donation Event",
    "tags": ["community"],
    "showThumbnail": true
  },
  {
    "title": "Hand to Hand Foundation-Giving Mother's Day Care Packages",
    "description": "We support those in need, Bertie Foundation Event #9",
    "date": "August 2024",
    "videoUrl": "https://www.youtube.com/embed/aPMSPyz3fbU",
    "thumbnailUrl": "https://i.ytimg.com/vi/aPMSPyz3fbU/hqdefault.jpg",
    "category": "Mother's Day",
    "tags": ["children"],
    "showThumbnail": true
  },
  {
    "title": "Bang Lamung Social Welfare Center For Elderly Persons",
    "description": "At the Bang Lamung Social Welfare Center, Bertie Foundation Event #8",
    "date": "July 2024",
    "videoUrl": "https://www.youtube.com/embed/5Yp6DV0_3pM",
    "thumbnailUrl": "https://i.ytimg.com/vi/5Yp6DV0_3pM/hqdefault.jpg",
    "category": "Donation Event",
    "tags": ["elderly", "community"],
    "showThumbnail": true
  },
  {
    "title": "Father Ray's Children's Village and CPDC",
    "description": "Supporting our community with care and compassion, Bertie Foundation Event #6-#7",
    "date": "June 2024",
    "videoUrl": "https://www.youtube.com/embed/tzC1PXNXcFk",
    "category": "Donation Event",
    "tags": ["community"],
    "showThumbnail": true
  },
  {
    "title": "Bang Lamung Home for Boys",
    "description": "Bertie Foundation Event #4",
    "date": "April 2024",
    "videoUrl": "https://www.youtube.com/embed/S_ycApO7ljU",
    "category": "Donation Event",
    "tags": ["children", "community"],
    "showThumbnail": true
  },
  {
    "title": "Bang Lamung Hospital",
    "description": "Bertie Foundation Event #5",
    "date": "May 2024",
    "videoUrl": "https://www.youtube.com/embed/0ib90M2foZk",
    "thumbnailUrl": "https://i.ytimg.com/vi/0ib90M2foZk/hqdefault.jpg",
    "category": "Donation Event",
    "tags": ["community"],
    "showThumbnail": true
  },
  {
    "title": "First 2 Events of 2024",
    "description": "Bertie Foundation Events #2-#3 (Feb-Mar 2024)",
    "date": "February-March 2024",
    "videoUrl": "https://www.youtube.com/embed/_KSYXN6ZAMs",
    "thumbnailUrl": "https://i.ytimg.com/vi/_KSYXN6ZAMs/hqdefault.jpg",
    "category": "Donation Event",
    "tags": ["education", "community"],
    "showThumbnail": true
  },
  {
    "title": "Karunyawet Home for Persons with Disabilities",
    "description": "Bertie Foundation visited Karunyawet Home for Persons with Disabilities. Bertie Foundation Event #3",
    "date": "March 2024",
    "videoUrl": "https://www.youtube.com/embed/-41-PifqgA0",
    "thumbnailUrl": "https://i.ytimg.com/vi/-41-PifqgA0/hqdefault.jpg",
    "category": "Disability Support",
    "tags": ["disability", "inclusion", "community"],
    "showThumbnail": true
  },
  {
    "title": "Child Protection and Development Center",
    "description": "Bertie Foundation Event #2 - Part of our January-March events",
    "date": "February 2024",
    "videoUrl": "https://www.youtube.com/embed/V030Mds4bhQ",
    "thumbnailUrl": "https://i.ytimg.com/vi/V030Mds4bhQ/hqdefault.jpg",
    "category": "Donation Event",
    "tags": ["children", "protection"],
    "showThumbnail": true
  },
  {
    "title": "Fountain of Life Women's Center",
    "description": "Bertie Foundation Event #1 - Part of our January-March events",
    "date": "January 2024",
    "videoUrl": "https://www.youtube.com/embed/g47HzCL2ZLA",
    "thumbnailUrl": "https://i.ytimg.com/vi/g47HzCL2ZLA/hqdefault.jpg",
    "category": "Donation Event",
    "tags": ["women"],
    "showThumbnail": true
  },
];

// Automatically generate thumbnail URLs for videos that don't have one
const processedVideos = VIDEOS.map(video => {
  if (!video.thumbnailUrl) {
    const videoId = getYouTubeID(video.videoUrl);
    if (videoId) {
      return {
        ...video,
        thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      };
    }
  }
  return video;
});

export default function Videos() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Get all unique tags
  const allTags = Array.from(new Set(processedVideos.flatMap(video => video.tags)));
  
  // Filter videos based on category and/or tag selection
  const filteredVideos = processedVideos.filter(video => {
    const matchesCategory = selectedCategory ? video.category === selectedCategory : true;
    const matchesTag = selectedTag ? video.tags.includes(selectedTag) : true;
    return matchesCategory && matchesTag;
  });
  
  // Group videos by month and year
  const videosByMonth = filteredVideos.reduce((acc, video) => {
    const monthYear = video.date; // Use the full date string as the key
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(video);
    return acc;
  }, {} as Record<string, Video[]>);
    
  const getButtonClass = (isSelected: boolean) => {
    const baseClass = "px-6 py-2 rounded-full text-white transition-all duration-200";
    return isSelected
      ? `${baseClass} bg-blue-600`
      : `${baseClass} bg-blue-600/70 hover:bg-blue-600`;
  };
  
  const resetFilters = () => {
    setSelectedCategory(null);
    setSelectedTag(null);
  };
  return (
    <Layout useWhiteBackground>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-900 via-secondary-900 to-primary-800 py-24 px-4 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary-500/10 to-transparent rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div
            className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-500/10 to-transparent rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>

        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mb-8">
              <Play className="w-8 h-8 text-red-500" />
            </div>

            <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-6">
              BERTIE's History of <span className="text-primary-400">Giving</span>
            </h1>

            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Watch our journey of making a difference in the community through these inspiring videos.
              Each story represents a milestone in our mission to create positive change.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter Section - with added spacing and label */}
      <div className="container mx-auto px-4 py-12">
        {/* Categories Filter */}
        <div className="mb-6">
          <h3 className="text-2xl font-semibold text-blue-800 mb-4 text-center">Filter Videos by Category</h3>
          <div className="flex flex-wrap gap-4 justify-center">
            <motion.button
              onClick={resetFilters}
              className={getButtonClass(!selectedCategory && !selectedTag)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              All Videos
            </motion.button>
            {Array.from(new Set(processedVideos.map(video => video.category))).map((category) => (
              <motion.button
                key={category}
                onClick={() => {
                  setSelectedCategory(selectedCategory === category ? null : category);
                  setSelectedTag(null); // Reset tag when changing category
                }}
                className={getButtonClass(selectedCategory === category)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </div>
        
        {/* Tags Filter */}
        <div>
          <h3 className="text-2xl font-semibold text-blue-800 mb-4 text-center">Filter by Tags</h3>
          <div className="flex flex-wrap gap-4 justify-center">
            {allTags.map((tag) => (
              <motion.button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={getButtonClass(selectedTag === tag)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                #{tag}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Videos Grouped by Month */}
      <div className="container mx-auto px-4 mb-24">
        {Object.entries(videosByMonth).length > 0 ? (
          Object.entries(videosByMonth).map(([monthYear, videos], monthIndex) => (
            <div key={monthYear} className="mb-16">
              <h2 className="text-3xl font-bold text-blue-800 mb-8 border-b-2 border-blue-500 pb-2">{monthYear}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {videos.map((video, videoIndex) => (
                  <motion.div
                    key={`${monthIndex}-${videoIndex}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: videoIndex * 0.1 }}
                  >
                    <VideoPlayer {...video} />
                  </motion.div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16">
            <h3 className="text-2xl font-semibold text-gray-500">No videos match your current filters</h3>
            <button 
              onClick={resetFilters}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
