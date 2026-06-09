import React, { useEffect, useRef } from "react";
import { VIDEOS } from "../pages/Videos";
import { MapPin } from "lucide-react";

// Helper: extract YouTube video ID and build thumbnail URL
const getYouTubeThumbnail = (video: { thumbnailUrl?: string; videoUrl: string }): string => {
  if (video.thumbnailUrl) return video.thumbnailUrl;
  const match = video.videoUrl.match(/(?:embed\/|v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return match ? `https://i.ytimg.com/vi/${match[1]}/hqdefault.jpg` : "";
};

// Group videos by year, sorted newest first
const groupByYear = (videos: typeof VIDEOS) => {
  const sorted = [...videos].sort((a, b) => {
    const yearA = parseInt(a.date.match(/\d{4}/)?.[0] ?? "0");
    const yearB = parseInt(b.date.match(/\d{4}/)?.[0] ?? "0");
    if (yearB !== yearA) return yearB - yearA;
    const months = ["january","february","march","april","may","june","july","august","september","october","november","december"];
    const monthA = months.findIndex(m => a.date.toLowerCase().includes(m));
    const monthB = months.findIndex(m => b.date.toLowerCase().includes(m));
    return monthB - monthA;
  });

  const groups: Record<string, typeof VIDEOS> = {};
  sorted.forEach(v => {
    const year = v.date.match(/\d{4}/)?.[0] ?? "Unknown";
    if (!groups[year]) groups[year] = [];
    groups[year].push(v);
  });
  return groups;
};

// Fade-in hook using IntersectionObserver
const useFadeIn = () => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.style.opacity = "1"; el.style.transform = "translateY(0)"; obs.unobserve(el); } },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
};

// Individual card
const EventCard: React.FC<{ event: typeof VIDEOS[0]; featured?: boolean }> = ({ event, featured }) => {
  const ref = useFadeIn();
  const thumb = getYouTubeThumbnail(event);

  if (featured) {
    return (
      <div
        ref={ref}
        style={{ opacity: 0, transform: "translateY(24px)", transition: "opacity 0.55s ease, transform 0.55s ease" }}
        className="col-span-full flex flex-col md:flex-row bg-secondary-800 border border-white/5 rounded-2xl overflow-hidden hover:-translate-y-1 hover:border-primary-500/40 hover:shadow-2xl transition-all duration-200 group"
      >
        <div className="relative md:w-96 flex-shrink-0 aspect-video md:aspect-auto overflow-hidden bg-secondary-900">
          {thumb && <img src={thumb} alt={event.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400" />}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 fill-gray-900 ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </div>
          <span className="absolute top-3 left-3 text-xs font-semibold tracking-widest uppercase bg-black/70 backdrop-blur-sm border border-white/10 text-primary-400 px-3 py-1 rounded-full">
            {event.date}
          </span>
        </div>
        <div className="p-7 flex flex-col justify-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-primary-400 bg-primary-500/10 px-3 py-1 rounded-full w-fit mb-3">
            <MapPin className="w-2.5 h-2.5" />{event.category}
          </span>
          <h3 className="text-xl font-bold text-white leading-snug mb-3">{event.title}</h3>
          <p className="text-sm text-gray-400 leading-relaxed line-clamp-4">{event.description}</p>
          {event.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
              {event.tags.map(tag => (
                <span key={tag} className="text-xs text-gray-500 bg-white/4 border border-white/6 rounded-full px-2.5 py-0.5">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      style={{ opacity: 0, transform: "translateY(24px)", transition: "opacity 0.55s ease, transform 0.55s ease" }}
      className="flex flex-col bg-secondary-800 border border-white/5 rounded-2xl overflow-hidden hover:-translate-y-1 hover:border-primary-500/40 hover:shadow-2xl transition-all duration-200 group"
    >
      <div className="relative aspect-video overflow-hidden bg-secondary-900">
        {thumb && <img src={thumb} alt={event.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400" />}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-11 h-11 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
            <svg className="w-4 h-4 fill-gray-900 ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
        <span className="absolute top-2.5 left-2.5 text-xs font-semibold tracking-widest uppercase bg-black/70 backdrop-blur-sm border border-white/10 text-primary-400 px-2.5 py-1 rounded-full">
          {event.date}
        </span>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-primary-400 bg-primary-500/10 px-2.5 py-1 rounded-full w-fit mb-3">
          <MapPin className="w-2.5 h-2.5" />{event.category}
        </span>
        <h3 className="text-sm font-semibold text-white leading-snug mb-2">{event.title}</h3>
        <p className="text-xs text-gray-400 leading-relaxed line-clamp-3 flex-1">{event.description}</p>
        {event.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-white/5">
            {event.tags.map(tag => (
              <span key={tag} className="text-xs text-gray-500 bg-white/4 border border-white/6 rounded-full px-2 py-0.5">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const PastDonations: React.FC = () => {
  const grouped = groupByYear(VIDEOS);
  const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="bg-secondary-950 text-white py-16">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-primary-400 bg-primary-500/10 border border-primary-500/20 px-4 py-2 rounded-full mb-5">
            <svg className="w-3.5 h-3.5 fill-red-500" viewBox="0 0 24 24"><path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/></svg>
            Our Impact Journey
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Who We've Helped</h2>
          <p className="text-lg text-gray-400 max-w-xl mx-auto">
            Every event, every donation, every life touched — our story from the very beginning.
          </p>

          {/* Stats row */}
          <div className="flex justify-center gap-12 mt-10 flex-wrap">
            {[
              { num: `${VIDEOS.length}+`, label: "Events" },
              { num: `${years.length}+`, label: "Years of Service" },
              { num: "10+", label: "Organisations Helped" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-4xl font-bold text-white">{s.num}</div>
                <div className="text-xs uppercase tracking-widest text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Year groups */}
        {years.map(year => {
          const events = grouped[year];
          return (
            <div key={year} className="mb-6">
              {/* Year header */}
              <div className="flex items-center gap-4 mb-10 pt-6">
                <span className="text-3xl font-bold text-white whitespace-nowrap">{year}</span>
                <div className="flex-1 h-px bg-gradient-to-r from-primary-500/40 to-transparent" />
                <span className="text-xs text-gray-500 whitespace-nowrap">{events.length} event{events.length !== 1 ? "s" : ""}</span>
              </div>

              {/* Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {events.map((event, i) => (
                  <EventCard key={i} event={event} featured={i === 0} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PastDonations;
