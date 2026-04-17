import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Props {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
  visible: boolean;
}

export function Toast({ 
  message, 
  type = 'success', 
  duration = 5000, 
  onClose,
  visible 
}: Props) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          setIsExiting(false);
          onClose();
        }, 300); // Animation duration
      }, duration);
  
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);

  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800';
      case 'error':
        return 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800';
      case 'info':
        return 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div 
        className={`${getBgColor()} border rounded-lg shadow-lg p-4 max-w-md transform transition-all duration-300 ${isExiting ? 'translate-y-2 opacity-0' : 'translate-y-0 opacity-100'}`}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 flex-1 pt-0.5">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              type="button"
              className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={() => {
                setIsExiting(true);
                setTimeout(onClose, 300);
              }}
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
