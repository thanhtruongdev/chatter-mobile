import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: { backgroundColor: 'transparent' },
				gestureEnabled: true,
				gestureDirection: 'horizontal',
				animation: 'none',
			}}
		>
			<Stack.Screen name="login/index" options={{
				animation: 'slide_from_left',
				gestureDirection: 'horizontal',
				gestureEnabled: true,
			}} />
			<Stack.Screen name="register/index" options={{
				animation: 'slide_from_right',
				gestureDirection: 'horizontal',
				gestureEnabled: true,
			}} />
		</Stack>
	);
}
