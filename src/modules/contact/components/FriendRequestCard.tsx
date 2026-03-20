import { Colors } from '@/constants/theme';
import { Check, X } from 'lucide-react-native';
import React, { FC } from 'react';
import { Pressable, Text, View } from 'react-native';
import { PendingFriendRequestItem } from '../types/contact.types';

export interface FriendRequestCardProps {
    request: PendingFriendRequestItem;
    isProcessing: boolean;
    onAccept: (requestId: string) => void;
    onReject: (requestId: string) => void;
}

export const FriendRequestCard: FC<FriendRequestCardProps> = ({ request, isProcessing, onAccept, onReject }) => {
    const handleAccept = () => {
        onAccept(request.requestId);
    };

    const handleReject = () => {
        onReject(request.requestId);
    };

    return (
        <View className="mb-3 flex-row items-center rounded-3xl border px-4 py-4" style={{ borderColor: Colors.light.border, backgroundColor: Colors.light.background }}>
            <View className="mr-4 size-16 items-center justify-center rounded-2xl" style={{ backgroundColor: Colors.light.surface }}>
                <Text className="text-lg font-bold" style={{ color: Colors.light.text }}>
                    {request.title.slice(0, 2).toUpperCase()}
                </Text>
            </View>

            <View className="flex-1">
                <Text className="text-lg font-bold" style={{ color: Colors.light.text }}>{request.title}</Text>
                <Text className="text-md" style={{ color: Colors.light.secondaryText }}>{request.subtitle}</Text>
            </View>

            <Pressable
                onPress={handleAccept}
                disabled={isProcessing}
                className="mr-3 size-14 items-center justify-center rounded-2xl"
                style={{ backgroundColor: Colors.light.primary }}
                accessibilityRole="button"
                accessibilityLabel={`Accept friend request from ${request.title}`}
            >
                <Check size={24} color={Colors.light.background} />
            </Pressable>

            <Pressable
                onPress={handleReject}
                disabled={isProcessing}
                className="size-14 items-center justify-center rounded-2xl"
                style={{ backgroundColor: Colors.light.surface }}
                accessibilityRole="button"
                accessibilityLabel={`Reject friend request from ${request.title}`}
            >
                <X size={24} color={Colors.light.secondaryText} />
            </Pressable>
        </View>
    );
};
