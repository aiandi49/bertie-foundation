import React from "react";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'text' | 'outline';
  size?: "xsmall" | "small" | "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  ...props
}: Props) {
  const baseStyles = "font-semibold rounded-lg transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantStyles = {
    success: 'bg-green-600 hover:bg-green-500 text-white border border-green-700 hover:border-green-600',
    primary: "bg-primary-600 text-white hover:bg-primary-700",
    secondary: "bg-secondary-700 text-white hover:bg-secondary-600",
    danger: "bg-red-600 text-white hover:bg-red-700",
    outline: "bg-transparent border-2 border-primary-500 text-primary-500 hover:bg-primary-500/10",
    text: "bg-transparent text-primary-500 hover:text-primary-400 shadow-none hover:shadow-none"
  };

  const sizeStyles = {
    xsmall: "px-2 py-1 text-xs",
    small: "px-3 py-1.5 text-sm",
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
