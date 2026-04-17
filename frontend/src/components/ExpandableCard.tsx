import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog } from './Dialog';
import { ArrowRight } from 'lucide-react';

interface ExpandableCardProps {
  title: string;
  description: string;
  image?: string;
  category?: string;
  categoryColor?: string;
  icon?: React.ReactNode;
  expandedContent?: React.ReactNode;
  details?: string[];
  impact?: string;
}

export function ExpandableCard({
  title,
  description,
  image,
  category,
  categoryColor = 'bg-primary-500',
  icon,
  expandedContent,
  details,
  impact
}: ExpandableCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <>
      <motion.div
        className="bg-gradient-to-br from-secondary-800 via-secondary-800 to-secondary-700 rounded-xl overflow-hidden shadow-lg hover:shadow-xl group cursor-pointer touch-manipulation h-full flex flex-col border border-secondary-700 transition-all duration-300 will-change-transform"
        whileHover={{ scale: 1.03 }}
        transition={{ duration: 0.3 }}
        onClick={handleOpenDialog}
      >
        {image && (
          <div className="relative h-24 sm:h-32 md:h-44 lg:h-48 overflow-hidden">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        )}
        <div className="p-3 sm:p-4 md:p-5 relative flex-grow flex flex-col">
          {!image && icon && (
            <div className="bg-primary-500/20 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center mb-2 sm:mb-3 md:mb-4">
              {icon}
            </div>
          )}
          <div className="flex flex-col space-y-1.5 sm:space-y-2 md:space-y-3 mb-2 sm:mb-3 md:mb-4">
            <h3 className="text-base sm:text-lg md:text-2xl font-display font-bold text-white group-hover:text-primary-400 transition-colors">
              {title}
            </h3>
            {category && (
              <span className={`${categoryColor} text-white text-[10px] sm:text-xs px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full w-fit inline-block`}>
                {category}
              </span>
            )}
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
          
          {details && details.length > 0 && (
            <div className="mt-4 space-y-2">
              {details.slice(0, 3).map((detail, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                  <p className="text-gray-300 text-sm">{detail}</p>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex justify-between items-center gap-2 sm:gap-3 mt-auto pt-4 border-t border-secondary-700/50">
            {impact && <span className="text-primary-400 text-xs sm:text-base font-medium truncate">{impact}</span>}
            <motion.button 
              className="bg-primary-600 text-white min-h-[28px] sm:min-h-[36px] px-2 sm:px-4 py-1 sm:py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium text-[10px] sm:text-sm flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenDialog();
              }}
            >
              <span>Learn More</span>
              <ArrowRight className="w-3 h-3 sm:w-5 sm:h-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      <Dialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        title={title}
      >
        {expandedContent ? (
          expandedContent
        ) : (
          <div className="space-y-2 sm:space-y-3 md:space-y-4 p-1 sm:p-2">
            {image && (
              <div className="relative h-28 sm:h-40 md:h-56 rounded-lg overflow-hidden mb-2 sm:mb-3">
                <img 
                  src={image} 
                  alt={title} 
                  className="w-full h-full object-cover" 
                  loading="lazy" 
                />
              </div>
            )}
            {category && (
              <div className="flex items-center gap-2">
                <span className={`${categoryColor} text-white text-xs px-2 py-0.5 sm:py-1 rounded-full`}>
                  {category}
                </span>
              </div>
            )}
            <p className="text-gray-300 leading-relaxed text-xs sm:text-sm">{description}</p>
            {details && (
              <div className="mt-2 sm:mt-3">
                <h4 className="text-xs sm:text-sm font-semibold text-white mb-1 sm:mb-2">Details</h4>
                <div className="space-y-1 sm:space-y-2">
                  {details.map((detail, index) => (
                    <div key={index} className="flex items-center gap-1 sm:gap-2">
                      <div className="w-1 h-1 rounded-full bg-primary-500" />
                      <p className="text-gray-400 text-[10px] sm:text-xs">{detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {impact && (
              <div className="mt-2 sm:mt-3">
                <h4 className="text-xs sm:text-sm font-semibold text-white mb-1 sm:mb-2">Impact</h4>
                <p className="text-primary-400 text-[10px] sm:text-xs">{impact}</p>
              </div>
            )}
          </div>
        )}
      </Dialog>
    </>
  );
}
