import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from 'react-native-toast-notifications';
import { contactService, getContactApiErrorMessage } from '../services/contactService';
import { FriendProfileDto, FriendProfileItem, PendingFriendRequestDto, PendingFriendRequestItem } from '../types/contact.types';

const mapFriendProfile = (friend: FriendProfileDto): FriendProfileItem => ({
  userId: friend.userId,
  title: friend.displayName?.trim() || friend.username,
  subtitle: `@${friend.username}`,
  isOnline: false,
});

const mapPendingRequest = (request: PendingFriendRequestDto): PendingFriendRequestItem => ({
  requestId: request.id,
  title: request.counterpart.displayName?.trim() || request.counterpart.username,
  subtitle: `@${request.counterpart.username}`,
  direction: request.direction,
});

export interface UseContactsResult {
  friendRequests: PendingFriendRequestItem[];
  friends: FriendProfileItem[];
  isLoadingContacts: boolean;
  removingFriendIds: string[];
  processingRequestIds: string[];
  reloadContacts: () => Promise<void>;
  acceptRequest: (requestId: string) => Promise<void>;
  rejectRequest: (requestId: string) => Promise<void>;
  removeFriend: (friendUserId: string) => Promise<void>;
  openConversation: (friendUserId: string) => Promise<string | null>;
}

export const useContacts = (): UseContactsResult => {
  const toast = useToast();
  const [friends, setFriends] = useState<FriendProfileItem[]>([]);
  const [friendRequests, setFriendRequests] = useState<PendingFriendRequestItem[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [removingFriendIds, setRemovingFriendIds] = useState<string[]>([]);
  const [processingRequestIds, setProcessingRequestIds] = useState<string[]>([]);

  const reloadContacts = useCallback(async (): Promise<void> => {
    setIsLoadingContacts(true);

    try {
      const [friendResponse, pendingRequestResponse] = await Promise.all([
        contactService.getFriendList(),
        contactService.getPendingFriendRequests(),
      ]);

      setFriends(friendResponse.map(mapFriendProfile));
      setFriendRequests(
        pendingRequestResponse
          .map(mapPendingRequest)
          .filter((request) => request.direction === 'incoming'),
      );
    } catch (error) {
      toast.show(getContactApiErrorMessage(error), { type: 'danger' });
    } finally {
      setIsLoadingContacts(false);
    }
  }, [toast]);

  useEffect(() => {
    void reloadContacts();
  }, [reloadContacts]);

  const acceptRequest = useCallback(async (requestId: string): Promise<void> => {
    if (processingRequestIds.includes(requestId)) {
      return;
    }

    setProcessingRequestIds((prev) => [...prev, requestId]);

    try {
      await contactService.acceptFriendRequest(requestId);
      setFriendRequests((prev) => prev.filter((item) => item.requestId !== requestId));
      toast.show('Friend request accepted.', { type: 'success' });
      await reloadContacts();
    } catch (error) {
      toast.show(getContactApiErrorMessage(error), { type: 'danger' });
    } finally {
      setProcessingRequestIds((prev) => prev.filter((id) => id !== requestId));
    }
  }, [processingRequestIds, reloadContacts, toast]);

  const rejectRequest = useCallback(async (requestId: string): Promise<void> => {
    if (processingRequestIds.includes(requestId)) {
      return;
    }

    setProcessingRequestIds((prev) => [...prev, requestId]);

    try {
      await contactService.rejectFriendRequest(requestId);
      setFriendRequests((prev) => prev.filter((item) => item.requestId !== requestId));
      toast.show('Friend request rejected.', { type: 'success' });
      await reloadContacts();
    } catch (error) {
      toast.show(getContactApiErrorMessage(error), { type: 'danger' });
    } finally {
      setProcessingRequestIds((prev) => prev.filter((id) => id !== requestId));
    }
  }, [processingRequestIds, reloadContacts, toast]);

  const removeFriend = useCallback(async (friendUserId: string): Promise<void> => {
    if (removingFriendIds.includes(friendUserId)) {
      return;
    }

    setRemovingFriendIds((prev) => [...prev, friendUserId]);

    try {
      await contactService.unfriend(friendUserId);
      setFriends((prev) => prev.filter((friend) => friend.userId !== friendUserId));
      toast.show('Friend removed.', { type: 'success' });
    } catch (error) {
      toast.show(getContactApiErrorMessage(error), { type: 'danger' });
    } finally {
      setRemovingFriendIds((prev) => prev.filter((id) => id !== friendUserId));
    }
  }, [removingFriendIds, toast]);

  const openConversation = useCallback(async (friendUserId: string): Promise<string | null> => {
    try {
      const createdConversation = await contactService.createDirectConversation(friendUserId);
      return createdConversation.id;
    } catch (error) {
      toast.show(getContactApiErrorMessage(error), { type: 'danger' });
      return null;
    }
  }, [toast]);

  return useMemo(() => ({
    friendRequests,
    friends,
    isLoadingContacts,
    removingFriendIds,
    processingRequestIds,
    reloadContacts,
    acceptRequest,
    rejectRequest,
    removeFriend,
    openConversation,
  }), [acceptRequest, friendRequests, friends, isLoadingContacts, openConversation, processingRequestIds, rejectRequest, reloadContacts, removeFriend, removingFriendIds]);
};
