'use client';

import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuccessNotificationProps {
  message: string;
  onComplete?: () => void;
  duration?: number;
  className?: string;
}

const SuccessNotification: React.FC<SuccessNotificationProps> = ({
  message,
  onComplete,
  duration = 2000,
  className
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Delay showing content to allow animation to start
    const contentTimer = setTimeout(() => {
      setShowContent(true);
    }, 200);

    // Auto-hide after duration
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onComplete?.();
      }, 300); // Wait for fade out animation
    }, duration);

    return () => {
      clearTimeout(contentTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, onComplete]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none",
        className
      )}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />

      {/* Success Animation Container */}
      <div className="relative flex flex-col items-center">
        {/* Sonar Rings Animation */}
        <div className="relative mb-4">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping" />

          {/* Middle ring */}
          <div className="absolute inset-0 rounded-full border-2 border-green-300 animate-ping animation-delay-200" />

          {/* Inner ring */}
          <div className="absolute inset-0 rounded-full border-2 border-green-200 animate-ping animation-delay-400" />

          {/* Center circle with checkmark */}
          <div
            className={cn(
              "relative w-16 h-16 bg-green-500 rounded-full flex items-center justify-center transition-all duration-300",
              showContent ? "scale-100 opacity-100" : "scale-75 opacity-0"
            )}
          >
            <Check
              className={cn(
                "w-8 h-8 text-white transition-transform duration-300",
                showContent ? "scale-100" : "scale-75"
              )}
            />
          </div>
        </div>

        {/* Success Message */}
        <div
          className={cn(
            "bg-white rounded-lg px-6 py-3 shadow-lg transition-all duration-300",
            showContent ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )}
        >
          <p className="text-gray-900 font-medium text-center">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default SuccessNotification;
