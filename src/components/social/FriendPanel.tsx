import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FriendList } from './FriendList';
import { AddFriend } from './AddFriend';
import { FriendRequests } from './FriendRequests';

interface FriendPanelProps {
  isOpen: boolean;
  onClose: () => void;
  myUserId: string;
  onVisitFriend: (friendId: string, friendName: string) => void;
  onNotify: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
}

type Tab = 'friends' | 'add' | 'requests';

export const FriendPanel: React.FC<FriendPanelProps> = ({
  isOpen,
  onClose,
  myUserId,
  onVisitFriend,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('friends');

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'friends', label: '好友', icon: '👥' },
    { id: 'add', label: '加好友', icon: '➕' },
    { id: 'requests', label: '請求', icon: '📩' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="好友系統" size="lg">
      {/* My ID display */}
      <div className="mb-4 p-3 bg-binance-gray rounded-lg flex items-center justify-between">
        <div>
          <span className="text-xs text-gray-400">我的 ID</span>
          <p className="text-xl font-bold text-binance-yellow font-mono">
            {myUserId}
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            navigator.clipboard.writeText(myUserId);
            onNotify('success', 'ID 已複製！');
          }}
        >
          複製
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 py-2 px-4 rounded-lg font-medium transition-all
              ${activeTab === tab.id
                ? 'bg-binance-yellow text-black'
                : 'bg-binance-gray-light text-gray-300 hover:bg-binance-gray'
              }
            `}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-[300px]">
        {activeTab === 'friends' && (
          <FriendList
            myUserId={myUserId}
            onVisitFriend={onVisitFriend}
            onNotify={onNotify}
          />
        )}
        {activeTab === 'add' && (
          <AddFriend myUserId={myUserId} onNotify={onNotify} />
        )}
        {activeTab === 'requests' && (
          <FriendRequests myUserId={myUserId} onNotify={onNotify} />
        )}
      </div>
    </Modal>
  );
};
