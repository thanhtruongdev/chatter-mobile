import { AUTH_USER_STORAGE_KEY } from '@/src/core/constants/storageKeys';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useToast } from 'react-native-toast-notifications';
import { Socket } from 'socket.io-client';
import { chatRealtimeService } from '../services/chatRealtimeService';
import {
    ChatMessageItem,
    ConversationHistoryEventPayload,
    MessageNewEventPayload,
    MessageSendPayload,
    MessageTypingEventPayload,
    RealtimeMessageDto,
} from '../types/chat.types';

interface StoredAuthUser {
  id: string;
}

export interface UseRealtimeChatResult {
  messages: ChatMessageItem[];
  draftMessage: string;
  isConnected: boolean;
  isJoining: boolean;
  typingText: string | null;
  setDraftMessage: (value: string) => void;
  sendTextMessage: () => Promise<void>;
}

const toChatMessage = (message: RealtimeMessageDto, currentUserId: string): ChatMessageItem => {
  const normalizedContent = message.content?.trim() || '[Unsupported message]';

  return {
    id: message.id,
    senderId: message.senderId,
    content: normalizedContent,
    createdAt: message.createdAt,
    isMine: message.senderId === currentUserId,
    status: 'sent',
  };
};

const parseCurrentUserId = async (): Promise<string | null> => {
  const rawUser = await SecureStore.getItemAsync(AUTH_USER_STORAGE_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    const user = JSON.parse(rawUser) as StoredAuthUser;
    return user.id;
  } catch {
    return null;
  }
};

const replaceMessageById = (
  messages: ChatMessageItem[],
  fromId: string,
  nextMessage: ChatMessageItem,
): ChatMessageItem[] => {
  return messages.map((item) => (item.id === fromId ? nextMessage : item));
};

const upsertMessage = (messages: ChatMessageItem[], nextMessage: ChatMessageItem): ChatMessageItem[] => {
  const exists = messages.some((item) => item.id === nextMessage.id);

  if (exists) {
    return messages;
  }

  return [...messages, nextMessage];
};

export const useRealtimeChat = (conversationId: string): UseRealtimeChatResult => {
  const toast = useToast();
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentUserIdRef = useRef<string>('');

  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [draftMessage, setDraftMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isJoining, setIsJoining] = useState(true);
  const [typingUserIds, setTypingUserIds] = useState<string[]>([]);

  const clearTypingTimer = useCallback(() => {
    if (!typingTimeoutRef.current) {
      return;
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = null;
  }, []);

  useEffect(() => {
    let isMounted = true;

    const setupRealtime = async (): Promise<void> => {
      const currentUserId = await parseCurrentUserId();

      if (!isMounted || !currentUserId) {
        setIsJoining(false);
        return;
      }

      currentUserIdRef.current = currentUserId;

      try {
        const socket = await chatRealtimeService.getSocket();

        if (!isMounted) {
          return;
        }

        socketRef.current = socket;

        const handleConnect = () => {
          setIsConnected(true);
        };

        const handleDisconnect = () => {
          setIsConnected(false);
        };

        const handleHistory = (payload: ConversationHistoryEventPayload) => {
          if (payload.conversationId !== conversationId) {
            return;
          }

          const mapped = payload.messages
            .map((item) => toChatMessage(item, currentUserIdRef.current))
            .sort((left, right) => left.createdAt.localeCompare(right.createdAt));

          setMessages(mapped);
        };

        const handleMessageNew = (payload: MessageNewEventPayload) => {
          if (payload.message.conversationId !== conversationId) {
            return;
          }

          const mapped = toChatMessage(payload.message, currentUserIdRef.current);
          setMessages((prev) => upsertMessage(prev, mapped));
        };

        const handleTyping = (payload: MessageTypingEventPayload) => {
          if (payload.conversationId !== conversationId || payload.userId === currentUserIdRef.current) {
            return;
          }

          setTypingUserIds((prev) => {
            if (payload.isTyping) {
              if (prev.includes(payload.userId)) {
                return prev;
              }

              return [...prev, payload.userId];
            }

            return prev.filter((item) => item !== payload.userId);
          });
        };

        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('conversation:history', handleHistory);
        socket.on('message:new', handleMessageNew);
        socket.on('message:typing', handleTyping);

        setIsConnected(socket.connected);

        const joinAck = await chatRealtimeService.joinConversation(socket, {
          conversationId,
          limit: 30,
          cursor: null,
        });

        if (!joinAck.ok) {
          toast.show(joinAck.error.message, { type: 'danger' });
        }
      } catch (error) {
        const fallbackMessage = error instanceof Error ? error.message : 'Unable to connect realtime chat.';
        toast.show(fallbackMessage, { type: 'danger' });
      } finally {
        if (isMounted) {
          setIsJoining(false);
        }
      }
    };

    void setupRealtime();

    return () => {
      isMounted = false;
      clearTypingTimer();

      const socket = socketRef.current;

      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('conversation:history');
        socket.off('message:new');
        socket.off('message:typing');
      }

      setTypingUserIds([]);
    };
  }, [clearTypingTimer, conversationId, toast]);

  const sendTyping = useCallback(async (isTyping: boolean): Promise<void> => {
    const socket = socketRef.current;

    if (!socket || !socket.connected) {
      return;
    }

    try {
      const ack = await chatRealtimeService.sendTyping(socket, {
        conversationId,
        isTyping,
      });

      if (!ack.ok) {
        return;
      }
    } catch {
      // Ignore typing failures to avoid interrupting message flow.
    }
  }, [conversationId]);

  const handleDraftChange = useCallback((value: string) => {
    setDraftMessage(value);

    void sendTyping(value.trim().length > 0);

    clearTypingTimer();
    typingTimeoutRef.current = setTimeout(() => {
      void sendTyping(false);
    }, 1200);
  }, [clearTypingTimer, sendTyping]);

  const sendTextMessage = useCallback(async (): Promise<void> => {
    const content = draftMessage.trim();

    if (!content) {
      return;
    }

    const socket = socketRef.current;

    if (!socket || !socket.connected) {
      toast.show('Realtime connection is not available.', { type: 'danger' });
      return;
    }

    const clientMessageId = `msg-${Date.now()}`;
    const optimisticId = `local-${clientMessageId}`;

    const optimisticMessage: ChatMessageItem = {
      id: optimisticId,
      senderId: currentUserIdRef.current,
      content,
      createdAt: new Date().toISOString(),
      isMine: true,
      status: 'pending',
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setDraftMessage('');
    clearTypingTimer();
    void sendTyping(false);

    const payload: MessageSendPayload = {
      clientMessageId,
      conversationId,
      type: 'text',
      content,
      metadata: null,
      replyToMessageId: null,
    };

    try {
      const ack = await chatRealtimeService.sendMessage(socket, payload);

      if (!ack.ok) {
        setMessages((prev) => replaceMessageById(prev, optimisticId, { ...optimisticMessage, status: 'failed' }));
        toast.show(ack.error.message, { type: 'danger' });
        return;
      }

      const deliveredMessage = toChatMessage(ack.data.message, currentUserIdRef.current);
      setMessages((prev) => replaceMessageById(prev, optimisticId, deliveredMessage));
    } catch {
      setMessages((prev) => replaceMessageById(prev, optimisticId, { ...optimisticMessage, status: 'failed' }));
      toast.show('Unable to send message. Please retry.', { type: 'danger' });
    }
  }, [clearTypingTimer, conversationId, draftMessage, sendTyping, toast]);

  const typingText = useMemo(() => {
    if (typingUserIds.length === 0) {
      return null;
    }

    if (typingUserIds.length === 1) {
      return 'Someone is typing...';
    }

    return `${typingUserIds.length} people are typing...`;
  }, [typingUserIds]);

  return {
    messages,
    draftMessage,
    isConnected,
    isJoining,
    typingText,
    setDraftMessage: handleDraftChange,
    sendTextMessage,
  };
};
