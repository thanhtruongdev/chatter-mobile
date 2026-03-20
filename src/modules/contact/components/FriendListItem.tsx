import { Colors } from '@/constants/theme';
import { MessageSquare, UserMinus } from 'lucide-react-native';
import React, { FC } from 'react';
import { Pressable, Text, View } from 'react-native';
import { FriendProfileItem } from '../types/contact.types';

export interface FriendListItemProps {
    friend: FriendProfileItem;
    isRemoving: boolean;
    onPressMessage: (friendUserId: string) => void;
    onPressRemove: (friendUserId: string) => void;
}

export const FriendListItem: FC<FriendListItemProps> = ({ friend, isRemoving, onPressMessage, onPressRemove }) => {
    const handleMessage = () => {
        onPressMessage(friend.userId);
    };

    const handleRemove = () => {
        onPressRemove(friend.userId);
    };

    return (
        <View className="mb-5 flex-row items-center">
            <View className="mr-4">
                <View className="size-16 items-center justify-center rounded-full" style={{ backgroundColor: Colors.light.surface }}>
                    <Text className="text-lg font-semibold" style={{ color: Colors.light.text }}>
                        {friend.title.slice(0, 2).toUpperCase()}
                    </Text>
                </View>
                <View
                    className="absolute -bottom-[2px] -right-[2px] size-[14px] rounded-full border-2"
                    style={{
                        backgroundColor: friend.isOnline ? Colors.light.success : Colors.light.border,
                        borderColor: Colors.light.background,
                    }}
                />
            </View>

            <View className="flex-1 pr-2">
                <Text className="text-[21px] font-bold" style={{ color: Colors.light.text }}>{friend.title}</Text>
                <Text className="text-[15px]" style={{ color: Colors.light.secondaryText }}>{friend.subtitle}</Text>
            </View>

            <Pressable
                onPress={handleMessage}
                className="mr-3 size-11 items-center justify-center"
                accessibilityRole="button"
                accessibilityLabel={`Message ${friend.title}`}
            >
                <MessageSquare size={28} color={Colors.light.secondaryText} />
            </Pressable>

            <Pressable
                onPress={handleRemove}
                disabled={isRemoving}
                className="size-11 items-center justify-center"
                accessibilityRole="button"
                accessibilityLabel={`Remove ${friend.title} from friends`}
            >
                <UserMinus size={28} color={Colors.light.error} />
            </Pressable>
        </View>
    );
};
