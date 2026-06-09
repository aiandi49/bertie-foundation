import React, { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn } from "lucide-react";
import { Navigation } from "../components/Navigation";
import { AppLayout } from "../components/AppLayout";

interface MemberCardProps {
  objectPosition?: string;
  name: string;
  nickname?: string;
  title: string;
  imageUrl: string;
  level: "administration" | "advisory" | "member" | "previous";
  roleDescription?: string;
  onImageClick?: () => void;
}

const MemberCard: React.FC<MemberCardProps> = ({ name, nickname, title, imageUrl, level, roleDescription, objectPosition, onImageClick }) => {
  const baseClasses = `
    relative overflow-hidden rounded-xl p-6
    transition-all duration-500
    hover:transform hover:scale-105
    group min-h-[320px] flex flex-col justify-between
    bg-blue-600 shadow-lg
  `;

  const levelClasses = {
    administration: "ring-2 ring-blue-400/50",
    advisory: "ring-2 ring-blue-400/50",
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
          {imageUrl && onImageClick ? (
            <button
              onClick={onImageClick}
              className="relative w-full h-full rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white group/imgbtn"
              aria-label={`View full photo of ${name}`}
            >
              <img
                src={imageUrl}
                alt={name}
                style={objectPosition ? { objectPosition } : undefined}
                className="w-full h-full object-cover rounded-full border-4 border-white/20 group-hover/imgbtn:border-red-400/60 transition-colors duration-300"
              />
              <div className="absolute inset-0 rounded-full bg-black/0 group-hover/imgbtn:bg-black/35 transition-colors duration-300 flex items-center justify-center">
                <ZoomIn className="text-white opacity-0 group-hover/imgbtn:opacity-100 transition-opacity duration-300 drop-shadow-lg" size={22} />
              </div>
            </button>
          ) : (
            <img
              src={imageUrl || "/images/bertie-logo.jpg"}
              alt={name}
              style={objectPosition ? { objectPosition } : undefined}
              className={`w-full h-full ${imageUrl ? 'object-cover rounded-full border-4 border-white/20' : 'object-contain rounded-lg'} 
                       group-hover:border-red-500/50 transition-colors duration-500`}
            />
          )}
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

function MemberLightbox({ member, onClose }: { member: { name: string; nickname?: string; imageUrl: string; title: string; objectPosition?: string }; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: "rgba(5, 10, 25, 0.93)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-white bg-white/10 hover:bg-white/25 rounded-full p-2 transition-colors"
        aria-label="Close"
      >
        <X size={24} />
      </button>

      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.22 }}
        className="flex flex-col items-center gap-5 px-6"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={member.imageUrl}
          alt={member.name}
          style={{ ...(member.objectPosition ? { objectPosition: member.objectPosition } : {}), boxShadow: "0 0 80px rgba(0,0,0,0.7)" }}
          className="max-w-[85vw] max-h-[78vh] w-auto h-auto rounded-2xl shadow-2xl object-contain"
        />
        <div className="text-center">
          <p className="text-white text-xl font-bold">
            {member.name}
            {member.nickname && <span className="text-red-400 ml-2">({member.nickname})</span>}
          </p>
          <p className="text-white/50 text-sm mt-1">{member.title}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

const allActiveMembers = [
  { name: "Shy Rogers", title: "Member", imageUrl: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/images/shy.jpeg" },
  { name: "Peter Smith", nickname: "Pete", title: "Member", imageUrl: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/images/peter.jpeg" },
  { name: "Reginald Cuffy", nickname: "Reggie", title: "Member", imageUrl: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/images/reggie.jpeg" },
  { name: "Lindiwe Ndlovu", nickname: "MsLee", title: "Member", imageUrl: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/images/mslee.jpeg" },
  { name: "Allan Hill", nickname: "Al", title: "Member", imageUrl: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/images/al.jpeg" },
  { name: "DonCosta Seawell", nickname: "DC", title: "Member", imageUrl: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/images/dc.jpeg" },
  { name: "Pat Patterson", title: "Member", imageUrl: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/images/pat.jpeg" },
  { name: "Nate Ross", title: "Member", imageUrl: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/images/nate.jpeg" },
  { name: "Anthony Franklin", nickname: "Tony", title: "Member", imageUrl: "" },
  { name: "Anna Chalk", title: "Member", imageUrl: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/bertie/anna_chalk.jpeg", objectPosition: "center 35%" },
  { name: "Auggie Karcher", title: "Member", imageUrl: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/images/auggie.jpeg" },
  { name: "Bernard Smith", title: "Member", imageUrl: "" },
  { name: "Carl Lockett", title: "Member", imageUrl: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/images/carl.jpeg" },
  { name: "Carol Popp", title: "Member", imageUrl: "" },
  { name: "Steve Reyes", title: "Member", imageUrl: "" },
  { name: "Chrissie Katz", title: "Member", imageUrl: "" },
  { name: "Chom Hill", title: "Member", imageUrl: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/bertie/chom_jill.jpeg" },
  { name: "Cornell Sandifer", title: "Member", imageUrl: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/images/cornell.jpeg" },
  { name: "Daniel Powell", nickname: "Dan", title: "Member", imageUrl: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/images/dan.jpeg" },
  { name: "Dyrick Fowler", nickname: "Dee", title: "Member", imageUrl: "" },
  { name: "Fang Chokchai", title: "Member", imageUrl: "" },
  { name: "Gregory Faison", title: "Member", imageUrl: "" },
  { name: "Harold W Hill Jr", nickname: "JR", title: "Member", imageUrl: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/bertie/harold_w_hill_jr.jpeg", objectPosition: "center 17%" },
  { name: "Jefferey Norris", title: "Member", imageUrl: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/bertie/jefferey_norris.jpeg", objectPosition: "center 30%" },
  { name: "Koi Sudwisai", title: "Member", imageUrl: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/images/koi.jpeg" },
  { name: "Lenny Yarde", title: "Member", imageUrl: "" },
  { name: "Maurice Mitchell", nickname: "M&M", title: "Member", imageUrl: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/images/maurice.jpeg" },
  { name: "Michael Alfred", nickname: "Mike", title: "Member", imageUrl: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/bertie/michael_alfred.jpeg", objectPosition: "center 30%" },
  { name: "Mike Henry", title: "Member", imageUrl: "" },
  { name: "Mike Popp", title: "Member", imageUrl: "" },
  { name: "Nnamdi Samuels", title: "Member", imageUrl: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/images/nnamdi.jpeg" },
  { name: "Rena Karcher", title: "Member", imageUrl: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/bertie/rena_karcher.jpeg" },
  { name: "Rich Smith", title: "Member", imageUrl: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/bertie/rich_smith.jpeg", objectPosition: "center 30%" },
  { name: "Rich Strong", title: "Member", imageUrl: "" },
  { name: "Sam Alexander", title: "Member", imageUrl: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/images/sam.jpeg" },
  { name: "Sherman Hargrave", title: "Member", imageUrl: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/images/sherman.jpeg" },
  { name: "Skymas Bundi", nickname: "Sky", title: "Member", imageUrl: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/images/skymas.jpeg" },
  { name: "Tamika Smith", nickname: "Mikka", title: "Member", imageUrl: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/images/mikka.jpeg" },
  { name: "Tony Ford", title: "Member", imageUrl: "" },
  { name: "Tony Rock", title: "Member", imageUrl: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/bertie/tony_rock.jpeg", objectPosition: "center 20%" },
  { name: "Tony Thomas", title: "Member", imageUrl: "https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/bertie/tony_thomas.jpeg", objectPosition: "center 20%" },
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
  const [showPreviousMembers] = React.useState(false);
  const [lightboxMember, setLightboxMember] = React.useState<typeof allActiveMembers[0] | null>(null);

  const openMemberLightbox = useCallback((member: typeof allActiveMembers[0]) => {
    if (member.imageUrl) setLightboxMember(member);
  }, []);
  const closeMemberLightbox = useCallback(() => setLightboxMember(null), []);

  const searchAllMembers = () => {
    const allMembers = [
      ...allActiveMembers.map(m => ({ ...m, level: "member" as const })),
      ...previousMembers.map(m => ({ ...m, level: "previous" as const })),
    ];

    if (!searchTerm) return allActiveMembers.map(m => ({ ...m, level: "member" as const }));

    const searchTermLower = searchTerm.toLowerCase();
    return allMembers.filter(member => {
      const firstName = member.name.toLowerCase().split(' ')[0];
      const firstNameMatch = firstName.startsWith(searchTermLower);
      const nicknameMatch = (member as any).nickname?.toLowerCase().startsWith(searchTermLower);
      const fullNameMatch = member.name.toLowerCase().includes(searchTermLower);
      return firstNameMatch || nicknameMatch || fullNameMatch;
    });
  };

  const displayedMembers = searchAllMembers();
  const isSearching = searchTerm.length > 0;

  return (
    <AppLayout>
      <Navigation />
      {/* Logo and Banner Section */}
      <section className="relative bg-gradient-to-br from-primary-900 via-secondary-900 to-primary-800 py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary-500/10 to-transparent rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-500/10 to-transparent rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], rotate: [360, 180, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center justify-center"
          >
            <div className="relative mb-16 w-40 h-40 flex justify-center items-center">
              <div className="absolute -inset-2 bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 rounded-full opacity-80 blur-md animate-pulse-slow" />
              <div className="relative w-full h-full flex justify-center items-center">
                <img
                  src="https://zubuqhdelzdujuwtcyzx.supabase.co/storage/v1/object/public/images/memberlogo.jpeg"
                  alt="Bertie Foundation Highlight"
                  className="h-full w-auto object-contain rounded-xl border-4 border-white/20 bg-white/10"
                />
              </div>
            </div>

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
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary-500/10 to-transparent rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-500/10 to-transparent rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], rotate: [360, 180, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
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
                    onImageClick={member.imageUrl ? () => openMemberLightbox(member) : undefined}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-blue-600 ring-2 ring-blue-400/50 text-center">
                <p className="text-xl text-gray-300">Sorry, member not found</p>
              </div>
            )}
          </motion.div>

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

      {/* Member Lightbox */}
      <AnimatePresence>
        {lightboxMember && (
          <MemberLightbox member={lightboxMember} onClose={closeMemberLightbox} />
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
