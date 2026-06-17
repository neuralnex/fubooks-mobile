import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

interface SkeletonProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
}

const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const opacityValue = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(opacityValue, {
          toValue: 0.6,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 0.3,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => animate());
    };

    animate();

    return () => opacityValue.stopAnimation();
  }, [opacityValue]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity: opacityValue,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#e0e0e0',
  },
});

// Skeleton Screen Components
interface SkeletonBookCardProps {
  style?: any;
}

export const SkeletonBookCard: React.FC<SkeletonBookCardProps> = ({ style }) => (
  <View style={[skeletonStyles.bookCard, style]}>
    <Skeleton width="100%" height={120} borderRadius={8} />
    <Skeleton width="70%" height={16} borderRadius={4} style={{ marginTop: 8 }} />
    <Skeleton width="50%" height={14} borderRadius={4} style={{ marginTop: 4 }} />
    <View style={skeletonStyles.bookCardFooter}>
      <Skeleton width="30%" height={16} borderRadius={4} />
      <Skeleton width="20%" height={16} borderRadius={10} />
    </View>
  </View>
);

interface SkeletonOrderCardProps {
  style?: any;
}

export const SkeletonOrderCard: React.FC<SkeletonOrderCardProps> = ({ style }) => (
  <View style={[skeletonStyles.orderCard, style]}>
    <View style={skeletonStyles.orderHeader}>
      <Skeleton width="60%" height={16} borderRadius={4} />
      <Skeleton width="30%" height={14} borderRadius={4} />
    </View>
    <Skeleton width="80%" height={14} borderRadius={4} style={{ marginTop: 8 }} />
    <View style={skeletonStyles.orderFooter}>
      <View style={skeletonStyles.statusContainer}>
        <Skeleton width={80} height={24} borderRadius={12} />
        <Skeleton width={80} height={24} borderRadius={12} style={{ marginLeft: 8 }} />
      </View>
      <Skeleton width="25%" height={18} borderRadius={4} />
    </View>
  </View>
);

const skeletonStyles = StyleSheet.create({
  bookCard: {
    width: '48%',
    marginBottom: 16,
  },
  bookCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  orderCard: {
    width: '100%',
    padding: 16,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});

export default Skeleton;
