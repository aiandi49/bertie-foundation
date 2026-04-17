import React from "react";
import { motion } from "framer-motion";
import { Layout } from "../components/Layout";
import { Heart, Users, Globe, Target } from "lucide-react";

export default function Vision() {
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
              Our Vision & Mission
            </h1>
            <p className="text-2xl text-gray-300 max-w-3xl mx-auto">
              Building a better future through compassion, community, and meaningful impact.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-8">
          {/* Vision & Mission Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-2">
            {/* Vision */}
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
                  Our Vision
                </h2>
                <p className="text-gray-300 leading-relaxed text-xl font-semibold">
                  To let everyone know they are loved, cared for and that their lives matter through compassionately serving and positively enhancing their lives.
                </p>
              </div>
            </motion.div>

            {/* Mission */}
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
                  Our Mission
                </h2>
                <p className="text-gray-300 leading-relaxed text-xl font-semibold">
                  The Bertie Foundation is a diverse group of people dedicated to providing service orientated organizations with a wide range of resources to aid underprivileged lives in thailand.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Additional Values Section */}
      <div className="bg-white pt-2 pb-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Guiding Principles */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-blue-600 p-8 rounded-xl shadow-lg relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-purple-500/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <h3 className="text-3xl font-display font-bold text-white mb-6 flex items-center gap-3">
                  <Users className="text-[#FF4C4C]" />
                  Guiding Principles
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start space-x-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF4C4C] mt-2.5" />
                    <p className="text-gray-300 font-medium text-xl font-semibold">LOYALTY</p>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF4C4C] mt-2.5" />
                    <p className="text-gray-300 font-medium text-xl font-semibold">COMPASSION</p>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF4C4C] mt-2.5" />
                    <p className="text-gray-300 font-medium text-xl font-semibold">PASSION</p>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF4C4C] mt-2.5" />
                    <p className="text-gray-300 font-medium text-xl font-semibold">INITIATIVE</p>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF4C4C] mt-2.5" />
                    <p className="text-gray-300 font-medium text-xl font-semibold">TEAMWORK</p>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Long-term Goals */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-blue-600 p-8 rounded-xl shadow-lg relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-primary-500/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <h3 className="text-3xl font-display font-bold text-white mb-6 flex items-center gap-3">
                  <Globe className="text-[#FF4C4C]" />
                  Long-term Goals
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start space-x-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF4C4C] mt-2.5" />
                    <p className="text-gray-300 text-xl font-semibold">Expand our reach to serve more communities in need</p>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF4C4C] mt-2.5" />
                    <p className="text-gray-300 text-xl font-semibold">Develop sustainable and scalable program models</p>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF4C4C] mt-2.5" />
                    <p className="text-gray-300 text-xl font-semibold">Foster lasting partnerships for greater impact</p>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
