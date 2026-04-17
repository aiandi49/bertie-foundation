import React from "react";
import { motion } from "framer-motion";
import { Layout } from "../components/Layout";
import { Heart, Users, Globe, Target } from "lucide-react";

export default function OurStory() {
  return (
    <Layout>
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
          >
            <h1 className="text-6xl md:text-7xl font-display font-bold text-white mb-6">
              Our Story
            </h1>
            <p className="text-2xl text-gray-300 max-w-3xl mx-auto">
              Empowering communities through compassion, collaboration, and meaningful impact.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-24">
        {/* Mission & Values Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-blue-600 p-8 rounded-xl shadow-lg relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-purple-500/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <h2 className="text-3xl font-display font-bold text-white mb-6 flex items-center gap-3">
                <Target className="text-[#FF4C4C]" />
                Our Mission
              </h2>
              <p className="text-gray-300 leading-relaxed text-xl font-semibold">
                The Bertie Foundation is a diverse group of people dedicated to providing service orientated, 
                organizations with a wide range of resources to aid underprivileged lives in thailand. 
              </p>
            </div>
          </motion.div>

          {/* Values */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-blue-600 p-8 rounded-xl shadow-lg relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-primary-500/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <h2 className="text-3xl font-display font-bold text-white mb-6 flex items-center gap-3">
                <Heart className="text-[#FF4C4C]" />
                Core Values
              </h2>
              <div className="space-y-6">
                <div className="bg-blue-700 p-4 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold text-white mb-2">BERTIE Values</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-center gap-2">
                      <span className="text-[#FF4C4C] font-bold">B</span>
                      <span className="text-xl font-semibold">- BRAVE</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#FF4C4C] font-bold">E</span>
                      <span className="text-xl font-semibold">- EMPATHETIC</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#FF4C4C] font-bold">R</span>
                      <span className="text-xl font-semibold">- RESILIENT</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#FF4C4C] font-bold">T</span>
                      <span className="text-xl font-semibold">- THOUGHTFUL</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#FF4C4C] font-bold">I</span>
                      <span className="text-xl font-semibold">- INSPIRATIONAL</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#FF4C4C] font-bold">E</span>
                      <span className="text-xl font-semibold">- EMPOWERING</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Impact Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-blue-600 p-8 rounded-xl shadow-lg text-center relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-purple-500/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <Users className="w-12 h-12 text-[#FF4C4C] mx-auto mb-4" />
              <h3 className="text-4xl font-bold text-white mb-2">1000+</h3>
              <p className="text-gray-300 text-xl font-semibold">People Helped</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-blue-600 p-8 rounded-xl shadow-lg text-center relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-primary-500/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <Globe className="w-12 h-12 text-[#FF4C4C] mx-auto mb-4" />
              <h3 className="text-4xl font-bold text-white mb-2">15+</h3>
              <p className="text-gray-300 text-xl font-semibold">Partner Organizations</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-blue-600 p-8 rounded-xl shadow-lg text-center relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-purple-500/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <Heart className="w-12 h-12 text-[#FF4C4C] mx-auto mb-4" />
              <h3 className="text-4xl font-bold text-white mb-2">100%</h3>
              <p className="text-gray-300 text-xl font-semibold">Commitment to Community</p>
            </div>
          </motion.div>
        </div>

        {/* Story Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-blue-600 p-8 rounded-xl shadow-lg relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-purple-500/5 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative">
            <h2 className="text-3xl font-display font-bold text-white mb-6">Our Journey</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-xl font-semibold">
                The Bertie Foundation emerged from a simple yet powerful idea: that small acts of kindness 
                can create ripples of positive change throughout a community. Founded in Pattaya, Thailand, 
                our journey began with a group of expats who saw both the challenges and the incredible 
                potential in our local community.
              </p>
              <p className="text-xl font-semibold">
                What started as informal gatherings to help those in need has grown into a structured 
                foundation that works closely with local organizations, supports various causes, and 
                creates lasting impact. We believe in the power of community, transparency, and sustainable 
                change.
              </p>
              <p className="text-xl font-semibold">
                Today, we continue to grow and evolve, but our core mission remains the same: to help 
                those in need and create positive change in our community, one step at a time.
              </p>
            </div>
          </div>
        </motion.div>
        </div>
      </div>
    </Layout>
  );
}
