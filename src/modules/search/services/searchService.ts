import { api } from '@/src/core/lib/api';
import { ApiResponseEnvelope } from '@/src/core/types/api.types';
import { isAxiosError } from 'axios';
import { FriendRequestDto, SearchUserDto } from '../types/search.types';

export const getSearchApiErrorMessage = (error: unknown): string => {
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

const searchUsers = async (query: string, limit = 10): Promise<SearchUserDto[]> => {
  const trimmedQuery = query.trim();

  if (trimmedQuery.length === 0) {
    return [];
  }

  const response = await api.get<ApiResponseEnvelope<SearchUserDto[]>>('/friends/search', {
    params: {
      q: trimmedQuery,
      limit: String(limit),
    },
  });

  return response.data.data;
};

const sendFriendRequest = async (targetUserId: string, message?: string): Promise<FriendRequestDto> => {
  const response = await api.post<ApiResponseEnvelope<FriendRequestDto>>('/friends/requests', {
    targetUserId,
    message,
  });

  return response.data.data;
};

export const searchService = {
  searchUsers,
  sendFriendRequest,
};
