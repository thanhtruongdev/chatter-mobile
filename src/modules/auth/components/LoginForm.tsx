import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import { Colors } from '@/constants/theme';
import React, { FC, useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LoginFormErrors, LoginFormValues, loginSchema } from '../schemas/auth.schems';



export interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => void;
  isLoggingIn?: boolean;
}

export const LoginForm: FC<LoginFormProps> = ({ onSubmit, isLoggingIn }) => {
  const [values, setValues] = useState<LoginFormValues>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});

  const updateField = useCallback((field: keyof LoginFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const handleEmailChange = useCallback((text: string) => {
    updateField('email', text);
  }, [updateField]);

  const handlePasswordChange = useCallback((text: string) => {
    updateField('password', text);
  }, [updateField]);

  const handleForgotPasswordPress = useCallback(() => {
    // Placeholder until forgot-password flow is implemented.
  }, []);

  const handleSubmit = useCallback(() => {
    const parsed = loginSchema.safeParse(values);

    if (!parsed.success) {
      const nextErrors: LoginFormErrors = {};

      for (const issue of parsed.error.issues) {
        const field = issue.path[0];

        if ((field === 'email' || field === 'password') && !nextErrors[field]) {
          nextErrors[field] = issue.message;
        }
      }

      setErrors(nextErrors);
      return;
    }

    setErrors({});
    onSubmit(parsed.data);
  }, [onSubmit, values]);

  return (
    <View style={styles.container}>
      <TextInput
        label="EMAIL ADDRESS"
        placeholder="name@example.com"
        leftIcon="mail-outline"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={values.email}
        onChangeText={handleEmailChange}
      />
      {errors.email ? (
        <Text style={styles.errorText}>{errors.email}</Text>
      ) : null}

      <View style={styles.passwordHeader}>
        <Text style={styles.passwordLabel}>PASSWORD</Text>
        <TouchableOpacity
          onPress={handleForgotPasswordPress}
          accessibilityRole="button"
          accessibilityLabel="Forgot password"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.forgotText}>Forgot password ?</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        placeholder="••••••••"
        leftIcon="lock-closed-outline"
        isPassword
        value={values.password}
        onChangeText={handlePasswordChange}
      />
      {errors.password ? (
        <Text style={styles.errorText}>{errors.password}</Text>
      ) : null}

      <View style={styles.submitButtonContainer}>
        <Button
          label="Sign In"
          onPress={handleSubmit}
          disabled={isLoggingIn}
          accessibilityRole="button"
          accessibilityLabel="Sign In"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  errorText: {
    marginTop: -12,
    marginBottom: 12,
    fontSize: 12,
    color: Colors.light.error,
  },
  passwordHeader: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  passwordLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: Colors.light.secondaryText,
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  submitButtonContainer: {
    marginTop: 12,
  },
});
