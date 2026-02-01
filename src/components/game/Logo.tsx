import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = false }) => {
  const imageSizes = {
    sm: 'h-10',
    md: 'h-16',
    lg: 'h-32',
  };

  return (
    <div className="flex items-center gap-2">
      <img
        src="/logo.png"
        alt="BSC Farm"
        className={`${imageSizes[size]} w-auto object-contain`}
      />
      {showText && (
        <div className="flex flex-col">
          <span className="text-xs text-binance-gold font-semibold tracking-widest uppercase">
            Powered by $FARM
          </span>
        </div>
      )}
    </div>
  );
};
