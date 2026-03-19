import { authService } from '@/src/modules/auth';
import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import './global.css';

export default function App() {
    const [targetRoute, setTargetRoute] = useState<'/(auth)/login' | '/(tabs)/home' | null>(null);

    useEffect(() => {
        let isMounted = true;

        const restoreSession = async () => {
            const session = await authService.getStoredSession();

            if (!isMounted) {
                return;
            }

            setTargetRoute(session ? '/(tabs)/home' : '/(auth)/login');
        };

        void restoreSession();

        return () => {
            isMounted = false;
        };
    }, []);

    if (!targetRoute) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="small" />
            </View>
        );
    }

    return <Redirect href={targetRoute} />;
}