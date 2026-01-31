import { useState, useEffect, useCallback } from 'react';
import { IsometricFarm } from '../game/IsometricFarm';
import { Button } from '../ui/Button';
import { Notification } from '../ui/Notification';
import { FarmCell, Position, Notification as NotificationType, CropStage } from '../../types';
import { getUserById } from '../../services/userService';
import { stealCrop, getStolenCellsForTarget } from '../../services/stealService';
import { useGameStore } from '../../store/useGameStore';
import { getCropById } from '../../data/crops';
import { incrementStats } from '../../services/leaderboardService';
import { updateAchievementProgress } from '../../services/achievementService';
import { updateTaskProgress } from '../../services/dailyTaskService';

// Calculate crop stage based on planted time
const getCropStage = (plantedAt: number, growthTime: number): CropStage => {
  const now = Date.now();
  const elapsed = (now - plantedAt) / 1000; // in seconds
  const progress = elapsed / growthTime;

  if (progress < 0.25) return 'seed';
  if (progress < 0.5) return 'sprout';
  if (progress < 1) return 'growing';
  return 'mature';
};

// Update farm cells with calculated stages
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

interface FriendFarmPageProps {
  friendId: string;
  friendName: string;
  myUserId: string;
  onBack: () => void;
}

export const FriendFarmPage: React.FC<FriendFarmPageProps> = ({
  friendId,
  friendName,
  myUserId,
  onBack,
}) => {
  const [friendFarm, setFriendFarm] = useState<FarmCell[]>([]);
  const [stolenPositions, setStolenPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<NotificationType | null>(null);
  const [friendLevel, setFriendLevel] = useState(1);

  const { addDemoBalance, player } = useGameStore();

  const handleNotify = useCallback(
    (type: NotificationType['type'], message: string) => {
      setNotification({ type, message });
    },
    []
  );

  // Load friend's farm
  useEffect(() => {
    const loadFriendData = async () => {
      setIsLoading(true);
      try {
        console.log(`🌾 [FriendFarm] Loading friend farm for ID: ${friendId}`);
        const friendUser = await getUserById(friendId);

        if (friendUser) {
          console.log(`🌾 [FriendFarm] Friend user found:`, {
            name: friendUser.name,
            level: friendUser.level,
            farmCellsCount: friendUser.farmCells.length,
            farmCells: friendUser.farmCells
          });

          // Calculate current crop stages based on plantedAt time
          const updatedFarm = updateFarmCellStages(friendUser.farmCells);
          console.log(`🌾 [FriendFarm] Updated farm cells:`, updatedFarm);
          setFriendFarm(updatedFarm);
          setFriendLevel(friendUser.level);

          // Load already stolen positions
          const stolen = await getStolenCellsForTarget(myUserId, friendId);
          console.log(`🌾 [FriendFarm] Already stolen positions:`, stolen);
          setStolenPositions(stolen);
        } else {
          console.error(`❌ [FriendFarm] Friend user not found for ID: ${friendId}`);
          handleNotify('error', '找不到好友的農場');
        }
      } catch (error) {
        console.error('❌ [FriendFarm] Failed to load friend farm:', error);
        handleNotify('error', '載入農場失敗');
      } finally {
        setIsLoading(false);
      }
    };

    loadFriendData();
  }, [friendId, myUserId, handleNotify]);

  // Update crop stages every second
  useEffect(() => {
    const interval = setInterval(() => {
      setFriendFarm((prev) => updateFarmCellStages(prev));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle stealing
  const handleSteal = async (position: Position) => {
    try {
      console.log(`🥷 [FriendFarm] Attempting to steal from position:`, position);
      const result = await stealCrop(myUserId, friendId, position);

      if (result.success && result.amount) {
        console.log(`✅ [FriendFarm] Steal successful! Amount: ${result.amount}`);

        // Update local balance
        addDemoBalance(result.amount);

        // Add to stolen positions
        setStolenPositions((prev) => [...prev, position]);

        // Remove the crop from the friend's farm visually
        setFriendFarm((prevFarm) =>
          prevFarm.map((cell) => {
            if (cell.position.x === position.x && cell.position.y === position.y) {
              const { plantedCrop, ...cellWithoutCrop } = cell;
              return cellWithoutCrop;
            }
            return cell;
          })
        );

        // Update achievements, tasks, and leaderboard stats
        if (player) {
          try {
            await updateAchievementProgress(player.oderId, 'steal', 1);
            await updateTaskProgress(player.oderId, 'steal', 1);
            await incrementStats(player.oderId, 'steal', 1, player.level);
          } catch (error) {
            console.error('Failed to update stats:', error);
          }
        }

        handleNotify('success', result.message);
      } else {
        console.warn(`⚠️ [FriendFarm] Steal failed:`, result.message);
        handleNotify('error', result.message);
      }
    } catch (error) {
      console.error('❌ [FriendFarm] Failed to steal crop:', error);
      handleNotify('error', '偷菜失敗');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-binance-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-binance-yellow mx-auto mb-4"></div>
          <p className="text-gray-400">正在載入 {friendName} 的農場...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-binance-dark via-binance-gray to-binance-dark">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-binance-dark/90 backdrop-blur-md border-b-2 border-red-500/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button onClick={onBack} variant="secondary" size="sm">
              ← 返回我的農場
            </Button>

            <div className="text-center">
              <h1 className="text-xl font-bold text-white">
                {friendName} 的農場
              </h1>
              <p className="text-xs text-gray-400">
                ID: {friendId} · Lv.{friendLevel}
              </p>
            </div>

            <div className="w-24" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Steal tips */}
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <h3 className="text-sm font-bold text-red-400 mb-2">🥷 偷菜模式</h3>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>• 點擊成熟的作物（有 ✨ 標記）來偷菜</li>
              <li>• 每塊地只能偷一次</li>
              <li>• 偷取價值的 10-20%</li>
              <li>• 每位好友 30 分鐘冷卻時間</li>
            </ul>
          </div>

          {/* Farm */}
          <div className="relative bg-gradient-to-b from-green-900/20 to-green-800/20 rounded-xl border-2 border-red-500/30 overflow-hidden" style={{ height: '600px' }}>
            <IsometricFarm
              onNotify={handleNotify}
              isVisiting={true}
              visitingFarm={friendFarm}
              visitingUserId={friendId}
              stolenPositions={stolenPositions}
              onSteal={handleSteal}
            />
          </div>

          {/* Stats */}
          <div className="mt-4 flex justify-center gap-4 text-sm text-gray-400">
            <span>
              已偷: {stolenPositions.length} 塊
            </span>
            <span>
              可偷: {friendFarm.filter(c => c.plantedCrop?.stage === 'mature').length - stolenPositions.length} 塊
            </span>
          </div>
        </div>
      </main>

      {/* Notification */}
      {notification && (
        <Notification
          notification={notification}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};
