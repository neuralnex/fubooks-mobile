// Animated Components for Smooth Mobile UI

export { default as AnimatedView } from '../AnimatedView';
export { default as TouchableRipple } from '../TouchableRipple';
export { default as Skeleton, SkeletonBookCard, SkeletonOrderCard } from '../Skeleton';
export { default as SmoothHeader } from '../SmoothHeader';
export { default as Pagination } from '../Pagination';

// Animation Presets
export const AnimationPresets = {
  fadeIn: {
    type: 'fadeIn' as const,
    duration: 300,
    delay: 0,
  },
  slideUp: {
    type: 'slideUp' as const,
    duration: 400,
    delay: 0,
  },
  slideDown: {
    type: 'slideDown' as const,
    duration: 400,
    delay: 0,
  },
  slideLeft: {
    type: 'slideLeft' as const,
    duration: 400,
    delay: 0,
  },
  slideRight: {
    type: 'slideRight' as const,
    duration: 400,
    delay: 0,
  },
  bounce: {
    type: 'bounce' as const,
    duration: 500,
    delay: 0,
  },
  scale: {
    type: 'scale' as const,
    duration: 300,
    delay: 0,
  },
};

// Stagger animations for lists
export const createStaggerAnimation = (index: number, baseDelay = 50, multiplier = 1) => ({
  delay: index * baseDelay * multiplier,
});
