import { motion } from "framer-motion";
import { Layout } from "../components/Layout";
import { Mail, Phone, MapPin, Clock, Facebook, Twitter, Instagram, Linkedin, Youtube, Globe, X } from "lucide-react";
import { Button } from "../components/Button";
import { apiClient } from "app";
import { useState } from "react";

export default function ContactUs() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    category: ""
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const response = await apiClient.submit_contact({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        category: formData.category || "general"
      });

      if (response.ok) {
        setSuccess(true);
        setFormData({ name: "", email: "", subject: "", message: "", category: "" });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to submit form");
      }
    } catch (error) {
      console.error("Error submitting contact form:", error);
      setError("There was an error submitting your message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="bg-white">
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
              Let's Connect
            </h1>
            <div className="space-y-4 max-w-3xl mx-auto">
              <p className="text-2xl text-gray-300">
                We're here to help and answer any questions you might have.
              </p>
              <p className="text-xl text-gray-300">
                Looking forward to hearing from you!
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-24 -mt-20">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2">
            {/* Info Cards */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Office Hours Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-[#2563EB] rounded-xl p-8 shadow-lg relative overflow-hidden group border border-blue-400"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-purple-500/10 transform group-hover:scale-105 transition-transform duration-500" />
                <div className="relative z-10">
                  <div className="bg-primary-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                    <Clock className="text-[#FF4C4C]" size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">Office Hours</h2>
                  <div className="space-y-3 text-gray-300">
                    <p><span className="text-white font-medium">Monday - Friday:</span> 9:00 AM - 4:00 PM</p>
                    <p><span className="text-white font-medium">Saturday - Sunday:</span> Closed</p>
                    <p className="flex items-center">
                      <Phone className="text-[#FF4C4C] mr-2" size={16} />
                      <span className="text-white font-medium">+66 97 343 2151</span>
                    </p>
                    <p className="text-base text-white mt-2 font-bold">Please note: All times are in Thailand Time (GMT+7).</p>
                  </div>
                </div>
              </motion.div>

              {/* Email Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-[#2563EB] rounded-xl p-8 shadow-lg relative overflow-hidden group border border-blue-400"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-primary-500/10 transform group-hover:scale-105 transition-transform duration-500" />
                <div className="relative z-10">
                  <div className="bg-blue-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                    <Mail className="text-[#FF4C4C]" size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">Email Us</h2>
                  <div className="space-y-3 text-gray-300">
                    <p><span className="text-white font-medium">Email:</span><br />info@bertiefoundation.org</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Contact Form Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-[#2563EB] rounded-xl p-8 shadow-lg relative overflow-hidden border border-blue-400 max-w-xl mx-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-purple-500/5 to-blue-500/5 transform hover:scale-105 transition-transform duration-500" />
              <div className="relative z-10">
                <h2 className="text-3xl font-bold text-white mb-8 text-center">Send us a Message</h2>
                
                {success ? (
                  <motion.div 
                    className="text-center py-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-8 h-8 text-primary-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
                    <p className="text-gray-300 mb-6">
                      Thank you for reaching out. We'll get back to you soon.
                    </p>
                    <Button 
                      onClick={() => setSuccess(false)}
                      className="mt-4"
                    >
                      Send Another Message
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="mt-6">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300">Name</label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-1 block w-full px-4 py-2 rounded-lg bg-primary-900 border border-secondary-700 text-white focus:outline-none focus:border-primary-500 transition-colors shadow-sm"
                      required
                    />
                  </div>
                  <div className="mt-6">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-1 block w-full px-4 py-2 rounded-lg bg-primary-900 border border-secondary-700 text-white focus:outline-none focus:border-primary-500 transition-colors shadow-sm"
                      required
                    />
                  </div>
                  <div className="mt-6">
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-300">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      id="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="mt-1 block w-full px-4 py-2 rounded-lg bg-primary-900 border border-secondary-700 text-white focus:outline-none focus:border-primary-500 transition-colors shadow-sm"
                      required
                    />
                  </div>
                  <div className="mt-6">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-300">Category</label>
                    <select
                      id="category"
                      name="category"
                      required
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg bg-primary-900 border border-secondary-700 text-white focus:outline-none focus:border-primary-500 transition-colors appearance-none"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="volunteer">Volunteering</option>
                      <option value="donation">Donations</option>
                      <option value="partnership">Partnership</option>
                      <option value="support">Support</option>
                    </select>
                  </div>
                  <div className="mt-6">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg bg-primary-900 border border-secondary-700 text-white focus:outline-none focus:border-primary-500 transition-colors"
                    ></textarea>
                  </div>

                  {error && (
                    <div className="text-red-400 text-sm mb-4">{error}</div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2" />
                        Sending...
                      </span>
                    ) : (
                      "Send Message"
                    )}
                  </Button>
                </form>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 space-y-8">
            {/* Connect Online Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-[#2563EB] rounded-xl p-8 shadow-lg relative overflow-hidden group border border-blue-400"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 transform group-hover:scale-105 transition-transform duration-500" />
              <div className="relative z-10">
                <div className="bg-purple-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                  <Globe className="text-[#FF4C4C]" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Connect Online</h2>
                <div className="grid grid-cols-2 gap-6">
                  <motion.a 
                    href="https://www.instagram.com/bertie_foundation/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex flex-col items-center space-y-2 group"
                    whileHover={{ scale: 1.1, y: -2 }}
                  >
                    <div className="p-2 rounded-lg bg-primary-900 hover:bg-primary-800 text-[#FF4C4C] hover:text-[#FF4C4C]/80 transition-all duration-300 group">
                      <Instagram size={24} className="transform group-hover:rotate-12 transition-transform duration-300" />
                    </div>
                    <span className="text-sm text-gray-300">Instagram</span>
                  </motion.a>
                  <motion.a 
                    href="https://www.linkedin.com/company/bertie-foundation/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex flex-col items-center space-y-2 group"
                    whileHover={{ scale: 1.1, y: -2 }}
                  >
                    <div className="p-2 rounded-lg bg-primary-900 hover:bg-primary-800 text-[#FF4C4C] hover:text-[#FF4C4C]/80 transition-all duration-300 group">
                      <Linkedin size={24} className="transform group-hover:rotate-12 transition-transform duration-300" />
                    </div>
                    <span className="text-sm text-gray-300">LinkedIn</span>
                  </motion.a>
                  <motion.a 
                    href="https://x.com/BertieFndtn" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex flex-col items-center space-y-2 group"
                    whileHover={{ scale: 1.1, y: -2 }}
                  >
                    <div className="p-2 rounded-lg bg-primary-900 hover:bg-primary-800 text-[#FF4C4C] hover:text-[#FF4C4C]/80 transition-all duration-300 group">
                      <X size={24} className="transform group-hover:rotate-12 transition-transform duration-300" />
                    </div>
                    <span className="text-sm text-gray-300">Twitter</span>
                  </motion.a>
                  <motion.a 
                    href="https://www.youtube.com/@BertieFoundation" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex flex-col items-center space-y-2 group"
                    whileHover={{ scale: 1.1, y: -2 }}
                  >
                    <div className="p-2 rounded-lg bg-primary-900 hover:bg-primary-800 text-[#FF4C4C] hover:text-[#FF4C4C]/80 transition-all duration-300 group">
                      <Youtube size={24} className="transform group-hover:rotate-12 transition-transform duration-300" />
                    </div>
                    <span className="text-sm text-gray-300">YouTube</span>
                  </motion.a>
                </div>
              </div>
            </motion.div>

            {/* QR Code */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="bg-white rounded-xl p-8 shadow-lg flex flex-col items-center"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Scan to Connect on LINE</h3>
              <img 
                src="https://static.databutton.com/public/65360aa8-19c8-4d03-b56c-9401fdbd71f8/QR CODE (BERTIE).jpeg" 
                alt="LINE QR Code" 
                className="w-full max-w-xs rounded-lg"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
