import {
    AUTH_ACCESS_TOKEN_STORAGE_KEY,
    AUTH_REFRESH_TOKEN_STORAGE_KEY,
    AUTH_USER_STORAGE_KEY,
} from '@/src/core/constants/storageKeys';
import { api, setApiAccessToken } from '@/src/core/lib/api';
import { ApiResponseEnvelope } from '@/src/core/types/api.types';
import {
    AuthSession,
    AuthSuccessResponseData,
    AuthUser,
    LoginRequestDto,
    RegisterRequestDto,
} from '@/src/modules/auth/types/auth.types';
import { isAxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { LoginFormValues, RegisterFormValues } from '../schemas/auth.schems';

const saveSession = async (session: AuthSession): Promise<void> => {
  await Promise.all([
    SecureStore.setItemAsync(AUTH_ACCESS_TOKEN_STORAGE_KEY, session.accessToken),
    SecureStore.setItemAsync(AUTH_REFRESH_TOKEN_STORAGE_KEY, session.refreshToken),
    SecureStore.setItemAsync(AUTH_USER_STORAGE_KEY, JSON.stringify(session.user)),
  ]);

  setApiAccessToken(session.accessToken);
};

const toLoginPayload = (values: LoginFormValues): LoginRequestDto => ({
  emailOrUsername: values.email.trim(),
  password: values.password,
});

const toRegisterPayload = (values: RegisterFormValues): RegisterRequestDto => ({
  displayName: values.displayName.trim(),
  username: values.username.trim(),
  email: values.email.trim(),
  password: values.password,
});

const toSession = (data: AuthSuccessResponseData): AuthSession => ({
  user: data.user,
  accessToken: data.accessToken,
  refreshToken: data.refreshToken,
});

const parseStoredUser = (rawUser: string | null): AuthUser | null => {
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    return null;
  }
};

export const getApiErrorMessage = (error: unknown): string => {
  if (isAxiosError<ApiResponseEnvelope<unknown>>(error)) {
    const apiMessage = error.response?.data?.message;
    const firstFieldMessage = error.response?.data?.errors?.[0]?.message;
    return firstFieldMessage ?? apiMessage ?? 'Something went wrong. Please try again.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
};

const login = async (values: LoginFormValues): Promise<AuthSession> => {
  const payload = toLoginPayload(values);
  const response = await api.post<ApiResponseEnvelope<AuthSuccessResponseData>>('/auth/login', payload);
  const session = toSession(response.data.data);
  await saveSession(session);
  return session;
};

const register = async (values: RegisterFormValues): Promise<AuthSession> => {
  const payload = toRegisterPayload(values);
  const response = await api.post<ApiResponseEnvelope<AuthSuccessResponseData>>('/auth/register', payload);
  const session = toSession(response.data.data);
  await saveSession(session);
  return session;
};

const getStoredSession = async (): Promise<AuthSession | null> => {
  const [accessToken, refreshToken, rawUser] = await Promise.all([
    SecureStore.getItemAsync(AUTH_ACCESS_TOKEN_STORAGE_KEY),
    SecureStore.getItemAsync(AUTH_REFRESH_TOKEN_STORAGE_KEY),
    SecureStore.getItemAsync(AUTH_USER_STORAGE_KEY),
  ]);

  const user = parseStoredUser(rawUser);

  if (!accessToken || !refreshToken || !user) {
    return null;
  }

  setApiAccessToken(accessToken);

  return {
    accessToken,
    refreshToken,
    user,
  };
};

const clearSession = async (): Promise<void> => {
  await Promise.all([
    SecureStore.deleteItemAsync(AUTH_ACCESS_TOKEN_STORAGE_KEY),
    SecureStore.deleteItemAsync(AUTH_REFRESH_TOKEN_STORAGE_KEY),
    SecureStore.deleteItemAsync(AUTH_USER_STORAGE_KEY),
  ]);

  setApiAccessToken(null);
};

export const authService = {
  login,
  register,
  getStoredSession,
  clearSession,
};
