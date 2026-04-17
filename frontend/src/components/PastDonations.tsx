import React from "react";
import { VIDEOS } from "../pages/Videos";
import { motion } from "framer-motion";
import { DollarSign, MapPin } from "lucide-react";

// Sort videos by date in descending order
const sortedVideos = [...VIDEOS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

const PastDonations: React.FC = () => {
  return (
    <div className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-4xl font-bold text-center mb-8 text-primary-400"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Who We've Helped
        </motion.h2>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-primary-700 hidden md:block" />

          {sortedVideos.map((event, index) => (
            <motion.div
              key={index}
              className="mb-8 flex flex-col md:flex-row justify-center items-center w-full"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <div className="w-full md:w-1/2 md:pr-8 text-center md:text-right mb-4 md:mb-0">
                <p className="text-lg font-semibold text-primary-300 bg-gray-800/50 inline-block px-4 py-1 rounded-full md:bg-transparent md:px-0 md:py-0">{event.date}</p>
              </div>
              <div className="w-full md:w-1/2 md:pl-8">
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-primary-500/20 transition-shadow duration-300 mx-4 md:mx-0">
                  <h3 className="text-xl font-bold mb-2 text-white">{event.title}</h3>
                  <p className="text-gray-400 mb-4">{event.description}</p>
                  <div className="flex items-center text-primary-400">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{event.category}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PastDonations;
