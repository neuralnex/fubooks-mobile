import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function PaymentSuccessScreen() {
  const { id, status } = useLocalSearchParams<{ id: string; status?: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    // Auto-redirect after 3 seconds if payment was successful
    if (status === 'SUCCESS' || status === 'success') {
      const timer = setTimeout(() => {
        router.push('/(tabs)/orders');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, router]);

  const isSuccess = status === 'SUCCESS' || status === 'success';

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {isSuccess ? (
            <View style={[styles.successIcon, { backgroundColor: colors.success }]}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
          ) : (
            <View style={[styles.errorIcon, { backgroundColor: colors.error }]}>
              <Text style={styles.cross}>✕</Text>
            </View>
          )}
        </View>

        <ThemedText type="title" style={styles.title}>
          {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
        </ThemedText>

        <Text style={[styles.message, { color: colors.text }]}>
          {isSuccess
            ? 'Your order has been paid successfully. You will receive a confirmation shortly.'
            : 'Your payment could not be processed. Please try again or contact support.'}
        </Text>

        {id && (
          <View style={[styles.orderInfo, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <Text style={[styles.orderLabel, { color: colors.text }]}>Order ID:</Text>
            <Text style={[styles.orderId, { color: colors.primary }]}>{id.slice(0, 8)}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/(tabs)/orders')}
        >
          <Text style={styles.buttonText}>View Orders</Text>
        </TouchableOpacity>

        {isSuccess && (
          <Text style={[styles.redirectText, { color: colors.icon }]}>
            Redirecting to orders in 3 seconds...
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#fff',
    fontSize: 48,
    fontWeight: 'bold',
  },
  cross: {
    color: '#fff',
    fontSize: 48,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
  },
  orderLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    borderRadius: 12,
    padding: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    minWidth: 200,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  redirectText: {
    fontSize: 12,
    marginTop: 16,
    textAlign: 'center',
  },
});

