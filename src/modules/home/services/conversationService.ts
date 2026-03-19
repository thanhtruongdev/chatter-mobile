import { api } from '@/src/core/lib/api';
import { ApiResponseEnvelope } from '@/src/core/types/api.types';
import { isAxiosError } from 'axios';
import { ConversationDto } from '../types/home.types';

export const getConversationApiErrorMessage = (error: unknown): string => {
  if (isAxiosError<ApiResponseEnvelope<unknown>>(error)) {
    const apiMessage = error.response?.data?.message;
    const firstFieldMessage = error.response?.data?.errors?.[0]?.message;
    return firstFieldMessage ?? apiMessage ?? 'Unable to load conversations.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unable to load conversations.';
};

const getConversationList = async (): Promise<ConversationDto[]> => {
  const response = await api.get<ApiResponseEnvelope<ConversationDto[]>>('/conversation');
  return response.data.data;
};

export const conversationService = {
  getConversationList,
};
