import React, { FC } from 'react';
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { Colors } from '@/constants/theme';

export interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: 'primary' | 'outline' | 'social';
  icon?: React.ReactNode;
}

export const Button: FC<ButtonProps> = ({ 
  label, 
  variant = 'primary', 
  icon,
  style, 
  disabled,
  ...props 
}) => {
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';
  const isSocial = variant === 'social';

  const containerStyle = [
    styles.container,
    isPrimary && styles.primaryContainer,
    isOutline && styles.outlineContainer,
    isSocial && styles.socialContainer,
    disabled && styles.disabled,
    style,
  ];

  const textStyle = [
    styles.text,
    isPrimary && styles.primaryText,
    isOutline && styles.outlineText,
    isSocial && styles.socialText,
  ];

  return (
    <TouchableOpacity 
      style={containerStyle} 
      activeOpacity={0.8}
      disabled={disabled}
      {...props}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={textStyle}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 24,
  },
  primaryContainer: {
    backgroundColor: Colors.light.primary,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  socialContainer: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 24, // Matches the mockup social button pill shape
    height: 60,
  },
  iconContainer: {
    marginRight: 10,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  outlineText: {
    color: Colors.light.primary,
  },
  socialText: {
    color: Colors.light.text,
    fontWeight: '500',
  },
});
