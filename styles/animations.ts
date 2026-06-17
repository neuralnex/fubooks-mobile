import { Animated, Easing } from 'react-native';

// ============================================
// Smooth Animation Presets
// ============================================

export const AnimationTypes = {
  FADE_IN: 'fadeIn',
  SLIDE_UP: 'slideUp',
  SLIDE_DOWN: 'slideDown',
  SLIDE_LEFT: 'slideLeft',
  SLIDE_RIGHT: 'slideRight',
  BOUNCE: 'bounce',
  SCALE: 'scale',
  PULSE: 'pulse',
} as const;

type AnimationType = typeof AnimationTypes[keyof typeof AnimationTypes];

// ============================================
// Animation Configurations
// ============================================

export interface AnimationConfig {
  type: AnimationType;
  duration?: number;
  delay?: number;
  easing?: any;
  useNativeDriver?: boolean;
}

export const AnimationConfigs: Record<string, AnimationConfig> = {
  // Fade Animations
  fadeIn: {
    type: AnimationTypes.FADE_IN,
    duration: 300,
    delay: 0,
    easing: Easing.out(Easing.ease),
    useNativeDriver: true,
  },
  fadeInSlow: {
    type: AnimationTypes.FADE_IN,
    duration: 500,
    delay: 0,
    easing: Easing.out(Easing.ease),
    useNativeDriver: true,
  },
  
  // Slide Animations
  slideUp: {
    type: AnimationTypes.SLIDE_UP,
    duration: 400,
    delay: 0,
    easing: Easing.out(Easing.ease),
    useNativeDriver: true,
  },
  slideUpSlow: {
    type: AnimationTypes.SLIDE_UP,
    duration: 600,
    delay: 0,
    easing: Easing.out(Easing.ease),
    useNativeDriver: true,
  },
  
  slideDown: {
    type: AnimationTypes.SLIDE_DOWN,
    duration: 400,
    delay: 0,
    easing: Easing.out(Easing.ease),
    useNativeDriver: true,
  },
  
  slideLeft: {
    type: AnimationTypes.SLIDE_LEFT,
    duration: 400,
    delay: 0,
    easing: Easing.out(Easing.ease),
    useNativeDriver: true,
  },
  
  slideRight: {
    type: AnimationTypes.SLIDE_RIGHT,
    duration: 400,
    delay: 0,
    easing: Easing.out(Easing.ease),
    useNativeDriver: true,
  },
  
  // Scale Animations
  scale: {
    type: AnimationTypes.SCALE,
    duration: 300,
    delay: 0,
    easing: Easing.out(Easing.ease),
    useNativeDriver: true,
  },
  
  bounce: {
    type: AnimationTypes.BOUNCE,
    duration: 500,
    delay: 0,
    easing: Easing.out(Easing.ease),
    useNativeDriver: true,
  },
  
  pulse: {
    type: AnimationTypes.PULSE,
    duration: 1000,
    delay: 0,
    easing: Easing.inOut(Easing.ease),
    useNativeDriver: true,
  },
};

// ============================================
// Animation Helper Functions
// ============================================

export const createAnimation = (
  value: Animated.Value,
  config: AnimationConfig
) => {
  const { type, duration = 300, delay = 0, easing = Easing.out(Easing.ease), useNativeDriver = true } = config;

  switch (type) {
    case AnimationTypes.FADE_IN:
      return Animated.timing(value, {
        toValue: 1,
        duration,
        delay,
        easing,
        useNativeDriver,
      });

    case AnimationTypes.SLIDE_UP:
      return Animated.timing(value, {
        toValue: 1,
        duration,
        delay,
        easing,
        useNativeDriver,
      });

    case AnimationTypes.SLIDE_DOWN:
      return Animated.timing(value, {
        toValue: 1,
        duration,
        delay,
        easing,
        useNativeDriver,
      });

    case AnimationTypes.SLIDE_LEFT:
      return Animated.timing(value, {
        toValue: 1,
        duration,
        delay,
        easing,
        useNativeDriver,
      });

    case AnimationTypes.SLIDE_RIGHT:
      return Animated.timing(value, {
        toValue: 1,
        duration,
        delay,
        easing,
        useNativeDriver,
      });

    case AnimationTypes.SCALE:
      return Animated.timing(value, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.out(Easing.back(1)),
        useNativeDriver,
      });

    case AnimationTypes.BOUNCE:
      return Animated.spring(value, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver,
      });

    case AnimationTypes.PULSE:
      return Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: 1.05,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver,
          }),
          Animated.timing(value, {
            toValue: 1,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver,
          }),
        ])
      );

    default:
      return Animated.timing(value, {
        toValue: 1,
        duration,
        delay,
        easing,
        useNativeDriver,
      });
  }
};

// ============================================
// Stagger Animation Helpers
// ============================================

export const staggerAnimations = (
  items: any[],
  baseDelay: number = 50,
  callback: (index: number, item: any) => void
) => {
  items.forEach((item, index) => {
    setTimeout(() => callback(index, item), index * baseDelay);
  });
};

// ============================================
// Scroll-Based Animations
// ============================================

export const createScrollAnimation = (
  scrollY: Animated.Value,
  config: {
    inputRange: number[];
    outputRange: number[];
    extrapolate?: 'extend' | 'clamp' | 'identity';
  }
) => {
  const { inputRange, outputRange, extrapolate = 'clamp' } = config;
  return scrollY.interpolate({ inputRange, outputRange, extrapolate });
};

// ============================================
// Interaction Animations
// ============================================

export const pressInAnimation = (
  scaleValue: Animated.Value,
  opacityValue: Animated.Value
) => {
  Animated.parallel([
    Animated.timing(scaleValue, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }),
    Animated.timing(opacityValue, {
      toValue: 0.7,
      duration: 100,
      useNativeDriver: true,
    }),
  ]).start();
};

export const pressOutAnimation = (
  scaleValue: Animated.Value,
  opacityValue: Animated.Value
) => {
  Animated.parallel([
    Animated.timing(scaleValue, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }),
    Animated.timing(opacityValue, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }),
  ]).start();
};

// ============================================
// Transition Presets
// ============================================

export const TransitionPresets = {
  // Modal transitions
  modal: {
    enter: AnimationConfigs.slideUp,
    exit: {
      type: AnimationTypes.SLIDE_DOWN,
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    },
  },
  
  // Navigation transitions
  navigation: {
    push: AnimationConfigs.slideRight,
    pop: {
      type: AnimationTypes.SLIDE_LEFT,
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    },
  },
  
  // Tab transitions
  tab: {
    enter: AnimationConfigs.fadeIn,
    exit: AnimationConfigs.fadeIn,
  },
};

// ============================================
// Color Animations
// ============================================

export const animateColor = (
  value: Animated.Value,
  colors: string[],
  duration: number = 300
) => {
  // Note: Color animation requires different approach
  // This is a placeholder for actual implementation
  return Animated.timing(value, {
    toValue: 1,
    duration,
    useNativeDriver: false,
  });
};
