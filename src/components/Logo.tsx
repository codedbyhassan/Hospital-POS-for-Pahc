import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 32 }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        {/* Outer shield shape */}
        <path
          d="M20 2L32 8V18C32 28 26 36 20 38C14 36 8 28 8 18V8L20 2Z"
          fill="hsl(var(--primary))"
          stroke="hsl(var(--primary))"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Medical cross */}
        <g fill="hsl(var(--primary-foreground))">
          {/* Horizontal bar */}
          <rect x="14" y="16" width="12" height="3" rx="1.5" />
          {/* Vertical bar */}
          <rect x="17.5" y="13" width="3" height="12" rx="1.5" />
          {/* Center circle */}
          <circle cx="19" cy="18.5" r="2" fill="hsl(var(--primary-foreground))" />
        </g>

        {/* Inner accent */}
        <circle
          cx="20"
          cy="20"
          r="6"
          fill="none"
          stroke="hsl(var(--primary-foreground))"
          strokeWidth="0.5"
          opacity="0.2"
        />

        {/* Small decorative elements */}
        <circle cx="12" cy="12" r="1" fill="hsl(var(--primary-foreground))" opacity="0.6" />
        <circle cx="28" cy="12" r="1" fill="hsl(var(--primary-foreground))" opacity="0.6" />
      </svg>
    </div>
  );
};

export default Logo;