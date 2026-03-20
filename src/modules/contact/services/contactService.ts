import { api } from '@/src/core/lib/api';
import { ApiResponseEnvelope } from '@/src/core/types/api.types';
import { isAxiosError } from 'axios';
import {
    CreateDirectConversationRequestDto,
    CreatedConversationDto,
    FriendProfileDto,
    FriendRequestDto,
    PendingFriendRequestDto,
} from '../types/contact.types';

export const getContactApiErrorMessage = (error: unknown): string => {
  if (isAxiosError<ApiResponseEnvelope<unknown>>(error)) {
    const apiMessage = error.response?.data?.message;
    const firstFieldMessage = error.response?.data?.errors?.[0]?.message;
    return firstFieldMessage ?? apiMessage ?? 'Unable to complete this action.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unable to complete this action.';
};

const getFriendList = async (): Promise<FriendProfileDto[]> => {
  const response = await api.get<ApiResponseEnvelope<FriendProfileDto[]>>('/friends');
  return response.data.data;
};

const getPendingFriendRequests = async (): Promise<PendingFriendRequestDto[]> => {
  const response = await api.get<ApiResponseEnvelope<PendingFriendRequestDto[]>>('/friends/requests/pending');
  return response.data.data;
};

const createDirectConversation = async (friendUserId: string): Promise<CreatedConversationDto> => {
  const payload: CreateDirectConversationRequestDto = {
    type: 'direct',
    memberIds: [friendUserId],
  };

  const response = await api.post<ApiResponseEnvelope<CreatedConversationDto>>('/conversation', payload);
  return response.data.data;
};

const acceptFriendRequest = async (requestId: string): Promise<FriendRequestDto> => {
  const response = await api.patch<ApiResponseEnvelope<FriendRequestDto>>(`/friends/requests/${requestId}/accept`);
  return response.data.data;
};

const rejectFriendRequest = async (requestId: string): Promise<FriendRequestDto> => {
  const response = await api.patch<ApiResponseEnvelope<FriendRequestDto>>(`/friends/requests/${requestId}/reject`);
  return response.data.data;
};

const unfriend = async (friendUserId: string): Promise<void> => {
  await api.delete<ApiResponseEnvelope<{ unfriended: boolean }>>(`/friends/${friendUserId}`);
};

export const contactService = {
  getFriendList,
  getPendingFriendRequests,
  createDirectConversation,
  acceptFriendRequest,
  rejectFriendRequest,
  unfriend,
};
