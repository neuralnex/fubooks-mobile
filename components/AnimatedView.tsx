import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, ViewStyle } from 'react-native';

interface AnimatedViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  animationType?: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'bounce' | 'scale';
  duration?: number;
  delay?: number;
  easing?: any;
  useNativeDriver?: boolean;
}

const AnimatedView: React.FC<AnimatedViewProps> = ({
  children,
  style,
  animationType = 'fadeIn',
  duration = 300,
  delay = 0,
  easing = Easing.out(Easing.ease),
  useNativeDriver = true,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    const animations = [];

    switch (animationType) {
      case 'fadeIn':
        animations.push(
          Animated.timing(opacityValue, {
            toValue: 1,
            duration,
            delay,
            easing,
            useNativeDriver,
          })
        );
        break;

      case 'slideUp':
        animations.push(
          Animated.timing(animatedValue, {
            toValue: 1,
            duration,
            delay,
            easing,
            useNativeDriver,
          })
        );
        animations.push(
          Animated.timing(opacityValue, {
            toValue: 1,
            duration,
            delay,
            easing,
            useNativeDriver,
          })
        );
        break;

      case 'slideDown':
        animations.push(
          Animated.timing(animatedValue, {
            toValue: 1,
            duration,
            delay,
            easing,
            useNativeDriver,
          })
        );
        animations.push(
          Animated.timing(opacityValue, {
            toValue: 1,
            duration,
            delay,
            easing,
            useNativeDriver,
          })
        );
        break;

      case 'slideLeft':
      case 'slideRight':
        animations.push(
          Animated.timing(animatedValue, {
            toValue: 1,
            duration,
            delay,
            easing,
            useNativeDriver,
          })
        );
        animations.push(
          Animated.timing(opacityValue, {
            toValue: 1,
            duration,
            delay,
            easing,
            useNativeDriver,
          })
        );
        break;

      case 'bounce':
        animations.push(
          Animated.spring(scaleValue, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver,
          })
        );
        animations.push(
          Animated.timing(opacityValue, {
            toValue: 1,
            duration,
            delay,
            useNativeDriver,
          })
        );
        break;

      case 'scale':
        animations.push(
          Animated.timing(scaleValue, {
            toValue: 1,
            duration,
            delay,
            easing,
            useNativeDriver,
          })
        );
        animations.push(
          Animated.timing(opacityValue, {
            toValue: 1,
            duration,
            delay,
            easing,
            useNativeDriver,
          })
        );
        break;

      default:
        animations.push(
          Animated.timing(opacityValue, {
            toValue: 1,
            duration,
            delay,
            easing,
            useNativeDriver,
          })
        );
    }

    Animated.parallel(animations).start();
  }, [animatedValue, opacityValue, scaleValue, animationType, duration, delay, easing, useNativeDriver]);

  const getTransform = () => {
    switch (animationType) {
      case 'slideUp':
        return [{ translateY: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }];
      case 'slideDown':
        return [{ translateY: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }];
      case 'slideLeft':
        return [{ translateX: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }];
      case 'slideRight':
        return [{ translateX: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }];
      case 'scale':
        return [{ scale: scaleValue }];
      case 'bounce':
        return [{ scale: scaleValue }];
      default:
        return [];
    }
  };

  const animatedStyle = {
    opacity: opacityValue,
    transform: getTransform(),
  };

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
};

export default AnimatedView;
