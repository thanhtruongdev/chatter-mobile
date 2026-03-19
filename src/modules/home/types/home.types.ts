export interface ConversationPreview {
  id: string;
  title: string;
  messagePreview: string;
  timeLabel: string;
  unreadCount?: number;
  isOnline?: boolean;
  hasImageAttachment?: boolean;
  avatarFallback: string;
  avatarTone: 'primary' | 'secondaryText' | 'text' | 'icon' | 'surface' | 'border';
}

export interface ConversationMemberDto {
  userId: string;
  role: 'owner' | 'member';
  joinedAt: string;
}

export interface ConversationDto {
  id: string;
  type: 'direct' | 'group' | 'channel';
  title: string | null;
  avatarUrl: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  latestMessages: LatestMessageDto[];
  members: ConversationMemberDto[];
}

export interface LatestMessageDto {
  id: string;
  senderId: string;
  type: 'text' | 'image' | 'file' | 'system';
  content: string | null;
  createdAt: string;
  contentCategory: 'text' | 'media' | 'system';
  mediaType: 'image' | 'video' | 'audio' | 'record' | 'file' | null;
}
