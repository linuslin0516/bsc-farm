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

  // Determine cell state for styling
  const getCellStyle = () => {
    if (isVisiting && canSteal && isMature && !isStolen) {
      return 'border-red-500 bg-red-500/20';
    }
    if (isMature && !isVisiting) {
      return 'border-space-cyan bg-space-cyan/20';
    }
    if (plantedCrop) {
      return 'border-green-600 bg-green-900/30';
    }
    if (canPlant && !isVisiting) {
      return isHovered
        ? 'border-green-400 bg-green-500/30'
        : 'border-space-gray-light';
    }
    return 'border-space-gray-light';
  };

  // Get hover effect for diamond
  const getHoverEffect = () => {
    if (!isHovered) return '';
    if (isVisiting && canSteal && isMature && !isStolen) {
      return 'shadow-[0_0_20px_rgba(239,68,68,0.6)]';
    }
    if (isMature && !isVisiting) {
      return 'shadow-[0_0_20px_rgba(34,211,238,0.6)]';
    }
    if (canPlant && !isVisiting) {
      return 'shadow-[0_0_20px_rgba(34,197,94,0.5)]';
    }
    return '';
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
            ${isSelected ? 'ring-2 ring-space-cyan ring-offset-2 ring-offset-space-dark' : ''}
          `}
          style={{
            width: `${CELL_WIDTH}px`,
            height: `${CELL_HEIGHT}px`,
            top: `${CELL_HEIGHT}px`,
            left: 0,
            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            background: plantedCrop
              ? 'linear-gradient(135deg, #2D1B4E 0%, #4C3575 50%, #2D1B4E 100%)'
              : isHovered && canPlant
              ? 'linear-gradient(135deg, #1a3a4a 0%, #2a5a6a 50%, #1a3a4a 100%)'
              : 'linear-gradient(135deg, #1E293B 0%, #334155 50%, #1E293B 100%)',
          }}
        >
          {/* Soil texture */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`,
              backgroundSize: '8px 8px',
            }}
          />
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
            className="absolute left-1/2 -translate-x-1/2 text-xs text-space-cyan font-bold animate-bounce bg-black/60 px-2 py-1 rounded-full"
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
                  ? 'text-farm-green scale-125 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]'
                  : 'text-white/60'
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
