import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = false }) => {
  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`${textSizes[size]}`}>🚀</span>
      <span className={`${textSizes[size]} font-bold bg-gradient-to-r from-space-cyan to-space-purple bg-clip-text text-transparent`}>
        Space Farm
      </span>
      {showText && (
        <div className="flex flex-col">
          <span className="text-xs text-space-glow font-semibold tracking-widest uppercase">
            Cosmic Crops
          </span>
        </div>
      )}
    </div>
  );
};
