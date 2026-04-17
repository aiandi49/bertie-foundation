import React, { useEffect, useCallback } from 'react';
import { trackEvent, ANALYTICS_EVENTS } from '../utils/analytics';
import { apiClient } from 'app';
import { motion } from 'framer-motion';
import { Navigation } from '../components/Navigation';
import { Phone, MessageSquare, Settings, Shield, Zap, BarChart } from 'lucide-react';

export default function BerdieConsultant() {
  const handleFeatureClick = useCallback((feature: string) => {
    trackEvent({
      event_type: ANALYTICS_EVENTS.USER_INTERACTION.BUTTON_CLICK,
      component: "berdie_consultant",
      action: "feature_click",
      metadata: { feature }
    });
  }, []);

  useEffect(() => {
    // Track page view
    trackEvent({
      event_type: ANALYTICS_EVENTS.NAVIGATION.PAGE_VIEW,
      component: "berdie_consultant",
      action: "page_view",
      metadata: {}
    });

    // Track Play.ai initialization
    trackEvent({
      event_type: ANALYTICS_EVENTS.USER_INTERACTION.VIEW,
      component: "berdie_consultant",
      action: "playai_init",
      metadata: {}
    });

    // @ts-ignore
    window.PlayAI?.open('sCgzTfx3WK8eG3k7jsl-W');
    
    return () => {
      // @ts-ignore
      window.PlayAI?.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-secondary-950">
      <Navigation />

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
            <div className="flex justify-center mb-8">
              <motion.div
                className="w-20 h-20 bg-primary-500/20 rounded-full flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Phone className="w-10 h-10 text-primary-400" />
              </motion.div>
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-8">
              Meet <span className="text-primary-400">BERDIE</span> Consultant
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12">
              Your AI-powered calling assistant, designed to enhance communication and streamline interactions
              with our community members.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Play.ai Integration */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="bg-secondary-800/50 backdrop-blur p-8 rounded-xl shadow-lg">
            <div id="play-ai-container" className="w-full h-[600px]"></div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Natural Conversations */}
            <motion.div
              className="bg-secondary-800/50 backdrop-blur p-8 rounded-xl shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center mb-6">
                <MessageSquare className="w-6 h-6 text-primary-400" />
              </div>
              <h3 
                className="text-xl font-bold text-white mb-4 cursor-pointer hover:text-primary-400 transition-colors"
                onClick={() => handleFeatureClick("natural_conversations")}
              >Natural Conversations</h3>
              <p className="text-gray-400">
                Engage in human-like conversations with advanced natural language processing capabilities.
              </p>
            </motion.div>

            {/* Customizable Settings */}
            <motion.div
              className="bg-secondary-800/50 backdrop-blur p-8 rounded-xl shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center mb-6">
                <Settings className="w-6 h-6 text-primary-400" />
              </div>
              <h3 
                className="text-xl font-bold text-white mb-4 cursor-pointer hover:text-primary-400 transition-colors"
                onClick={() => handleFeatureClick("customizable_settings")}
              >Customizable Settings</h3>
              <p className="text-gray-400">
                Tailor the AI's behavior, voice, and responses to match your organization's needs.
              </p>
            </motion.div>

            {/* Secure Communications */}
            <motion.div
              className="bg-secondary-800/50 backdrop-blur p-8 rounded-xl shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-primary-400" />
              </div>
              <h3 
                className="text-xl font-bold text-white mb-4 cursor-pointer hover:text-primary-400 transition-colors"
                onClick={() => handleFeatureClick("secure_communications")}
              >Secure Communications</h3>
              <p className="text-gray-400">
                Enterprise-grade security ensures all conversations remain private and protected.
              </p>
            </motion.div>

            {/* Real-time Processing */}
            <motion.div
              className="bg-secondary-800/50 backdrop-blur p-8 rounded-xl shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-primary-400" />
              </div>
              <h3 
                className="text-xl font-bold text-white mb-4 cursor-pointer hover:text-primary-400 transition-colors"
                onClick={() => handleFeatureClick("realtime_processing")}
              >Real-time Processing</h3>
              <p className="text-gray-400">
                Lightning-fast response times and real-time voice processing for smooth interactions.
              </p>
            </motion.div>

            {/* Analytics Dashboard */}
            <motion.div
              className="bg-secondary-800/50 backdrop-blur p-8 rounded-xl shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center mb-6">
                <BarChart className="w-6 h-6 text-primary-400" />
              </div>
              <h3 
                className="text-xl font-bold text-white mb-4 cursor-pointer hover:text-primary-400 transition-colors"
                onClick={() => handleFeatureClick("analytics_dashboard")}
              >Analytics Dashboard</h3>
              <p className="text-gray-400">
                Comprehensive analytics and insights to track and improve communication effectiveness.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-24 px-4 bg-secondary-900/50">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-bold text-white mb-8">
              Seamless Integration with <span className="text-primary-400">play.ai</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
              BERDIE Consultant is powered by play.ai's advanced AI technology, ensuring reliable
              and intelligent communication capabilities.
            </p>
            <div className="bg-secondary-800/50 backdrop-blur p-8 rounded-xl shadow-lg inline-block">
              <p className="text-gray-400 mb-4">
                Configure your play.ai integration by adding your API keys to the Config (Secrets) area:
              </p>
              <pre className="bg-secondary-700 p-4 rounded-lg text-left text-sm text-gray-300">
                <code>
                  PLAY_AI_API_KEY=your_api_key_here
                  <br />
                  PLAY_AI_AGENT_ID=your_agent_id_here
                </code>
              </pre>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
