export interface FriendProfileDto {
  userId: string;
  username: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  friendedAt: string;
}

export interface FriendRequestDto {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: 'pending' | 'accepted' | 'rejected';
  message: string | null;
  createdAt: string;
  actedAt: string | null;
}

export interface PendingRequestCounterpartDto {
  userId: string;
  username: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface PendingFriendRequestDto extends FriendRequestDto {
  direction: 'incoming' | 'outgoing';
  counterpart: PendingRequestCounterpartDto;
}

export interface FriendProfileItem {
  userId: string;
  title: string;
  subtitle: string;
  isOnline: boolean;
}

export interface PendingFriendRequestItem {
  requestId: string;
  title: string;
  subtitle: string;
  direction: 'incoming' | 'outgoing';
}

export interface CreateDirectConversationRequestDto {
  type: 'direct';
  memberIds: string[];
}

export interface CreatedConversationDto {
  id: string;
}
