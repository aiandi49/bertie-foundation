import React from "react";
import { motion } from "framer-motion";
import { Layout } from "../components/Layout";
import { Heart, Users, Globe, Target } from "lucide-react";

// Force rebuild check
export default function AboutUs() {
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
            <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-6">
              About Us
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Empowering communities through compassion, collaboration, and meaningful impact.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-24">
        {/* Mission & Values Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-secondary-900/30 p-8 rounded-xl border border-secondary-700/30 relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-purple-500/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <h2 className="text-3xl font-display font-bold text-white mb-6 flex items-center gap-3">
                <Target className="text-primary-400" />
                Our Mission
              </h2>
              <p className="text-gray-300 leading-relaxed">
                The Bertie Foundation is dedicated to making a positive impact in Pattaya, Thailand, 
                by supporting local organizations and individuals in need. We strive to create lasting 
                change through sustainable initiatives and community engagement.
              </p>
            </div>
          </motion.div>

          {/* Values */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-secondary-900/30 p-8 rounded-xl border border-secondary-700/30 relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-primary-500/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <h2 className="text-3xl font-display font-bold text-white mb-6 flex items-center gap-3">
                <Heart className="text-primary-400" />
                Our Values
              </h2>
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-primary-400">•</span>
                  <span>Compassion in every action</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-400">•</span>
                  <span>Transparency in operations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-400">•</span>
                  <span>Community-driven solutions</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-400">•</span>
                  <span>Sustainable impact</span>
                </li>
              </ul>
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
            className="bg-secondary-900/30 p-8 rounded-xl border border-secondary-700/30 text-center relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-purple-500/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <Users className="w-12 h-12 text-primary-400 mx-auto mb-4" />
              <h3 className="text-4xl font-bold text-white mb-2">1000+</h3>
              <p className="text-gray-300">People Helped</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-secondary-900/30 p-8 rounded-xl border border-secondary-700/30 text-center relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-primary-500/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <Globe className="w-12 h-12 text-primary-400 mx-auto mb-4" />
              <h3 className="text-4xl font-bold text-white mb-2">15+</h3>
              <p className="text-gray-300">Partner Organizations</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-secondary-900/30 p-8 rounded-xl border border-secondary-700/30 text-center relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-purple-500/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <Heart className="w-12 h-12 text-primary-400 mx-auto mb-4" />
              <h3 className="text-4xl font-bold text-white mb-2">100%</h3>
              <p className="text-gray-300">Commitment to Community</p>
            </div>
          </motion.div>
        </div>

        {/* Story Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-secondary-900/30 p-8 rounded-xl border border-secondary-700/30 relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-purple-500/5 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative">
            <h2 className="text-3xl font-display font-bold text-white mb-6">Our Story</h2>
            <div className="prose prose-invert max-w-none">
              <p>
                The Bertie Foundation emerged from a simple yet powerful idea: that small acts of kindness 
                can create ripples of positive change throughout a community. Founded in Pattaya, Thailand, 
                our journey began with a group of expats who saw both the challenges and the incredible 
                potential in our local community.
              </p>
              <p>
                What started as informal gatherings to help those in need has grown into a structured 
                foundation that works closely with local organizations, supports various causes, and 
                creates lasting impact. We believe in the power of community, transparency, and sustainable 
                change.
              </p>
              <p>
                Today, we continue to grow and evolve, but our core mission remains the same: to help 
                those in need and create positive change in our community, one step at a time.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
