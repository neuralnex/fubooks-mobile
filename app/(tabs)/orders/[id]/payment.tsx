import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../../../contexts/AuthContext';
import { apiService } from '../../../../services/api';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function PaymentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'Please sign in to make a payment', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handlePayment = async () => {
    if (!id) {
      Alert.alert('Error', 'Order ID is missing');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.initiateCashierPayment(id);
      
      if (response.cashierUrl) {
        await apiService.openPaymentUrl(response.cashierUrl);
      } else if (response.paymentUrl) {
        await apiService.openPaymentUrl(response.paymentUrl);
      } else {
        Alert.alert('Error', 'Payment URL not available');
        return;
      }
      
      // Don't show alert, let the payment gateway handle redirect
      // The returnUrl will redirect back to the app
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Complete Payment
        </ThemedText>

        <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Gateway</Text>
          <Text style={[styles.description, { color: colors.icon }]}>
            Click the button below to proceed to the payment gateway where you can choose your preferred payment method.
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.payButton,
            { backgroundColor: colors.primary },
            loading && styles.payButtonDisabled,
          ]}
          onPress={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payButtonText}>Proceed to Payment</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  payButton: {
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
