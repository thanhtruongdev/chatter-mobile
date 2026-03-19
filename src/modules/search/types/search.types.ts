export type UserSearchStatus = 'can_send' | 'already_friends' | 'request_pending' | 'blocked';

export interface SearchUserDto {
  userId: string;
  username: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  searchStatus: UserSearchStatus;
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

export interface SearchUserItem {
  userId: string;
  title: string;
  subtitle: string;
  status: UserSearchStatus;
}
