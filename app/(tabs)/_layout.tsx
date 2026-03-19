import { Tabs } from "expo-router";
import { House, NotebookTabs, Search } from 'lucide-react-native';
import React from "react";

export default function TabsLayout() {
    return (
        <Tabs screenOptions={{
            headerShown: false
        }}>
            <Tabs.Screen
                name="home/index"
                options={{
                    title: 'Home',
                    headerTitle: '',
                    tabBarIcon: ({ color }) =>
                        <House width={24} height={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="search/index"
                options={{
                    title: 'Search',
                    headerTitle: '',
                    tabBarIcon: ({ color }) =>
                        <Search width={24} height={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="contact/index"
                options={{
                    title: 'Contacts',
                    headerTitle: '',
                    tabBarIcon: ({ color }) =>
                        <NotebookTabs width={24} height={24} color={color} />,
                }}
            />
        </Tabs>
    )
}