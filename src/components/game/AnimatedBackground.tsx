import { useState, useEffect, useMemo } from 'react';
import { getTimeOfDay, getSkyColors, TimeOfDay } from '../../utils/timeOfDay';

interface CloudProps {
  id: number;
  size: 'sm' | 'md' | 'lg';
  top: number;
  delay: number;
  opacity: number;
  color: string;
}

const Cloud: React.FC<CloudProps> = ({ size, top, delay, opacity, color }) => {
  const sizeClasses = {
    sm: 'w-16 h-8',
    md: 'w-24 h-12',
    lg: 'w-32 h-16',
  };

  const animationClass = {
    sm: 'animate-cloud-drift-fast',
    md: 'animate-cloud-drift',
    lg: 'animate-cloud-drift-slow',
  };

  return (
    <div
      className={`absolute ${sizeClasses[size]} ${animationClass[size]}`}
      style={{
        top: `${top}%`,
        animationDelay: `${delay}s`,
        opacity,
        left: '-10%',
      }}
    >
      {/* Cloud shape using multiple circles */}
      <div className="relative w-full h-full">
        <div
          className="absolute rounded-full"
          style={{
            width: '50%',
            height: '80%',
            left: '10%',
            top: '20%',
            backgroundColor: color,
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: '40%',
            height: '70%',
            left: '35%',
            top: '0%',
            backgroundColor: color,
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: '45%',
            height: '75%',
            left: '50%',
            top: '15%',
            backgroundColor: color,
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: '35%',
            height: '60%',
            left: '70%',
            top: '30%',
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
};

interface StarProps {
  top: number;
  left: number;
  size: number;
  delay: number;
}

const Star: React.FC<StarProps> = ({ top, left, size, delay }) => (
  <div
    className="absolute rounded-full bg-white animate-twinkle"
    style={{
      top: `${top}%`,
      left: `${left}%`,
      width: `${size}px`,
      height: `${size}px`,
      animationDelay: `${delay}s`,
    }}
  />
);

export const AnimatedBackground: React.FC = () => {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(getTimeOfDay());
  const skyColors = getSkyColors(timeOfDay);

  // Update time of day every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeOfDay = getTimeOfDay();
      if (newTimeOfDay !== timeOfDay) {
        setTimeOfDay(newTimeOfDay);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [timeOfDay]);

  // Generate random clouds
  const clouds = useMemo(() => {
    const cloudConfigs: CloudProps[] = [];
    const sizes: ('sm' | 'md' | 'lg')[] = ['sm', 'md', 'lg'];

    for (let i = 0; i < 8; i++) {
      cloudConfigs.push({
        id: i,
        size: sizes[i % 3],
        top: 5 + Math.random() * 25,
        delay: Math.random() * 30,
        opacity: skyColors.cloudOpacity * (0.7 + Math.random() * 0.3),
        color: skyColors.cloudColor,
      });
    }

    return cloudConfigs;
  }, [skyColors.cloudColor, skyColors.cloudOpacity]);

  // Generate stars for night
  const stars = useMemo(() => {
    if (!skyColors.showStars) return [];

    const starConfigs: StarProps[] = [];
    for (let i = 0; i < 50; i++) {
      starConfigs.push({
        top: Math.random() * 60,
        left: Math.random() * 100,
        size: 1 + Math.random() * 2,
        delay: Math.random() * 3,
      });
    }
    return starConfigs;
  }, [skyColors.showStars]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Sky gradient */}
      <div
        className="absolute inset-0 transition-all duration-[3000ms] ease-in-out"
        style={{
          background: `linear-gradient(to bottom, ${skyColors.from} 0%, ${skyColors.via} 40%, ${skyColors.to} 100%)`,
        }}
      />

      {/* Stars (night only) */}
      {skyColors.showStars && (
        <div className="absolute inset-0">
          {stars.map((star, i) => (
            <Star key={i} {...star} />
          ))}
        </div>
      )}

      {/* Clouds */}
      <div className="absolute inset-0">
        {clouds.map((cloud) => (
          <Cloud key={cloud.id} {...cloud} />
        ))}
      </div>

      {/* Ground gradient overlay */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/3"
        style={{
          background: `linear-gradient(to top, rgba(34, 197, 94, 0.3) 0%, transparent 100%)`,
        }}
      />

      {/* Subtle vignette effect */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.2) 100%)',
        }}
      />
    </div>
  );
};
