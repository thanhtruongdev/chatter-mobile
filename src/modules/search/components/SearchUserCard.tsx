import { Colors } from '@/constants/theme';
import React, { FC, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SearchUserItem } from '../types/search.types';

export interface SearchUserCardProps {
    user: SearchUserItem;
    isSubmitting: boolean;
    onPressAddFriend: (userId: string) => void;
}

const getButtonLabel = (status: SearchUserItem['status'], isSubmitting: boolean): string => {
    if (isSubmitting) {
        return 'Sending...';
    }

    if (status === 'request_pending') {
        return 'Sent';
    }

    if (status === 'already_friends') {
        return 'Friends';
    }

    if (status === 'blocked') {
        return 'Blocked';
    }

    return 'Add Friend';
};

export const SearchUserCard: FC<SearchUserCardProps> = ({ user, isSubmitting, onPressAddFriend }) => {
    const initials = useMemo(() => user.title.slice(0, 2).toUpperCase(), [user.title]);
    const isActionEnabled = user.status === 'can_send' && !isSubmitting;
    const buttonLabel = getButtonLabel(user.status, isSubmitting);

    const handlePress = () => {
        if (isActionEnabled) {
            onPressAddFriend(user.userId);
        }
    };

    return (
        <View className="mb-3 rounded-[24px] border p-4" style={{ borderColor: Colors.light.border, backgroundColor: Colors.light.background }}>
            <View className="flex-row items-center">
                <View className="mr-4 size-16 items-center justify-center rounded-[20px]" style={{ backgroundColor: Colors.light.surface }}>
                    <Text className="text-lg font-semibold" style={{ color: Colors.light.text }}>{initials}</Text>
                </View>

                <View className="flex-1 pr-3">
                    <Text className="text-[20px] font-bold" style={{ color: Colors.light.text }}>{user.title}</Text>
                    <Text className="text-[16px]" style={{ color: Colors.light.secondaryText }}>{user.subtitle}</Text>
                </View>

                <Pressable
                    onPress={handlePress}
                    disabled={!isActionEnabled}
                    className="min-w-[132px] items-center justify-center rounded-full px-5 py-3"
                    style={{
                        backgroundColor: isActionEnabled ? Colors.light.primary : Colors.light.surface,
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`${buttonLabel} ${user.title}`}
                    accessibilityState={{ disabled: !isActionEnabled }}
                >
                    <Text
                        className="text-[18px] font-bold"
                        style={{ color: isActionEnabled ? Colors.light.background : Colors.light.secondaryText }}
                    >
                        {buttonLabel}
                    </Text>
                </Pressable>
            </View>
        </View>
    );
};
