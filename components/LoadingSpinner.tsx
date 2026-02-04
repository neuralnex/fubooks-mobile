import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text, Platform } from 'react-native';
import { Logo } from './Logo';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export function LoadingSpinner() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const useNativeDriver = Platform.OS !== 'web';

  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.05,
            duration: 700,
            useNativeDriver,
          }),
          Animated.timing(scale, {
            toValue: 0.95,
            duration: 700,
            useNativeDriver,
          }),
        ])
      ),
    ]).start();
  }, [opacity, scale, useNativeDriver]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View
        style={[
          styles.logoWrapper,
          {
            opacity,
            transform: [{ scale }],
          },
        ]}
      >
        <Logo size={56} />
        <Text style={[styles.brandText, { color: colors.text }]}>FUBOOKS</Text>
      </Animated.View>
      <Text style={[styles.subtitle, { color: colors.icon }]} numberOfLines={1}>
        Loading bookstore...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  brandText: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  subtitle: {
    marginTop: 12,
    fontSize: 13,
  },
});

