import React, { FC } from 'react';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';

export interface SocialAuthButtonProps {
  provider: 'google' | 'apple';
  onPress: () => void;
}

export const SocialAuthButton: FC<SocialAuthButtonProps> = ({ provider, onPress }) => {
  const isGoogle = provider === 'google';
  const label = isGoogle ? 'Google' : 'Apple';
  const iconName = isGoogle ? 'logo-google' : 'logo-apple';
  
  return (
    <Button
      variant="social"
      label={label}
      icon={<Ionicons name={iconName} size={24} color="#000" />}
      onPress={onPress}
      style={styles.button}
    />
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
});
