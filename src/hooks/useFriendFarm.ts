import { useState, useEffect, useCallback } from 'react';
import { FarmCell, Position, CropStage } from '../types';
import { getUserById } from '../services/userService';
import { stealCrop, getStolenCellsForTarget } from '../services/stealService';
import { useGameStore } from '../store/useGameStore';
import { getCropById } from '../data/crops';
import { incrementStats } from '../services/leaderboardService';
import { updateAchievementProgress } from '../services/achievementService';
import { updateTaskProgress } from '../services/dailyTaskService';

const getCropStage = (plantedAt: number, growthTime: number): CropStage => {
  const now = Date.now();
  const elapsed = (now - plantedAt) / 1000;
  const progress = elapsed / growthTime;

  if (progress < 0.25) return 'seed';
  if (progress < 0.5) return 'sprout';
  if (progress < 1) return 'growing';
  return 'mature';
};

const updateFarmCellStages = (cells: FarmCell[]): FarmCell[] => {
  return cells.map((cell) => {
    if (!cell.plantedCrop) return cell;
    const crop = getCropById(cell.plantedCrop.cropId);
    if (!crop) return cell;

    const newStage = getCropStage(cell.plantedCrop.plantedAt, crop.growthTime);
    return {
      ...cell,
      plantedCrop: { ...cell.plantedCrop, stage: newStage },
    };
  });
};

export function useFriendFarm(friendId: string | null, myUserId: string) {
  const [friendFarm, setFriendFarm] = useState<FarmCell[]>([]);
  const [stolenPositions, setStolenPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [friendLevel, setFriendLevel] = useState(1);

  const { addDemoBalance, player } = useGameStore();

  // Load friend's farm
  useEffect(() => {
    if (!friendId) {
      setFriendFarm([]);
      setStolenPositions([]);
      setFriendLevel(1);
      return;
    }

    const loadFriendData = async () => {
      setIsLoading(true);
      try {
        const friendUser = await getUserById(friendId);
        if (friendUser) {
          const updatedFarm = updateFarmCellStages(friendUser.farmCells);
          setFriendFarm(updatedFarm);
          setFriendLevel(friendUser.level);
          const stolen = await getStolenCellsForTarget(myUserId, friendId);
          setStolenPositions(stolen);
        }
      } catch (error) {
        console.error('Failed to load friend farm:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFriendData();
  }, [friendId, myUserId]);

  // Update crop stages every second
  useEffect(() => {
    if (!friendId) return;
    const interval = setInterval(() => {
      setFriendFarm((prev) => updateFarmCellStages(prev));
    }, 1000);
    return () => clearInterval(interval);
  }, [friendId]);

  // Handle stealing
  const handleSteal = useCallback(
    async (position: Position) => {
      if (!friendId) return { success: false, message: '' };
      try {
        const result = await stealCrop(myUserId, friendId, position);

        if (result.success && result.amount) {
          addDemoBalance(result.amount);
          setStolenPositions((prev) => [...prev, position]);

          // Remove the crop visually
          setFriendFarm((prevFarm) =>
            prevFarm.map((cell) => {
              if (cell.position.x === position.x && cell.position.y === position.y) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { plantedCrop, ...cellWithoutCrop } = cell;
                return cellWithoutCrop;
              }
              return cell;
            })
          );

          // Update achievements, tasks, and stats
          if (player) {
            try {
              await updateAchievementProgress(player.oderId, 'steal', 1);
              await updateTaskProgress(player.oderId, 'steal', 1);
              await incrementStats(player.oderId, 'steal', 1, player.level);
            } catch (error) {
              console.error('Failed to update stats:', error);
            }
          }

          return { success: true, message: result.message };
        }
        return { success: false, message: result.message };
      } catch (error) {
        console.error('Failed to steal crop:', error);
        return { success: false, message: '偷菜失敗' };
      }
    },
    [friendId, myUserId, addDemoBalance, player]
  );

  const stealableCount =
    friendFarm.filter((c) => c.plantedCrop?.stage === 'mature').length -
    stolenPositions.length;

  return {
    friendFarm,
    stolenPositions,
    isLoading,
    friendLevel,
    handleSteal,
    stolenCount: stolenPositions.length,
    stealableCount: Math.max(0, stealableCount),
  };
}
