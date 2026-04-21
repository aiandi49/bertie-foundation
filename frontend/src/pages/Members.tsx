import React from "react";
import { motion } from "framer-motion";
import { Navigation } from "../components/Navigation";
import { AppLayout } from "../components/AppLayout";

interface MemberCardProps {
  name: string;
  nickname?: string;
  title: string;
  imageUrl: string;
  level: "administration" | "advisory" | "member" | "previous";
  roleDescription?: string;
}

const MemberCard: React.FC<MemberCardProps> = ({ name, nickname, title, imageUrl, level, roleDescription }) => {
  const baseClasses = `
    relative overflow-hidden rounded-xl p-6
    transition-all duration-500
    hover:transform hover:scale-105
    group min-h-[320px] flex flex-col justify-between
    bg-blue-600 shadow-lg
  `;

  // Using same blue background for all cards with different accent colors
  // Since everyone is now "member", we can simplify or just keep the generic blue
  const levelClasses = {
    administration: "ring-2 ring-blue-400/50", // Changed to blue
    advisory: "ring-2 ring-blue-400/50", // Changed to blue
    member: "ring-2 ring-blue-400/50",
    previous: "ring-2 ring-gray-500/50",
  };

  return (
    <motion.div
      className={`${baseClasses} ${levelClasses[level]}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Profile Image Container */}
      <div className="relative mb-4 flex justify-center">
        <div className={`absolute inset-0 bg-gradient-to-r rounded-full opacity-70 blur-xl transition-all duration-500 ${level === "administration" ? "from-red-500/60 via-blue-500/40 to-purple-500/60" : "from-blue-500/60 to-purple-500/60"}`} />
        <div className="relative w-32 h-32">
          <img
            src={imageUrl || "/images/bertie-logo.jpg"}
            alt={name}
            className={`w-full h-full ${imageUrl ? 'object-cover rounded-full border-4 border-white/20' : 'object-contain rounded-lg'} 
                     group-hover:border-red-500/50 transition-colors duration-500`}
          />
        </div>
      </div>

      {/* Member Info */}
      <div className="relative text-center z-10 mt-4">
        <h3 className="text-xl font-display font-bold text-white mb-2">
          {name}
          {nickname && (
            <span className="text-red-500 ml-2">({nickname})</span>
          )}
        </h3>
        <div className="space-y-2">
          <p className="text-blue-300 font-medium">{title}</p>
          {roleDescription && (
            <p className="text-white text-lg font-semibold italic px-4">{roleDescription}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Consolidated members list
const allActiveMembers = [
  // Administration Board (converted to Members)
  {
    name: "Shy Rogers",
    title: "Member",
    imageUrl: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/images/shy.jpeg",
  },
  {
    name: "Peter Smith",
    nickname: "Pete",
    title: "Member",
    imageUrl: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/images/peter.jpeg",
  },
  {
    name: "Reginald Cuffy",
    nickname: "Reggie",
    title: "Member",
    imageUrl: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/images/reggie.jpeg",
  },
  {
    name: "Lindiwe Ndlovu",
    nickname: "MsLee",
    title: "Member",
    imageUrl: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/images/mslee.jpeg",
  },
  // Advisory Board (converted to Members)
  {
    name: "Allan Hill",
    nickname: "Al",
    title: "Member",
    imageUrl: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/images/al.jpeg",
  },
  {
    name: "DonCosta Seawell",
    nickname: "DC",
    title: "Member",
    imageUrl: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/images/dc.jpeg",
  },
  {
    name: "Pat Patterson",
    title: "Member",
    imageUrl: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/images/pat.jpeg",
  },
  {
    name: "Nate Ross",
    title: "Member",
    imageUrl: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/images/nate.jpeg",
  },
  // Existing Members
  { name: "Anthony Franklin", nickname: "Tony", title: "Member", imageUrl: "" },
  { name: "Anna Chalk", title: "Member", imageUrl: "" },
  { name: "Auggie Karcher", title: "Member", imageUrl: "" },
  { name: "Bernard Smith", title: "Member", imageUrl: "" },
  { name: "Carl Lockett", title: "Member", imageUrl: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/images/carl.jpeg" },
  { name: "Carol Popp", title: "Member", imageUrl: "" },
  { name: "Steve Reyes", title: "Member", imageUrl: "" },
  { name: "Chrissie Katz", title: "Member", imageUrl: "" },
  { name: "Cornell Sandifer", title: "Member", imageUrl: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/images/cornell.jpeg" },
  { name: "Daniel Powell", nickname: "Dan", title: "Member", imageUrl: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/images/dan.jpeg" },
  { name: "Dyrick Fowler", nickname: "Dee", title: "Member", imageUrl: "" },
  { name: "Fang Chokchai", title: "Member", imageUrl: "" },
  { name: "Gregory Faison", title: "Member", imageUrl: "" },
  { name: "Harold W Hill Jr", nickname: "JR", title: "Member", imageUrl: "" },
  { name: "Jefferey Norris", title: "Member", imageUrl: "" },
  { name: "Koi Sudwisai", title: "Member", imageUrl: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/images/koi.jpeg" },
  { name: "Lenny Yarde", title: "Member", imageUrl: "" },
  { name: "Maurice Mitchell", nickname: "M&M", title: "Member", imageUrl: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/images/maurice.jpeg" },
  { name: "Michael Alfred", nickname: "Mike", title: "Member", imageUrl: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/images/mike.jpeg" },
  { name: "Mike Henry", title: "Member", imageUrl: "" },
  { name: "Mike Popp", title: "Member", imageUrl: "" },
  { name: "Nnamdi Samuels", title: "Member", imageUrl: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/images/nnamdi.jpeg" },
  { name: "Rena Karcher", title: "Member", imageUrl: "" },
  { name: "Rich Smith", title: "Member", imageUrl: "" },
  { name: "Rich Strong", title: "Member", imageUrl: "" },
  { name: "Sam Alexander", title: "Member", imageUrl: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/images/sam.jpeg" },
  { name: "Sherman Hargrave", title: "Member", imageUrl: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/images/sherman.jpeg" },
  { name: "Skymas Bundi", nickname: "Sky", title: "Member", imageUrl: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/images/skymas.jpeg" },
  { name: "Tamika Smith", nickname: "Mikka", title: "Member", imageUrl: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/images/mikka.jpeg" },
  { name: "Tony Ford", title: "Member", imageUrl: "" },
  { name: "Tony Rock", title: "Member", imageUrl: "" },
  { name: "Tony Thomas", title: "Member", imageUrl: "" },
  { name: "Vernon Taylor", title: "Member", imageUrl: "" },
  { name: "Wil Weatherspoon", title: "Member", imageUrl: "" },
  { name: "Wainwright Jackson", title: "Member", imageUrl: "" },
].sort((a, b) => a.name.localeCompare(b.name));

const previousMembers = [
  { name: "Chicago", title: "Chief Operations Officer (COO)", imageUrl: "" },
  { name: "Will", title: "Member", imageUrl: "" },
  { name: "CJ", title: "Chief Marketing Officer (CMO)", imageUrl: "" },
  { name: "Parnum", title: "Member", imageUrl: "" },
  { name: "Tony", title: "Member", imageUrl: "" },
  { name: "Keith Mangram", title: "Member", imageUrl: "" },
];

export default function Members() {
  const [searchTerm, setSearchTerm] = React.useState("");
  // Set to false to hide Previous Members section
  const [showPreviousMembers] = React.useState(false);

  const searchAllMembers = () => {
    // Always search from the full list including previous members if needed, 
    // but usually search just filters the visible lists.
    // We'll search within allActiveMembers + previousMembers
    
    const allMembers = [
      ...allActiveMembers.map(m => ({ ...m, level: "member" as const })),
      ...previousMembers.map(m => ({ ...m, level: "previous" as const })),
    ];
    
    if (!searchTerm) return allActiveMembers.map(m => ({ ...m, level: "member" as const }));

    const searchTermLower = searchTerm.toLowerCase();
    return allMembers.filter(member => {
      const firstName = member.name.toLowerCase().split(' ')[0];
      const firstNameMatch = firstName.startsWith(searchTermLower);
      const nicknameMatch = member.nickname?.toLowerCase().startsWith(searchTermLower);
      const fullNameMatch = member.name.toLowerCase().includes(searchTermLower);
      
      return firstNameMatch || nicknameMatch || fullNameMatch;
    });
  };

  const displayedMembers = searchAllMembers();
  const isSearching = searchTerm.length > 0;

  return (
    <AppLayout>
      <Navigation />
      {/* Logo and Banner Section - Matching Our Story Style */}
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
            className="flex flex-col items-center justify-center"
          >
            {/* Headshot Image */}
            <div className="relative mb-16 w-40 h-40 flex justify-center items-center"> {/* Further increased bottom margin */}
              {/* Glow effect */}
              <div className="absolute -inset-2 bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 rounded-full opacity-80 blur-md animate-pulse-slow" />
              {/* Image container */} 
              <div className="relative w-full h-full flex justify-center items-center"> {/* Container for image */}
                <img
                  src="https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/images/memberlogo.jpeg"
                  alt="Bertie Foundation Highlight"
                  className="h-full w-auto object-contain rounded-xl border-4 border-white/20 bg-white/10" // Fill container, object-contain
                />
              </div>
            </div>
            
            {/* Foundation Name */}
            <h1 className="text-6xl md:text-7xl font-display font-bold text-white mb-6">
              The Bertie Foundation
            </h1>
            <p className="text-2xl text-gray-300 max-w-3xl mx-auto">
              Empowering communities through compassion, collaboration, and meaningful impact.
            </p>
          </motion.div>
        </div>
      </section>

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
              Our Team
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
              Meet the dedicated individuals who make our mission possible.
              Together, we're building a stronger community and creating lasting change.
            </p>

            {/* Search Box */}
            <div className="relative max-w-md mx-auto">
              <input
                type="text"
                placeholder="Search members by first name or nickname..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-3 bg-blue-700/50 border border-blue-500/50 rounded-full
                         text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/50
                         transition-all duration-300"
              />
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary-500/20 to-purple-500/20 rounded-full blur-lg opacity-0 transition-opacity duration-300 group-focus-within:opacity-100" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Members Grid */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-16 space-y-24">
        
          <motion.div
            className="mb-24"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-display font-bold text-[#FF4C4C] mb-4">
                Members
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-purple-500 mx-auto rounded-full" />
            </div>
            
            {displayedMembers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                {displayedMembers.map((member, index) => (
                  <MemberCard
                    key={index}
                    {...member}
                    level={member.level || "member"}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-blue-600 ring-2 ring-blue-400/50 text-center">
                <p className="text-xl text-gray-300">Sorry, member not found</p>
              </div>
            )}
          </motion.div>

        {/* Previous Members - Only show if not searching and toggle is on */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {showPreviousMembers && !isSearching && (
            <>
              <div className="text-center mb-12">
                <h2 className="text-4xl font-display font-bold text-white mb-4">
                  Previous Members
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-purple-500 mx-auto rounded-full" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 lg:gap-8">
                {previousMembers.map((member, index) => (
                  <MemberCard
                    key={index}
                    {...member}
                    level="previous"
                  />
                ))}
              </div>
            </>
          )}
        </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
