import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Folder, Image as ImageIcon, Edit } from 'lucide-react';
import { API_URL } from 'app';
import { OptimizedImage } from './OptimizedImage';
import { getOptimizedAnimationConfig } from '../utils/performanceUtils';

interface Album {
  id: string;
  title: string;
  description?: string;
  cover_image_url?: string;
  created_at: string;
  updated_at: string;
  image_count: number;
}

interface Props {
  albums: Album[];
  onAlbumClick: (album: Album) => void;
  onEditClick?: (album: Album) => void;
}

export function AlbumGrid({ albums, onAlbumClick, onEditClick }: Props) {
  const navigate = useNavigate();
  const animConfig = getOptimizedAnimationConfig();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {albums.map((album, index) => (
        <motion.div
          key={album.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: animConfig.duration, 
            ease: animConfig.ease, 
            delay: index * 0.1 * (animConfig.enableComplexAnimations ? 1 : 0)
          }}
          className="group relative overflow-hidden rounded-lg bg-secondary-800 aspect-square hover:shadow-lg transition-all duration-300 cursor-pointer"
          onClick={() => navigate(`/AlbumDetail?id=${album.id}`)}
        >
          {album.cover_image_url ? (
            <OptimizedImage
              src={album.cover_image_url || ''}
              alt={album.title}
              className="absolute inset-0"
              objectFit="cover"
              priority={index < 6} /* Only prioritize first visible albums */
            />
          ) : (
            <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-secondary-700">
              <Folder className="w-24 h-24 text-secondary-400" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-6">
            <div className="w-full">
              <h3 className="text-xl font-semibold text-white mb-2">{album.title}</h3>
              {album.description && (
                <p className="text-sm text-gray-300 mb-3 line-clamp-2">{album.description}</p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <ImageIcon className="w-4 h-4" />
                  <span>{album.image_count} photos</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(album.created_at).toLocaleDateString()}</span>
                </div>
                {onEditClick && (
                  <button 
                    className="bg-secondary-700 hover:bg-secondary-600 rounded-full p-2 text-white transition-colors"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent album click
                      onEditClick(album);
                    }}
                    aria-label="Edit album"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
