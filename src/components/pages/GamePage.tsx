import { useState, useCallback } from 'react';
import { AnimatedBackground } from '../game/AnimatedBackground';
import { HUD } from '../game/HUD';
import { IsometricFarm } from '../game/IsometricFarm';
import { CropToolbar } from '../game/CropToolbar';
import { ToolToolbar } from '../game/ToolToolbar';
import { Shop } from '../game/Shop';
import { FriendPanel } from '../social/FriendPanel';
import { Notification } from '../ui/Notification';
import { AchievementPanel } from '../game/AchievementPanel';
import { DailyTasksPanel } from '../game/DailyTasksPanel';
import { LeaderboardPanel } from '../game/LeaderboardPanel';
import { CropCodex } from '../game/CropCodex';
import { UnlockAnimation } from '../ui/UnlockAnimation';
import { UpgradeShopPanel } from '../game/UpgradeShopPanel';
import { useGameStore } from '../../store/useGameStore';
import { useFriendFarm } from '../../hooks/useFriendFarm';
import { Notification as NotificationType, CropRarity } from '../../types';
import { getCropById } from '../../data/crops';
import { updateTaskProgress } from '../../services/dailyTaskService';
import { updateAchievementProgress } from '../../services/achievementService';
import { incrementStats } from '../../services/leaderboardService';
import { getCropPrice } from '../../services/marketService';
import { LANGUAGE_NAMES, Language } from '../../store/useLanguageStore';
import { useT } from '../../translations';
import { localizeText, localizeZh } from '../../utils/i18n';

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

  const whitepaperText = language === 'en' ? 'Whitepaper' : '白皮書';

  return (
    <div className="fixed bottom-20 left-4 z-40 pointer-events-auto">
      <div className="hud-panel rounded-xl p-4 w-56">
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
                      ? 'bg-space-bio-cyan/20 text-space-bio-cyan'
                      : 'hover:bg-white/10 text-gray-300'
                  }`}
                >
                  {LANGUAGE_NAMES[lang]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Whitepaper Link */}
        <a
          href="/whitepaper"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-500/20 text-blue-400 flex items-center gap-2 mb-2"
        >
          <span>📄</span>
          <span>{whitepaperText}</span>
        </a>

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
  const [isUpgradeShopOpen, setIsUpgradeShopOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Translation hook
  const { t, language } = useT();
  const l = (en: string, zh: string) => localizeText(language, en, zh);
  const zh = (value: string) => localizeZh(value, language);

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

  // Friend farm hook
  const {
    friendFarm,
    stolenPositions,
    isLoading: isFriendFarmLoading,
    friendLevel,
    handleSteal,
    stolenCount,
    stealableCount,
  } = useFriendFarm(
    visitingState.isVisiting ? visitingState.friendId : null,
    player?.oderId || ''
  );

  const handleNotify = useCallback(
    (type: NotificationType['type'], message: string, duration?: number) => {
      setNotification({ type, message, duration });
    },
    []
  );

  // Plant all empty cells with selected crop
  const handlePlantAll = useCallback(async () => {
    if (!selectedCrop) {
      handleNotify('info', l('Please select seeds first!', '請先選擇種子！'));
      return;
    }

    const cropDef = getCropById(selectedCrop);
    if (!cropDef) return;

    const emptyCells = farmCells.filter((cell) => !cell.plantedCrop);
    if (emptyCells.length === 0) {
      handleNotify('info', l('No empty land available!', '沒有空地了！'));
      return;
    }

    const totalCost = emptyCells.length * cropDef.cost;
    if (demoBalance < totalCost) {
      const maxPlantable = Math.floor(demoBalance / cropDef.cost);
      if (maxPlantable === 0) {
        handleNotify('error', l(`Not enough GOLD! Need ${cropDef.cost}`, `GOLD 不足！需要 ${cropDef.cost}`));
        return;
      }
      handleNotify(
        'warning',
        l(`Not enough GOLD to plant all! Planting ${maxPlantable} plots (need ${totalCost}, have ${demoBalance.toFixed(0)})`, `GOLD 不足種滿！僅種植 ${maxPlantable} 塊地（共需 ${totalCost}，目前有 ${demoBalance.toFixed(0)}）`)
      );
      let planted = 0;
      for (let i = 0; i < maxPlantable; i++) {
        if (subtractDemoBalance(cropDef.cost)) {
          plantCrop(emptyCells[i].position, selectedCrop);
          planted++;
        }
      }

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

    let planted = 0;
    for (const cell of emptyCells) {
      if (subtractDemoBalance(cropDef.cost)) {
        plantCrop(cell.position, selectedCrop);
        planted++;
      }
    }

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
    const cropName = language === 'en' ? cropDef.name : zh(cropDef.nameCn);
    handleNotify('success', l(`Planted ${planted} plots of ${cropName}!`, `成功種植 ${planted} 塊 ${cropName}！`));
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

  // Handle steal with notification
  const handleStealWithNotify = useCallback(
    async (position: { x: number; y: number }) => {
      const result = await handleSteal(position);
      if (result.success) {
        handleNotify('success', result.message);
      } else {
        handleNotify('error', result.message);
      }
    },
    [handleSteal, handleNotify]
  );

  // Harvest all mature crops
  const handleHarvestAll = useCallback(async () => {
    const matureCells = farmCells.filter(
      (cell) => cell.plantedCrop && cell.plantedCrop.stage === 'mature'
    );

    if (matureCells.length === 0) {
      handleNotify('info', l('No mature crops to harvest!', '沒有成熟的作物可以收成！'));
      return;
    }

    const bonuses = getUpgradeBonuses();

    let totalEarnings = 0;
    let totalXP = 0;
    let harvested = 0;

    for (const cell of matureCells) {
      const result = harvestCrop(cell.position);
      if (result) {
        const cropDef = getCropById(result.cropId);
        if (cropDef) {
          let currentPrice = await getCropPrice(result.cropId);
          currentPrice = Math.floor(currentPrice * bonuses.sellPriceMultiplier);

          const isRareOrAbove = ['rare', 'epic', 'legendary'].includes(cropDef.rarity);
          if (isRareOrAbove) {
            currentPrice = Math.floor(currentPrice * bonuses.rareBonusMultiplier);
          }

          totalEarnings += currentPrice;
          totalXP += Math.floor(cropDef.experience * bonuses.expMultiplier);
          harvested++;

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
      addDemoBalance(totalEarnings);
      addExperience(totalXP);

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
      handleNotify('success', l(`Harvested ${harvested} plots! Earned ${totalEarnings} GOLD and ${totalXP} XP!`, `收成了 ${harvested} 塊作物！獲得 ${totalEarnings} GOLD 和 ${totalXP} XP！`));
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

  // Function to show unlock animation
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

  // Expose showUnlockAnimation to window for global access
  if (typeof window !== 'undefined') {
    (window as unknown as { showUnlockAnimation: typeof showUnlockAnimation }).showUnlockAnimation = showUnlockAnimation;
  }

  if (!player) return null;

  const isVisiting = visitingState.isVisiting;

  // Loading state for friend farm
  if (isVisiting && isFriendFarmLoading) {
    return (
      <div className="h-screen w-screen overflow-hidden relative">
        <AnimatedBackground />
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-space-bio-cyan mx-auto mb-4" />
            <p className="text-gray-400">
              {l(`Loading ${visitingState.friendName}'s farm...`, `正在載入 ${visitingState.friendName} 的農場...`)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      {/* Animated Sky Background */}
      <AnimatedBackground />

      {/* Main Game Area - Full Screen */}
      <div className="relative z-10 h-full w-full">
        {/* Isometric Farm - renders own farm or friend's farm */}
        <IsometricFarm
          onNotify={handleNotify}
          isVisiting={isVisiting}
          visitingFarm={isVisiting ? friendFarm : undefined}
          visitingUserId={isVisiting ? visitingState.friendId : undefined}
          stolenPositions={isVisiting ? stolenPositions : undefined}
          onSteal={isVisiting ? handleStealWithNotify : undefined}
        />
      </div>

      {/* HUD - switches between normal and visiting mode */}
      <HUD
        onOpenShop={() => setIsShopOpen(true)}
        onOpenFriends={() => setIsFriendPanelOpen(true)}
        onOpenAchievements={() => setIsAchievementPanelOpen(true)}
        onOpenDailyTasks={() => setIsDailyTasksPanelOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenCodex={() => setIsCodexOpen(true)}
        onOpenUpgrades={() => setIsUpgradeShopOpen(true)}
        isVisiting={isVisiting}
        visitingFriendName={visitingState.friendName}
        visitingFriendLevel={friendLevel}
        onReturnFromVisit={handleBackFromVisit}
        stolenCount={stolenCount}
        stealableCount={stealableCount}
      />

      {/* Only show toolbars, settings, help when NOT visiting */}
      {!isVisiting && (
        <>
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
              className="hud-panel p-3 rounded-full hover:bg-white/20 transition-all group"
              title={t.farm.dragHint}
              onClick={() => handleNotify('info', t.farm.dragHint)}
            >
              <span className="text-xl">❓</span>
            </button>
            <button
              className="hud-panel p-3 rounded-full hover:bg-white/20 transition-all group"
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
        </>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowLogoutConfirm(false)} />
          <div className="relative hud-panel rounded-xl p-6 w-80 text-center">
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
