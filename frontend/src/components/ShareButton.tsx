import React from "react";
import { Share2 } from "lucide-react";

interface Props {
  quote: string;
  author: string;
  platform: "twitter" | "facebook" | "linkedin";
}

export function ShareButton({ quote, author, platform }: Props) {
  const getShareUrl = () => {
    const baseUrl = "https://www.bertiefoundation.org";
    const text = encodeURIComponent(`"${quote}" - ${author} | Join us at The Nest Hub`);
    
    switch (platform) {
      case "twitter":
        return `https://twitter.com/intent/tweet?text=${text}&url=${baseUrl}`;
      case "facebook":
        return `https://www.facebook.com/sharer/sharer.php?u=${baseUrl}&quote=${text}`;
      case "linkedin":
        return `https://www.linkedin.com/shareArticle?mini=true&url=${baseUrl}&title=The%20Nest%20Hub&summary=${text}`;
      default:
        return "#";
    }
  };

  const getPlatformColor = () => {
    switch (platform) {
      case "twitter":
        return "hover:bg-[#1DA1F2] hover:border-[#1DA1F2]";
      case "facebook":
        return "hover:bg-[#4267B2] hover:border-[#4267B2]";
      case "linkedin":
        return "hover:bg-[#0077b5] hover:border-[#0077b5]";
      default:
        return "";
    }
  };

  return (
    <button
      onClick={() => window.open(getShareUrl(), "_blank")}
      className={`p-2 rounded-full border border-gray-600 text-gray-400
                  hover:text-white transition-all duration-300 ${getPlatformColor()}`}
      aria-label={`Share on ${platform}`}
    >
      <Share2 size={16} />
    </button>
  );
}
