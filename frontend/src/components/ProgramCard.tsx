import React from 'react';
import { motion } from 'framer-motion';
import { Program } from '../utils/types';
import { getCategoryColor } from '../utils/utils';

interface Props {
  program: Program;
}

export function ProgramCard({ program }: Props) {
  return (
    <motion.div 
      className="bg-gradient-to-br from-secondary-800 via-secondary-800 to-secondary-700 rounded-xl overflow-hidden shadow-xl group"
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <img
          src={program.image}
          alt={program.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
      <div className="p-8 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary-800/95 via-secondary-800/95 to-secondary-700/95 backdrop-blur-sm" />
        <div className="relative z-10">
          <div className="flex flex-col space-y-4 mb-6">
            <h3 className="text-2xl font-display font-bold text-white group-hover:text-primary-400 transition-colors">
              {program.title}
            </h3>
            <span className={`${getCategoryColor(program.category)} text-white text-sm px-4 py-1.5 rounded-full w-fit`}>
              {program.category}
            </span>
          </div>
          <p className="text-gray-300 mb-6 leading-relaxed">{program.description}</p>
          <div className="flex justify-between items-center">
            <span className="text-primary-400 text-sm font-medium">{program.impact}</span>
            <motion.button 
              className="bg-primary-600 text-white px-6 py-2.5 rounded-lg hover:bg-primary-700 transition-colors font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Learn More
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}