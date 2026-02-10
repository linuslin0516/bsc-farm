import { useEffect, useCallback } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { FarmCellComponent } from './FarmCell';
import { getCropById } from '../../data/crops';
import { Position } from '../../types';

interface FarmGridProps {
  onNotify: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
}

export const FarmGrid: React.FC<FarmGridProps> = ({ onNotify }) => {
  const {
    player,
    farmCells,
    selectedCrop,
    plantCrop,
    harvestCrop,
    updateCropStages,
    addExperience,
    addDemoBalance,
    subtractDemoBalance,
    demoBalance,
  } = useGameStore();

  // Update crop stages every second
  useEffect(() => {
    const interval = setInterval(() => {
      updateCropStages();
    }, 1000);
    return () => clearInterval(interval);
  }, [updateCropStages]);

  const handlePlant = useCallback(
    (position: Position) => {
      if (!selectedCrop) {
        onNotify('info', 'Select a crop from the toolbar first!');
        return;
      }

      const cropDef = getCropById(selectedCrop);
      if (!cropDef) return;

      if (demoBalance < cropDef.cost) {
        onNotify('error', `Not enough GOLD! Need ${cropDef.cost}`);
        return;
      }

      if (subtractDemoBalance(cropDef.cost)) {
        plantCrop(position, selectedCrop);
        onNotify('success', `Planted ${cropDef.nameCn}!`);
      }
    },
    [selectedCrop, demoBalance, subtractDemoBalance, plantCrop, onNotify]
  );

  const handleHarvest = useCallback(
    (position: Position) => {
      const harvested = harvestCrop(position);
      if (harvested) {
        const cropDef = getCropById(harvested.cropId);
        if (cropDef) {
          addDemoBalance(cropDef.sellPrice);
          addExperience(cropDef.experience);
          onNotify('success', `Harvested ${cropDef.nameCn}! +${cropDef.sellPrice} GOLD`);
        }
      }
    },
    [harvestCrop, addDemoBalance, addExperience, onNotify]
  );

  const getTimeRemaining = useCallback(
    (plantedAt: number, cropId: string): number => {
      const cropDef = getCropById(cropId);
      if (!cropDef) return 0;
      const elapsed = (Date.now() - plantedAt) / 1000;
      return Math.max(0, cropDef.growthTime - elapsed);
    },
    []
  );

  if (!player) return null;

  const gridSize = player.landSize;

  return (
    <div className="flex flex-col items-center">
      <div className="card p-4 mb-4">
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          }}
        >
          {farmCells.map((cell) => (
            <FarmCellComponent
              key={`${cell.position.x}-${cell.position.y}`}
              cell={cell}
              isSelected={false}
              selectedCropId={selectedCrop}
              onPlant={() => handlePlant(cell.position)}
              onHarvest={() => handleHarvest(cell.position)}
              getTimeRemaining={() =>
                cell.plantedCrop
                  ? getTimeRemaining(cell.plantedCrop.plantedAt, cell.plantedCrop.cropId)
                  : 0
              }
            />
          ))}
        </div>
      </div>

      {/* Farm info */}
      <div className="text-sm text-gray-400">
        Farm Size: {gridSize}x{gridSize} ({gridSize * gridSize} plots)
      </div>
    </div>
  );
};
