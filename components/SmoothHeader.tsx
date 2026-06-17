import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import type { Animated as AnimatedType } from 'react-native';

// Optional BlurView import - will use fallback if not available
let BlurView: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  BlurView = require('expo-blur').BlurView;
} catch {
  // BlurView not available, will use semi-transparent background
}

interface SmoothHeaderProps {
  title: string;
  subtitle?: string;
  scrollY: AnimatedType.Value;
  children?: React.ReactNode;
  withBlur?: boolean;
}

const SmoothHeader: React.FC<SmoothHeaderProps> = ({
  title,
  subtitle,
  scrollY,
  children,
  withBlur = true,
}) => {
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [100, 70],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  const titleScale = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0.95],
    extrapolate: 'clamp',
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [0, 30],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={[
        styles.header,
        {
          height: headerHeight,
          opacity: headerOpacity,
        },
      ]}
    >
      {withBlur && BlurView ? (
        <BlurView intensity={10} style={StyleSheet.absoluteFill} />
      ) : withBlur ? (
        <View style={styles.blurFallback} />
      ) : null}
      <Animated.View
        style={[
          styles.titleContainer,
          {
            transform: [{ scale: titleScale }],
            opacity: titleOpacity,
          },
        ]}
      >
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </Animated.View>
      {children && <View style={styles.childrenContainer}>{children}</View>}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  blurFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
  },
  titleContainer: {
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 4,
  },
  childrenContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
});

export default SmoothHeader;
