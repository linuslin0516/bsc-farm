import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Button } from '../ui/Button';

interface ToolToolbarProps {
  onNotify: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
  onPlantAll: () => void;
}

export const ToolToolbar: React.FC<ToolToolbarProps> = ({ onNotify, onPlantAll }) => {
  const { selectedTool, setSelectedTool, inventory } = useGameStore();

  // Get tool quantities from inventory
  const fertilizerCount = inventory.find((i) => i.itemId === 'fertilizer')?.quantity || 0;
  const superFertilizerCount =
    inventory.find((i) => i.itemId === 'super_fertilizer')?.quantity || 0;

  const tools = [
    {
      id: 'fertilizer',
      name: '肥料',
      icon: '🧪',
      count: fertilizerCount,
      description: '加速50%',
    },
    {
      id: 'super_fertilizer',
      name: '超級肥料',
      icon: '⚡',
      count: superFertilizerCount,
      description: '瞬間成熟',
    },
    {
      id: 'remove',
      name: '取消播種',
      icon: '❌',
      count: -1, // Always available
      description: '移除作物',
    },
  ];

  return (
    <div className="glass-panel rounded-2xl p-3 pointer-events-auto max-w-[90vw] sm:max-w-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <span className="text-lg">🛠️</span>
          <h3 className="text-sm font-bold text-binance-yellow">工具欄</h3>
        </div>
        {selectedTool && (
          <button
            onClick={() => setSelectedTool(null)}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            取消選擇
          </button>
        )}
      </div>

      {/* Tools Grid */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-binance-yellow scrollbar-track-transparent">
        {tools.map((tool) => {
          const isSelected = selectedTool === tool.id;
          const isAvailable = tool.count !== 0;

          return (
            <button
              key={tool.id}
              onClick={() => {
                if (tool.count === 0 && tool.id !== 'remove') {
                  onNotify('error', `沒有${tool.name}了！請在商店購買。`);
                  return;
                }
                setSelectedTool(isSelected ? null : tool.id);
              }}
              disabled={tool.count === 0 && tool.id !== 'remove'}
              className={`
                relative flex-shrink-0 flex flex-col items-center p-2 rounded-xl border-2 transition-all min-w-[70px]
                ${
                  isSelected
                    ? 'border-binance-yellow bg-binance-yellow/20 shadow-lg'
                    : 'border-white/10 hover:border-binance-yellow/50 bg-white/5'
                }
                ${
                  !isAvailable && tool.id !== 'remove'
                    ? 'opacity-40 cursor-not-allowed'
                    : 'cursor-pointer hover:scale-105'
                }
              `}
              title={tool.description}
            >
              <div className={`transition-transform text-3xl ${isSelected ? 'scale-110' : ''}`}>
                {tool.icon}
              </div>
              <span
                className={`text-xs mt-1 font-medium ${
                  isSelected ? 'text-binance-yellow' : 'text-gray-300'
                }`}
              >
                {tool.name}
              </span>
              {tool.count >= 0 && (
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[10px] text-gray-400">x{tool.count}</span>
                </div>
              )}
            </button>
          );
        })}

        {/* Plant All button */}
        <button
          onClick={onPlantAll}
          className="relative flex-shrink-0 flex flex-col items-center p-2 rounded-xl border-2 border-green-400/50 hover:border-green-400 bg-green-500/10 hover:bg-green-500/20 transition-all min-w-[70px] cursor-pointer hover:scale-105"
          title="種滿所有空地"
        >
          <div className="text-3xl">🌾</div>
          <span className="text-xs mt-1 font-medium text-green-400">一鍵播種</span>
        </button>
      </div>

      {/* Selected tool info */}
      {selectedTool && (
        <div className="mt-2 pt-2 border-t border-white/10">
          <div className="text-xs px-1 text-gray-300">
            {selectedTool === 'fertilizer' && '點擊已種植的作物來施肥（加速50%）'}
            {selectedTool === 'super_fertilizer' && '點擊已種植的作物來施超級肥料（瞬間成熟）'}
            {selectedTool === 'remove' && '點擊已種植的作物來移除它'}
          </div>
        </div>
      )}
    </div>
  );
};
