import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "../components/Layout";
import { Calendar, Video } from "lucide-react";
import { VideoDialog } from "../components/VideoDialog";
import { ExpandableCard } from "../components/ExpandableCard";

interface TimelineEventProps {
  date: string;
  title: string;
  description?: string;
  videoUrl?: string;
  isHighlight?: boolean;
}

const TimelineConnector = () => (
  <div className="relative h-32 my-12">
    <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-500 to-[#FF4C4C] transform -translate-x-1/2">
      <div className="absolute top-0 left-1/2 w-4 h-4 bg-primary-500 rounded-full transform -translate-x-1/2 animate-pulse" />
      <div className="absolute bottom-0 left-1/2 w-4 h-4 bg-[#FF4C4C] rounded-full transform -translate-x-1/2 animate-pulse" />
    </div>
  </div>
);

const TimelineEvent: React.FC<TimelineEventProps> = ({
  date,
  title,
  description,
  videoUrl,
  isHighlight = false,
}) => {
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  return (
    <motion.div
      className={`relative p-6 rounded-xl ${isHighlight ? 'bg-[#0f172a] border-2 border-[#1e293b]' : 'bg-[#0f172a] border border-[#1e293b]'}
        hover:shadow-lg hover:shadow-primary-500/10 transition-all duration-300
        group backdrop-blur-sm`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* Date Badge */}
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-5 h-5 text-primary-400" />
        <span className="text-primary-400 font-medium">{date}</span>
      </div>

      {/* Content */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary-500/20 to-[#FF4C4C]/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <h3 className="relative text-xl font-display font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">{title}</h3>
      </div>
      {description && (
        <p className="text-gray-300 mb-4 group-hover:text-gray-200 transition-colors">{description}</p>
      )}

      {/* Video Link */}
      {videoUrl && (
        <>
          <button
            onClick={() => setIsVideoDialogOpen(true)}
            className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors"
          >
            <Video className="w-5 h-5" />
            <span>Watch Video</span>
          </button>
          
          <VideoDialog
            isOpen={isVideoDialogOpen}
            videoUrl={videoUrl}
            title={title}
            date={date}
            description={description}
            onClose={() => setIsVideoDialogOpen(false)}
          />
        </>
      )}
    </motion.div>
  );
};

const bertieFoundationEvents: TimelineEventProps[] = [
  {
    date: "April 2026",
    title: "Banglamung Home for Boys",
    description: "The first of three donation events for the boys home in 2026.",
    videoUrl: "https://www.youtube.com/embed/8fJWIztETCQ",
    isHighlight: true,
  },
  {
    date: "January 2026",
    title: "MERCY Foundation",
    description: "Teaming up with MERCY Pattaya to give to an underserved community in Pattaya.",
    videoUrl: "https://www.youtube.com/embed/6jU70GIOH3w",
  },
  {
    date: "December 2025",
    title: "Animal Army",
    description: "Our first visit and donation to Animal Army.",
    videoUrl: "https://www.youtube.com/embed/Rv5fwgWjHs4",
  },
  {
    date: "October 2025",
    title: "Fountain of Life Women's Center",
    description: "Returning to where Bertie started with another donation.",
    videoUrl: "https://www.youtube.com/embed/ZOQsPpJpfY8",
    isHighlight: true,
  },
  {
    date: "August 2025",
    title: "Hand to Hand Foundation",
    description: "Food and hygiene products for those in need for Thai Mother's Day.",
    videoUrl: "https://www.youtube.com/embed/6TZtDs6Z7_s",
  },
  {
    date: "July 2025",
    title: "Chaleo-Pavana Memorial School",
    description: "Our first visit and donation to Chaleo-Pavana Memorial School.",
    videoUrl: "https://www.youtube.com/embed/DQX8GsOL-38",
  },
  {
    date: "June 2025",
    title: "Baan Kru Boonchoo Home for Special Needs Children",
    description: "Our first visit and donation to Baan Kru Boonchoo.",
    videoUrl: "https://www.youtube.com/embed/IghReLv-LeE",
  },
  {
    date: "May 2025",
    title: "Glory Hut Foundation",
    description: "Our first official donation event at Glory Hut, after nearly a year of friendship.",
    videoUrl: "https://www.youtube.com/embed/vdu7qaESn-o",
    isHighlight: true,
  },
  {
    date: "April 2025",
    title: "Father Ray's Children's Village",
    description: "A donation and a pizza party with the help of Dank Pizza and Cafe.",
    videoUrl: "https://www.youtube.com/embed/60DCHc5bKHA",
  },
  {
    date: "March 2025",
    title: "Take Care Kids Foundation at Underwater World Pattaya",
    description: "Bertie's first ever field trip, with a pizza party and treat bags.",
    videoUrl: "https://www.youtube.com/embed/XohHEfowLYs",
  },
  {
    date: "February 2025",
    title: "Anti Human Trafficking and Child Abuse Centre (ATCC)",
    description: "Food, toys, and plumbing supplies for their garden.",
    videoUrl: "https://www.youtube.com/embed/FbnaBUAUXbQ",
  },
  {
    date: "January 2025",
    title: "Human Help Network",
    description: "Food, toys, backpacks, and school supplies.",
    videoUrl: "https://www.youtube.com/embed/fS5U73D7yQ8",
  },
  {
    date: "December 2024",
    title: "December Celebrations 2024",
    isHighlight: true,
  },
  {
    date: "December 2024",
    title: "The Redemptorist Foundation for People with Disabilities",
    description: "Unofficial events for Fountain of Life Women's Center, Fountain of Life Children's Center, Glory Hut, and Take Care Kids",
    isHighlight: true,
  },
  {
    date: "November 2024",
    title: "Bang Lamung Hospital on behalf of Nurse Oi",
    description: "Unofficial Hand to Hand's Christmas Stockings",
  },
  {
    date: "October 2024",
    title: "58:12 Foundation",
    videoUrl: "https://www.youtube.com/embed/5hQbCBUD83U",
  },
  {
    date: "September 2024",
    title: "Baan Jing Jai and Fountain of Life Children's Center",
    videoUrl: "https://www.youtube.com/embed/tow_Bj-Ay_Y",
  },
  {
    date: "August 2024",
    title: "Direct donations to local mothers with Hand to Hand",
    description: "Unofficial Hand to Hand preschool",
    videoUrl: "https://www.youtube.com/embed/aPMSPyz3fbU",
    isHighlight: true,
  },
  {
    date: "July 2024",
    title: "Bang Lamung Development Center for Older Persons",
    videoUrl: "https://www.youtube.com/embed/5Yp6DV0_3pM",
    isHighlight: true,
  },
  {
    date: "June 2024",
    title: "Father Ray's Children Village and CPDC",
    videoUrl: "https://www.youtube.com/embed/tzC1PXNXcFk",
  },
  {
    date: "May 2024",
    title: "Bang Lamung Hospital",
  },
  {
    date: "April 2024",
    title: "Bang Lamung Boys Home",
    videoUrl: "https://www.youtube.com/embed/S_ycApO7ljU",
  },
  {
    date: "March 2024",
    title: "Karunyawet Home for Persons with Disabilities",
    videoUrl: "https://www.youtube.com/embed/JqxA-AY3bK8",
    description: "Video Promo: January to March 2024",
    isHighlight: true,
  },
  {
    date: "February 2024",
    title: "Child Protection and Development Center (CPDC)",
  },
  {
    date: "January 2024",
    title: "Fountain of Life Women's Center",
  },
];

const shyRogersEvents: TimelineEventProps[] = [
  {
    date: "December 2023",
    title: "Take Care Kids",
    description: "Providing support and resources to vulnerable children",
  },
  {
    date: "November 2023",
    title: "Human Help Network",
    description: "Collaborating with local organizations to maximize community impact",
  },
  {
    date: "October 2023",
    title: "Hand to Hand",
    description: "Direct assistance to families in need within our community",
  },
  {
    date: "September 2023",
    title: "Redemption Foundation for People with Disabilities",
    description: "Supporting services for individuals with disabilities",
  },
  {
    date: "August 2023",
    title: "Hope for Strays & ATCC",
    description: "Support provided to Hope for Strays and the Anti Human Trafficking and Child Abuse Center",
  },
  {
    date: "July 2023",
    title: "Center for Older Persons",
    description: "Assisting elderly community members with social activities and care",
  },
  {
    date: "June 2023",
    title: "Pattaya Orphanage",
    description: "Providing supplies and support to orphaned children",
  },
];

export default function History() {
  return (
    <Layout>

      {/* Hero Section - Styled like OurStory */}
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
              History of Events
            </h1>
            <p className="text-2xl text-gray-300 max-w-3xl mx-auto">
              A timeline of BERTIE's contributions and impact in our community.
              Together, we're making a difference one event at a time.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2025 Events Calendar */}
      <section className="container mx-auto px-4 py-24 relative">
        <motion.div
          className="mb-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-16 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#FF4C4C]/5 via-transparent to-primary-500/5 blur-3xl" />
            <motion.h2
              className="text-4xl font-display font-bold text-[#FF4C4C] mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              2025 Events
            </motion.h2>
            <motion.div
              className="w-32 h-1 bg-gradient-to-r from-[#FF4C4C] to-primary-500 mx-auto rounded-full"
              initial={{ width: 0 }}
              whileInView={{ width: 128 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
          </div>

          {/* First Half of 2025 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-6">
            {[
              { 
                month: 'January', 
                icon: '🎉', 
                date: '6 Jan',
                events: [
                  { date: '6 Jan 2025', title: 'General Public Meeting', highlight: false },
                  { date: '20 Jan 2025', title: 'Monthly Leadership Meeting', highlight: true },
                ]
              },
              { 
                month: 'February', 
                icon: '💝', 
                date: '3 Feb',
                events: [
                  { date: '3 Feb 2025', title: 'General Public Meeting', highlight: false },
                  { date: '17 Feb 2025', title: 'Monthly Leadership Meeting', highlight: true },
                ]
              },
              { 
                month: 'March', 
                icon: '🌸', 
                date: '3 Mar',
                events: [
                  { date: '3 Mar 2025', title: 'General Public Meeting', highlight: false },
                  { date: '17 Mar 2025', title: 'Monthly Leadership Meeting', highlight: true },
                  { date: '26 Mar 2025', title: 'New Member Shirt Presentation', highlight: false, color: 'green' },
                ]
              },
              { 
                month: 'April', 
                icon: '🌺', 
                date: '7 Apr',
                events: [
                  { date: '7 Apr 2025', title: 'General Public Meeting', highlight: false },
                  { date: '21 Apr 2025', title: 'Monthly Leadership Meeting', highlight: true },
                ]
              },
              { 
                month: 'May', 
                icon: '🌟', 
                date: '5 May',
                events: [
                  { date: '5 May 2025', title: 'General Public Meeting', highlight: false },
                  { date: '19 May 2025', title: 'Monthly Leadership Meeting', highlight: true },
                ]
              },
              { 
                month: 'June', 
                icon: '☀️', 
                date: '2 Jun',
                events: [
                  { date: '2 Jun 2025', title: 'General Public Meeting', highlight: false },
                  { date: '16 Jun 2025', title: 'Monthly Leadership Meeting', highlight: true },
                ]
              },
            ].map((item) => (
              <div key={item.month} className="bg-white border border-gray-200 dark:bg-secondary-800 dark:border-secondary-700 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-300">
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-primary-900 dark:text-white">{item.month} <span className="text-gray-500 dark:text-gray-400">2025</span></h3>
                    <span className="text-3xl">{item.icon}</span>
                  </div>
                  <div className="space-y-3">
                    {item.events.map((event, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <span className={`w-3 h-3 mt-1.5 ${event.color === 'green' ? 'bg-green-500' : event.highlight ? 'bg-[#FF4C4C]' : 'bg-primary-500'} rounded-full flex-shrink-0`} />
                        <div>
                          <p className="font-medium dark:text-white">{event.title}</p>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">{event.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Second Half of 2025 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {[
              { month: 'July', icon: '🌅', date: '7 Jul', 
                events: [
                  { date: '7 Jul 2025', title: 'General Public Meeting', highlight: false },
                  { date: '21 Jul 2025', title: 'Monthly Leadership Meeting', highlight: true },
                  { date: '30 Jul 2025', title: 'New Member Shirt Presentation', highlight: false, color: 'green' },
                ]
              },
              { month: 'August', icon: '🌈', date: '4 Aug',
                events: [
                  { date: '4 Aug 2025', title: 'General Public Meeting', highlight: false },
                  { date: '18 Aug 2025', title: 'Monthly Leadership Meeting', highlight: true },
                  { date: '27 Aug 2025', title: 'New Member Shirt Presentation', highlight: false, color: 'green' },
                ]
              },
              { month: 'September', icon: '🍂', date: '1 Sep',
                events: [
                  { date: '1 Sep 2025', title: 'General Public Meeting', highlight: false },
                  { date: '15 Sep 2025', title: 'Monthly Leadership Meeting', highlight: true },
                  { date: '24 Sep 2025', title: 'New Member Shirt Presentation', highlight: false, color: 'green' },
                ]
              },
              { month: 'October', icon: '🎃', date: '6 Oct',
                events: [
                  { date: '6 Oct 2025', title: 'General Public Meeting', highlight: false },
                  { date: '20 Oct 2025', title: 'Monthly Leadership Meeting', highlight: true },
                  { date: '29 Oct 2025', title: 'New Member Shirt Presentation', highlight: false, color: 'green' },
                ]
              },
              { month: 'November', icon: '🍁', date: '3 Nov',
                events: [
                  { date: '3 Nov 2025', title: 'General Public Meeting', highlight: false },
                  { date: '17 Nov 2025', title: 'Monthly Leadership Meeting', highlight: true },
                  { date: '26 Nov 2025', title: 'New Member Shirt Presentation', highlight: false, color: 'green' },
                ]
              },
              { month: 'December', icon: '❄️', date: '1 Dec',
                events: [
                  { date: '1 Dec 2025', title: 'General Public Meeting', highlight: false },
                  { date: '15 Dec 2025', title: 'Monthly Leadership Meeting', highlight: true },
                  { date: '17 Dec 2025', title: 'New Member Shirt Presentation', highlight: false, color: 'green' },
                ]
              },
            ].map((item) => (
              <div key={item.month} className="bg-white border border-gray-200 dark:bg-secondary-800 dark:border-secondary-700 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-300">
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-primary-900 dark:text-white">{item.month} <span className="text-gray-500 dark:text-gray-400">2025</span></h3>
                    <span className="text-3xl">{item.icon}</span>
                  </div>
                  <div className="space-y-3">
                    {item.events.map((event, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <span className={`w-3 h-3 mt-1.5 ${event.color === 'green' ? 'bg-green-500' : event.highlight ? 'bg-[#FF4C4C]' : 'bg-primary-500'} rounded-full flex-shrink-0`} />
                        <div>
                          <p className="font-medium dark:text-white">{event.title}</p>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">{event.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>


      {/* Timeline Section */}
      <div className="container mx-auto px-4 py-24 relative">
        {/* Timeline Background Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-secondary-700/30 transform -translate-x-1/2 z-0" />
        {/* The Bertie Foundation Era */}
        <motion.div
          className="mb-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-16 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-primary-500/5 blur-3xl" />
            <motion.h2
              className="text-4xl font-display font-bold text-[#FF4C4C] mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              As The Bertie Foundation
            </motion.h2>
            <motion.div
              className="w-32 h-1 bg-gradient-to-r from-purple-500 to-primary-500 mx-auto rounded-full"
              initial={{ width: 0 }}
              whileInView={{ width: 128 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bertieFoundationEvents.map((event, index) => (
              <TimelineEvent key={index} {...event} />
            ))}
          </div>
        </motion.div>

        {/* Era Connector */}
        <TimelineConnector />

        {/* Shy Rogers and Friends Era */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-16 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-transparent to-[#FF4C4C]/5 blur-3xl" />
            <motion.h2
              className="text-4xl font-display font-bold text-[#FF4C4C] mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              As Shy Rogers and Friends
            </motion.h2>
            <motion.div
              className="w-32 h-1 bg-gradient-to-r from-primary-500 to-[#FF4C4C] mx-auto rounded-full"
              initial={{ width: 0 }}
              whileInView={{ width: 128 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {shyRogersEvents.map((event, index) => (
              <TimelineEvent key={index} {...event} />
            ))}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
