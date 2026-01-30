import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { getUnlockedCrops, getCropById } from '../../data/crops';
import { CropShopIcon } from './CropIcon';
import { RARITY_COLORS, RARITY_NAMES } from '../../types';

export const CropToolbar: React.FC = () => {
  const { player, selectedCrop, setSelectedCrop, demoBalance } = useGameStore();

  if (!player) return null;

  const unlockedCrops = getUnlockedCrops(player.level);

  return (
    <div className="glass-panel rounded-2xl p-3 pointer-events-auto max-w-[90vw] sm:max-w-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌱</span>
          <h3 className="text-sm font-bold text-binance-yellow">選擇種子</h3>
        </div>
        {selectedCrop && (
          <button
            onClick={() => setSelectedCrop(null)}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            取消選擇
          </button>
        )}
      </div>

      {/* Crop Grid - Horizontal scrollable */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-binance-yellow scrollbar-track-transparent">
        {unlockedCrops.map((crop) => {
          const isSelected = selectedCrop === crop.id;
          const canAfford = demoBalance >= crop.cost;

          const rarityColors = RARITY_COLORS[crop.rarity];
          return (
            <button
              key={crop.id}
              onClick={() => setSelectedCrop(isSelected ? null : crop.id)}
              disabled={!canAfford}
              className={`
                relative flex-shrink-0 flex flex-col items-center p-2 rounded-xl border-2 transition-all min-w-[70px]
                ${isSelected
                  ? `${rarityColors.border} ${rarityColors.bg} shadow-lg ${rarityColors.glow}`
                  : `border-white/10 hover:${rarityColors.border} bg-white/5`
                }
                ${!canAfford ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
              `}
              title={`${crop.nameCn} (${RARITY_NAMES[crop.rarity]}) - 成本: ${crop.cost}, 賣出: ${crop.sellPrice}`}
            >
              {/* Rarity indicator dot */}
              <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                crop.rarity === 'legendary' ? 'bg-yellow-400 animate-pulse' :
                crop.rarity === 'epic' ? 'bg-purple-400' :
                crop.rarity === 'rare' ? 'bg-blue-400' :
                crop.rarity === 'uncommon' ? 'bg-green-400' :
                'bg-gray-400'
              }`} />
              <div className={`transition-transform ${isSelected ? 'scale-110' : ''}`}>
                <CropShopIcon cropId={crop.id} size="md" />
              </div>
              <span className={`text-xs mt-1 font-medium ${isSelected ? rarityColors.text : 'text-gray-300'}`}>
                {crop.nameCn}
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px] text-binance-yellow">💰{crop.cost}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected crop info */}
      {selectedCrop && (
        <div className="mt-2 pt-2 border-t border-white/10">
          {(() => {
            const crop = getCropById(selectedCrop);
            if (!crop) return null;
            const rarityColors = RARITY_COLORS[crop.rarity];
            return (
              <div className="flex justify-between items-center text-xs px-1">
                <span className="text-gray-300 flex items-center gap-2">
                  已選：<strong className={rarityColors.text}>{crop.nameCn}</strong>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${rarityColors.bg} ${rarityColors.text}`}>
                    {RARITY_NAMES[crop.rarity]}
                  </span>
                </span>
                <div className="flex gap-3 text-gray-400">
                  <span>⏱️ {crop.growthTime < 60 ? `${crop.growthTime}秒` : `${Math.floor(crop.growthTime / 60)}分鐘`}</span>
                  <span className="text-farm-green">💰+{crop.sellPrice}</span>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
