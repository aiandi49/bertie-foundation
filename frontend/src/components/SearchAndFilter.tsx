import React from "react";
import { motion } from "framer-motion";
import { Search, Filter } from "lucide-react";

interface Props {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedTags: string[];
  onTagSelect: (tag: string) => void;
  selectedProgram: string;
  onProgramSelect: (program: string) => void;
  availableTags: string[];
  availablePrograms: string[];
}

export function SearchAndFilter({
  searchTerm,
  onSearchChange,
  selectedTags,
  onTagSelect,
  selectedProgram,
  onProgramSelect,
  availableTags,
  availablePrograms,
}: Props) {
  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Search Input */}
      <motion.div 
        className="relative"
        whileTap={{ scale: 0.98 }}
      >
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search stories..."
          className="w-full pl-10 pr-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg
                   text-white placeholder-gray-400 focus:outline-none focus:border-primary-500
                   focus:ring-2 focus:ring-primary-500"
        />
      </motion.div>

      {/* Filters */}
      <motion.div 
        className="flex flex-wrap gap-4"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.05
            }
          }
        }}
      >
        <motion.div 
          className="flex-1 min-w-[200px]"
          variants={{
            hidden: { opacity: 0, x: -20 },
            visible: { opacity: 1, x: 0 }
          }}
        >
          <label className="block text-sm font-medium text-gray-400 mb-2">
            <Filter className="inline-block w-4 h-4 mr-2" />
            Filter by Program
          </label>
          <select
            value={selectedProgram}
            onChange={(e) => onProgramSelect(e.target.value)}
            className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg
                     text-white focus:outline-none focus:border-primary-500 focus:ring-2
                     focus:ring-primary-500"
          >
            <option value="">All Programs</option>
            {availablePrograms.map((program) => (
              <option key={program} value={program}>
                {program.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
              </option>
            ))}
          </select>
        </motion.div>

        <motion.div 
          className="flex-1 min-w-[200px]"
          variants={{
            hidden: { opacity: 0, x: 20 },
            visible: { opacity: 1, x: 0 }
          }}
        >
          <label className="block text-sm font-medium text-gray-400 mb-2">
            <Filter className="inline-block w-4 h-4 mr-2" />
            Filter by Tags
          </label>
          <motion.div 
            className="flex flex-wrap gap-2"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 }
            }}
          >
            {availableTags.map((tag) => (
              <motion.button
                variants={{
                  hidden: { opacity: 0, scale: 0.8 },
                  visible: { opacity: 1, scale: 1 }
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                key={tag}
                onClick={() => onTagSelect(tag)}
                className={`px-3 py-1 rounded-full text-sm transition-colors duration-200
                         ${selectedTags.includes(tag)
                           ? "bg-primary-500 text-white"
                           : "bg-secondary-700 text-gray-400 hover:bg-secondary-600"}`}
              >
                #{tag}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
