import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Users, ArrowRight } from 'lucide-react';
import { trackEvent } from '../utils/analytics';
import { Opportunity } from '../utils/types';
import { formatDate } from '../utils/utils';

interface Props {
  opportunity: Opportunity;
}

export function OpportunityCard({ opportunity }: Props) {
  const handleApply = () => {
    trackEvent("volunteer", "apply", { opportunity: opportunity.title });
    // TODO: Implement application flow
    console.log(`Applied to: ${opportunity.title}`);
  };

  return (
    <motion.div 
      className="bg-secondary-800/50 backdrop-blur rounded-xl p-6 shadow-lg relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-secondary-800/30 to-primary-500/5"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-display font-bold text-white">
            {opportunity.title}
          </h3>
          <span className="text-primary-400 text-sm">
            {formatDate(opportunity.date)}
          </span>
        </div>

        <p className="text-gray-300 mb-6 line-clamp-3">{opportunity.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2 text-gray-400">
            <div className="p-2 bg-primary-500/20 rounded-lg">
              <MapPin className="w-4 h-4 text-primary-400" />
            </div>
            <span>{opportunity.location}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <div className="p-2 bg-primary-500/20 rounded-lg">
              <Clock className="w-4 h-4 text-primary-400" />
            </div>
            <span>{opportunity.commitment}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-6">
            {opportunity.skills.map((skill) => (
              <span
                key={skill}
                className="bg-secondary-700/50 text-primary-300 text-sm px-3 py-1 rounded-full
                         border border-primary-500/20 hover:border-primary-500/40 transition-colors"
              >
                {skill}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary-500/20 rounded-lg">
                <Users className="w-4 h-4 text-primary-400" />
              </div>
              <span className="text-gray-400">
                {opportunity.spots ? (
                  opportunity.spots === 1 ? (
                    "1 spot left"
                  ) : (
                    `${opportunity.spots} spots left`
                  )
                ) : (
                  "Limited spots available"
                )}
              </span>
            </div>
            <motion.button
              onClick={handleApply}
              className="flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-lg
                       hover:bg-primary-600 transition-all duration-200 shadow-lg shadow-primary-500/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Apply Now
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
