import React from 'react';
import { FarmCell as FarmCellType } from '../../types';
import { CropIcon } from './CropIcon';
import { getCropById } from '../../data/crops';

interface FarmCellProps {
  cell: FarmCellType;
  isSelected: boolean;
  selectedCropId: string | null;
  onPlant: () => void;
  onHarvest: () => void;
  getTimeRemaining: () => number;
}

export const FarmCellComponent: React.FC<FarmCellProps> = ({
  cell,
  isSelected,
  selectedCropId,
  onPlant,
  onHarvest,
  getTimeRemaining,
}) => {
  const plantedCrop = cell.plantedCrop;
  const cropDef = plantedCrop ? getCropById(plantedCrop.cropId) : null;
  const isMature = plantedCrop?.stage === 'mature';
  const timeRemaining = getTimeRemaining();

  const handleClick = () => {
    if (isMature) {
      onHarvest();
    } else if (!plantedCrop && selectedCropId) {
      onPlant();
    }
  };

  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return 'Ready!';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div
      onClick={handleClick}
      className={`
        farm-cell flex flex-col items-center justify-center
        ${plantedCrop ? 'planted' : ''}
        ${isMature ? 'mature cursor-pointer' : ''}
        ${!plantedCrop && selectedCropId ? 'hover:bg-green-800/30 cursor-pointer' : ''}
        ${isSelected ? 'ring-2 ring-binance-yellow' : ''}
      `}
    >
      {plantedCrop && cropDef ? (
        <>
          <CropIcon cropId={plantedCrop.cropId} stage={plantedCrop.stage} />
          {!isMature && (
            <span className="text-[10px] text-gray-300 mt-1">
              {formatTime(timeRemaining)}
            </span>
          )}
          {isMature && (
            <span className="text-[10px] text-binance-yellow font-bold animate-pulse">
              Harvest!
            </span>
          )}
        </>
      ) : (
        <span className="text-2xl opacity-20">+</span>
      )}
    </div>
  );
};
