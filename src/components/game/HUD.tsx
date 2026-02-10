import { useGameStore } from '../../store/useGameStore';
import { useLanguageStore } from '../../store/useLanguageStore';
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
  // Visiting mode props
  isVisiting?: boolean;
  visitingFriendName?: string;
  visitingFriendLevel?: number;
  onReturnFromVisit?: () => void;
  stolenCount?: number;
  stealableCount?: number;
}

export const HUD: React.FC<HUDProps> = ({
  onOpenShop,
  onOpenFriends,
  onOpenAchievements,
  onOpenDailyTasks,
  onOpenLeaderboard,
  onOpenCodex,
  onOpenUpgrades,
  isVisiting = false,
  visitingFriendName,
  visitingFriendLevel,
  onReturnFromVisit,
  stolenCount = 0,
  stealableCount = 0,
}) => {
  const { player, goldBalance } = useGameStore();
  const { language } = useLanguageStore();
  const l = (en: string, zh: string) => localizeText(language, en, zh);

  if (!player) return null;

  const currentLevelExp = getExpForLevel(player.level);
  const expProgress = (player.experience / currentLevelExp) * 100;

  // Visiting mode - show visit banner instead of normal HUD
  if (isVisiting) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <div className="p-3">
          <div className="visit-banner rounded-xl px-4 py-3 pointer-events-auto">
            <div className="flex items-center justify-between">
              {/* Back button */}
              <button
                onClick={onReturnFromVisit}
                className="flex items-center gap-2 text-white hover:text-red-300 transition-colors"
              >
                <span className="text-lg">&larr;</span>
                <span className="text-sm font-medium">{l('Return', '返回')}</span>
              </button>

              {/* Center info */}
              <div className="text-center">
                <div className="flex items-center gap-2 justify-center">
                  <span className="text-lg">🥷</span>
                  <span className="text-white font-bold">
                    {l(`Visiting ${visitingFriendName}'s Farm`, `拜訪 ${visitingFriendName} 的農場`)}
                  </span>
                  <span className="text-gray-400 text-sm">Lv.{visitingFriendLevel}</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {l('Click mature crops to raid!', '點擊成熟作物掠奪！')}
                </p>
              </div>

              {/* Steal stats */}
              <div className="flex items-center gap-4 text-sm">
                <div className="text-center">
                  <p className="text-red-400 font-bold">{stolenCount}</p>
                  <p className="text-[10px] text-gray-400">{l('Raided', '已偷')}</p>
                </div>
                <div className="text-center">
                  <p className="text-green-400 font-bold">{stealableCount}</p>
                  <p className="text-[10px] text-gray-400">{l('Available', '可偷')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normal mode - left player panel + right sidebar
  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Left: Player panel */}
      <div className="absolute top-3 left-3 pointer-events-auto">
        <div className="hud-panel rounded-xl p-3 w-52">
          {/* Title */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🚀</span>
            <span className="text-sm font-bold text-space-bio-cyan tracking-wide">Space Farm</span>
          </div>

          {/* Avatar + Name */}
          <div className="flex items-center gap-2 mb-2">
            {player.avatarUrl ? (
              <img
                src={player.avatarUrl}
                alt={player.name}
                className="w-8 h-8 rounded-full border border-space-bio-cyan/30"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-space-blue to-space-purple flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {player.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white truncate">{player.name}</p>
              <p className="text-[10px] text-gray-500 font-mono">ID: {player.oderId}</p>
            </div>
          </div>

          {/* Level progress */}
          <div className="mb-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-400">Lv.{player.level}</span>
              <span className="text-[10px] text-gray-500">
                {player.experience}/{currentLevelExp} XP
              </span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-space-bio-purple to-space-bio-cyan transition-all duration-300 rounded-full"
                style={{ width: `${expProgress}%` }}
              />
            </div>
          </div>

          {/* GOLD Balance */}
          <div className="flex items-center gap-2 bg-white/5 rounded-lg px-2 py-1.5">
            <span className="text-base">⚡</span>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">GOLD</p>
              <p className="text-sm font-bold text-space-bio-cyan">
                {goldBalance.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Vertical sidebar buttons */}
      <div className="absolute top-3 right-3 pointer-events-auto">
        <div className="flex flex-col gap-1.5">
          <SidebarButton
            emoji="📋"
            label={l('Daily', '每日')}
            onClick={onOpenDailyTasks}
            hasBadge
          />
          <SidebarButton
            emoji="🏆"
            label={l('Achieve', '成就')}
            onClick={onOpenAchievements}
          />
          <SidebarButton
            emoji="📚"
            label={l('Codex', '圖鑑')}
            onClick={onOpenCodex}
          />
          <SidebarButton
            emoji="🏅"
            label={l('Rank', '排行')}
            onClick={onOpenLeaderboard}
          />
          <SidebarButton
            emoji="🏪"
            label={l('Shop', '商店')}
            onClick={onOpenShop}
          />
          <SidebarButton
            emoji="🏗️"
            label={l('Upgrade', '升級')}
            onClick={onOpenUpgrades}
          />
          <SidebarButton
            emoji="👥"
            label={l('Friends', '好友')}
            onClick={onOpenFriends}
          />
        </div>
      </div>
    </div>
  );
};

// Sidebar button component
const SidebarButton: React.FC<{
  emoji: string;
  label: string;
  onClick: () => void;
  hasBadge?: boolean;
}> = ({ emoji, label, onClick, hasBadge }) => (
  <button
    onClick={onClick}
    className="hud-panel w-14 py-2 rounded-xl hover:bg-white/10 transition-all group relative flex flex-col items-center"
    title={label}
  >
    <span className="text-xl group-hover:scale-110 transition-transform inline-block">
      {emoji}
    </span>
    <span className="text-[9px] text-gray-400 group-hover:text-white transition-colors mt-0.5">
      {label}
    </span>
    {hasBadge && (
      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
    )}
  </button>
);
