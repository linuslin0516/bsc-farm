import { useGameStore } from '../../store/useGameStore';
import { Logo } from './Logo';
import { getExpForLevel } from '../../config/constants';

interface HUDProps {
  onOpenShop: () => void;
  onOpenFriends: () => void;
  onOpenAchievements: () => void;
  onOpenDailyTasks: () => void;
  onOpenLeaderboard: () => void;
  onOpenCodex: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  onOpenShop,
  onOpenFriends,
  onOpenAchievements,
  onOpenDailyTasks,
  onOpenLeaderboard,
  onOpenCodex,
}) => {
  const { player, demoBalance } = useGameStore();

  if (!player) return null;

  const currentLevelExp = getExpForLevel(player.level);
  const expProgress = (player.experience / currentLevelExp) * 100;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="p-3 flex justify-between items-start gap-4">
        {/* Left side - Logo and Balance */}
        <div className="flex items-center gap-3 pointer-events-auto">
          {/* Logo */}
          <div className="glass-panel p-2 rounded-xl">
            <Logo size="sm" />
          </div>

          {/* Balance */}
          <div className="glass-panel px-4 py-2 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🪙</span>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">$FARM</p>
                <p className="text-lg font-bold text-binance-yellow">
                  {demoBalance.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Center - Level */}
        <div className="glass-panel px-4 py-2 rounded-xl pointer-events-auto hidden sm:block">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-binance-yellow to-binance-gold flex items-center justify-center">
              <span className="text-binance-dark font-bold text-lg">{player.level}</span>
            </div>
            <div className="min-w-[120px]">
              <p className="text-xs text-gray-400">等級 {player.level}</p>
              <div className="h-2 bg-binance-gray rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-gradient-to-r from-binance-yellow to-binance-gold transition-all duration-300"
                  style={{ width: `${expProgress}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-0.5">
                {player.experience} / {currentLevelExp} XP
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Action buttons */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Daily Tasks */}
          <button
            onClick={onOpenDailyTasks}
            className="glass-panel p-3 rounded-xl hover:bg-white/20 transition-all group relative"
            title="每日任務"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform inline-block">📋</span>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          </button>

          {/* Achievements */}
          <button
            onClick={onOpenAchievements}
            className="glass-panel p-3 rounded-xl hover:bg-white/20 transition-all group"
            title="成就"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform inline-block">🏆</span>
          </button>

          {/* Crop Codex */}
          <button
            onClick={onOpenCodex}
            className="glass-panel p-3 rounded-xl hover:bg-white/20 transition-all group"
            title="作物圖鑑"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform inline-block">📚</span>
          </button>

          {/* Leaderboard */}
          <button
            onClick={onOpenLeaderboard}
            className="glass-panel p-3 rounded-xl hover:bg-white/20 transition-all group"
            title="排行榜"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform inline-block">🏅</span>
          </button>

          {/* Shop */}
          <button
            onClick={onOpenShop}
            className="glass-panel p-3 rounded-xl hover:bg-white/20 transition-all group"
            title="商店"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform inline-block">🏪</span>
          </button>

          {/* Friends */}
          <button
            onClick={onOpenFriends}
            className="glass-panel p-3 rounded-xl hover:bg-white/20 transition-all group"
            title="好友"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform inline-block">👥</span>
          </button>
        </div>
      </div>
    </div>
  );
};
