import { useState, useEffect, useCallback } from 'react';
import { DailyTask } from '../../types';
import { getDailyTasksWithProgress, claimTaskReward, getTimeUntilReset } from '../../services/dailyTaskService';
import { useGameStore } from '../../store/useGameStore';

interface DailyTasksPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify?: (type: 'success' | 'error' | 'info', message: string) => void;
}

interface TaskWithProgress {
  task: DailyTask;
  progress: number;
  completed: boolean;
  claimed: boolean;
}

export const DailyTasksPanel: React.FC<DailyTasksPanelProps> = ({
  isOpen,
  onClose,
  onNotify,
}) => {
  const [tasks, setTasks] = useState<TaskWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeUntilReset, setTimeUntilReset] = useState(0);
  const { player, addExperience, addDemoBalance } = useGameStore();

  const loadTasks = useCallback(async () => {
    if (player?.oderId) {
      setIsLoading(true);
      try {
        const data = await getDailyTasksWithProgress(player.oderId);
        setTasks(data);
      } catch (error) {
        console.error('Failed to load daily tasks:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [player?.oderId]);

  useEffect(() => {
    if (isOpen) {
      loadTasks();
    }
  }, [isOpen, loadTasks]);

  // Update countdown timer
  useEffect(() => {
    const updateTimer = () => {
      setTimeUntilReset(getTimeUntilReset());
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClaim = async (taskId: string) => {
    if (!player?.oderId) return;

    try {
      const reward = await claimTaskReward(player.oderId, taskId);
      if (reward) {
        // Apply rewards
        if (reward.xp > 0) {
          addExperience(reward.xp);
        }
        if (reward.tokens > 0) {
          addDemoBalance(reward.tokens);
        }

        // Update local state
        setTasks(prev =>
          prev.map(t =>
            t.task.id === taskId ? { ...t, claimed: true } : t
          )
        );

        onNotify?.('success', `獲得 ${reward.xp} XP 和 ${reward.tokens} $FARM！`);
      }
    } catch (error) {
      console.error('Failed to claim reward:', error);
      onNotify?.('error', '領取獎勵失敗');
    }
  };

  if (!isOpen) return null;

  const formatTimeRemaining = (ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const claimedCount = tasks.filter(t => t.claimed).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-binance-gray rounded-2xl border-2 border-binance-yellow/30 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-binance-yellow/20 bg-binance-dark/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📋</span>
              <div>
                <h2 className="text-xl font-bold text-binance-yellow">每日任務</h2>
                <p className="text-sm text-gray-400">
                  完成任務獲得獎勵
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

          {/* Reset timer */}
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-gray-400">重置倒計時</span>
            <span className="text-binance-yellow font-mono font-bold">
              {formatTimeRemaining(timeUntilReset)}
            </span>
          </div>

          {/* Progress */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-2 bg-binance-dark rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
                style={{ width: `${(completedCount / 3) * 100}%` }}
              />
            </div>
            <span className="text-sm text-gray-400">{completedCount}/3</span>
          </div>
        </div>

        {/* Tasks */}
        <div className="p-4 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="text-gray-400">載入中...</div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              今日任務載入失敗，請稍後再試
            </div>
          ) : (
            tasks.map(({ task, progress, completed, claimed }) => (
              <TaskCard
                key={task.id}
                task={task}
                progress={progress}
                completed={completed}
                claimed={claimed}
                onClaim={() => handleClaim(task.id)}
              />
            ))
          )}
        </div>

        {/* Bonus for completing all */}
        <div className="p-4 border-t border-binance-yellow/20 bg-binance-dark/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎁</span>
              <div>
                <div className="text-sm font-bold text-white">全部完成獎勵</div>
                <div className="text-xs text-gray-400">完成所有每日任務</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-blue-400">+100 XP</div>
                <div className="text-xs text-yellow-400">+25 $FARM</div>
              </div>
              {completedCount === 3 && claimedCount < 3 ? (
                <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-400 text-white font-bold rounded-lg hover:opacity-90 transition-opacity">
                  領取
                </button>
              ) : (
                <div className={`px-4 py-2 rounded-lg ${
                  claimedCount === 3
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-binance-gray-light text-gray-500'
                }`}>
                  {claimedCount === 3 ? '已領取' : `${completedCount}/3`}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Task Card Component
interface TaskCardProps {
  task: DailyTask;
  progress: number;
  completed: boolean;
  claimed: boolean;
  onClaim: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  progress,
  completed,
  claimed,
  onClaim,
}) => {
  const progressPercent = Math.min((progress / task.requirement) * 100, 100);

  return (
    <div
      className={`
        p-4 rounded-xl border-2 transition-all duration-200
        ${completed
          ? claimed
            ? 'bg-green-500/10 border-green-500/30'
            : 'bg-binance-yellow/10 border-binance-yellow/50'
          : 'bg-binance-dark/50 border-binance-gray-light'
        }
      `}
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className="text-3xl">{task.icon}</div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white">{task.nameCn}</h3>
          <p className="text-sm text-gray-400">{task.descriptionCn}</p>

          {/* Progress bar */}
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>進度</span>
              <span>{Math.min(progress, task.requirement)}/{task.requirement}</span>
            </div>
            <div className="h-2 bg-binance-dark rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  completed ? 'bg-green-500' : 'bg-binance-yellow'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Rewards */}
          <div className="flex gap-3 mt-2">
            <div className="flex items-center gap-1 text-xs">
              <span>⭐</span>
              <span className="text-blue-400">+{task.rewardXp} XP</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <span>💰</span>
              <span className="text-yellow-400">+{task.rewardTokens} $FARM</span>
            </div>
          </div>
        </div>

        {/* Claim button */}
        <div>
          {claimed ? (
            <div className="px-3 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm">
              ✓ 已領取
            </div>
          ) : completed ? (
            <button
              onClick={onClaim}
              className="px-4 py-2 bg-gradient-to-r from-binance-yellow to-binance-gold text-black font-bold rounded-lg hover:opacity-90 transition-opacity animate-pulse"
            >
              領取
            </button>
          ) : (
            <div className="px-3 py-2 bg-binance-gray-light text-gray-500 rounded-lg text-sm">
              進行中
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
