import { useCallback, useEffect, useState } from 'react';
import { useToast } from 'react-native-toast-notifications';
import { conversationService, getConversationApiErrorMessage } from '../services/conversationService';
import { ConversationPreview } from '../types/home.types';
import { toConversationPreview } from '../utils/conversationMapper';

export interface UseConversationsResult {
  conversations: ConversationPreview[];
  isLoading: boolean;
  isRefreshing: boolean;
  reloadConversations: () => Promise<void>;
  refreshConversations: () => Promise<void>;
}

export const useConversations = (): UseConversationsResult => {
  const toast = useToast();
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadConversations = useCallback(async (showToastOnError: boolean): Promise<void> => {
    try {
      const data = await conversationService.getConversationList();
      setConversations(data.map(toConversationPreview));
    } catch (error) {
      if (showToastOnError) {
        toast.show(getConversationApiErrorMessage(error), {
          type: 'danger',
        });
      }
    }
  }, [toast]);

  const reloadConversations = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    await loadConversations(true);
    setIsLoading(false);
  }, [loadConversations]);

  const refreshConversations = useCallback(async (): Promise<void> => {
    setIsRefreshing(true);
    await loadConversations(true);
    setIsRefreshing(false);
  }, [loadConversations]);

  useEffect(() => {
    void reloadConversations();
  }, [reloadConversations]);

  return {
    conversations,
    isLoading,
    isRefreshing,
    reloadConversations,
    refreshConversations,
  };
};
