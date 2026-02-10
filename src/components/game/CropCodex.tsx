import { useState, useEffect } from 'react';
import { CropDefinition, CropRarity, RARITY_COLORS, RARITY_NAMES } from '../../types';
import { getAllCrops } from '../../data/crops';
import { useGameStore } from '../../store/useGameStore';
import { getPlayerAchievements } from '../../services/achievementService';

interface CropCodexProps {
  isOpen: boolean;
  onClose: () => void;
}

type FilterRarity = 'all' | CropRarity;

export const CropCodex: React.FC<CropCodexProps> = ({ isOpen, onClose }) => {
  const [selectedRarity, setSelectedRarity] = useState<FilterRarity>('all');
  const [discoveredCrops, setDiscoveredCrops] = useState<string[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<CropDefinition | null>(null);
  const { player } = useGameStore();

  const allCrops = getAllCrops();

  useEffect(() => {
    const loadDiscoveredCrops = async () => {
      if (player?.oderId) {
        try {
          const achievements = await getPlayerAchievements(player.oderId);
          setDiscoveredCrops(achievements.cropsDiscovered);
        } catch (error) {
          console.error('Failed to load discovered crops:', error);
        }
      }
    };

    if (isOpen) {
      loadDiscoveredCrops();
    }
  }, [isOpen, player?.oderId]);

  if (!isOpen) return null;

  const filteredCrops = selectedRarity === 'all'
    ? allCrops
    : allCrops.filter(crop => crop.rarity === selectedRarity);

  const rarityOrder: CropRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

  const groupedCrops = rarityOrder.reduce((acc, rarity) => {
    acc[rarity] = filteredCrops.filter(crop => crop.rarity === rarity);
    return acc;
  }, {} as Record<CropRarity, CropDefinition[]>);

  const totalDiscovered = discoveredCrops.length;
  const totalCrops = allCrops.length;

  const isDiscovered = (cropId: string) => discoveredCrops.includes(cropId);
  const isUnlocked = (crop: CropDefinition) => (player?.level || 1) >= crop.unlockLevel;

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}秒`;
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}分鐘`;
    const hours = Math.floor(mins / 60);
    const remainMins = mins % 60;
    return remainMins > 0 ? `${hours}小時${remainMins}分` : `${hours}小時`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-space-gray rounded-2xl border-2 border-space-cyan/30 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-space-cyan/20 bg-space-dark/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📚</span>
              <div>
                <h2 className="text-2xl font-bold text-space-cyan">作物圖鑑</h2>
                <p className="text-sm text-gray-400">
                  已發現 {totalDiscovered}/{totalCrops} 種作物
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-space-gray-light hover:bg-red-500/20 flex items-center justify-center transition-colors"
            >
              <span className="text-xl">✕</span>
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-3 bg-space-dark rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-space-cyan to-space-glow transition-all duration-500"
              style={{ width: `${(totalDiscovered / totalCrops) * 100}%` }}
            />
          </div>

          {/* Rarity filter */}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedRarity('all')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedRarity === 'all'
                  ? 'bg-space-cyan text-black'
                  : 'bg-space-gray-light text-gray-300 hover:bg-space-gray-light/80'
              }`}
            >
              全部
            </button>
            {rarityOrder.map(rarity => {
              const colors = RARITY_COLORS[rarity];
              return (
                <button
                  key={rarity}
                  onClick={() => setSelectedRarity(rarity)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    selectedRarity === rarity
                      ? `${colors.bg} ${colors.border} ${colors.text}`
                      : 'bg-space-gray-light text-gray-300 border-transparent hover:bg-space-gray-light/80'
                  }`}
                >
                  {RARITY_NAMES[rarity]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {selectedRarity === 'all' ? (
            // Grouped view
            rarityOrder.map(rarity => {
              const crops = groupedCrops[rarity];
              if (crops.length === 0) return null;
              const colors = RARITY_COLORS[rarity];

              return (
                <div key={rarity} className="mb-6">
                  <h3 className={`text-lg font-bold mb-3 ${colors.text}`}>
                    {RARITY_NAMES[rarity]} ({crops.length})
                  </h3>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                    {crops.map(crop => (
                      <CropCard
                        key={crop.id}
                        crop={crop}
                        discovered={isDiscovered(crop.id)}
                        unlocked={isUnlocked(crop)}
                        onClick={() => setSelectedCrop(crop)}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            // Filtered view
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {filteredCrops.map(crop => (
                <CropCard
                  key={crop.id}
                  crop={crop}
                  discovered={isDiscovered(crop.id)}
                  unlocked={isUnlocked(crop)}
                  onClick={() => setSelectedCrop(crop)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Crop Detail Modal */}
        {selectedCrop && (
          <CropDetailModal
            crop={selectedCrop}
            discovered={isDiscovered(selectedCrop.id)}
            unlocked={isUnlocked(selectedCrop)}
            onClose={() => setSelectedCrop(null)}
            formatTime={formatTime}
          />
        )}
      </div>
    </div>
  );
};

// Crop Card Component
interface CropCardProps {
  crop: CropDefinition;
  discovered: boolean;
  unlocked: boolean;
  onClick: () => void;
}

const CropCard: React.FC<CropCardProps> = ({ crop, discovered, unlocked, onClick }) => {
  const colors = RARITY_COLORS[crop.rarity];

  return (
    <button
      onClick={onClick}
      className={`
        relative aspect-square rounded-xl border-2 p-2
        flex flex-col items-center justify-center
        transition-all duration-200 hover:scale-105
        ${discovered
          ? `${colors.bg} ${colors.border} ${colors.glow}`
          : 'bg-space-dark/50 border-space-gray-light'
        }
      `}
    >
      {/* Emoji or locked icon */}
      <span className={`text-3xl ${!discovered ? 'opacity-30 grayscale' : ''}`}>
        {discovered ? crop.emoji : '❓'}
      </span>

      {/* Lock icon for undiscovered */}
      {!discovered && (
        <div className="absolute top-1 right-1">
          <span className="text-xs">🔒</span>
        </div>
      )}

      {/* Level requirement if not unlocked */}
      {!unlocked && (
        <div className="absolute bottom-1 text-[10px] text-gray-500">
          Lv.{crop.unlockLevel}
        </div>
      )}
    </button>
  );
};

// Crop Detail Modal
interface CropDetailModalProps {
  crop: CropDefinition;
  discovered: boolean;
  unlocked: boolean;
  onClose: () => void;
  formatTime: (seconds: number) => string;
}

const CropDetailModal: React.FC<CropDetailModalProps> = ({
  crop,
  discovered,
  unlocked,
  onClose,
  formatTime,
}) => {
  const colors = RARITY_COLORS[crop.rarity];

  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-10">
      <div
        className={`
          relative w-full max-w-md rounded-2xl p-6
          ${colors.bg} border-2 ${colors.border}
          ${crop.rarity === 'legendary' ? 'glow-legendary' : crop.rarity === 'epic' ? 'glow-epic' : ''}
        `}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center transition-colors"
        >
          <span>✕</span>
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center">
          {/* Emoji */}
          <div className={`text-7xl mb-4 ${!discovered ? 'opacity-30 grayscale' : ''}`}>
            {discovered ? crop.emoji : '❓'}
          </div>

          {/* Rarity badge */}
          <div className={`px-3 py-1 rounded-full text-sm font-bold ${colors.text} ${colors.bg} border ${colors.border}`}>
            {RARITY_NAMES[crop.rarity]}
          </div>

          {/* Name */}
          <h3 className="text-2xl font-bold text-white mt-3">
            {discovered ? crop.nameCn : '???'}
          </h3>
          {discovered && (
            <p className="text-sm text-gray-400">{crop.name}</p>
          )}

          {/* Description */}
          <p className="text-gray-300 mt-3">
            {discovered ? crop.description : '尚未發現此作物'}
          </p>

          {/* Stats */}
          {discovered && (
            <div className="w-full mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="bg-black/30 rounded-lg p-3">
                <div className="text-gray-400">種子價格</div>
                <div className="text-space-cyan font-bold">{crop.cost} GOLD</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3">
                <div className="text-gray-400">售價</div>
                <div className="text-green-400 font-bold">{crop.sellPrice} GOLD</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3">
                <div className="text-gray-400">生長時間</div>
                <div className="text-blue-400 font-bold">{formatTime(crop.growthTime)}</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3">
                <div className="text-gray-400">經驗值</div>
                <div className="text-purple-400 font-bold">+{crop.experience} XP</div>
              </div>
            </div>
          )}

          {/* Unlock requirement */}
          {!unlocked && (
            <div className="mt-4 px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg">
              <span className="text-red-400">🔒 需要等級 {crop.unlockLevel} 解鎖</span>
            </div>
          )}

          {/* Profit calculation */}
          {discovered && (
            <div className="mt-4 text-sm text-gray-400">
              利潤: <span className="text-green-400 font-bold">+{crop.sellPrice - crop.cost} GOLD</span>
              {' '}({((crop.sellPrice - crop.cost) / crop.cost * 100).toFixed(0)}% 回報率)
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
