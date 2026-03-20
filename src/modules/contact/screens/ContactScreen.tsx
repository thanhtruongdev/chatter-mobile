import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { Search, Settings } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, ListRenderItemInfo, Platform, Pressable, SafeAreaView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FriendListItem } from '../components/FriendListItem';
import { FriendRequestCard } from '../components/FriendRequestCard';
import { useContacts } from '../hooks/useContacts';
import { FriendProfileItem, PendingFriendRequestItem } from '../types/contact.types';

export const ContactScreen = () => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const {
        friendRequests,
        friends,
        isLoadingContacts,
        processingRequestIds,
        removingFriendIds,
        acceptRequest,
        rejectRequest,
        removeFriend,
        openConversation,
    } = useContacts();

    const handleOpenSettings = useCallback(() => {
        // Placeholder until settings route is available.
    }, []);

    const handleOpenFriendSearch = useCallback(() => {
        // Placeholder until friend search route is linked from this screen.
    }, []);

    const handleOpenMessage = useCallback((friendUserId: string) => {
        const open = async (): Promise<void> => {
            const conversationId = await openConversation(friendUserId);

            if (!conversationId) {
                return;
            }

            router.push({
                pathname: '/chat/[conversationId]',
                params: { conversationId },
            });
        };

        void open();
    }, [openConversation, router]);

    const handleAcceptRequest = useCallback((requestId: string) => {
        void acceptRequest(requestId);
    }, [acceptRequest]);

    const handleRejectRequest = useCallback((requestId: string) => {
        void rejectRequest(requestId);
    }, [rejectRequest]);

    const handleRemoveFriend = useCallback((friendUserId: string) => {
        void removeFriend(friendUserId);
    }, [removeFriend]);

    const requestKeyExtractor = useCallback((item: PendingFriendRequestItem) => item.requestId, []);
    const friendKeyExtractor = useCallback((item: FriendProfileItem) => item.userId, []);

    const renderRequestItem = useCallback(
        ({ item }: ListRenderItemInfo<PendingFriendRequestItem>) => (
            <FriendRequestCard
                request={item}
                isProcessing={processingRequestIds.includes(item.requestId)}
                onAccept={handleAcceptRequest}
                onReject={handleRejectRequest}
            />
        ),
        [handleAcceptRequest, handleRejectRequest, processingRequestIds],
    );

    const renderFriendItem = useCallback(
        ({ item }: ListRenderItemInfo<FriendProfileItem>) => (
            <FriendListItem
                friend={item}
                isRemoving={removingFriendIds.includes(item.userId)}
                onPressMessage={handleOpenMessage}
                onPressRemove={handleRemoveFriend}
            />
        ),
        [handleOpenMessage, handleRemoveFriend, removingFriendIds],
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
                data={friends}
                keyExtractor={friendKeyExtractor}
                renderItem={renderFriendItem}
                contentContainerClassName="px-5 pb-8"
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={(
                    <View>
                        <View className="mb-6 mt-5 flex-row items-center justify-between">
                            <Text className="text-[56px] font-extrabold" style={{ color: Colors.light.text }}>People</Text>
                            <Pressable
                                onPress={handleOpenSettings}
                                className="size-11 items-center justify-center"
                                accessibilityRole="button"
                                accessibilityLabel="Open people settings"
                            >
                                <Settings size={28} color={Colors.light.secondaryText} />
                            </Pressable>
                        </View>

                        <View className="mb-4 flex-row items-center justify-between">
                            <Text className="text-[12px] font-bold tracking-[1px]" style={{ color: Colors.light.secondaryText }}>
                                FRIEND REQUESTS
                            </Text>
                            <View className="rounded-full px-4 py-1" style={{ backgroundColor: Colors.light.surface }}>
                                <Text className="text-[13px] font-bold" style={{ color: Colors.light.primary }}>
                                    {friendRequests.length} New
                                </Text>
                            </View>
                        </View>

                        {friendRequests.length > 0 ? (
                            <FlatList
                                data={friendRequests}
                                keyExtractor={requestKeyExtractor}
                                renderItem={renderRequestItem}
                                scrollEnabled={false}
                            />
                        ) : (
                            <View className="mb-6 rounded-[24px] border px-5 py-4" style={{ borderColor: Colors.light.border, backgroundColor: Colors.light.background }}>
                                <Text className="text-[15px]" style={{ color: Colors.light.secondaryText }}>
                                    No pending requests. Use Search tab to discover and invite new people.
                                </Text>
                            </View>
                        )}

                        <View className="mb-4 mt-4 flex-row items-center justify-between">
                            <Text className="text-[12px] font-bold tracking-[1px]" style={{ color: Colors.light.secondaryText }}>
                                YOUR FRIENDS
                            </Text>
                            <Pressable
                                onPress={handleOpenFriendSearch}
                                className="size-10 items-center justify-center"
                                accessibilityRole="button"
                                accessibilityLabel="Search in your friends"
                            >
                                <Search size={24} color={Colors.light.primary} />
                            </Pressable>
                        </View>

                        {isLoadingContacts ? (
                            <View className="py-6">
                                <ActivityIndicator size="small" color={Colors.light.primary} />
                            </View>
                        ) : null}

                        {!isLoadingContacts && friends.length > 0 ? (
                            <View className="mb-4 rounded-[28px] border px-4 py-5" style={{ borderColor: Colors.light.border, backgroundColor: Colors.light.background }}>
                                <Text className="mb-3 text-[14px]" style={{ color: Colors.light.secondaryText }}>
                                    Keep your circle close and start chatting anytime.
                                </Text>
                            </View>
                        ) : null}
                    </View>
                )}
                ListEmptyComponent={
                    !isLoadingContacts
                        ? (
                            <Text className="text-[15px]" style={{ color: Colors.light.secondaryText }}>
                                You have no friends yet. Send requests from the Search tab.
                            </Text>
                        )
                        : null
                }
            />
        </SafeAreaView>
    );
};
