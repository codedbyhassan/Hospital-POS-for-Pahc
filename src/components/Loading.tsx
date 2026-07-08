import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Loading: React.FC<LoadingProps> = ({ className, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 md:w-8 md:h-8',
    md: 'w-12 h-12 md:w-16 md:h-16',
    lg: 'w-20 h-20 md:w-24 md:h-24'
  };

  const iconSizes = {
    sm: 'w-3 h-3 md:w-4 md:h-4',
    md: 'w-4 h-4 md:w-5 md:h-5',
    lg: 'w-5 h-5 md:w-6 md:h-6'
  };

  const particleSizes = {
    sm: 'w-0.5 h-0.5 md:w-1 md:h-1',
    md: 'w-1 h-1 md:w-1.5 md:h-1.5',
    lg: 'w-1.5 h-1.5 md:w-2 md:h-2'
  };

  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm", className)}>
      <div className="relative">
        {/* Outer rotating ring */}
        <div className={cn(
          "border-2 md:border-4 border-primary/20 rounded-full animate-spin",
          sizeClasses[size]
        )}>
          <div className="absolute top-0 left-0 w-full h-full border-2 md:border-4 border-transparent border-t-primary rounded-full animate-spin"
               style={{ animationDuration: '1.5s' }} />
        </div>

        {/* Inner pulsing medical cross */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Horizontal bar */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={cn("bg-primary rounded-full animate-pulse", iconSizes[size])}
                   style={{ animationDelay: '0s', animationDuration: '2s' }} />
            </div>
            {/* Vertical bar */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={cn("bg-primary rounded-full animate-pulse", iconSizes[size])}
                   style={{ animationDelay: '0.5s', animationDuration: '2s' }} />
            </div>
            {/* Center dot */}
            <div className={cn("bg-primary rounded-full animate-ping", particleSizes[size])}
                 style={{ animationDelay: '1s', animationDuration: '1.5s' }} />
          </div>
        </div>

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={cn("absolute rounded-full animate-bounce bg-primary/60", particleSizes[size])}
            style={{
              top: `${20 + Math.sin(i * 60 * Math.PI / 180) * 25}%`,
              left: `${20 + Math.cos(i * 60 * Math.PI / 180) * 25}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: '2s'
            }}
          />
        ))}

        {/* Ripple effect */}
        <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping"
             style={{ animationDuration: '2s' }} />
      </div>

      {/* Loading text */}
      <div className="absolute bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2">
        <p className="text-xs md:text-sm text-muted-foreground animate-pulse">Loading...</p>
      </div>
    </div>
  );
};

export default Loading;