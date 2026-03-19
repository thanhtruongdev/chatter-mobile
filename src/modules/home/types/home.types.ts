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
