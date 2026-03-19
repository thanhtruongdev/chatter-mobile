import { ConversationDto, ConversationPreview, LatestMessageDto } from '../types/home.types';

const formatUpdatedAt = (value: string): string => {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return '';
  }

  const now = new Date();
  const isSameDay = parsedDate.toDateString() === now.toDateString();

  if (isSameDay) {
    return parsedDate.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  const diffMs = now.getTime() - parsedDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return 'Yesterday';
  }

  return parsedDate.toLocaleDateString([], {
    month: 'short',
    day: '2-digit',
  });
};

const getAvatarTone = (type: ConversationDto['type']): ConversationPreview['avatarTone'] => {
  if (type === 'channel') {
    return 'icon';
  }

  if (type === 'group') {
    return 'secondaryText';
  }

  return 'primary';
};

const getConversationTitle = (conversation: ConversationDto): string => {
  if (conversation.title && conversation.title.trim().length > 0) {
    return conversation.title.trim();
  }

  if (conversation.type === 'direct') {
    return 'Direct Message';
  }

  if (conversation.type === 'channel') {
    return 'Channel';
  }

  return 'Group Chat';
};

const getMessagePreview = (conversation: ConversationDto): string => {
  const latestMessage = conversation.latestMessages[0];

  if (latestMessage) {
    return getLatestMessagePreview(latestMessage);
  }

  if (conversation.type === 'channel') {
    return 'Tap to view channel updates.';
  }

  if (conversation.type === 'group') {
    return 'No messages yet. Start the conversation.';
  }

  return 'Tap to open the conversation.';
};

const getLatestMessagePreview = (message: LatestMessageDto): string => {
  if (message.contentCategory === 'system') {
    return 'System message';
  }

  if (message.contentCategory === 'media') {
    if (message.mediaType === 'image') {
      return 'Sent a photo';
    }

    if (message.mediaType === 'video') {
      return 'Sent a video';
    }

    if (message.mediaType === 'audio' || message.mediaType === 'record') {
      return 'Sent an audio';
    }

    return message.content?.trim() || 'Sent an attachment';
  }

  return message.content?.trim() || 'New message';
};

const hasAttachmentIcon = (conversation: ConversationDto): boolean => {
  const latestMessage = conversation.latestMessages[0];
  return latestMessage?.contentCategory === 'media';
};

export const toConversationPreview = (conversation: ConversationDto): ConversationPreview => {
  const title = getConversationTitle(conversation);
  const latestMessage = conversation.latestMessages[0];
  const timeSource = latestMessage?.createdAt ?? conversation.updatedAt;

  return {
    id: conversation.id,
    title,
    messagePreview: getMessagePreview(conversation),
    timeLabel: formatUpdatedAt(timeSource),
    avatarFallback: title.slice(0, 2).toUpperCase(),
    avatarTone: getAvatarTone(conversation.type),
    hasImageAttachment: hasAttachmentIcon(conversation),
    unreadCount: undefined,
    isOnline: false,
  };
};
