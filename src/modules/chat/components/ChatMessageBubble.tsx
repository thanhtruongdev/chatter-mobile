import { Colors } from '@/constants/theme';
import React, { FC } from 'react';
import { Text, View } from 'react-native';
import { ChatMessageItem } from '../types/chat.types';

export interface ChatMessageBubbleProps {
    message: ChatMessageItem;
}

const statusTextMap: Record<ChatMessageItem['status'], string> = {
    pending: 'Sending',
    sent: 'Sent',
    failed: 'Failed',
};

export const ChatMessageBubble: FC<ChatMessageBubbleProps> = ({ message }) => {
    return (
        <View className={`mb-3 ${message.isMine ? 'items-end' : 'items-start'}`}>
            <View
                className={`max-w-[82%] rounded-3xl px-4 py-3 ${message.isMine ? 'rounded-br-md' : 'rounded-bl-md'}`}
                style={{
                    backgroundColor: message.isMine ? Colors.light.primary : Colors.light.surface,
                }}
            >
                <Text
                    className="text-[15px] leading-6"
                    style={{ color: message.isMine ? Colors.light.background : Colors.light.text }}
                >
                    {message.content}
                </Text>
            </View>
            <Text className="mt-1 text-xs" style={{ color: Colors.light.secondaryText }}>
                {statusTextMap[message.status]}
            </Text>
        </View>
    );
};
