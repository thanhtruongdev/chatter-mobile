import { Stack } from 'expo-router';

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
			<Stack.Screen name="login/index" />
			<Stack.Screen name="register/index" />
		</Stack>
	);
}
