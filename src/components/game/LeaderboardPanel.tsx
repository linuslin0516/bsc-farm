import { useState, useEffect } from 'react';
import { LeaderboardEntry } from '../../types';
import { getLeaderboard, getPlayerRank } from '../../services/leaderboardService';
import { useGameStore } from '../../store/useGameStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { localizeText } from '../../utils/i18n';

interface LeaderboardPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type LeaderboardType = 'score' | 'level' | 'harvests';

export const LeaderboardPanel: React.FC<LeaderboardPanelProps> = ({ isOpen, onClose }) => {
  const [selectedType, setSelectedType] = useState<LeaderboardType>('score');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<{ rank: number; total: number; score: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { player } = useGameStore();
  const { language } = useLanguageStore();
  const l = (en: string, zh: string) => localizeText(language, en, zh);

  useEffect(() => {
    const loadLeaderboard = async () => {
      if (!isOpen) return;

      setIsLoading(true);
      try {
        const [leaderboard, playerRank] = await Promise.all([
          getLeaderboard(selectedType, 50),
          player?.oderId ? getPlayerRank(player.oderId, selectedType) : Promise.resolve(null),
        ]);

        setEntries(leaderboard);
        setMyRank(playerRank);
      } catch (error) {
        console.error('Failed to load leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLeaderboard();
  }, [isOpen, selectedType, player?.oderId]);

  if (!isOpen) return null;

  const tabs: { id: LeaderboardType; label: string; icon: string }[] = [
    { id: 'score', label: l('Score', '積分'), icon: '🏆' },
    { id: 'level', label: l('Level', '等級'), icon: '⭐' },
    { id: 'harvests', label: l('Harvests', '收成'), icon: '🌾' },
  ];

  const getRankStyle = (rank: number): string => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500 to-yellow-400 text-black';
      case 2:
        return 'bg-gradient-to-r from-gray-400 to-gray-300 text-black';
      case 3:
        return 'bg-gradient-to-r from-amber-700 to-amber-600 text-white';
      default:
        return 'bg-binance-gray-light text-gray-300';
    }
  };

  const getRankEmoji = (rank: number): string => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '';
    }
  };

  const getScoreLabel = (): string => {
    switch (selectedType) {
      case 'level':
        return l('Level', '等級');
      case 'harvests':
        return l('Harvests', '收成數');
      default:
        return l('Score', '積分');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] bg-binance-gray rounded-2xl border-2 border-binance-yellow/30 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-binance-yellow/20 bg-binance-dark/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🏆</span>
              <div>
                <h2 className="text-xl font-bold text-binance-yellow">{l('Leaderboard', '排行榜')}</h2>
                <p className="text-sm text-gray-400">
                  {l('Compete with other farmers', '與其他農夫一較高下')}
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

          {/* Tabs */}
          <div className="mt-3 flex gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedType(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${
                  selectedType === tab.id
                    ? 'bg-binance-yellow text-black font-bold'
                    : 'bg-binance-gray-light text-gray-300 hover:bg-binance-gray-light/80'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* My Rank Card */}
        {player && myRank && (
          <div className="p-4 bg-gradient-to-r from-binance-yellow/10 to-transparent border-b border-binance-yellow/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-binance-yellow text-black flex items-center justify-center font-bold">
                  {player.avatarUrl ? (
                    <img src={player.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    player.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <div className="font-bold text-white">{player.name}</div>
                  <div className="text-sm text-gray-400">{l('My Rank', '我的排名')}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${
                  myRank.rank <= 3 ? 'text-binance-yellow' : 'text-white'
                }`}>
                  #{myRank.rank}
                  {myRank.rank <= 3 && <span className="ml-1">{getRankEmoji(myRank.rank)}</span>}
                </div>
                <div className="text-sm text-gray-400">
                  {getScoreLabel()}: {myRank.score.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="text-gray-400">{l('Loading...', '載入中...')}</div>
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <span className="text-4xl mb-2">🏜️</span>
              <span>{l('No data yet', '暫無排行資料')}</span>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {entries.map((entry, index) => {
                const isMe = entry.oderId === player?.oderId;

                return (
                  <div
                    key={entry.oderId}
                    className={`
                      flex items-center gap-3 p-3 rounded-xl transition-colors
                      ${isMe
                        ? 'bg-binance-yellow/20 border border-binance-yellow/50'
                        : index < 3
                          ? 'bg-binance-dark/50 border border-binance-gray-light'
                          : 'bg-binance-dark/30'
                      }
                    `}
                  >
                    {/* Rank */}
                    <div
                      className={`
                        w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm
                        ${getRankStyle(entry.rank)}
                      `}
                    >
                      {entry.rank <= 3 ? getRankEmoji(entry.rank) : entry.rank}
                    </div>

                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-binance-gray-light flex items-center justify-center overflow-hidden">
                      {entry.avatarUrl ? (
                        <img src={entry.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg">{entry.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>

                    {/* Name & Level */}
                    <div className="flex-1 min-w-0">
                      <div className={`font-bold truncate ${isMe ? 'text-binance-yellow' : 'text-white'}`}>
                        {entry.name}
                        {isMe && <span className="ml-2 text-xs text-binance-yellow">({l('You', '你')})</span>}
                      </div>
                      <div className="text-xs text-gray-400">
                        Lv.{entry.level}
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <div className={`font-bold ${
                        entry.rank === 1 ? 'text-yellow-400' :
                        entry.rank === 2 ? 'text-gray-300' :
                        entry.rank === 3 ? 'text-amber-600' :
                        'text-white'
                      }`}>
                        {entry.score.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">{getScoreLabel()}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-binance-yellow/20 bg-binance-dark/30">
          <div className="text-center text-xs text-gray-500">
            {l('Score = (Level × 100) + (Harvests × 10) + (Steals × 5)', '積分計算: (等級 × 100) + (收成數 × 10) + (偷菜數 × 5)')}
          </div>
        </div>
      </div>
    </div>
  );
};
