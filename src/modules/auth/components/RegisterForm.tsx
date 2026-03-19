import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import { Colors } from '@/constants/theme';
import React, { FC, useCallback, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { RegisterFormErrors, RegisterFormValues, registerSchema } from '../schemas/auth.schems';

export interface RegisterFormProps {
    onSubmit: (values: RegisterFormValues) => void;
    onPressSignIn: () => void;
    isRegistering?: boolean;
}

export const RegisterForm: FC<RegisterFormProps> = ({ onSubmit, onPressSignIn, isRegistering }) => {
    const [values, setValues] = useState<RegisterFormValues>({
        displayName: '',
        username: '',
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState<RegisterFormErrors>({});

    const updateField = useCallback((field: keyof RegisterFormValues, value: string) => {
        setValues((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => {
            if (!prev[field]) {
                return prev;
            }

            return { ...prev, [field]: undefined };
        });
    }, []);

    const handleDisplayNameChange = useCallback((text: string) => {
        updateField('displayName', text);
    }, [updateField]);

    const handleUsernameChange = useCallback((text: string) => {
        updateField('username', text);
    }, [updateField]);

    const handleEmailChange = useCallback((text: string) => {
        updateField('email', text);
    }, [updateField]);

    const handlePasswordChange = useCallback((text: string) => {
        updateField('password', text);
    }, [updateField]);

    const handleSubmit = useCallback(() => {
        const parsed = registerSchema.safeParse(values);

        if (!parsed.success) {
            const nextErrors: RegisterFormErrors = {};

            for (const issue of parsed.error.issues) {
                const field = issue.path[0];

                if (
                    (field === 'displayName' || field === 'username' || field === 'email' || field === 'password') &&
                    !nextErrors[field]
                ) {
                    nextErrors[field] = issue.message;
                }
            }

            setErrors(nextErrors);
            return;
        }

        setErrors({});
        onSubmit(parsed.data);
    }, [onSubmit, values]);

    const handleTermsPress = useCallback(() => {
        // Placeholder until legal content routes are available.
    }, []);

    const handlePrivacyPress = useCallback(() => {
        // Placeholder until legal content routes are available.
    }, []);

    return (
        <View className="w-full">
            <TextInput
                label="DISPLAY NAME"
                placeholder="Alex Johnson"
                leftIcon="id-card-outline"
                value={values.displayName}
                onChangeText={handleDisplayNameChange}
            />
            {errors.displayName ? <Text className="-mt-3 mb-3 text-sm" style={{ color: Colors.light.error }}>{errors.displayName}</Text> : null}

            <TextInput
                label="USERNAME"
                placeholder="alexj_chat"
                leftIcon="at-outline"
                autoCapitalize="none"
                autoCorrect={false}
                value={values.username}
                onChangeText={handleUsernameChange}
            />
            {errors.username ? <Text className="-mt-3 mb-3 text-sm" style={{ color: Colors.light.error }}>{errors.username}</Text> : null}

            <TextInput
                label="EMAIL ADDRESS"
                placeholder="alex@example.com"
                leftIcon="mail-outline"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={values.email}
                onChangeText={handleEmailChange}
            />
            {errors.email ? <Text className="-mt-3 mb-3 text-sm" style={{ color: Colors.light.error }}>{errors.email}</Text> : null}

            <TextInput
                label="PASSWORD"
                placeholder="••••••••"
                leftIcon="lock-closed-outline"
                isPassword
                value={values.password}
                onChangeText={handlePasswordChange}
            />
            {errors.password ? <Text className="-mt-3 mb-3 text-sm" style={{ color: Colors.light.error }}>{errors.password}</Text> : null}

            <Button
                label="Sign Up"
                onPress={handleSubmit}
                disabled={isRegistering}
                accessibilityRole="button"
                accessibilityLabel="Sign Up"
                className='mt-3'
            />

            <View className="mt-7 flex-row flex-wrap justify-center px-2">
                <Text className="text-sm leading-7" style={{ color: Colors.light.secondaryText }}>By signing up, you agree to our </Text>
                <TouchableOpacity
                    onPress={handleTermsPress}
                    accessibilityRole="button"
                    accessibilityLabel="Terms of Service"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <Text className="text-sm font-bold leading-7" style={{ color: Colors.light.primary }}>Terms of Service</Text>
                </TouchableOpacity>
                <Text className="text-sm leading-7" style={{ color: Colors.light.secondaryText }}> and </Text>
                <TouchableOpacity
                    onPress={handlePrivacyPress}
                    accessibilityRole="button"
                    accessibilityLabel="Privacy Policy"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <Text className="text-sm font-bold leading-7" style={{ color: Colors.light.primary }}>Privacy Policy.</Text>
                </TouchableOpacity>
            </View>

            <View className="mt-2 flex-row items-center justify-center">
                <Text className="text-md" style={{ color: Colors.light.secondaryText }}>Already have an account? </Text>
                <TouchableOpacity
                    onPress={onPressSignIn}
                    accessibilityRole="button"
                    accessibilityLabel="Sign In"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <Text className="text-md font-bold" style={{ color: Colors.light.primary }}>Sign In</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};