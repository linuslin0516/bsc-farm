import React, { useState, useMemo, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { getUnlockedCrops, getCropById } from '../../data/crops';
import { CropShopIcon } from './CropIcon';
import { RARITY_COLORS, CropRarity } from '../../types';
import { getRarityLabel, localizeText, localizeZh } from '../../utils/i18n';
import { getMarketData, CropMarketPrice } from '../../services/marketService';

type SortMode = 'unlock' | 'price' | 'rarity' | 'profit';

const rarityOrder: Record<CropRarity, number> = {
  common: 1,
  uncommon: 2,
  rare: 3,
  epic: 4,
  legendary: 5,
};

export const CropToolbar: React.FC = () => {
  const { player, selectedCrop, setSelectedCrop, demoBalance } = useGameStore();
  const { language } = useLanguageStore();
  const l = (en: string, zh: string) => localizeText(language, en, zh);
  const zh = (value: string) => localizeZh(value, language);
  const [sortMode, setSortMode] = useState<SortMode>('unlock');
  const [marketPrices, setMarketPrices] = useState<Record<string, CropMarketPrice>>({});

  // Load market prices
  useEffect(() => {
    const loadPrices = async () => {
      try {
        const data = await getMarketData();
        setMarketPrices(data.prices);
      } catch (error) {
        console.error('Failed to load market prices:', error);
      }
    };
    loadPrices();

    // Reload prices every 5 minutes
    const interval = setInterval(loadPrices, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!player) return null;

  const unlockedCrops = useMemo(() => {
    const crops = getUnlockedCrops(player.level);

    switch (sortMode) {
      case 'price':
        return [...crops].sort((a, b) => a.cost - b.cost);
      case 'rarity':
        return [...crops].sort((a, b) => rarityOrder[b.rarity] - rarityOrder[a.rarity]);
      case 'profit':
        return [...crops].sort((a, b) => {
          const profitA = a.sellPrice - a.cost;
          const profitB = b.sellPrice - b.cost;
          return profitB - profitA;
        });
      case 'unlock':
      default:
        return crops;
    }
  }, [player.level, sortMode]);

  return (
    <div className="hud-panel rounded-2xl p-3 pointer-events-auto max-w-[90vw] sm:max-w-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌱</span>
          <h3 className="text-sm font-bold text-space-cyan">{l('Select Seeds', '選擇種子')}</h3>
        </div>
        <div className="flex items-center gap-2">
          {/* Sort dropdown */}
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="text-xs bg-space-gray border border-space-cyan/30 rounded px-2 py-1 text-gray-300 focus:outline-none focus:border-space-cyan"
          >
            <option value="unlock">{l('Unlock', '解鎖順序')}</option>
            <option value="price">{l('Price', '價格')}</option>
            <option value="rarity">{l('Rarity', '稀有度')}</option>
            <option value="profit">{l('Profit', '利潤')}</option>
          </select>
          {selectedCrop && (
            <button
              onClick={() => setSelectedCrop(null)}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              {l('Clear', '取消選擇')}
            </button>
          )}
        </div>
      </div>

      {/* Crop Grid - Horizontal scrollable */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-space-cyan scrollbar-track-transparent">
        {unlockedCrops.map((crop) => {
          const isSelected = selectedCrop === crop.id;
          const canAfford = demoBalance >= crop.cost;
          const priceData = marketPrices[crop.id];
          const currentPrice = priceData?.currentPrice || crop.sellPrice;
          const trend = priceData?.trend || 'stable';
          const priceChange = currentPrice - crop.sellPrice;
          const priceChangePercent = Math.round((priceChange / crop.sellPrice) * 100);

          const rarityColors = RARITY_COLORS[crop.rarity];
          const cropName = language === 'en' ? crop.name : zh(crop.nameCn);
          const rarityLabel = getRarityLabel(crop.rarity, language);
          const trendIcon = trend === 'up' ? '📈' : trend === 'down' ? '📉' : '';
          const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400';

          return (
            <button
              key={crop.id}
              onClick={() => setSelectedCrop(isSelected ? null : crop.id)}
              disabled={!canAfford}
              className={`
                relative flex-shrink-0 flex flex-col items-center p-2 rounded-xl border-2 transition-all min-w-[70px]
                ${isSelected
                  ? `${rarityColors.border} ${rarityColors.bg} shadow-lg ${rarityColors.glow}`
                  : `${rarityColors.border} opacity-60 hover:opacity-100 bg-white/5`
                }
                ${!canAfford ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
              `}
              title={`${cropName} (${rarityLabel}) - ${l('Cost', '成本')}: ${crop.cost}, ${l('Market', '市場價')}: ${currentPrice} (${priceChange > 0 ? '+' : ''}${priceChangePercent}%)`}
            >
              {/* Rarity indicator dot */}
              <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                crop.rarity === 'legendary' ? 'bg-yellow-400 animate-pulse' :
                crop.rarity === 'epic' ? 'bg-purple-400' :
                crop.rarity === 'rare' ? 'bg-blue-400' :
                crop.rarity === 'uncommon' ? 'bg-green-400' :
                'bg-gray-400'
              }`} />

              {/* Price trend indicator */}
              {trendIcon && (
                <div className={`absolute top-1 left-1 text-[10px] ${trendColor}`}>
                  {trendIcon}
                </div>
              )}

              <div className={`transition-transform ${isSelected ? 'scale-110' : ''}`}>
                <CropShopIcon cropId={crop.id} size="md" />
              </div>
              <span className={`text-xs mt-1 font-medium ${isSelected ? rarityColors.text : 'text-gray-300'}`}>
                {cropName}
              </span>
              <div className="flex flex-col items-center gap-0.5 mt-0.5">
                <span className="text-[10px] text-space-cyan">💰{crop.cost}</span>
                <span className={`text-[9px] ${trendColor}`}>
                  🏷️{currentPrice}
                </span>
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
          const cropName = language === 'en' ? crop.name : zh(crop.nameCn);
          const rarityLabel = getRarityLabel(crop.rarity, language);
            const priceData = marketPrices[selectedCrop];
            const currentPrice = priceData?.currentPrice || crop.sellPrice;
            const trend = priceData?.trend || 'stable';
            const priceChange = currentPrice - crop.sellPrice;
            const priceChangePercent = Math.round((priceChange / crop.sellPrice) * 100);
            const trendIcon = trend === 'up' ? '📈' : trend === 'down' ? '📉' : '📊';
            const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400';

            return (
              <div className="flex flex-col gap-1 text-xs px-1">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 flex items-center gap-2">
                    {l('Selected:', '已選：')}<strong className={rarityColors.text}>{cropName}</strong>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${rarityColors.bg} ${rarityColors.text}`}>
                      {rarityLabel}
                    </span>
                  </span>
                  <span>⏱️ {crop.growthTime < 60 ? `${crop.growthTime}秒` : `${Math.floor(crop.growthTime / 60)}分鐘`}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">
                    {l('Base', '基礎價')}: <span className="text-gray-300">{crop.sellPrice}</span>
                  </span>
                  <span className={`flex items-center gap-1 ${trendColor}`}>
                    <span>{trendIcon}</span>
                    <span>{l('Market', '市場價')}: <strong>{currentPrice}</strong></span>
                    <span className="text-[10px]">({priceChange > 0 ? '+' : ''}{priceChangePercent}%)</span>
                  </span>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
