import { useGameStore } from '../../store/useGameStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { Logo } from './Logo';
import { getExpForLevel } from '../../config/constants';
import { localizeText } from '../../utils/i18n';

interface HUDProps {
  onOpenShop: () => void;
  onOpenFriends: () => void;
  onOpenAchievements: () => void;
  onOpenDailyTasks: () => void;
  onOpenLeaderboard: () => void;
  onOpenCodex: () => void;
  onOpenUpgrades: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  onOpenShop,
  onOpenFriends,
  onOpenAchievements,
  onOpenDailyTasks,
  onOpenLeaderboard,
  onOpenCodex,
  onOpenUpgrades,
}) => {
  const { player, goldBalance } = useGameStore();
  const { language } = useLanguageStore();
  const l = (en: string, zh: string) => localizeText(language, en, zh);

  if (!player) return null;

  const currentLevelExp = getExpForLevel(player.level);
  const expProgress = (player.experience / currentLevelExp) * 100;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="p-3 flex justify-between items-start gap-4">
        {/* Left side - Logo and Balance */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Logo */}
          <div className="glass-panel p-2 rounded-xl">
            <Logo size="sm" />
          </div>

          {/* GOLD Balance */}
          <div className="glass-panel px-3 py-2 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚡</span>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">GOLD</p>
                <p className="text-base font-bold text-space-cyan">
                  {goldBalance.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Center - Level */}
        <div className="glass-panel px-4 py-2 rounded-xl pointer-events-auto hidden sm:block">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-space-blue to-space-purple flex items-center justify-center">
              <span className="text-white font-bold text-lg">{player.level}</span>
            </div>
            <div className="min-w-[120px]">
              <p className="text-xs text-gray-400">{l('Level', 'Level')} {player.level}</p>
              <div className="h-2 bg-space-gray rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-gradient-to-r from-space-blue to-space-cyan transition-all duration-300"
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
            title={l('Daily Tasks', 'Daily Tasks')}
          >
            <span className="text-2xl group-hover:scale-110 transition-transform inline-block">📋</span>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          </button>

          {/* Achievements */}
          <button
            onClick={onOpenAchievements}
            className="glass-panel p-3 rounded-xl hover:bg-white/20 transition-all group"
            title={l('Achievements', 'Achievements')}
          >
            <span className="text-2xl group-hover:scale-110 transition-transform inline-block">🏆</span>
          </button>

          {/* Crop Codex */}
          <button
            onClick={onOpenCodex}
            className="glass-panel p-3 rounded-xl hover:bg-white/20 transition-all group"
            title={l('Codex', 'Codex')}
          >
            <span className="text-2xl group-hover:scale-110 transition-transform inline-block">📚</span>
          </button>

          {/* Leaderboard */}
          <button
            onClick={onOpenLeaderboard}
            className="glass-panel p-3 rounded-xl hover:bg-white/20 transition-all group"
            title={l('Leaderboard', 'Leaderboard')}
          >
            <span className="text-2xl group-hover:scale-110 transition-transform inline-block">🏅</span>
          </button>

          {/* Shop */}
          <button
            onClick={onOpenShop}
            className="glass-panel p-3 rounded-xl hover:bg-white/20 transition-all group"
            title={l('Shop', 'Shop')}
          >
            <span className="text-2xl group-hover:scale-110 transition-transform inline-block">🏪</span>
          </button>

          {/* Upgrades */}
          <button
            onClick={onOpenUpgrades}
            className="glass-panel p-3 rounded-xl hover:bg-white/20 transition-all group"
            title={l('Upgrades', 'Upgrades')}
          >
            <span className="text-2xl group-hover:scale-110 transition-transform inline-block">🏗️</span>
          </button>

          {/* Friends */}
          <button
            onClick={onOpenFriends}
            className="glass-panel p-3 rounded-xl hover:bg-white/20 transition-all group"
            title={l('Friends', 'Friends')}
          >
            <span className="text-2xl group-hover:scale-110 transition-transform inline-block">👥</span>
          </button>
        </div>
      </div>
    </div>
  );
};
