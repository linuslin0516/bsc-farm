import { useState, useCallback } from 'react';
import { AnimatedBackground } from '../game/AnimatedBackground';
import { HUD } from '../game/HUD';
import { CharacterStatsPanel } from '../game/CharacterStatsPanel';
import { IsometricFarm } from '../game/IsometricFarm';
import { CropToolbar } from '../game/CropToolbar';
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

  const { player } = useGameStore();

  const handleNotify = useCallback(
    (type: NotificationType['type'], message: string, duration?: number) => {
      setNotification({ type, message, duration });
    },
    []
  );

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

  // Function to show unlock animation (can be called from anywhere)
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
