import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from 'react-native-toast-notifications';
import { getSearchApiErrorMessage, searchService } from '../services/searchService';
import { SearchUserDto, SearchUserItem } from '../types/search.types';

export interface UseUserSearchResult {
  keyword: string;
  users: SearchUserItem[];
  isSearching: boolean;
  submittingUserIds: string[];
  setKeyword: (value: string) => void;
  sendFriendRequest: (targetUserId: string) => Promise<void>;
}

const mapSearchUserToItem = (user: SearchUserDto): SearchUserItem => ({
  userId: user.userId,
  title: user.displayName?.trim() || user.username,
  subtitle: `@${user.username}`,
  status: user.searchStatus,
});

export const useUserSearch = (): UseUserSearchResult => {
  const toast = useToast();
  const [keyword, setKeyword] = useState('');
  const [users, setUsers] = useState<SearchUserItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [submittingUserIds, setSubmittingUserIds] = useState<string[]>([]);

  useEffect(() => {
    const trimmedKeyword = keyword.trim();
    const effectiveKeyword = trimmedKeyword.length > 0 ? trimmedKeyword : 'a';

    let isCancelled = false;
    const timeoutId = setTimeout(async () => {
      setIsSearching(true);

      try {
        const result = await searchService.searchUsers(effectiveKeyword);

        if (!isCancelled) {
          setUsers(result.map(mapSearchUserToItem));
        }
      } catch (error) {
        if (!isCancelled) {
          toast.show(getSearchApiErrorMessage(error), { type: 'danger' });
        }
      } finally {
        if (!isCancelled) {
          setIsSearching(false);
        }
      }
    }, 350);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [keyword, toast]);

  const sendFriendRequest = useCallback(async (targetUserId: string): Promise<void> => {
    if (submittingUserIds.includes(targetUserId)) {
      return;
    }

    setSubmittingUserIds((prev) => [...prev, targetUserId]);

    try {
      await searchService.sendFriendRequest(targetUserId);
      setUsers((prev) => prev.map((item) => (
        item.userId === targetUserId
          ? { ...item, status: 'request_pending' }
          : item
      )));
      toast.show('Friend request sent.', { type: 'success' });
    } catch (error) {
      toast.show(getSearchApiErrorMessage(error), { type: 'danger' });
    } finally {
      setSubmittingUserIds((prev) => prev.filter((id) => id !== targetUserId));
    }
  }, [submittingUserIds, toast]);

  return useMemo(() => ({
    keyword,
    users,
    isSearching,
    submittingUserIds,
    setKeyword,
    sendFriendRequest,
  }), [isSearching, keyword, sendFriendRequest, submittingUserIds, users]);
};
