import { Colors } from '@/constants/theme';
import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { Image, Platform, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LoginForm } from '../components/LoginForm';
import { SocialAuthButton } from '../components/SocialAuthButton';
import { useAuth } from '../hooks/useAuth';
import { LoginFormValues } from '../schemas/auth.schems';

export const LoginScreen = () => {
  const insets = useSafeAreaInsets();
  const { login, isLoggingIn, clearAuthError } = useAuth();

  const handleLogin = useCallback(async (values: LoginFormValues) => {
    const session = await login(values);

    if (session) {
      router.replace('/(tabs)/home');
    }
  }, [login]);

  const handleSocialLogin = useCallback((provider: 'google' | 'apple') => {
    // Implement social login logic
    void provider;
  }, []);

  const navigateToSignUp = useCallback(() => {
    clearAuthError();
    router.push('/(auth)/register');
  }, [clearAuthError]);

  const handleGoogleLogin = useCallback(() => {
    handleSocialLogin('google');
  }, [handleSocialLogin]);

  const handleAppleLogin = useCallback(() => {
    handleSocialLogin('apple');
  }, [handleSocialLogin]);

  return (
    <SafeAreaView
      className="flex-1"
      style={{
        backgroundColor: Colors.light.background,
        paddingTop: Platform.OS === 'android' ? insets.top : 0,
      }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6 pb-10">

          {/* Logo Section */}
          <View className="items-center">
            <Image
              source={require('@/assets/logo/chatter-logo-transparent.png')}
              className="h-28 w-[140px]"
              resizeMode="cover"
            />
          </View>

          {/* Header Section */}
          <View className="mb-8 items-center">
            <Text className="mb-2 text-[28px] font-bold" style={{ color: Colors.light.text }}>
              Welcome back
            </Text>
            <Text className="text-[15px]" style={{ color: Colors.light.secondaryText }}>
              Please enter your account to sign in
            </Text>
          </View>

          {/* Form Section */}
          <LoginForm onSubmit={handleLogin} isLoggingIn={isLoggingIn} />

          {/* Divider */}
          <View className="my-8 flex-row items-center">
            <View className="h-px flex-1" style={{ backgroundColor: Colors.light.border }} />
            <Text
              className="mx-4 text-xs font-semibold tracking-[1px]"
              style={{ color: Colors.light.secondaryText }}
            >
              OR CONTINUE WITH
            </Text>
            <View className="h-px flex-1" style={{ backgroundColor: Colors.light.border }} />
          </View>

          {/* Social Buttons */}
          <View className="-mx-2 flex-row justify-between">
            <SocialAuthButton provider="google" onPress={handleGoogleLogin} />
            <SocialAuthButton provider="apple" onPress={handleAppleLogin} />
          </View>

          {/* Footer */}
          <View className="mt-12 flex-row justify-center">
            <Text className="text-md" style={{ color: Colors.light.secondaryText }}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity
              onPress={navigateToSignUp}
              accessibilityRole="button"
              accessibilityLabel="Sign Up"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text className="text-md font-bold" style={{ color: Colors.light.primary }}>Sign Up</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
