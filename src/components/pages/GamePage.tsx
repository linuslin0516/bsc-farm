import { useState, useCallback, useEffect } from 'react';
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
import { WalletPanel } from '../game/WalletPanel';
import { TokenExchangePanel } from '../game/TokenExchangePanel';
import { UpgradeShopPanel } from '../game/UpgradeShopPanel';
import { useGameStore } from '../../store/useGameStore';
import { useWeb3Store } from '../../store/useWeb3Store';
import { Notification as NotificationType, CropRarity } from '../../types';
import { getCropById } from '../../data/crops';
import { updateTaskProgress } from '../../services/dailyTaskService';
import { updateAchievementProgress } from '../../services/achievementService';
import { incrementStats } from '../../services/leaderboardService';
import { getCropPrice } from '../../services/marketService';
import { LANGUAGE_NAMES, Language } from '../../store/useLanguageStore';
import { useT } from '../../translations';

interface GamePageProps {
  onLogout: () => void;
}

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

// Settings Menu Component
const SettingsMenu: React.FC<{ onClose: () => void; onLogout: () => void }> = ({ onLogout }) => {
  const { t, language, setLanguage } = useT();
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);

  const languages: Language[] = ['zh-CN', 'zh-TW', 'en'];

  return (
    <div className="fixed bottom-20 left-4 z-40 pointer-events-auto">
      <div className="glass-panel rounded-xl p-4 w-56">
        <h3 className="text-white font-bold mb-3">{t.settings.title}</h3>

        {/* Language Selector */}
        <div className="mb-2">
          <button
            onClick={() => setShowLanguageSelect(!showLanguageSelect)}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 text-gray-200 flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <span>🌐</span>
              <span>{t.settings.language}</span>
            </span>
            <span className="text-gray-400 text-sm">{LANGUAGE_NAMES[language]}</span>
          </button>

          {showLanguageSelect && (
            <div className="mt-1 ml-6 space-y-1">
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setLanguage(lang);
                    setShowLanguageSelect(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    language === lang
                      ? 'bg-binance-yellow/20 text-binance-yellow'
                      : 'hover:bg-white/10 text-gray-300'
                  }`}
                >
                  {LANGUAGE_NAMES[lang]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-500/20 text-red-400 flex items-center gap-2"
        >
          <span>🚪</span>
          <span>{t.settings.logout}</span>
        </button>
      </div>
    </div>
  );
};

export const GamePage: React.FC<GamePageProps> = ({ onLogout }) => {
  // Panel states
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isFriendPanelOpen, setIsFriendPanelOpen] = useState(false);
  const [isAchievementPanelOpen, setIsAchievementPanelOpen] = useState(false);
  const [isDailyTasksPanelOpen, setIsDailyTasksPanelOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isCodexOpen, setIsCodexOpen] = useState(false);
  const [isWalletPanelOpen, setIsWalletPanelOpen] = useState(false);
  const [isExchangePanelOpen, setIsExchangePanelOpen] = useState(false);
  const [isUpgradeShopOpen, setIsUpgradeShopOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Translation hook
  const { t } = useT();

  // Initialize Web3 listeners
  const { initializeListeners } = useWeb3Store();
  useEffect(() => {
    initializeListeners();
  }, [initializeListeners]);

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
    getUpgradeBonuses,
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

    // Get upgrade bonuses
    const bonuses = getUpgradeBonuses();

    let totalEarnings = 0;
    let totalXP = 0;
    let harvested = 0;

    for (const cell of matureCells) {
      const result = harvestCrop(cell.position);
      if (result) {
        const cropDef = getCropById(result.cropId);
        if (cropDef) {
          // Get current market price for this crop
          let currentPrice = await getCropPrice(result.cropId);

          // Apply sell price bonus
          currentPrice = Math.floor(currentPrice * bonuses.sellPriceMultiplier);

          // Apply rare bonus for rare+ crops
          const isRareOrAbove = ['rare', 'epic', 'legendary'].includes(cropDef.rarity);
          if (isRareOrAbove) {
            currentPrice = Math.floor(currentPrice * bonuses.rareBonusMultiplier);
          }

          totalEarnings += currentPrice;

          // Apply exp bonus
          totalXP += Math.floor(cropDef.experience * bonuses.expMultiplier);
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
    getUpgradeBonuses,
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
        onOpenWallet={() => setIsWalletPanelOpen(!isWalletPanelOpen)}
        onOpenExchange={() => setIsExchangePanelOpen(true)}
        onOpenUpgrades={() => setIsUpgradeShopOpen(true)}
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

      {/* Help & Settings - Bottom Left */}
      <div className="fixed bottom-4 left-4 z-30 pointer-events-auto flex gap-2">
        <button
          className="glass-panel p-3 rounded-full hover:bg-white/20 transition-all group"
          title={t.farm.dragHint}
          onClick={() => handleNotify('info', t.farm.dragHint)}
        >
          <span className="text-xl">❓</span>
        </button>
        <button
          className="glass-panel p-3 rounded-full hover:bg-white/20 transition-all group"
          title={t.settings.title}
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
        >
          <span className="text-xl">⚙️</span>
        </button>
      </div>

      {/* Settings Menu */}
      {isSettingsOpen && (
        <SettingsMenu
          onClose={() => setIsSettingsOpen(false)}
          onLogout={() => {
            setIsSettingsOpen(false);
            setShowLogoutConfirm(true);
          }}
        />
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowLogoutConfirm(false)} />
          <div className="relative glass-panel rounded-xl p-6 w-80 text-center">
            <h3 className="text-xl font-bold text-white mb-2">{t.settings.logoutConfirm}</h3>
            <p className="text-gray-400 text-sm mb-6">
              {t.settings.logoutDesc}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white transition-colors"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onLogout();
                }}
                className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
              >
                {t.settings.logout}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Panel - Floating (appears below HUD on left side) */}
      {isWalletPanelOpen && (
        <div className="fixed top-20 left-4 z-50 w-80">
          <WalletPanel onNotify={handleNotify} />
          <button
            onClick={() => setIsWalletPanelOpen(false)}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-white text-xs
                     flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

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

      {/* Token Exchange Panel */}
      <TokenExchangePanel
        isOpen={isExchangePanelOpen}
        onClose={() => setIsExchangePanelOpen(false)}
        onNotify={handleNotify}
      />

      {/* Upgrade Shop Panel */}
      <UpgradeShopPanel
        isOpen={isUpgradeShopOpen}
        onClose={() => setIsUpgradeShopOpen(false)}
        onNotify={handleNotify}
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
