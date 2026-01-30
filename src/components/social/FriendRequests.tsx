import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { FriendInfo } from '../../types';
import {
  getPendingRequestsWithDetails,
  acceptFriendRequest,
  rejectFriendRequest,
} from '../../services/friendService';

interface FriendRequestsProps {
  myUserId: string;
  onNotify: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
}

export const FriendRequests: React.FC<FriendRequestsProps> = ({
  myUserId,
  onNotify,
}) => {
  const [requests, setRequests] = useState<FriendInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadRequests();
  }, [myUserId]);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const pendingRequests = await getPendingRequestsWithDetails(myUserId);
      setRequests(pendingRequests);
    } catch (error) {
      console.error('Failed to load friend requests:', error);
      onNotify('error', '載入好友請求失敗');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (requesterId: string, requesterName: string) => {
    setProcessingIds((prev) => new Set(prev).add(requesterId));

    try {
      await acceptFriendRequest(myUserId, requesterId);
      setRequests((prev) => prev.filter((r) => r.oderId !== requesterId));
      onNotify('success', `已接受 ${requesterName} 的好友請求！`);
    } catch (error) {
      console.error('Failed to accept friend request:', error);
      onNotify('error', '接受好友請求失敗');
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requesterId);
        return newSet;
      });
    }
  };

  const handleReject = async (requesterId: string, requesterName: string) => {
    setProcessingIds((prev) => new Set(prev).add(requesterId));

    try {
      await rejectFriendRequest(myUserId, requesterId);
      setRequests((prev) => prev.filter((r) => r.oderId !== requesterId));
      onNotify('info', `已拒絕 ${requesterName} 的好友請求`);
    } catch (error) {
      console.error('Failed to reject friend request:', error);
      onNotify('error', '拒絕好友請求失敗');
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requesterId);
        return newSet;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-binance-yellow"></div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-4xl mb-4">📭</p>
        <p>沒有待處理的好友請求</p>
        <p className="text-sm mt-2">分享你的 ID 讓朋友加你吧！</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-400 mb-4">
        有 {requests.length} 個待處理的請求
      </p>

      {requests.map((request) => {
        const isProcessing = processingIds.has(request.oderId);

        return (
          <div
            key={request.oderId}
            className="flex items-center justify-between p-4 bg-binance-gray-light rounded-lg"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">{request.name}</span>
                <span className="text-xs text-gray-400">Lv.{request.level}</span>
              </div>
              <div className="text-xs text-gray-400">ID: {request.oderId}</div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleAccept(request.oderId, request.name)}
                isLoading={isProcessing}
                disabled={isProcessing}
              >
                ✓ 接受
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleReject(request.oderId, request.name)}
                disabled={isProcessing}
              >
                ✗ 拒絕
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
