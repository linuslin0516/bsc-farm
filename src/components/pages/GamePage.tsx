import { useState, useCallback } from 'react';
import { AnimatedBackground } from '../game/AnimatedBackground';
import { HUD } from '../game/HUD';
import { CharacterStatsPanel } from '../game/CharacterStatsPanel';
import { IsometricFarm } from '../game/IsometricFarm';
import { CropToolbar } from '../game/CropToolbar';
import { ToolToolbar } from '../game/ToolToolbar';
import { Shop } from '../game/Shop';
import { FriendPanel } from '../social/FriendPanel';
import { FriendFarmPage } from './FriendFarmPage';
import { Notification } from '../ui/Notification';
import { AchievementPanel } from '../game/AchievementPanel';
import { DailyTasksPanel } from '../game/DailyTasksPanel';
import { LeaderboardPanel } from '../game/LeaderboardPanel';
import { CropCodex } from '../game/CropCodex';
import { UnlockAnimation } from '../ui/UnlockAnimation';
import { useGameStore } from '../../store/useGameStore';
import { Notification as NotificationType, CropRarity } from '../../types';
import { getCropById } from '../../data/crops';
import { updateTaskProgress } from '../../services/dailyTaskService';
import { updateAchievementProgress } from '../../services/achievementService';
import { incrementStats } from '../../services/leaderboardService';
import { getCropPrice } from '../../services/marketService';

interface VisitingState {
  isVisiting: boolean;
  friendId: string;
  friendName: string;
}

interface UnlockState {
  isOpen: boolean;
  type: 'crop' | 'achievement';
  title: string;
  subtitle?: string;
  emoji: string;
  rarity: CropRarity;
  rewards?: { xp?: number; tokens?: number };
}

export const GamePage: React.FC = () => {
  // Panel states
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isFriendPanelOpen, setIsFriendPanelOpen] = useState(false);
  const [isAchievementPanelOpen, setIsAchievementPanelOpen] = useState(false);
  const [isDailyTasksPanelOpen, setIsDailyTasksPanelOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isCodexOpen, setIsCodexOpen] = useState(false);

  // Notification state
  const [notification, setNotification] = useState<NotificationType | null>(null);

  // Visiting state
  const [visitingState, setVisitingState] = useState<VisitingState>({
    isVisiting: false,
    friendId: '',
    friendName: '',
  });

  // Unlock animation state
  const [unlockState, setUnlockState] = useState<UnlockState>({
    isOpen: false,
    type: 'crop',
    title: '',
    emoji: '',
    rarity: 'common',
  });

  const {
    player,
    farmCells,
    selectedCrop,
    plantCrop,
    harvestCrop,
    addDemoBalance,
    addExperience,
    demoBalance,
    subtractDemoBalance,
    syncFarmToFirebase,
  } = useGameStore();

  const handleNotify = useCallback(
    (type: NotificationType['type'], message: string, duration?: number) => {
      setNotification({ type, message, duration });
    },
    []
  );

  // Plant all empty cells with selected crop
  const handlePlantAll = useCallback(async () => {
    if (!selectedCrop) {
      handleNotify('info', '請先選擇種子！');
      return;
    }

    const cropDef = getCropById(selectedCrop);
    if (!cropDef) return;

    const emptyCells = farmCells.filter((cell) => !cell.plantedCrop);
    if (emptyCells.length === 0) {
      handleNotify('info', '沒有空地了！');
      return;
    }

    const totalCost = emptyCells.length * cropDef.cost;
    if (demoBalance < totalCost) {
      const maxPlantable = Math.floor(demoBalance / cropDef.cost);
      if (maxPlantable === 0) {
        handleNotify('error', `$FARM 不足！需要 ${cropDef.cost}`);
        return;
      }
      handleNotify(
        'warning',
        `$FARM 不足種滿！僅種植 ${maxPlantable} 塊地（共需 ${totalCost}，目前有 ${demoBalance.toFixed(0)}）`
      );
      // Plant what we can afford
      let planted = 0;
      for (let i = 0; i < maxPlantable; i++) {
        if (subtractDemoBalance(cropDef.cost)) {
          plantCrop(emptyCells[i].position, selectedCrop);
          planted++;
        }
      }

      // Update achievements, daily tasks, and leaderboard stats
      if (player && planted > 0) {
        try {
          await updateAchievementProgress(player.oderId, 'plant', planted);
          await updateTaskProgress(player.oderId, 'plant', planted);
          await incrementStats(player.oderId, 'plant', planted, player.level);
        } catch (error) {
          console.error('Failed to update achievements/tasks/stats:', error);
        }
      }

      await syncFarmToFirebase();
      return;
    }

    // Plant all
    let planted = 0;
    for (const cell of emptyCells) {
      if (subtractDemoBalance(cropDef.cost)) {
        plantCrop(cell.position, selectedCrop);
        planted++;
      }
    }

    // Update achievements, daily tasks, and leaderboard stats
    if (player && planted > 0) {
      try {
        await updateAchievementProgress(player.oderId, 'plant', planted);
        await updateTaskProgress(player.oderId, 'plant', planted);
        await incrementStats(player.oderId, 'plant', planted, player.level);
      } catch (error) {
        console.error('Failed to update achievements/tasks/stats:', error);
      }
    }

    await syncFarmToFirebase();
    handleNotify('success', `成功種植 ${planted} 塊 ${cropDef.nameCn}！`);
  }, [
    selectedCrop,
    farmCells,
    demoBalance,
    subtractDemoBalance,
    plantCrop,
    syncFarmToFirebase,
    handleNotify,
  ]);

  const handleVisitFriend = useCallback((friendId: string, friendName: string) => {
    setVisitingState({
      isVisiting: true,
      friendId,
      friendName,
    });
    setIsFriendPanelOpen(false);
  }, []);

  const handleBackFromVisit = useCallback(() => {
    setVisitingState({
      isVisiting: false,
      friendId: '',
      friendName: '',
    });
  }, []);

  // Harvest all mature crops
  const handleHarvestAll = useCallback(async () => {
    const matureCells = farmCells.filter(
      (cell) => cell.plantedCrop && cell.plantedCrop.stage === 'mature'
    );

    if (matureCells.length === 0) {
      handleNotify('info', '沒有成熟的作物可以收成！');
      return;
    }

    let totalEarnings = 0;
    let totalXP = 0;
    let harvested = 0;

    for (const cell of matureCells) {
      const result = harvestCrop(cell.position);
      if (result) {
        const cropDef = getCropById(result.cropId);
        if (cropDef) {
          // Get current market price for this crop
          const currentPrice = await getCropPrice(result.cropId);
          totalEarnings += currentPrice;
          totalXP += cropDef.experience;
          harvested++;

          // Mark crop as discovered
          if (player) {
            try {
              await updateAchievementProgress(player.oderId, 'discover_crop', 1, {
                cropId: result.cropId,
              });
            } catch (error) {
              console.error('Failed to update crop discovery:', error);
            }
          }
        }
      }
    }

    if (harvested > 0 && player) {
      // Apply rewards
      addDemoBalance(totalEarnings);
      addExperience(totalXP);

      // Update achievements, tasks, and stats
      try {
        await updateAchievementProgress(player.oderId, 'harvest', harvested);
        await updateAchievementProgress(player.oderId, 'earn', totalEarnings);
        await updateTaskProgress(player.oderId, 'harvest', harvested);
        await updateTaskProgress(player.oderId, 'earn', totalEarnings);
        await incrementStats(player.oderId, 'harvest', harvested, player.level);
        await incrementStats(player.oderId, 'earn', totalEarnings, player.level);
      } catch (error) {
        console.error('Failed to update achievements/tasks/stats:', error);
      }

      await syncFarmToFirebase();
      handleNotify('success', `收成了 ${harvested} 塊作物！獲得 ${totalEarnings} $FARM 和 ${totalXP} XP！`);
    }
  }, [
    farmCells,
    harvestCrop,
    addDemoBalance,
    addExperience,
    syncFarmToFirebase,
    handleNotify,
    player,
  ]);

  // Function to show unlock animation (exported for use by other components)
  const showUnlockAnimation = useCallback((
    type: 'crop' | 'achievement',
    title: string,
    emoji: string,
    rarity: CropRarity,
    subtitle?: string,
    rewards?: { xp?: number; tokens?: number }
  ) => {
    setUnlockState({
      isOpen: true,
      type,
      title,
      subtitle,
      emoji,
      rarity,
      rewards,
    });
  }, []);

  // Expose showUnlockAnimation to window for global access (e.g., from services)
  if (typeof window !== 'undefined') {
    (window as unknown as { showUnlockAnimation: typeof showUnlockAnimation }).showUnlockAnimation = showUnlockAnimation;
  }

  if (!player) return null;

  // Show friend's farm if visiting
  if (visitingState.isVisiting) {
    return (
      <FriendFarmPage
        friendId={visitingState.friendId}
        friendName={visitingState.friendName}
        myUserId={player.oderId}
        onBack={handleBackFromVisit}
      />
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      {/* Animated Sky Background */}
      <AnimatedBackground />

      {/* Main Game Area - Full Screen */}
      <div className="relative z-10 h-full w-full">
        {/* Isometric Farm - Full Screen */}
        <IsometricFarm onNotify={handleNotify} />
      </div>

      {/* Floating HUD */}
      <HUD
        onOpenShop={() => setIsShopOpen(true)}
        onOpenFriends={() => setIsFriendPanelOpen(true)}
        onOpenAchievements={() => setIsAchievementPanelOpen(true)}
        onOpenDailyTasks={() => setIsDailyTasksPanelOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenCodex={() => setIsCodexOpen(true)}
      />

      {/* Character Stats Panel */}
      <CharacterStatsPanel />

      {/* Floating Crop Toolbar - Bottom */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
        <CropToolbar />
      </div>

      {/* Floating Tool Toolbar - Bottom Right */}
      <div className="fixed bottom-4 right-4 z-40">
        <ToolToolbar onNotify={handleNotify} onPlantAll={handlePlantAll} onHarvestAll={handleHarvestAll} />
      </div>

      {/* Help Tooltip - Bottom Left */}
      <div className="fixed bottom-4 left-4 z-30 pointer-events-auto">
        <button
          className="glass-panel p-3 rounded-full hover:bg-white/20 transition-all group"
          title="遊戲指南"
          onClick={() => handleNotify('info', '🖱️ 拖曳移動視角 | 滾輪縮放 | 點擊種植/收成')}
        >
          <span className="text-xl">❓</span>
        </button>
      </div>

      {/* Shop Modal */}
      <Shop
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        onNotify={handleNotify}
      />

      {/* Friend Panel */}
      <FriendPanel
        isOpen={isFriendPanelOpen}
        onClose={() => setIsFriendPanelOpen(false)}
        myUserId={player.oderId}
        onVisitFriend={handleVisitFriend}
        onNotify={handleNotify}
      />

      {/* Achievement Panel */}
      <AchievementPanel
        isOpen={isAchievementPanelOpen}
        onClose={() => setIsAchievementPanelOpen(false)}
      />

      {/* Daily Tasks Panel */}
      <DailyTasksPanel
        isOpen={isDailyTasksPanelOpen}
        onClose={() => setIsDailyTasksPanelOpen(false)}
        onNotify={handleNotify}
      />

      {/* Leaderboard Panel */}
      <LeaderboardPanel
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
      />

      {/* Crop Codex */}
      <CropCodex
        isOpen={isCodexOpen}
        onClose={() => setIsCodexOpen(false)}
      />

      {/* Unlock Animation */}
      <UnlockAnimation
        isOpen={unlockState.isOpen}
        onClose={() => setUnlockState(prev => ({ ...prev, isOpen: false }))}
        type={unlockState.type}
        title={unlockState.title}
        subtitle={unlockState.subtitle}
        emoji={unlockState.emoji}
        rarity={unlockState.rarity}
        rewards={unlockState.rewards}
      />

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
