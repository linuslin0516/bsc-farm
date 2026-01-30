import React from 'react';
import { CropStage } from '../../types';

interface CropIconProps {
  cropId: string;
  stage: CropStage;
  size?: 'sm' | 'md' | 'lg';
}

// Emoji-based crop icons for simplicity
const CROP_EMOJIS: Record<string, Record<CropStage, string>> = {
  carrot: {
    seed: '🟤',
    sprout: '🌱',
    growing: '🥕',
    mature: '🥕',
  },
  tomato: {
    seed: '🟤',
    sprout: '🌱',
    growing: '🍅',
    mature: '🍅',
  },
  corn: {
    seed: '🟤',
    sprout: '🌱',
    growing: '🌽',
    mature: '🌽',
  },
  potato: {
    seed: '🟤',
    sprout: '🌱',
    growing: '🥔',
    mature: '🥔',
  },
  strawberry: {
    seed: '🟤',
    sprout: '🌱',
    growing: '🍓',
    mature: '🍓',
  },
  watermelon: {
    seed: '🟤',
    sprout: '🌱',
    growing: '🍉',
    mature: '🍉',
  },
  pumpkin: {
    seed: '🟤',
    sprout: '🌱',
    growing: '🎃',
    mature: '🎃',
  },
  golden_wheat: {
    seed: '🟤',
    sprout: '🌱',
    growing: '🌾',
    mature: '🌾',
  },
};

export const CropIcon: React.FC<CropIconProps> = ({ cropId, stage, size = 'md' }) => {
  const sizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  const stageClasses: Record<CropStage, string> = {
    seed: 'crop-seed opacity-60',
    sprout: 'crop-sprout',
    growing: 'crop-growing',
    mature: 'crop-mature',
  };

  const emoji = CROP_EMOJIS[cropId]?.[stage] || '🌱';

  return (
    <span className={`${sizes[size]} ${stageClasses[stage]} inline-block`}>
      {emoji}
    </span>
  );
};

// Simple icon for shop/selection
export const CropShopIcon: React.FC<{ cropId: string; size?: 'sm' | 'md' | 'lg' }> = ({
  cropId,
  size = 'md',
}) => {
  const sizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  const emoji = CROP_EMOJIS[cropId]?.mature || '🌱';

  return <span className={sizes[size]}>{emoji}</span>;
};
