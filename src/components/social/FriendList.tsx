import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { FriendInfo } from '../../types';
import { Language } from '../../store/useLanguageStore';
import { getFriendListWithDetails, removeFriend } from '../../services/friendService';
import { localizeText } from '../../utils/i18n';

interface FriendListProps {
  myUserId: string;
  onVisitFriend: (friendId: string, friendName: string) => void;
  onNotify: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
  language: Language;
}

export const FriendList: React.FC<FriendListProps> = ({
  myUserId,
  onVisitFriend,
  onNotify,
  language,
}) => {
  const [friends, setFriends] = useState<FriendInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const l = (en: string, zh: string) => localizeText(language, en, zh);

  useEffect(() => {
    loadFriends();
  }, [myUserId]);

  const loadFriends = async () => {
    setIsLoading(true);
    try {
      const friendList = await getFriendListWithDetails(myUserId);
      setFriends(friendList);
    } catch (error) {
      console.error('Failed to load friends:', error);
      onNotify('error', l('Failed to load friend list', '載入好友列表失敗'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFriend = async (friendId: string, friendName: string) => {
    if (!confirm(l(`Are you sure you want to remove ${friendName}?`, `確定要刪除好友 ${friendName} 嗎？`))) return;

    try {
      await removeFriend(myUserId, friendId);
      setFriends((prev) => prev.filter((f) => f.oderId !== friendId));
      onNotify('success', l(`Removed friend ${friendName}`, `已刪除好友 ${friendName}`));
    } catch (error) {
      console.error('Failed to remove friend:', error);
      onNotify('error', l('Failed to remove friend', '刪除好友失敗'));
    }
  };

  const formatLastOnline = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 5) return l('Just now', '剛剛在線');
    if (minutes < 60) return l(`${minutes} min ago`, `${minutes} 分鐘前`);
    if (hours < 24) return l(`${hours} hours ago`, `${hours} 小時前`);
    return l(`${days} days ago`, `${days} 天前`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-space-cyan"></div>
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-4xl mb-4">👥</p>
        <p>{l('No friends yet', '還沒有好友')}</p>
        <p className="text-sm mt-2">{l('Click "Add Friend" to share your ID with friends!', '點擊「加好友」分享你的 ID 給朋友吧！')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {friends.map((friend) => (
        <div
          key={friend.oderId}
          className="flex items-center justify-between p-3 bg-space-gray-light rounded-lg hover:bg-space-gray transition-colors"
        >
          <div className="flex items-center gap-3">
            {/* Online indicator */}
            <div
              className={`w-3 h-3 rounded-full ${
                friend.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
              }`}
            />

            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">{friend.name}</span>
                <span className="text-xs text-gray-400">Lv.{friend.level}</span>
              </div>
              <div className="text-xs text-gray-400">
                ID: {friend.oderId} ·{' '}
                {friend.isOnline ? (
                  <span className="text-green-400">{l('Online', '在線')}</span>
                ) : (
                  formatLastOnline(friend.lastOnline)
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => onVisitFriend(friend.oderId, friend.name)}
            >
              🏠 {l('Visit', '訪問')}
            </Button>
            <button
              onClick={() => handleRemoveFriend(friend.oderId, friend.name)}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors"
              title={l('Remove friend', '刪除好友')}
            >
              🗑️
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
