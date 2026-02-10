import { useEffect, useCallback, useState } from 'react';
import { FarmCamera } from './FarmCamera';
import { IsometricCell } from './IsometricCell';
import { useGameStore } from '../../store/useGameStore';
import { getCropById } from '../../data/crops';
import { Position, FarmCell } from '../../types';
import { updateAchievementProgress } from '../../services/achievementService';
import { updateTaskProgress } from '../../services/dailyTaskService';
import { incrementStats } from '../../services/leaderboardService';
import { getCropPrice } from '../../services/marketService';

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
    selectedTool,
    plantCrop,
    harvestCrop,
    updateCropStages,
    addExperience,
    addDemoBalance,
    subtractDemoBalance,
    demoBalance,
    syncFarmToFirebase,
    fertilizeCrop,
    removeCrop,
    setSelectedTool,
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

  // Calculate grid size based on the farm being displayed
  const gridSize = isVisiting && visitingFarm
    ? Math.sqrt(visitingFarm.length)
    : (player?.landSize || 3);

  console.log('🎮 [IsometricFarm] Render info:', {
    isVisiting,
    farmCellsCount: activeFarm.length,
    gridSize,
    playerLandSize: player?.landSize,
  });

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
        onNotify('error', `GOLD 不足！需要 ${cropDef.cost}`);
        return;
      }

      if (subtractDemoBalance(cropDef.cost)) {
        plantCrop(position, selectedCrop);
        onNotify('success', `種下了 ${cropDef.nameCn}！`);

        // Update achievements, daily tasks, and leaderboard stats
        if (player) {
          try {
            await updateAchievementProgress(player.oderId, 'plant', 1);
            await updateTaskProgress(player.oderId, 'plant', 1);
            await incrementStats(player.oderId, 'plant', 1, player.level);
          } catch (error) {
            console.error('Failed to update achievements/tasks/stats:', error);
          }
        }

        // Sync to Firebase
        await syncFarmToFirebase();
      }
    },
    [selectedCrop, demoBalance, subtractDemoBalance, plantCrop, onNotify, isVisiting, syncFarmToFirebase, player]
  );

  const handleHarvest = useCallback(
    async (position: Position) => {
      if (isVisiting) return;

      const harvested = harvestCrop(position);
      if (harvested) {
        const cropDef = getCropById(harvested.cropId);
        if (cropDef && player) {
          // Get current market price
          const currentPrice = await getCropPrice(harvested.cropId);
          const priceChange = currentPrice - cropDef.sellPrice;
          const priceChangePercent = Math.round((priceChange / cropDef.sellPrice) * 100);

          addDemoBalance(currentPrice);
          addExperience(cropDef.experience);

          // Show price with trend indicator
          const trendEmoji = priceChange > 0 ? '📈' : priceChange < 0 ? '📉' : '';
          const priceChangeText = priceChange !== 0 ? ` (${priceChange > 0 ? '+' : ''}${priceChangePercent}%)` : '';
          onNotify('success', `收成了 ${cropDef.nameCn}！${trendEmoji}+${currentPrice} GOLD${priceChangeText}`);

          // Update achievements, daily tasks, and leaderboard stats - mark crop as discovered
          try {
            await updateAchievementProgress(player.oderId, 'discover_crop', 1, {
              cropId: harvested.cropId,
            });
            await updateAchievementProgress(player.oderId, 'harvest', 1);
            await updateAchievementProgress(player.oderId, 'earn', currentPrice);

            // Update daily tasks
            await updateTaskProgress(player.oderId, 'harvest', 1);
            await updateTaskProgress(player.oderId, 'earn', currentPrice);

            // Update leaderboard stats
            await incrementStats(player.oderId, 'harvest', 1, player.level);
            await incrementStats(player.oderId, 'earn', currentPrice, player.level);
          } catch (error) {
            console.error('Failed to update achievements/tasks/stats:', error);
          }

          // Sync to Firebase
          await syncFarmToFirebase();
        }
      }
    },
    [harvestCrop, addDemoBalance, addExperience, onNotify, isVisiting, syncFarmToFirebase, player]
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

      // Handle tool usage
      if (selectedTool && cell.plantedCrop) {
        if (selectedTool === 'remove') {
          if (removeCrop(cell.position)) {
            onNotify('success', '已移除作物！');
            await syncFarmToFirebase();
          }
          return;
        }

        if (selectedTool === 'fertilizer' || selectedTool === 'super_fertilizer') {
          if (cell.plantedCrop.stage === 'mature') {
            onNotify('info', '作物已經成熟了，不需要施肥！');
            return;
          }

          if (cell.plantedCrop.fertilizedAt) {
            onNotify('info', '這塊地已經施過肥了！');
            return;
          }

          if (fertilizeCrop(cell.position, selectedTool)) {
            const cropDef = getCropById(cell.plantedCrop.cropId);
            const fertName = selectedTool === 'super_fertilizer' ? '超級肥料' : '肥料';
            onNotify('success', `對 ${cropDef?.nameCn} 施了${fertName}！`);
            await syncFarmToFirebase();
            // Auto-deselect tool if it was super fertilizer
            if (selectedTool === 'super_fertilizer') {
              setSelectedTool(null);
            }
          } else {
            onNotify('error', '沒有肥料了！請在商店購買。');
          }
          return;
        }
      }

      // Handle normal planting and harvesting
      if (cell.plantedCrop?.stage === 'mature') {
        await handleHarvest(cell.position);
      } else if (!cell.plantedCrop && !selectedTool) {
        await handlePlant(cell.position);
      }
    },
    [
      handlePlant,
      handleHarvest,
      isVisiting,
      onSteal,
      stolenPositions,
      onNotify,
      selectedTool,
      fertilizeCrop,
      removeCrop,
      syncFarmToFirebase,
      setSelectedTool,
    ]
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
