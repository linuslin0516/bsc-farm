import { useEffect, useState } from 'react';
import { CropRarity, RARITY_COLORS, RARITY_NAMES } from '../../types';

interface UnlockAnimationProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'crop' | 'achievement';
  title: string;
  subtitle?: string;
  emoji: string;
  rarity: CropRarity;
  rewards?: {
    xp?: number;
    tokens?: number;
  };
}

export const UnlockAnimation: React.FC<UnlockAnimationProps> = ({
  isOpen,
  onClose,
  type,
  title,
  subtitle,
  emoji,
  rarity,
  rewards,
}) => {
  const [stage, setStage] = useState<'enter' | 'show' | 'exit'>('enter');
  const rarityColor = RARITY_COLORS[rarity];
  const rarityName = RARITY_NAMES[rarity];

  useEffect(() => {
    if (isOpen) {
      setStage('enter');
      // Show animation
      const showTimer = setTimeout(() => setStage('show'), 100);
      // Auto close after 3 seconds
      const closeTimer = setTimeout(() => {
        setStage('exit');
        setTimeout(onClose, 500);
      }, 3500);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(closeTimer);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getRarityGradient = () => {
    switch (rarity) {
      case 'legendary':
        return 'from-yellow-600 via-yellow-400 to-yellow-600';
      case 'epic':
        return 'from-purple-600 via-purple-400 to-purple-600';
      case 'rare':
        return 'from-blue-600 via-blue-400 to-blue-600';
      case 'uncommon':
        return 'from-green-600 via-green-400 to-green-600';
      default:
        return 'from-gray-600 via-gray-400 to-gray-600';
    }
  };

  const getBackgroundEffect = () => {
    if (rarity === 'legendary') {
      return (
        <>
          {/* Rotating rays */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] animate-spin-slow">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-2 h-[50%] bg-gradient-to-t from-yellow-400/0 via-yellow-400/30 to-yellow-400/0"
                  style={{ transform: `rotate(${i * 30}deg)`, transformOrigin: 'center bottom' }}
                />
              ))}
            </div>
          </div>
          {/* Sparkles */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-sparkle"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        </>
      );
    }
    if (rarity === 'epic') {
      return (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-20 bg-gradient-to-b from-purple-400/0 via-purple-400/50 to-purple-400/0 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`
        fixed inset-0 z-[100] flex items-center justify-center
        transition-all duration-500
        ${stage === 'enter' ? 'opacity-0' : stage === 'show' ? 'opacity-100' : 'opacity-0'}
      `}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Background effects */}
      {getBackgroundEffect()}

      {/* Content */}
      <div
        className={`
          relative z-10 flex flex-col items-center
          transition-all duration-500
          ${stage === 'enter' ? 'scale-50 opacity-0' : stage === 'show' ? 'scale-100 opacity-100' : 'scale-150 opacity-0'}
        `}
      >
        {/* Title */}
        <div className={`text-2xl font-bold mb-4 ${rarityColor.text}`}>
          {type === 'crop' ? '🎉 新作物解鎖！' : '🏆 成就達成！'}
        </div>

        {/* Emoji container */}
        <div
          className={`
            relative w-40 h-40 rounded-full
            flex items-center justify-center
            ${rarityColor.bg} ${rarityColor.border} border-4
            ${rarity === 'legendary' ? 'animate-pulse' : ''}
            ${rarityColor.glow}
          `}
        >
          {/* Inner glow */}
          <div className={`absolute inset-2 rounded-full bg-gradient-to-br ${getRarityGradient()} opacity-30`} />

          {/* Emoji */}
          <span
            className={`
              text-7xl relative z-10
              ${stage === 'show' ? 'animate-bounce' : ''}
            `}
          >
            {emoji}
          </span>
        </div>

        {/* Rarity badge */}
        <div
          className={`
            mt-4 px-4 py-1 rounded-full
            ${rarityColor.bg} ${rarityColor.border} border-2
            ${rarityColor.text} font-bold text-sm
          `}
        >
          {rarityName}
        </div>

        {/* Name */}
        <div className="mt-4 text-3xl font-bold text-white">{title}</div>
        {subtitle && (
          <div className="mt-1 text-gray-400">{subtitle}</div>
        )}

        {/* Rewards */}
        {rewards && (rewards.xp || rewards.tokens) && (
          <div className="mt-6 flex gap-4">
            {rewards.xp && rewards.xp > 0 && (
              <div className="flex items-center gap-2 bg-blue-500/20 border border-blue-400/50 px-4 py-2 rounded-lg">
                <span className="text-2xl">⭐</span>
                <span className="text-blue-400 font-bold">+{rewards.xp} XP</span>
              </div>
            )}
            {rewards.tokens && rewards.tokens > 0 && (
              <div className="flex items-center gap-2 bg-yellow-500/20 border border-yellow-400/50 px-4 py-2 rounded-lg">
                <span className="text-2xl">💰</span>
                <span className="text-yellow-400 font-bold">+{rewards.tokens} GOLD</span>
              </div>
            )}
          </div>
        )}

        {/* Tap to close hint */}
        <div className="mt-8 text-gray-500 text-sm animate-pulse">
          點擊任意處繼續
        </div>
      </div>
    </div>
  );
};
