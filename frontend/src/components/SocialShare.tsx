import React from "react";
import { Facebook, Instagram, Link2, Linkedin } from "lucide-react";
import { trackEvent } from "../utils/analytics";

interface Props {
  title: string;
  url: string;
  description?: string;
}

export function SocialShare({ title, url, description }: Props) {
  const handleShare = async (platform: string) => {
    await trackEvent("social_share", "share_click", { platform });

    const shareText = `${title}${description ? ` - ${description}` : ""}`;
    let shareUrl = "";

    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case "instagram":
        // Instagram doesn't have a direct sharing API, we'll show a message or copy the URL
        try {
          await navigator.clipboard.writeText(url);
          alert("URL copied! Open Instagram and paste to share.");
        } catch (err) {
          console.error("Failed to copy URL:", err);
        }
        return;
      case "copy":
        try {
          await navigator.clipboard.writeText(url);
          // You might want to show a toast notification here
          console.log("URL copied to clipboard");
        } catch (err) {
          console.error("Failed to copy URL:", err);
        }
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => handleShare("twitter")}
        className="p-2 rounded-lg bg-primary-900 hover:bg-primary-800 text-[#FF4C4C] hover:text-[#FF4C4C]/80 transition-all duration-300 group"
        title="Share on Twitter"
      >
        {/* X icon (formerly Twitter) */}
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" 
          className="w-5 h-5 transform group-hover:rotate-12 transition-transform duration-300">
          <path d="M4 4l11.5 11.5M4 20L19 5" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      <button
        onClick={() => handleShare("facebook")}
        className="p-2 rounded-lg bg-primary-900 hover:bg-primary-800 text-[#FF4C4C] hover:text-[#FF4C4C]/80 transition-all duration-300 group"
        title="Share on Facebook"
      >
        <Facebook className="w-5 h-5 transform group-hover:rotate-12 transition-transform duration-300" />
      </button>
      <button
        onClick={() => handleShare("linkedin")}
        className="p-2 rounded-lg bg-primary-900 hover:bg-primary-800 text-[#FF4C4C] hover:text-[#FF4C4C]/80 transition-all duration-300 group"
        title="Share on LinkedIn"
      >
        <Linkedin className="w-5 h-5 transform group-hover:rotate-12 transition-transform duration-300" />
      </button>
      <button
        onClick={() => handleShare("instagram")}
        className="p-2 rounded-lg bg-primary-900 hover:bg-primary-800 text-[#FF4C4C] hover:text-[#FF4C4C]/80 transition-all duration-300 group"
        title="Share on Instagram"
      >
        <Instagram className="w-5 h-5 transform group-hover:rotate-12 transition-transform duration-300" />
      </button>
      <button
        onClick={() => handleShare("copy")}
        className="p-2 rounded-lg bg-primary-900 hover:bg-primary-800 text-[#FF4C4C] hover:text-[#FF4C4C]/80 transition-all duration-300 group"
        title="Copy link"
      >
        <Link2 className="w-5 h-5 transform group-hover:rotate-12 transition-transform duration-300" />
      </button>
    </div>
  );
}

