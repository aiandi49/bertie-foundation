import React from "react";

interface Props {
  className?: string;
}

export function BertieLogo({ className = "h-40" }: Props) {
  return (
    <div className={`relative w-auto flex justify-center items-center ${className}`}>
      <img
        src="https://static.databutton.com/public/65360aa8-19c8-4d03-b56c-9401fdbd71f8/new%20bertie%20logo%20borderless%20tall%20with%20slogan%20(1).jpg"
        alt="Bertie Foundation Logo"
        className="h-full w-auto object-contain rounded-xl shadow-2xl shadow-primary-400/40 hover:scale-105 transition-transform duration-300"
      />
    </div>
  );
}
