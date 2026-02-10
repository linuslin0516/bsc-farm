import { useState, useEffect, useMemo, useCallback } from 'react';

interface StarConfig {
  top: number;
  left: number;
  size: number;
  delay: number;
  color: string;
  glowSize: number;
}

interface ShootingStarData {
  id: number;
  top: number;
  left: number;
  angle: number;
}

let shootingStarId = 0;

const ShootingStar: React.FC<ShootingStarData & { onComplete: (id: number) => void }> = ({
  id,
  top,
  left,
  angle,
  onComplete,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => onComplete(id), 1500);
    return () => clearTimeout(timer);
  }, [id, onComplete]);

  return (
    <div
      className="absolute animate-shooting-star"
      style={{
        top: `${top}%`,
        left: `${left}%`,
        height: '2px',
        background: 'linear-gradient(to right, transparent, #ffffff, #67E8F9)',
        borderRadius: '2px',
        transform: `rotate(${angle}deg)`,
        boxShadow: '0 0 6px rgba(103, 232, 249, 0.6)',
      }}
    />
  );
};

export const AnimatedBackground: React.FC = () => {
  const [shootingStars, setShootingStars] = useState<ShootingStarData[]>([]);

  // Star layer 1: ~80 tiny distant stars
  const starsLayer1 = useMemo(() => {
    const stars: StarConfig[] = [];
    for (let i = 0; i < 80; i++) {
      stars.push({
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: 1 + Math.random(),
        delay: Math.random() * 5,
        color: '#ffffff',
        glowSize: 0,
      });
    }
    return stars;
  }, []);

  // Star layer 2: ~40 medium stars
  const starsLayer2 = useMemo(() => {
    const stars: StarConfig[] = [];
    const colors = ['#ffffff', '#E0F2FE', '#DBEAFE', '#C7D2FE'];
    for (let i = 0; i < 40; i++) {
      stars.push({
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: 2 + Math.random(),
        delay: Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        glowSize: 4,
      });
    }
    return stars;
  }, []);

  // Star layer 3: ~15 bright prominent stars
  const starsLayer3 = useMemo(() => {
    const stars: StarConfig[] = [];
    const colors = ['#ffffff', '#67E8F9', '#A5B4FC', '#C4B5FD'];
    for (let i = 0; i < 15; i++) {
      stars.push({
        top: Math.random() * 80,
        left: Math.random() * 100,
        size: 3 + Math.random() * 2,
        delay: Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        glowSize: 10,
      });
    }
    return stars;
  }, []);

  // Shooting stars - spawn periodically
  const removeShootingStar = useCallback((id: number) => {
    setShootingStars((prev) => prev.filter((s) => s.id !== id));
  }, []);

  useEffect(() => {
    const spawnStar = () => {
      setShootingStars((prev) => [
        ...prev,
        {
          id: ++shootingStarId,
          top: Math.random() * 50,
          left: Math.random() * 70,
          angle: 25 + Math.random() * 20,
        },
      ]);
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.3) spawnStar();
    }, 8000 + Math.random() * 7000);

    // Spawn one early
    const initialTimer = setTimeout(spawnStar, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Deep space base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 30% 20%, #0a0a2e 0%, #050510 50%, #020208 100%)',
        }}
      />

      {/* Star Layer 1 - tiny distant stars */}
      <div className="absolute inset-0">
        {starsLayer1.map((star, i) => (
          <div
            key={`s1-${i}`}
            className="absolute rounded-full animate-twinkle-slow"
            style={{
              top: `${star.top}%`,
              left: `${star.left}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              backgroundColor: star.color,
              opacity: 0.6,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Star Layer 2 - medium stars */}
      <div className="absolute inset-0">
        {starsLayer2.map((star, i) => (
          <div
            key={`s2-${i}`}
            className="absolute rounded-full animate-twinkle"
            style={{
              top: `${star.top}%`,
              left: `${star.left}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              backgroundColor: star.color,
              boxShadow: star.glowSize
                ? `0 0 ${star.glowSize}px ${star.color}`
                : undefined,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Star Layer 3 - bright prominent stars with glow */}
      <div className="absolute inset-0">
        {starsLayer3.map((star, i) => (
          <div
            key={`s3-${i}`}
            className="absolute rounded-full animate-twinkle-fast"
            style={{
              top: `${star.top}%`,
              left: `${star.left}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              backgroundColor: star.color,
              boxShadow: `0 0 ${star.glowSize}px ${star.color}, 0 0 ${star.glowSize * 2}px ${star.color}40`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Nebula cloud 1 - purple */}
      <div
        className="absolute animate-nebula-drift"
        style={{
          top: '-10%',
          left: '-5%',
          width: '60vw',
          height: '60vh',
          background:
            'radial-gradient(ellipse, rgba(139,92,246,0.12) 0%, rgba(99,102,241,0.06) 40%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Nebula cloud 2 - blue/cyan */}
      <div
        className="absolute animate-nebula-drift-reverse"
        style={{
          bottom: '-15%',
          right: '-10%',
          width: '50vw',
          height: '50vh',
          background:
            'radial-gradient(ellipse, rgba(14,165,233,0.10) 0%, rgba(34,211,238,0.05) 40%, transparent 70%)',
          filter: 'blur(100px)',
        }}
      />

      {/* Nebula cloud 3 - subtle pink */}
      <div
        className="absolute animate-nebula-drift"
        style={{
          top: '30%',
          right: '10%',
          width: '40vw',
          height: '40vh',
          background:
            'radial-gradient(ellipse, rgba(236,72,153,0.06) 0%, transparent 60%)',
          filter: 'blur(90px)',
          animationDelay: '-40s',
        }}
      />

      {/* Shooting stars */}
      {shootingStars.map((star) => (
        <ShootingStar key={star.id} {...star} onComplete={removeShootingStar} />
      ))}

      {/* Vignette overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)',
        }}
      />
    </div>
  );
};
