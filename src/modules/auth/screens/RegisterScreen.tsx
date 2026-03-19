import { Colors } from '@/constants/theme';
import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { Image, Platform, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RegisterForm } from '../components/RegisterForm';
import { useAuth } from '../hooks/useAuth';
import { RegisterFormValues } from '../schemas/auth.schems';

export const RegisterScreen = () => {
    const insets = useSafeAreaInsets();
    const { register, isRegistering, clearAuthError } = useAuth();

    const handleRegister = useCallback(async (values: RegisterFormValues) => {
        const session = await register(values);

        if (session) {
            router.replace('/(tabs)/home');
        }
    }, [register]);

    const handlePressSignIn = useCallback(() => {
        clearAuthError();
        router.replace('/(auth)/login');
    }, [clearAuthError]);

    return (
        <SafeAreaView
            className="flex-1 bg-white"
            style={{
                paddingTop: Platform.OS === 'android' ? insets.top : 0,
                backgroundColor: Colors.light.background,
            }}
        >
            <ScrollView
                contentContainerClassName="grow"
                keyboardShouldPersistTaps="handled"
            >
                <View className="flex-1 gap-3 justify-center px-6 py-5">
                    <View className="items-center">
                        <Image
                            source={require('@/assets/logo/chatter-logo-transparent.png')}
                            className="h-28 w-[140px]"
                            resizeMode="cover"
                        />
                    </View>

                    <View className="items-center flex gap-1">
                        <Text
                            className="text-center text-3xl font-extrabold"
                            style={{ color: Colors.light.text }}
                        >
                            Create Account
                        </Text>
                        <Text
                            className="text-center text-lg"
                            style={{ color: Colors.light.secondaryText }}
                        >
                            Enter your details to get started
                        </Text>
                    </View>

                    <RegisterForm
                        onSubmit={handleRegister}
                        onPressSignIn={handlePressSignIn}
                        isRegistering={isRegistering}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};
