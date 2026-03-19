import { Colors } from '@/constants/theme';
import { Image as ImageIcon, Users } from 'lucide-react-native';
import React, { FC, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ConversationPreview } from '../types/home.types';

export interface ConversationListItemProps {
    item: ConversationPreview;
    onPress: (conversationId: string) => void;
}

export const ConversationListItem: FC<ConversationListItemProps> = ({ item, onPress }) => {
    const avatarLabel = useMemo(() => item.avatarFallback.slice(0, 2).toUpperCase(), [item.avatarFallback]);
    const avatarColor = useMemo(() => {
        const toneMap = {
            primary: Colors.light.primary,
            secondaryText: Colors.light.secondaryText,
            text: Colors.light.text,
            icon: Colors.light.icon,
            surface: Colors.light.surface,
            border: Colors.light.border,
        } as const;

        return toneMap[item.avatarTone];
    }, [item.avatarTone]);

    const handlePress = () => {
        onPress(item.id);
    };

    return (
        <Pressable
            onPress={handlePress}
            className="flex-row items-center px-1 py-3 gap-3"
            accessibilityRole="button"
            accessibilityLabel={`Open conversation with ${item.title}`}
        >
            <View
                className="size-14 items-center justify-center rounded-full"
                style={{ backgroundColor: avatarColor }}
            >
                {item.title.includes('Team') ? (
                    <Users size={24} color={Colors.light.background} />
                ) : (
                    <Text className="text-xl font-bold" style={{ color: Colors.light.background }}>{avatarLabel}</Text>
                )}
                {item.isOnline ? (
                    <View
                        className="absolute -bottom-px -right-px size-[14px] rounded-full border-2"
                        style={{
                            backgroundColor: Colors.light.success,
                            borderColor: Colors.light.background,
                        }}
                    />
                ) : null}
            </View>

            <View className="flex-1">
                <View className="mb-0.5 flex-row items-center">
                    <Text numberOfLines={1} className="flex-1 text-xl font-bold" style={{ color: Colors.light.text }}>
                        {item.title}
                    </Text>
                    <Text
                        className={`text-sm ${item.unreadCount ? 'font-semibold' : 'font-normal'}`}
                        style={{ color: item.unreadCount ? Colors.light.primary : Colors.light.secondaryText }}
                    >
                        {item.timeLabel}
                    </Text>
                </View>

                <View className="flex-row items-center">
                    <Text
                        numberOfLines={1}
                        className="mr-[10px] flex-1 text-md"
                        style={{ color: Colors.light.secondaryText }}
                    >
                        {item.messagePreview}
                    </Text>
                    {item.unreadCount ? (
                        <View className="ml-1 h-5 min-w-5 items-center justify-center rounded-full" style={{ backgroundColor: Colors.light.primary }}>
                            <Text className="text-xs font-bold" style={{ color: Colors.light.background }}>{item.unreadCount}</Text>
                        </View>
                    ) : null}
                    {item.hasImageAttachment ? (
                        <ImageIcon size={20} color={Colors.light.icon} />
                    ) : null}
                </View>
            </View>
        </Pressable>
    );
};
