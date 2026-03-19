import { Colors } from '@/constants/theme';
import { Menu, MessageSquareText, Search, SquarePen } from 'lucide-react-native';
import React, { useCallback } from 'react';
import {
    FlatList,
    Image,
    ListRenderItemInfo,
    Platform,
    Pressable,
    SafeAreaView,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ConversationListItem } from '../components/ConversationListItem';
import { mockConversations } from '../constants/mockConversations';
import { ConversationPreview } from '../types/home.types';

export const HomeScreen = () => {
    const insets = useSafeAreaInsets();

    const handleOpenConversation = useCallback((conversationId: string) => {
        // Placeholder until conversation detail route is available.
        void conversationId;
    }, []);

    const handleOpenMenu = useCallback(() => {
        // Placeholder until drawer or side menu is available.
    }, []);

    const handleCompose = useCallback(() => {
        // Placeholder until new conversation flow is available.
    }, []);

    const renderConversation = useCallback(
        ({ item }: ListRenderItemInfo<ConversationPreview>) => (
            <ConversationListItem item={item} onPress={handleOpenConversation} />
        ),
        [handleOpenConversation],
    );

    const keyExtractor = useCallback((item: ConversationPreview) => item.id, []);

    return (
        <SafeAreaView
            className="flex-1"
            style={{
                backgroundColor: Colors.light.background,
                paddingTop: Platform.OS === 'android' ? insets.top : 0,
            }}
        >
            <View className="h-16 flex-row items-center justify-between border-b px-3" style={{ borderBottomColor: Colors.light.border }}>
                <Pressable
                    className="size-11 items-center justify-center"
                    onPress={handleOpenMenu}
                    accessibilityRole="button"
                    accessibilityLabel="Open menu"
                >
                    <Menu color={Colors.light.text} size={24} />
                </Pressable>
                <View className="items-center">
                    <Image
                        source={require('@/assets/logo/chatter-appicon-foreground.png')}
                        className="h-24 w-24"
                        resizeMode="contain"
                    />
                </View>
                <Pressable
                    className="size-11 items-center justify-center"
                    onPress={handleCompose}
                    accessibilityRole="button"
                    accessibilityLabel="Create new chat"
                >
                    <SquarePen color={Colors.light.text} size={24} />
                </Pressable>
            </View>

            <View
                className="mx-5 mb-3 mt-[18px] h-14 flex-row items-center rounded-full px-[18px]"
                style={{ backgroundColor: Colors.light.surface }}
            >
                <Search size={28} color={Colors.light.secondaryText} />
                <Text className="ml-3 text-lg" style={{ color: Colors.light.secondaryText }}>Search messages...</Text>
            </View>

            <FlatList
                data={mockConversations}
                keyExtractor={keyExtractor}
                renderItem={renderConversation}
                contentContainerClassName="px-5 pb-[120px]"
                showsVerticalScrollIndicator={false}
            />

            <Pressable
                className="absolute bottom-[28px] right-7 size-[56px] items-center justify-center rounded-full"
                style={{
                    backgroundColor: Colors.light.primary,
                    shadowColor: Colors.light.primary,
                    shadowOpacity: 0.35,
                    shadowRadius: 12,
                    shadowOffset: {
                        width: 0,
                        height: 8,
                    },
                    elevation: 8,
                }}
                onPress={handleCompose}
                accessibilityRole="button"
                accessibilityLabel="Start a new conversation"
            >
                <MessageSquareText size={24} color={Colors.light.background} />
            </Pressable>
        </SafeAreaView>
    );
};
