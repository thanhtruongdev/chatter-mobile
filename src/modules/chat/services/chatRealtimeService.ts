import { AUTH_ACCESS_TOKEN_STORAGE_KEY } from '@/src/core/constants/storageKeys';
import * as SecureStore from 'expo-secure-store';
import { io, Socket } from 'socket.io-client';
import {
    ConversationJoinAckData,
    ConversationJoinPayload,
    MessageSendAckData,
    MessageSendPayload,
    MessageTypingAckData,
    MessageTypingPayload,
    RealtimeAckResponse,
} from '../types/chat.types';

const defaultSocketUrl = 'http://localhost:3001';
const defaultSocketPath = '/socket.io';

const socketUrl = process.env.EXPO_PUBLIC_SOCKET_URL ?? defaultSocketUrl;
const socketPath = process.env.EXPO_PUBLIC_SOCKET_PATH ?? defaultSocketPath;

let socketClient: Socket | null = null;

const normalizeUrl = (url: string): string => (url.endsWith('/') ? url.slice(0, -1) : url);

const getAccessToken = async (): Promise<string | null> => {
  return SecureStore.getItemAsync(AUTH_ACCESS_TOKEN_STORAGE_KEY);
};

const getSocket = async (): Promise<Socket> => {
  if (socketClient) {
    return socketClient;
  }

  const token = await getAccessToken();

  socketClient = io(normalizeUrl(socketUrl), {
    path: socketPath,
    transports: ['websocket'],
    autoConnect: true,
    auth: token ? { token } : undefined,
  });

  return socketClient;
};

const disconnectSocket = (): void => {
  if (!socketClient) {
    return;
  }

  socketClient.disconnect();
  socketClient = null;
};

const emitWithAck = async <TData>(
  socket: Socket,
  eventName: string,
  payload: ConversationJoinPayload | MessageSendPayload | MessageTypingPayload,
): Promise<RealtimeAckResponse<TData>> => {
  return new Promise((resolve, reject) => {
    socket.timeout(12000).emit(eventName, payload, (error: Error | null, response: RealtimeAckResponse<TData>) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(response);
    });
  });
};

const joinConversation = async (
  socket: Socket,
  payload: ConversationJoinPayload,
): Promise<RealtimeAckResponse<ConversationJoinAckData>> => {
  return emitWithAck<ConversationJoinAckData>(socket, 'conversation:join', payload);
};

const sendMessage = async (
  socket: Socket,
  payload: MessageSendPayload,
): Promise<RealtimeAckResponse<MessageSendAckData>> => {
  return emitWithAck<MessageSendAckData>(socket, 'message:send', payload);
};

const sendTyping = async (
  socket: Socket,
  payload: MessageTypingPayload,
): Promise<RealtimeAckResponse<MessageTypingAckData>> => {
  return emitWithAck<MessageTypingAckData>(socket, 'message:typing', payload);
};

export const chatRealtimeService = {
  getSocket,
  disconnectSocket,
  joinConversation,
  sendMessage,
  sendTyping,
};
