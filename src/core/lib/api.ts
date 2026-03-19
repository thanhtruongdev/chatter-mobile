import {
  AUTH_ACCESS_TOKEN_STORAGE_KEY,
  AUTH_REFRESH_TOKEN_STORAGE_KEY,
} from '@/src/core/constants/storageKeys';
import { ApiResponseEnvelope } from '@/src/core/types/api.types';
import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import * as SecureStore from 'expo-secure-store';

const defaultApiBaseUrl = 'http://localhost:3000';
const defaultApiPrefix = '/api/v1';

const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL
  ?? defaultApiBaseUrl;
const apiPrefix = process.env.EXPO_PUBLIC_API_PREFIX
  ?? defaultApiPrefix;

const normalizeBaseUrl = (url: string): string => (url.endsWith('/') ? url.slice(0, -1) : url);
const normalizeApiPrefix = (prefix: string): string => (prefix.startsWith('/') ? prefix : `/${prefix}`);

const resolvedBaseUrl = `${normalizeBaseUrl(apiBaseUrl)}${normalizeApiPrefix(apiPrefix)}`;

let memoryAccessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

interface RefreshTokenResponseData {
  accessToken: string;
  refreshToken: string;
}

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const getAccessToken = async (): Promise<string | null> => {
  if (memoryAccessToken) {
    return memoryAccessToken;
  }

  const token = await SecureStore.getItemAsync(AUTH_ACCESS_TOKEN_STORAGE_KEY);
  memoryAccessToken = token;
  return token;
};

const getRefreshToken = async (): Promise<string | null> => {
  const token = await SecureStore.getItemAsync(AUTH_REFRESH_TOKEN_STORAGE_KEY);
  return token;
};

const isAuthRoute = (url?: string): boolean => {
  if (!url) {
    return false;
  }

  return url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh-token');
};

const clearTokenStorage = async (): Promise<void> => {
  await Promise.all([
    SecureStore.deleteItemAsync(AUTH_ACCESS_TOKEN_STORAGE_KEY),
    SecureStore.deleteItemAsync(AUTH_REFRESH_TOKEN_STORAGE_KEY),
  ]);
};

const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const refreshToken = await getRefreshToken();

    if (!refreshToken) {
      return null;
    }

    const refreshUrl = `${resolvedBaseUrl}/auth/refresh-token`;
    const response = await axios.post<ApiResponseEnvelope<RefreshTokenResponseData>>(refreshUrl, {
      refreshToken,
    });

    const nextAccessToken = response.data.data.accessToken;
    const nextRefreshToken = response.data.data.refreshToken;

    await Promise.all([
      SecureStore.setItemAsync(AUTH_ACCESS_TOKEN_STORAGE_KEY, nextAccessToken),
      SecureStore.setItemAsync(AUTH_REFRESH_TOKEN_STORAGE_KEY, nextRefreshToken),
    ]);

    memoryAccessToken = nextAccessToken;
    return nextAccessToken;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
};

const attachAuthorizationHeader = async (
  config: InternalAxiosRequestConfig,
): Promise<InternalAxiosRequestConfig> => {
  const token = await getAccessToken();

  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }

  return config;
};

const logApiError = (error: AxiosError<ApiResponseEnvelope<unknown>>): void => {
  const status = error.response?.status;
  const apiMessage = error.response?.data?.message;
  const firstFieldMessage = error.response?.data?.errors?.[0]?.message;
  const detail = firstFieldMessage ?? apiMessage ?? error.message;

  console.error('[API_ERROR]', {
    method: error.config?.method,
    url: error.config?.url,
    status,
    message: detail,
  });
};

export const setApiAccessToken = (token: string | null): void => {
  memoryAccessToken = token;
};

export const api = axios.create({
  baseURL: resolvedBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

api.interceptors.request.use(attachAuthorizationHeader);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ApiResponseEnvelope<unknown>>) => {
    const status = error.response?.status;
    const originalConfig = error.config as RetryableRequestConfig | undefined;

    const shouldTryRefresh = status === 401
      && !!originalConfig
      && !originalConfig._retry
      && !isAuthRoute(originalConfig.url);

    if (shouldTryRefresh && originalConfig) {
      originalConfig._retry = true;

      try {
        const nextAccessToken = await refreshAccessToken();

        if (nextAccessToken) {
          originalConfig.headers.set('Authorization', `Bearer ${nextAccessToken}`);
          return await api.request(originalConfig);
        }
      } catch {
        memoryAccessToken = null;
        await clearTokenStorage();
      }
    }

    logApiError(error);
    return Promise.reject(error);
  },
);
