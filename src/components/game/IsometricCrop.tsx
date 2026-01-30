import { CropStage, CropRarity } from '../../types';
import { getCropById } from '../../data/crops';

interface IsometricCropProps {
  cropId: string;
  stage: CropStage;
  canSteal?: boolean;
  isStolen?: boolean;
}

// Height mapping based on stage
const STAGE_HEIGHTS: Record<CropStage, number> = {
  seed: 10,
  sprout: 20,
  growing: 35,
  mature: 45,
};

// Rarity glow effects
const RARITY_GLOW: Record<CropRarity, string> = {
  common: '',
  uncommon: 'drop-shadow-[0_0_6px_rgba(74,222,128,0.6)]',
  rare: 'drop-shadow-[0_0_8px_rgba(96,165,250,0.7)]',
  epic: 'drop-shadow-[0_0_10px_rgba(192,132,252,0.8)]',
  legendary: 'drop-shadow-[0_0_15px_rgba(250,204,21,1)] animate-pulse',
};

export const IsometricCrop: React.FC<IsometricCropProps> = ({
  cropId,
  stage,
  canSteal = false,
  isStolen = false,
}) => {
  const cropDef = getCropById(cropId);
  const isMature = stage === 'mature';

  // Get emoji from crop definition or fallback
  const emoji = stage === 'seed' ? '🟤' : stage === 'sprout' ? '🌱' : (cropDef?.emoji || '🌿');
  const rarity = cropDef?.rarity || 'common';

  // Calculate height based on stage
  const height = STAGE_HEIGHTS[stage];

  const stageAnimation = {
    seed: 'animate-pulse',
    sprout: 'animate-bounce-slow',
    growing: '',
    mature: rarity === 'legendary' ? '' : 'animate-bounce-slow',
  };

  return (
    <div
      className={`
        relative flex items-end justify-center
        transition-transform duration-300 ease-out
        ${stageAnimation[stage]}
      `}
      style={{ height: `${height}px` }}
    >
      {/* Shadow */}
      <div
        className="absolute bottom-0 w-8 h-2 bg-black/30 rounded-full blur-sm"
        style={{ transform: 'rotateX(60deg)' }}
      />

      {/* Crop */}
      <span
        className={`
          text-3xl relative z-10
          ${isMature ? RARITY_GLOW[rarity] : ''}
          transition-all duration-300
        `}
        style={{
          filter: isStolen ? 'grayscale(0.5) opacity(0.6)' : 'none',
        }}
      >
        {emoji}
      </span>

      {/* Mature indicator - different based on rarity */}
      {isMature && !isStolen && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 animate-bounce">
          <span className="text-xs">
            {rarity === 'legendary' ? '👑' : rarity === 'epic' ? '💫' : '✨'}
          </span>
        </div>
      )}

      {/* Can steal indicator */}
      {canSteal && isMature && !isStolen && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] px-1 rounded animate-pulse">
          偷!
        </div>
      )}

      {/* Already stolen indicator */}
      {isStolen && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] text-gray-400">
          已偷
        </div>
      )}
    </div>
  );
};
