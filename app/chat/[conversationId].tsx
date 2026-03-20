import { ChatRoomScreen } from '@/src/modules/chat';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { Text, View } from 'react-native';

const ChatRoomRoute = () => {
    const router = useRouter();
    const params = useLocalSearchParams<{ conversationId?: string | string[] }>();

    const conversationId = Array.isArray(params.conversationId)
        ? params.conversationId[0]
        : params.conversationId;

    const handleBack = useCallback(() => {
        router.back();
    }, [router]);

    if (!conversationId) {
        return (
            <View className="flex-1 items-center justify-center">
                <Text>Conversation not found.</Text>
            </View>
        );
    }

    return <ChatRoomScreen conversationId={conversationId} onBack={handleBack} />;
};

export default ChatRoomRoute;
