import React from 'react';
import { View } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface LogoProps {
  size?: number;
}

export function Logo({ size = 36 }: LogoProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const sizeStyle = { width: size, height: size };

  return (
    <View style={sizeStyle}>
      <View
        style={[
          sizeStyle,
          {
            borderRadius: size / 8,
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}
      >
        <View
          style={{
            width: size * 0.6,
            height: size * 0.6,
            borderRadius: size * 0.12,
            borderWidth: size * 0.08,
            borderColor: colors.primary,
            borderLeftColor: colors.accent,
            borderBottomColor: colors.secondary,
            transform: [{ rotate: '-15deg' }],
          }}
        />
      </View>
    </View>
  );
}


