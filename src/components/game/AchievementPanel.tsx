import { useState, useEffect } from 'react';
import { Achievement, AchievementCategory, RARITY_COLORS } from '../../types';
import { getAchievementsWithProgress } from '../../services/achievementService';
import { useGameStore } from '../../store/useGameStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { localizeText, getRarityLabel } from '../../utils/i18n';

interface AchievementPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type CategoryFilter = 'all' | AchievementCategory;

interface AchievementWithProgress {
  achievement: Achievement;
  progress: number;
  unlocked: boolean;
}

export const AchievementPanel: React.FC<AchievementPanelProps> = ({ isOpen, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [achievementsData, setAchievementsData] = useState<AchievementWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { player } = useGameStore();
  const { language } = useLanguageStore();
  const l = (en: string, zh: string) => localizeText(language, en, zh);

  useEffect(() => {
    const loadAchievements = async () => {
      if (player?.oderId && isOpen) {
        setIsLoading(true);
        try {
          const data = await getAchievementsWithProgress(player.oderId);
          setAchievementsData(data);
        } catch (error) {
          console.error('Failed to load achievements:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadAchievements();
  }, [isOpen, player?.oderId]);

  if (!isOpen) return null;

  const categories: { id: CategoryFilter; label: string; icon: string }[] = [
    { id: 'all', label: l('All', '全部'), icon: '📋' },
    { id: 'farming', label: l('Farming', '農耕'), icon: '🌾' },
    { id: 'social', label: l('Social', '社交'), icon: '👥' },
    { id: 'collection', label: l('Collection', '收集'), icon: '📚' },
    { id: 'milestone', label: l('Milestone', '里程碑'), icon: '🏆' },
  ];

  const filteredAchievements = selectedCategory === 'all'
    ? achievementsData
    : achievementsData.filter(a => a.achievement.category === selectedCategory);

  const unlockedCount = achievementsData.filter(a => a.unlocked).length;
  const totalCount = achievementsData.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-binance-gray rounded-2xl border-2 border-binance-yellow/30 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-binance-yellow/20 bg-binance-dark/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🏆</span>
              <div>
                <h2 className="text-2xl font-bold text-binance-yellow">{l('Achievements', '成就系統')}</h2>
                <p className="text-sm text-gray-400">
                  {l(`Unlocked ${unlockedCount}/${totalCount} achievements`, `已解鎖 ${unlockedCount}/${totalCount} 個成就`)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-binance-gray-light hover:bg-red-500/20 flex items-center justify-center transition-colors"
            >
              <span className="text-xl">✕</span>
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-3 bg-binance-dark rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-binance-yellow to-binance-gold transition-all duration-500"
              style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
            />
          </div>

          {/* Category tabs */}
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-binance-yellow text-black font-bold'
                    : 'bg-binance-gray-light text-gray-300 hover:bg-binance-gray-light/80'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="text-gray-400">{l('Loading...', '載入中...')}</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredAchievements.map(({ achievement, progress, unlocked }) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  progress={progress}
                  unlocked={unlocked}
                  language={language}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Achievement Card Component
interface AchievementCardProps {
  achievement: Achievement;
  progress: number;
  unlocked: boolean;
  language: string;
}

const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  progress,
  unlocked,
  language,
}) => {
  const l = (en: string, zh: string) => localizeText(language as 'zh-CN' | 'zh-TW' | 'en', en, zh);
  const colors = RARITY_COLORS[achievement.rarity];
  const progressPercent = Math.min((progress / achievement.requirement) * 100, 100);
  const rarityLabel = getRarityLabel(achievement.rarity, language as 'zh-CN' | 'zh-TW' | 'en');

  // Use English or Chinese based on language
  const achievementName = language === 'en' ? achievement.name : l(achievement.name, achievement.nameCn);
  const achievementDesc = language === 'en' ? achievement.description : l(achievement.description, achievement.descriptionCn);

  return (
    <div
      className={`
        relative p-4 rounded-xl border-2 transition-all duration-200
        ${unlocked
          ? `${colors.bg} ${colors.border} ${colors.glow}`
          : 'bg-binance-dark/50 border-binance-gray-light'
        }
      `}
    >
      {/* Unlocked badge */}
      {unlocked && (
        <div className="absolute top-2 right-2">
          <span className="text-xl">✅</span>
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`
          text-4xl p-2 rounded-lg
          ${unlocked ? colors.bg : 'bg-binance-gray-light/50'}
        `}>
          {unlocked ? achievement.icon : '🔒'}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`font-bold ${unlocked ? colors.text : 'text-gray-400'}`}>
              {achievementName}
            </h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
              {rarityLabel}
            </span>
          </div>

          <p className="text-sm text-gray-400 mt-1">
            {achievementDesc}
          </p>

          {/* Progress bar */}
          {!unlocked && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{l('Progress', '進度')}</span>
                <span>{progress}/{achievement.requirement}</span>
              </div>
              <div className="h-2 bg-binance-dark rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    progressPercent >= 100 ? 'bg-green-500' : 'bg-binance-yellow'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Rewards */}
          <div className="flex gap-3 mt-2">
            {achievement.rewardXp > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <span>⭐</span>
                <span className={unlocked ? 'text-blue-400' : 'text-gray-500'}>
                  +{achievement.rewardXp} XP
                </span>
              </div>
            )}
            {achievement.rewardTokens > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <span>💰</span>
                <span className={unlocked ? 'text-yellow-400' : 'text-gray-500'}>
                  +{achievement.rewardTokens} $FARM
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
