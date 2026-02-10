import { useState } from 'react';
import { Button } from '../ui/Button';
import { sendFriendRequest } from '../../services/friendService';
import { Language } from '../../store/useLanguageStore';
import { localizeText } from '../../utils/i18n';

interface AddFriendProps {
  myUserId: string;
  onNotify: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
  language: Language;
}

export const AddFriend: React.FC<AddFriendProps> = ({ myUserId, onNotify, language }) => {
  const [friendId, setFriendId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const l = (en: string, zh: string) => localizeText(language, en, zh);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedId = friendId.trim();

    if (!trimmedId) {
      onNotify('error', l('Please enter friend ID', '請輸入好友 ID'));
      return;
    }

    if (trimmedId.length !== 6 || !/^\d+$/.test(trimmedId)) {
      onNotify('error', l('Invalid ID format (should be 6 digits)', 'ID 格式不正確（應為 6 位數字）'));
      return;
    }

    if (trimmedId === myUserId) {
      onNotify('error', l("Can't add yourself as friend!", '不能加自己為好友啦！'));
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
      onNotify('error', l('Failed to send friend request', '發送好友請求失敗'));
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
            {l("Enter friend's ID", '輸入好友的 ID')}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={friendId}
              onChange={(e) => setFriendId(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder={l('e.g.: 123456', '例如：123456')}
              className="input-field flex-1 text-xl font-mono text-center tracking-widest"
              maxLength={6}
            />
            <Button type="submit" isLoading={isLoading} disabled={friendId.length !== 6}>
              {l('Send Request', '發送請求')}
            </Button>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            {l("Friend's ID is a 6-digit number found in their profile", '好友的 ID 是 6 位數字，可以在好友的個人資料中找到')}
          </p>
        </div>
      </form>

      {/* Share section */}
      <div className="border-t border-space-gray-light pt-6">
        <h3 className="text-sm font-bold text-space-cyan mb-3">{l('Share with friends', '分享給朋友')}</h3>

        <div className="p-4 bg-space-gray rounded-lg text-center">
          <p className="text-gray-300 mb-3">{l('Let friends add you:', '讓朋友加你為好友：')}</p>
          <p className="text-3xl font-bold font-mono text-space-cyan mb-4">
            {myUserId}
          </p>

          <div className="flex justify-center gap-2">
            <Button
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(myUserId);
                onNotify('success', l('ID copied!', 'ID 已複製！'));
              }}
            >
              {l('Copy ID', '複製 ID')}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                const text = l(`Come play BSC Happy Farm! Add me: ${myUserId}`, `來玩 BSC 開心農場！加我好友：${myUserId}`);
                navigator.clipboard.writeText(text);
                onNotify('success', l('Invite message copied!', '邀請訊息已複製！'));
              }}
            >
              {l('Copy Invite', '複製邀請訊息')}
            </Button>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-space-cyan/10 border border-space-cyan/30 rounded-lg p-4">
        <h4 className="text-sm font-bold text-space-cyan mb-2">💡 {l('Tips', '小提示')}</h4>
        <ul className="text-xs text-gray-300 space-y-1">
          <li>• {l("After adding friends, you can visit their farms", '加好友後可以訪問對方的農場')}</li>
          <li>• {l("You can steal mature crops from friends (once per plot)", '可以偷好友成熟的作物（每塊地只能偷一次）')}</li>
          <li>• {l('Stealing has a 30-minute cooldown', '偷菜有 30 分鐘冷卻時間')}</li>
        </ul>
      </div>
    </div>
  );
};
