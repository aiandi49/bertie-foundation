import React from "react";

interface Props {
  className?: string;
}

export function BertieLogo({ className = "h-40" }: Props) {
  return (
    <div className={`relative w-auto flex justify-center items-center ${className}`}>
      <img
        src="/images/bertie-logo.jpg"
        alt="Bertie Foundation Logo"
        className="h-full w-auto object-contain rounded-xl shadow-2xl shadow-primary-400/40 hover:scale-105 transition-transform duration-300"
      />
    </div>
  );
}
