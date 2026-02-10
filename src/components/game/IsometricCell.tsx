import { useState, useCallback } from 'react';
import { FarmCell } from '../../types';
import { IsometricCrop } from './IsometricCrop';
import { getCropById } from '../../data/crops';
import { CELL_WIDTH, CELL_HEIGHT } from '../../utils/isometric';

interface IsometricCellProps {
  cell: FarmCell;
  x: number;
  y: number;
  isSelected: boolean;
  canPlant: boolean;
  canSteal?: boolean;
  isStolen?: boolean;
  isVisiting?: boolean;
  timeRemaining: number;
  onClick: () => void;
}

// Expanded click padding
const CLICK_PADDING = 15;

export const IsometricCell: React.FC<IsometricCellProps> = ({
  cell,
  x,
  y,
  isSelected,
  canPlant,
  canSteal = false,
  isStolen = false,
  isVisiting = false,
  timeRemaining,
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const plantedCrop = cell.plantedCrop;
  const cropDef = plantedCrop ? getCropById(plantedCrop.cropId) : null;
  const isMature = plantedCrop?.stage === 'mature';

  // Isometric position calculation
  const isoX = (x - y) * (CELL_WIDTH / 2);
  const isoY = (x + y) * (CELL_HEIGHT / 2);

  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  // Simple click handler
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      onClick();
    },
    [onClick]
  );

  // Determine cell border styling
  const getCellStyle = () => {
    if (isVisiting && canSteal && isMature && !isStolen) {
      return 'border-red-500/60';
    }
    if (isMature && !isVisiting) {
      return 'border-space-bio-cyan/40';
    }
    if (plantedCrop) {
      return 'border-space-bio-purple/20';
    }
    if (canPlant && !isVisiting) {
      return isHovered
        ? 'border-space-bio-cyan/30'
        : 'border-white/5';
    }
    return 'border-white/5';
  };

  // Get hover effect for diamond
  const getHoverEffect = () => {
    if (!isHovered) return '';
    if (isVisiting && canSteal && isMature && !isStolen) {
      return 'shadow-[0_0_20px_rgba(239,68,68,0.6)]';
    }
    if (isMature && !isVisiting) {
      return 'shadow-[0_0_20px_rgba(0,245,212,0.5)]';
    }
    if (canPlant && !isVisiting) {
      return 'shadow-[0_0_15px_rgba(0,245,212,0.3)]';
    }
    return '';
  };

  // Get rock background gradient based on cell state
  const getRockBackground = () => {
    if (isVisiting && canSteal && isMature && !isStolen) {
      // Stealable - red-tinted rock
      return 'linear-gradient(135deg, #3a1a1a 0%, #4d2a2a 50%, #3a1a1a 100%)';
    }
    if (isMature && !isVisiting) {
      // Mature - energy glow rock
      return 'linear-gradient(135deg, #1a2a3a 0%, #2a3d4d 50%, #1a2a3a 100%)';
    }
    if (plantedCrop) {
      // Planted - slightly lit rock
      return 'linear-gradient(135deg, #2a2a3a 0%, #3a3a4d 50%, #2a2a3a 100%)';
    }
    if (isHovered && canPlant && !isVisiting) {
      // Hover on empty plantable
      return 'linear-gradient(135deg, #2a3a3a 0%, #3d4d4d 50%, #2a3a3a 100%)';
    }
    // Empty - dark asteroid rock
    return 'linear-gradient(135deg, #2a2a3a 0%, #3d3d4d 50%, #2a2a3a 100%)';
  };

  return (
    // Outer click target - positioned to match the VISUAL diamond area
    <div
      className="absolute cursor-pointer"
      style={{
        left: `${isoX - CLICK_PADDING}px`,
        top: `${isoY + CELL_HEIGHT * 2 - CLICK_PADDING - 15}px`, // Adjusted up 15px
        width: `${CELL_WIDTH + CLICK_PADDING * 2}px`,
        height: `${CELL_HEIGHT + CLICK_PADDING * 2}px`, // Only cover the diamond height
        zIndex: x + y + 10, // Higher z-index for click priority
      }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Inner container - maintains original dimensions, shifted up to show crops */}
      <div
        className="absolute transition-transform duration-200 pointer-events-none"
        style={{
          left: `${CLICK_PADDING}px`,
          top: `${-CELL_HEIGHT * 2 + CLICK_PADDING + 15}px`, // Adjusted for 15px shift
          width: `${CELL_WIDTH}px`,
          height: `${CELL_HEIGHT * 2}px`,
          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        {/* Ground tile (diamond shape) */}
        <div
          className={`
            absolute border-2 transition-all duration-200
            ${getCellStyle()}
            ${getHoverEffect()}
            ${isSelected ? 'ring-2 ring-space-bio-cyan ring-offset-2 ring-offset-space-deep' : ''}
          `}
          style={{
            width: `${CELL_WIDTH}px`,
            height: `${CELL_HEIGHT}px`,
            top: `${CELL_HEIGHT}px`,
            left: 0,
            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            background: getRockBackground(),
          }}
        >
          {/* Rock surface texture - highlights and shadows */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `
                radial-gradient(ellipse 30% 20% at 30% 35%, rgba(255,255,255,0.08) 0%, transparent 100%),
                radial-gradient(ellipse 20% 15% at 70% 60%, rgba(255,255,255,0.05) 0%, transparent 100%),
                radial-gradient(ellipse 40% 30% at 50% 80%, rgba(0,0,0,0.15) 0%, transparent 100%)
              `,
            }}
          />

          {/* Bioluminescent cracks - only for planted cells */}
          {plantedCrop && (
            <div
              className={`absolute inset-0 ${isMature && !isVisiting ? 'animate-[crack-pulse_2s_ease-in-out_infinite]' : 'opacity-30'}`}
              style={{
                backgroundImage: `
                  linear-gradient(${45}deg, transparent 40%, ${isMature ? '#00f5d4' : '#9b5de5'}40 45%, transparent 50%),
                  linear-gradient(${135}deg, transparent 35%, ${isMature ? '#00f5d4' : '#9b5de5'}30 40%, transparent 45%),
                  linear-gradient(${90}deg, transparent 45%, ${isMature ? '#00f5d4' : '#9b5de5'}20 50%, transparent 55%)
                `,
              }}
            />
          )}
        </div>

        {/* Crop - positioned to sit on the diamond */}
        {plantedCrop && cropDef && (
          <div
            className="absolute left-1/2 transition-transform duration-200"
            style={{
              bottom: `5px`,
              transform: `translateX(-50%)`,
            }}
          >
            <IsometricCrop
              cropId={plantedCrop.cropId}
              stage={plantedCrop.stage}
              canSteal={canSteal && isVisiting}
              isStolen={isStolen}
            />
          </div>
        )}

        {/* Timer */}
        {plantedCrop && !isMature && timeRemaining > 0 && (
          <div
            className="absolute left-1/2 -translate-x-1/2 text-[10px] text-white bg-black/70 px-2 py-0.5 rounded-full backdrop-blur-sm whitespace-nowrap"
            style={{ top: `${CELL_HEIGHT - 5}px` }}
          >
            {formatTime(timeRemaining)}
          </div>
        )}

        {/* Harvest indicator */}
        {isMature && !isVisiting && (
          <div
            className="absolute left-1/2 -translate-x-1/2 text-xs text-space-bio-cyan font-bold animate-bounce bg-black/60 px-2 py-1 rounded-full border border-space-bio-cyan/30"
            style={{ top: `${CELL_HEIGHT - 5}px` }}
          >
            收成!
          </div>
        )}

        {/* Steal indicator */}
        {isVisiting && canSteal && isMature && !isStolen && (
          <div
            className="absolute left-1/2 -translate-x-1/2 text-xs text-red-400 font-bold animate-pulse bg-black/60 px-2 py-1 rounded-full"
            style={{ top: `${CELL_HEIGHT - 5}px` }}
          >
            偷菜!
          </div>
        )}

        {/* Empty cell - Plus sign only */}
        {!plantedCrop && canPlant && !isVisiting && (
          <div
            className={`
              absolute left-1/2 -translate-x-1/2
              flex items-center justify-center
              text-4xl font-bold
              transition-all duration-200
              ${
                isHovered
                  ? 'text-space-bio-cyan scale-125 drop-shadow-[0_0_8px_rgba(0,245,212,0.8)]'
                  : 'text-white/40'
              }
            `}
            style={{
              top: `${CELL_HEIGHT - 3}px`,
            }}
          >
            +
          </div>
        )}
      </div>
    </div>
  );
};
