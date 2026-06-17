import React, { useRef, useCallback } from 'react';
import { StyleSheet, StyleProp, ViewStyle, Pressable, Animated } from 'react-native';

interface TouchableRippleProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  rippleColor?: string;
  rippleContainerBorderRadius?: number;
  disabled?: boolean;
  delayPressIn?: number;
  delayPressOut?: number;
}

const TouchableRipple: React.FC<TouchableRippleProps> = ({
  children,
  onPress,
  style,
  rippleColor = 'rgba(0, 122, 255, 0.3)',
  rippleContainerBorderRadius = 0,
  disabled = false,
  delayPressIn = 0,
  delayPressOut = 0,
}) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const opacityValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.parallel([
      Animated.timing(scaleValue, {
        toValue: 0.98,
        duration: 100,
        delay: delayPressIn,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 0.8,
        duration: 100,
        delay: delayPressIn,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleValue, opacityValue, delayPressIn]);

  const handlePressOut = useCallback(() => {
    Animated.parallel([
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 150,
        delay: delayPressOut,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 150,
        delay: delayPressOut,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleValue, opacityValue, delayPressOut]);

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.container,
        style,
        {
          transform: [{ scale: scaleValue }],
          opacity: opacityValue,
        },
        disabled && styles.disabled,
      ]}
    >
      {children}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  disabled: {
    opacity: 0.6,
  },
});

export default TouchableRipple;
