import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FriendList } from './FriendList';
import { AddFriend } from './AddFriend';
import { FriendRequests } from './FriendRequests';
import { useLanguageStore } from '../../store/useLanguageStore';
import { localizeText } from '../../utils/i18n';

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
  const { language } = useLanguageStore();
  const l = (en: string, zh: string) => localizeText(language, en, zh);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'friends', label: l('Friends', '好友'), icon: '👥' },
    { id: 'add', label: l('Add Friend', '加好友'), icon: '➕' },
    { id: 'requests', label: l('Requests', '請求'), icon: '📩' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={l('Friend System', '好友系統')} size="lg">
      {/* My ID display */}
      <div className="mb-4 p-3 bg-space-gray rounded-lg flex items-center justify-between">
        <div>
          <span className="text-xs text-gray-400">{l('My ID', '我的 ID')}</span>
          <p className="text-xl font-bold text-space-cyan font-mono">
            {myUserId}
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            navigator.clipboard.writeText(myUserId);
            onNotify('success', l('ID copied!', 'ID 已複製！'));
          }}
        >
          {l('Copy', '複製')}
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
                ? 'bg-space-cyan text-black'
                : 'bg-space-gray-light text-gray-300 hover:bg-space-gray'
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
            language={language}
          />
        )}
        {activeTab === 'add' && (
          <AddFriend myUserId={myUserId} onNotify={onNotify} language={language} />
        )}
        {activeTab === 'requests' && (
          <FriendRequests myUserId={myUserId} onNotify={onNotify} language={language} />
        )}
      </div>
    </Modal>
  );
};
