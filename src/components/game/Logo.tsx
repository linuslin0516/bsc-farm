import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ size = 'md' }) => {
  const sizes = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
  };

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
  };

  return (
    <div className="flex items-center gap-3">
      {/* Farm Icon with BNB styling */}
      <div className={`relative ${iconSizes[size]}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* BNB-style diamond background */}
          <polygon
            points="50,5 95,50 50,95 5,50"
            fill="#F0B90B"
            className="drop-shadow-lg"
          />
          <polygon
            points="50,15 85,50 50,85 15,50"
            fill="#0B0E11"
          />
          {/* Wheat/plant icon in center */}
          <g transform="translate(50, 50)" fill="#F0B90B">
            {/* Stem */}
            <rect x="-2" y="-5" width="4" height="30" rx="2" />
            {/* Left leaves */}
            <ellipse cx="-8" cy="-5" rx="6" ry="12" transform="rotate(-30)" />
            <ellipse cx="-12" cy="5" rx="5" ry="10" transform="rotate(-45)" />
            {/* Right leaves */}
            <ellipse cx="8" cy="-5" rx="6" ry="12" transform="rotate(30)" />
            <ellipse cx="12" cy="5" rx="5" ry="10" transform="rotate(45)" />
            {/* Top grain */}
            <ellipse cx="0" cy="-18" rx="4" ry="8" />
          </g>
        </svg>
      </div>

      {/* Text Logo */}
      <div className="flex flex-col">
        <span
          className={`${sizes[size]} font-extrabold text-binance-yellow tracking-tight leading-none`}
          style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
        >
          BSC Farm
        </span>
        <span className="text-xs text-binance-gold font-semibold tracking-widest uppercase">
          Powered by $FARM
        </span>
      </div>
    </div>
  );
};
