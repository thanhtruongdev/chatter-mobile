import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { ToastProvider } from 'react-native-toast-notifications';

import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

export const unstable_settings = {
  anchor: '(tabs)',
};

const RootNavigation = () => {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  void colorScheme;

  return (
    <ToastProvider
      placement="top"
      duration={3200}
      animationType="slide-in"
      dangerColor="#DC2626"
      successColor="#15803D"
      offsetTop={insets.top + 8}
      textStyle={{ fontSize: 14 }}
    >
      <ThemeProvider value={DefaultTheme}>
        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </ToastProvider>
  );
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <RootNavigation />
    </SafeAreaProvider>
  );
}
