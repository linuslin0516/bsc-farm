import { useState } from 'react';
import { Button } from '../ui/Button';
import { sendFriendRequest } from '../../services/friendService';

interface AddFriendProps {
  myUserId: string;
  onNotify: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
}

export const AddFriend: React.FC<AddFriendProps> = ({ myUserId, onNotify }) => {
  const [friendId, setFriendId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedId = friendId.trim();

    if (!trimmedId) {
      onNotify('error', '請輸入好友 ID');
      return;
    }

    if (trimmedId.length !== 6 || !/^\d+$/.test(trimmedId)) {
      onNotify('error', 'ID 格式不正確（應為 6 位數字）');
      return;
    }

    if (trimmedId === myUserId) {
      onNotify('error', '不能加自己為好友啦！');
      return;
    }

    setIsLoading(true);

    try {
      const result = await sendFriendRequest(myUserId, trimmedId);

      if (result.success) {
        onNotify('success', result.message);
        setFriendId('');
      } else {
        onNotify('error', result.message);
      }
    } catch (error) {
      console.error('Failed to send friend request:', error);
      onNotify('error', '發送好友請求失敗');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            輸入好友的 ID
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={friendId}
              onChange={(e) => setFriendId(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="例如：123456"
              className="input-field flex-1 text-xl font-mono text-center tracking-widest"
              maxLength={6}
            />
            <Button type="submit" isLoading={isLoading} disabled={friendId.length !== 6}>
              發送請求
            </Button>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            好友的 ID 是 6 位數字，可以在好友的個人資料中找到
          </p>
        </div>
      </form>

      {/* Share section */}
      <div className="border-t border-binance-gray-light pt-6">
        <h3 className="text-sm font-bold text-binance-yellow mb-3">分享給朋友</h3>

        <div className="p-4 bg-binance-gray rounded-lg text-center">
          <p className="text-gray-300 mb-3">讓朋友加你為好友：</p>
          <p className="text-3xl font-bold font-mono text-binance-yellow mb-4">
            {myUserId}
          </p>

          <div className="flex justify-center gap-2">
            <Button
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(myUserId);
                onNotify('success', 'ID 已複製！');
              }}
            >
              複製 ID
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                const text = `來玩 BSC 開心農場！加我好友：${myUserId}`;
                navigator.clipboard.writeText(text);
                onNotify('success', '邀請訊息已複製！');
              }}
            >
              複製邀請訊息
            </Button>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-binance-yellow/10 border border-binance-yellow/30 rounded-lg p-4">
        <h4 className="text-sm font-bold text-binance-yellow mb-2">💡 小提示</h4>
        <ul className="text-xs text-gray-300 space-y-1">
          <li>• 加好友後可以訪問對方的農場</li>
          <li>• 可以偷好友成熟的作物（每塊地只能偷一次）</li>
          <li>• 偷菜有 30 分鐘冷卻時間</li>
        </ul>
      </div>
    </div>
  );
};
