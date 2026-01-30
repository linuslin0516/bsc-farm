import { useEffect, useCallback, useState } from 'react';
import { FarmCamera } from './FarmCamera';
import { IsometricCell } from './IsometricCell';
import { useGameStore } from '../../store/useGameStore';
import { getCropById } from '../../data/crops';
import { Position, FarmCell } from '../../types';

interface IsometricFarmProps {
  onNotify: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
  isVisiting?: boolean;
  visitingFarm?: FarmCell[];
  visitingUserId?: string;
  stolenPositions?: Position[];
  onSteal?: (position: Position) => void;
}

const CELL_WIDTH = 80;
const CELL_HEIGHT = 40;

export const IsometricFarm: React.FC<IsometricFarmProps> = ({
  onNotify,
  isVisiting = false,
  visitingFarm,
  stolenPositions = [],
  onSteal,
}) => {
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
    syncFarmToFirebase,
  } = useGameStore();

  const [, setTick] = useState(0);

  // Update crop stages every second
  useEffect(() => {
    const interval = setInterval(() => {
      updateCropStages();
      setTick((t) => t + 1); // Force re-render for timers
    }, 1000);
    return () => clearInterval(interval);
  }, [updateCropStages]);

  const activeFarm = isVisiting && visitingFarm ? visitingFarm : farmCells;
  const gridSize = player?.landSize || 3;

  const handlePlant = useCallback(
    async (position: Position) => {
      if (isVisiting) return;

      if (!selectedCrop) {
        onNotify('info', '請先從下方選擇種子！');
        return;
      }

      const cropDef = getCropById(selectedCrop);
      if (!cropDef) return;

      if (demoBalance < cropDef.cost) {
        onNotify('error', `$FARM 不足！需要 ${cropDef.cost}`);
        return;
      }

      if (subtractDemoBalance(cropDef.cost)) {
        plantCrop(position, selectedCrop);
        onNotify('success', `種下了 ${cropDef.nameCn}！`);
        // Sync to Firebase
        await syncFarmToFirebase();
      }
    },
    [selectedCrop, demoBalance, subtractDemoBalance, plantCrop, onNotify, isVisiting, syncFarmToFirebase]
  );

  const handleHarvest = useCallback(
    async (position: Position) => {
      if (isVisiting) return;

      const harvested = harvestCrop(position);
      if (harvested) {
        const cropDef = getCropById(harvested.cropId);
        if (cropDef) {
          addDemoBalance(cropDef.sellPrice);
          addExperience(cropDef.experience);
          onNotify('success', `收成了 ${cropDef.nameCn}！+${cropDef.sellPrice} $FARM`);
          // Sync to Firebase
          await syncFarmToFirebase();
        }
      }
    },
    [harvestCrop, addDemoBalance, addExperience, onNotify, isVisiting, syncFarmToFirebase]
  );

  const handleCellClick = useCallback(
    async (cell: FarmCell) => {
      if (isVisiting) {
        // Handle stealing
        if (onSteal && cell.plantedCrop?.stage === 'mature') {
          const isAlreadyStolen = stolenPositions.some(
            (p) => p.x === cell.position.x && p.y === cell.position.y
          );
          if (!isAlreadyStolen) {
            onSteal(cell.position);
          } else {
            onNotify('info', '你已經偷過這塊地了！');
          }
        }
        return;
      }

      if (cell.plantedCrop?.stage === 'mature') {
        await handleHarvest(cell.position);
      } else if (!cell.plantedCrop) {
        await handlePlant(cell.position);
      }
    },
    [handlePlant, handleHarvest, isVisiting, onSteal, stolenPositions, onNotify]
  );

  const getTimeRemaining = useCallback(
    (cell: FarmCell): number => {
      if (!cell.plantedCrop) return 0;
      const cropDef = getCropById(cell.plantedCrop.cropId);
      if (!cropDef) return 0;
      const elapsed = (Date.now() - cell.plantedCrop.plantedAt) / 1000;
      return Math.max(0, cropDef.growthTime - elapsed);
    },
    []
  );

  if (!player) return null;

  // Calculate container size for centering
  const containerWidth = gridSize * CELL_WIDTH;
  const containerHeight = gridSize * CELL_HEIGHT * 2;

  return (
    <div className="w-full h-full overflow-hidden relative">
      <FarmCamera>
        <div
          className="relative"
          style={{
            width: `${containerWidth}px`,
            height: `${containerHeight}px`,
          }}
        >
          {activeFarm.map((cell) => {
            const isStolen = stolenPositions.some(
              (p) => p.x === cell.position.x && p.y === cell.position.y
            );

            return (
              <IsometricCell
                key={`${cell.position.x}-${cell.position.y}`}
                cell={cell}
                x={cell.position.x}
                y={cell.position.y}
                isSelected={false}
                canPlant={!cell.plantedCrop && !!selectedCrop && !isVisiting}
                canSteal={isVisiting && cell.plantedCrop?.stage === 'mature'}
                isStolen={isStolen}
                isVisiting={isVisiting}
                timeRemaining={getTimeRemaining(cell)}
                onClick={() => handleCellClick(cell)}
              />
            );
          })}
        </div>
      </FarmCamera>

      {/* Visiting indicator */}
      {isVisiting && (
        <div className="absolute top-20 left-4 glass-panel text-white px-4 py-2 rounded-lg font-bold z-20 border border-red-500/50">
          <span className="text-red-400">🥷</span> 正在訪問好友農場 - 點擊成熟的作物偷菜！
        </div>
      )}
    </div>
  );
};
