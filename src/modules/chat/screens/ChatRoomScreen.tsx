import { Colors } from '@/constants/theme';
import { ArrowLeft, SendHorizontal } from 'lucide-react-native';
import React, { useCallback } from 'react';
import {
    ActivityIndicator,
    FlatList,
    ListRenderItemInfo,
    Platform,
    Pressable,
    SafeAreaView,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatMessageBubble } from '../components/ChatMessageBubble';
import { useRealtimeChat } from '../hooks/useRealtimeChat';
import { ChatMessageItem } from '../types/chat.types';

export interface ChatRoomScreenProps {
    conversationId: string;
    onBack: () => void;
}

export const ChatRoomScreen = ({ conversationId, onBack }: ChatRoomScreenProps) => {
    const insets = useSafeAreaInsets();
    const {
        messages,
        draftMessage,
        isConnected,
        isJoining,
        typingText,
        setDraftMessage,
        sendTextMessage,
    } = useRealtimeChat(conversationId);

    const keyExtractor = useCallback((item: ChatMessageItem) => item.id, []);

    const renderMessage = useCallback(
        ({ item }: ListRenderItemInfo<ChatMessageItem>) => <ChatMessageBubble message={item} />,
        [],
    );

    const handleSend = useCallback(() => {
        void sendTextMessage();
    }, [sendTextMessage]);

    return (
        <SafeAreaView
            className="flex-1"
            style={{
                backgroundColor: Colors.light.background,
                paddingTop: Platform.OS === 'android' ? insets.top : 0,
            }}
        >
            <View className="h-16 flex-row items-center border-b px-3" style={{ borderBottomColor: Colors.light.border }}>
                <Pressable
                    onPress={onBack}
                    className="mr-1 size-11 items-center justify-center"
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                >
                    <ArrowLeft size={24} color={Colors.light.text} />
                </Pressable>
                <View className="flex-1">
                    <Text numberOfLines={1} className="text-lg font-bold" style={{ color: Colors.light.text }}>
                        Conversation {conversationId}
                    </Text>
                    <Text className="text-sm" style={{ color: isConnected ? Colors.light.success : Colors.light.secondaryText }}>
                        {isConnected ? 'Realtime connected' : 'Connecting realtime...'}
                    </Text>
                </View>
            </View>

            {isJoining ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="small" color={Colors.light.primary} />
                </View>
            ) : (
                <FlatList
                    data={messages}
                    keyExtractor={keyExtractor}
                    renderItem={renderMessage}
                    contentContainerClassName={`px-4 pt-4 ${messages.length === 0 ? 'flex-1 items-center justify-center' : 'pb-4'}`}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={(
                        <Text className="text-base" style={{ color: Colors.light.secondaryText }}>
                            No messages yet. Start the conversation.
                        </Text>
                    )}
                />
            )}

            {typingText ? (
                <View className="px-5 pb-2">
                    <Text className="text-xs" style={{ color: Colors.light.secondaryText }}>{typingText}</Text>
                </View>
            ) : null}

            <View className="flex-row items-end border-t px-4 pb-3 pt-3" style={{ borderTopColor: Colors.light.border }}>
                <TextInput
                    value={draftMessage}
                    onChangeText={setDraftMessage}
                    placeholder="Write a message"
                    placeholderTextColor={Colors.light.secondaryText}
                    className="mr-3 max-h-32 flex-1 rounded-3xl px-4 py-3 text-[15px]"
                    style={{ backgroundColor: Colors.light.surface, color: Colors.light.text }}
                    multiline
                    accessibilityLabel="Message input"
                />
                <Pressable
                    onPress={handleSend}
                    className="size-12 items-center justify-center rounded-full"
                    style={{ backgroundColor: Colors.light.primary }}
                    accessibilityRole="button"
                    accessibilityLabel="Send message"
                >
                    <SendHorizontal size={20} color={Colors.light.background} />
                </Pressable>
            </View>
        </SafeAreaView>
    );
};
