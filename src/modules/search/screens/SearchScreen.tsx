import { Colors } from '@/constants/theme';
import { Search as SearchIcon, Share2 } from 'lucide-react-native';
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
import { SearchUserCard } from '../components/SearchUserCard';
import { useUserSearch } from '../hooks/useUserSearch';
import { SearchUserItem } from '../types/search.types';

export const SearchScreen = () => {
    const insets = useSafeAreaInsets();
    const {
        keyword,
        users,
        isSearching,
        setKeyword,
        sendFriendRequest,
        submittingUserIds,
    } = useUserSearch();

    const handleSendInvite = useCallback(() => {
        // Placeholder until invite contacts flow is available.
    }, []);

    const handleChangeSearch = useCallback((value: string) => {
        setKeyword(value);
    }, [setKeyword]);

    const handleAddFriend = useCallback((userId: string) => {
        void sendFriendRequest(userId);
    }, [sendFriendRequest]);

    const keyExtractor = useCallback((item: SearchUserItem) => item.userId, []);

    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<SearchUserItem>) => (
            <SearchUserCard
                user={item}
                isSubmitting={submittingUserIds.includes(item.userId)}
                onPressAddFriend={handleAddFriend}
            />
        ),
        [handleAddFriend, submittingUserIds],
    );

    return (
        <SafeAreaView
            className="flex-1"
            style={{
                backgroundColor: Colors.light.background,
                paddingTop: Platform.OS === 'android' ? insets.top : 0,
            }}
        >

            <FlatList
                data={users}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                contentContainerClassName={`px-5 pb-4 ${users.length === 0 ? 'min-h-[400px]' : ''}`}
                keyboardShouldPersistTaps="handled"
                ListHeaderComponent={(
                    <View className="pb-5">
                        <Text className="mb-1 text-xl font-extrabold" style={{ color: Colors.light.text }}>Find your people</Text>
                        <Text className="text-sm" style={{ color: Colors.light.secondaryText }}>Search for friends by name or username</Text>

                        <View className="mt-4 flex-row items-center rounded-full border px-5" style={{ borderColor: Colors.light.border, backgroundColor: Colors.light.background }}>
                            <SearchIcon size={20} color={Colors.light.secondaryText} />
                            <TextInput
                                value={keyword}
                                onChangeText={handleChangeSearch}
                                placeholder="Search users..."
                                placeholderTextColor={Colors.light.secondaryText}
                                className="ml-2 flex-1 text-lg"
                                style={{ color: Colors.light.text }}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        <Text className="mt-4 text-sm font-bold tracking-[1px]" style={{ color: Colors.light.secondaryText }}>
                            RECOMMENDED
                        </Text>

                        {isSearching ? (
                            <View className="py-6">
                                <ActivityIndicator size="small" color={Colors.light.primary} />
                            </View>
                        ) : null}

                        {!isSearching && keyword.trim().length > 0 && users.length === 0 ? (
                            <Text className="mt-3 text-[15px]" style={{ color: Colors.light.secondaryText }}>
                                No users found. Try another keyword.
                            </Text>
                        ) : null}

                        {!isSearching && keyword.trim().length === 0 && users.length === 0 ? (
                            <Text className="mt-3 text-[15px]" style={{ color: Colors.light.secondaryText }}>
                                No recommendations available right now.
                            </Text>
                        ) : null}
                    </View>
                )}
                ListFooterComponent={(
                    <View className="mt-4 flex gap-1 rounded-3xl px-6 py-8" style={{ backgroundColor: Colors.light.surface }}>
                        <View className="size-20 self-center items-center justify-center rounded-full" style={{ backgroundColor: Colors.light.background }}>
                            <Share2 size={28} color={Colors.light.primary} />
                        </View>
                        <Text className="text-center text-lg font-extrabold" style={{ color: Colors.light.text }}>
                            Can't find them?
                        </Text>
                        <Text className="text-center text-md" style={{ color: Colors.light.secondaryText }}>
                            Invite your contacts to join Chatter and start the conversation.
                        </Text>
                        <Pressable
                            className="self-center rounded-full border px-10 py-2 mt-2"
                            style={{ borderColor: Colors.light.primary }}
                            onPress={handleSendInvite}
                            accessibilityRole="button"
                            accessibilityLabel="Send invite"
                        >
                            <Text className="text-lg font-bold" style={{ color: Colors.light.primary }}>Send Invite</Text>
                        </Pressable>
                    </View>
                )}
            />
        </SafeAreaView>
    );
};
