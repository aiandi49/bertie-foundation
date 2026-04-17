import { apiClient } from 'app';
import { VIDEOS } from '../pages/Videos';

// Extract unique categories from videos
export const getUniqueVideoCategories = () => {
  const categories = VIDEOS.map(video => ({
    category: video.category,
    // Use the video title as the album description
    description: `Auto-generated album for videos in the ${video.category} category`
  }));
  
  // Remove duplicates (by category)
  const uniqueCategories = Array.from(
    new Map(categories.map(item => [item.category, item])).values()
  );
  
  return uniqueCategories;
};

// Sync video categories with albums
export const syncVideoCategories = async () => {
  try {
    const categories = getUniqueVideoCategories();
    
    // Call the API to sync categories
    const response = await apiClient.sync_video_categories(categories);
    const result = await response.json();
    
    console.log('Video categories synced with albums:', result);
    return result;
  } catch (error) {
    console.error('Error syncing video categories with albums:', error);
    throw error;
  }
};
