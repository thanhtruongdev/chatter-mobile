export interface RealtimeMessageDto {
  id: string;
  conversationId: string;
  senderId: string;
  type: 'text' | 'image' | 'file' | 'system';
  content: string | null;
  metadata: Record<string, string> | null;
  replyToMessageId: string | null;
  createdAt: string;
}

export interface ConversationHistoryCursor {
  createdAt: string;
  id: string;
}

export interface ConversationJoinPayload {
  conversationId: string;
  limit?: number;
  cursor?: ConversationHistoryCursor | null;
}

export interface MessageSendPayload {
  clientMessageId: string;
  conversationId: string;
  type: 'text' | 'image' | 'file' | 'system';
  content: string | null;
  metadata: Record<string, string> | null;
  replyToMessageId: string | null;
}

export interface MessageTypingPayload {
  conversationId: string;
  isTyping: boolean;
}

export interface RealtimeAckErrorDetail {
  field: string;
  code: string;
  message: string;
}

export interface RealtimeAckSuccess<TData> {
  ok: true;
  event: string;
  timestamp: string;
  data: TData;
}

export interface RealtimeAckError {
  ok: false;
  event: string;
  timestamp: string;
  error: {
    code: 'unauthorized' | 'forbidden' | 'validation_failed' | 'internal_error';
    message: string;
    details?: RealtimeAckErrorDetail[];
  };
}

export type RealtimeAckResponse<TData> = RealtimeAckSuccess<TData> | RealtimeAckError;

export interface ConversationJoinAckData {
  conversationId: string;
  joined: boolean;
}

export interface ConversationHistoryEventPayload {
  conversationId: string;
  messages: RealtimeMessageDto[];
  nextCursor: ConversationHistoryCursor | null;
}

export interface MessageSendAckData {
  clientMessageId: string;
  message: RealtimeMessageDto;
}

export interface MessageNewEventPayload {
  message: RealtimeMessageDto;
}

export interface MessageTypingAckData {
  conversationId: string;
  accepted: boolean;
}

export interface MessageTypingEventPayload {
  conversationId: string;
  userId: string;
  isTyping: boolean;
  at: string;
}

export interface ChatMessageItem {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  isMine: boolean;
  status: 'pending' | 'sent' | 'failed';
}
