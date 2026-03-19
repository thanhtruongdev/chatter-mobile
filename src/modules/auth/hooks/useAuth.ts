import { AuthSession } from '@/src/modules/auth/types/auth.types';
import { useCallback, useState } from 'react';
import { useToast } from 'react-native-toast-notifications';
import { LoginFormValues, RegisterFormValues } from '../schemas/auth.schems';
import { authService, getApiErrorMessage } from '../services/authService';

export interface UseAuthResult {
  isLoggingIn: boolean;
  isRegistering: boolean;
  authError: string | null;
  login: (values: LoginFormValues) => Promise<AuthSession | null>;
  register: (values: RegisterFormValues) => Promise<AuthSession | null>;
  clearAuthError: () => void;
}

export const useAuth = (): UseAuthResult => {
  const toast = useToast();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const login = useCallback(async (values: LoginFormValues): Promise<AuthSession | null> => {
    setIsLoggingIn(true);
    setAuthError(null);

    try {
      return await authService.login(values);
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      setAuthError(errorMessage);
      toast.show(errorMessage, {
        type: 'danger',
      });
      return null;
    } finally {
      setIsLoggingIn(false);
    }
  }, [toast]);

  const register = useCallback(async (values: RegisterFormValues): Promise<AuthSession | null> => {
    setIsRegistering(true);
    setAuthError(null);

    try {
      return await authService.register(values);
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      setAuthError(errorMessage);
      toast.show(errorMessage, {
        type: 'danger',
      });
      return null;
    } finally {
      setIsRegistering(false);
    }
  }, [toast]);

  return {
    isLoggingIn,
    isRegistering,
    authError,
    login,
    register,
    clearAuthError,
  };
};
