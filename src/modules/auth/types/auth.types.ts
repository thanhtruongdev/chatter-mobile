export interface AuthUser {
  id: string;
  username: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthSession extends AuthTokens {
  user: AuthUser;
}

export interface LoginRequestDto {
  emailOrUsername: string;
  password: string;
}

export interface RegisterRequestDto {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}

export interface AuthSuccessResponseData {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}
