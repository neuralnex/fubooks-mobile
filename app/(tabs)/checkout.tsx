import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';

import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import { apiService } from '../../services/api';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const DELIVERY_FEE_EZIOBODO = 500;

type FulfilmentMethod = 'pickup' | 'delivery';

export default function CheckoutScreen() {
  const { isAuthenticated, isAdmin } = useAuth();
  const { cart, refreshCart, clearCart } = useCart();
  const { showToast } = useToast();
  const router = useRouter();
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fulfilmentMethod, setFulfilmentMethod] = useState<FulfilmentMethod>('pickup');
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useFocusEffect(
    React.useCallback(() => {
      refreshCart();
    }, [refreshCart])
  );

  if (!isAuthenticated) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Please sign in to checkout</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.buttonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  if (isAdmin) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            Admin accounts are for operations only and cannot place orders.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Text style={styles.buttonText}>Go to Profile</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  if (cart.length === 0) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/(tabs)/cart')}
          >
            <Text style={styles.buttonText}>Back to Cart</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  const itemsTotal = cart.reduce(
    (sum, item) => sum + Number(item.book.price) * item.quantity,
    0
  );

  const deliveryFee = fulfilmentMethod === 'delivery' ? DELIVERY_FEE_EZIOBODO : 0;
  const grandTotal = itemsTotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (
      fulfilmentMethod === 'delivery' &&
      (!deliveryAddress || deliveryAddress.length < 10)
    ) {
      Alert.alert(
        'Error',
        'Please enter a valid Eziobodo or Umuchima delivery address (at least 10 characters)'
      );
      return;
    }

    const cleanedPhone = phoneNumber.trim();
    if (!cleanedPhone || cleanedPhone.replace(/[^\d+]/g, '').length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      const addressBase =
        fulfilmentMethod === 'pickup'
          ? 'SUG Building - Pickup Station'
          : deliveryAddress;
      const addressWithPhone = `Phone: ${cleanedPhone}\n${addressBase}`;

      const order = await apiService.createOrder({
        items: cart.map((item) => ({
          bookId: item.book.id,
          quantity: item.quantity,
        })),
        deliveryAddress: addressWithPhone,
        deliveryMethod: fulfilmentMethod,
      });

      await clearCart();
      showToast('Order created. Proceed to payment.', 'success', 1200);
      router.push(`/(tabs)/orders/${order.id}/payment`);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedText type="title" style={styles.title}>
        Checkout
      </ThemedText>

      <View style={[styles.checkoutCard, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Delivery Options</Text>

        <View style={styles.fulfilmentRow}>
          <TouchableOpacity
            style={[
              styles.fulfilmentOption,
              {
                borderColor:
                  fulfilmentMethod === 'pickup' ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setFulfilmentMethod('pickup')}
          >
            <View
              style={[
                styles.radioOuter,
                {
                  borderColor:
                    fulfilmentMethod === 'pickup' ? colors.primary : colors.border,
                },
              ]}
            >
              {fulfilmentMethod === 'pickup' && (
                <View
                  style={[styles.radioInner, { backgroundColor: colors.primary }]}
                />
              )}
            </View>
            <View style={styles.fulfilmentTextWrapper}>
              <Text style={[styles.fulfilmentTitle, { color: colors.text }]}>
                Pick up at SUG Building
              </Text>
              <Text style={[styles.fulfilmentSubtitle, { color: colors.icon }]}>
                Free – collect your order at the SUG building pickup station
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.fulfilmentOption,
              {
                borderColor:
                  fulfilmentMethod === 'delivery' ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setFulfilmentMethod('delivery')}
          >
            <View
              style={[
                styles.radioOuter,
                {
                  borderColor:
                    fulfilmentMethod === 'delivery' ? colors.primary : colors.border,
                },
              ]}
            >
              {fulfilmentMethod === 'delivery' && (
                <View
                  style={[styles.radioInner, { backgroundColor: colors.primary }]}
                />
              )}
            </View>
            <View style={styles.fulfilmentTextWrapper}>
              <Text style={[styles.fulfilmentTitle, { color: colors.text }]}>
                Deliver to Eziobodo / Umuchima
              </Text>
              <Text style={[styles.fulfilmentSubtitle, { color: colors.icon }]}>
                ₦{DELIVERY_FEE_EZIOBODO.toFixed(0)} delivery fee – enter your full
                Eziobodo or Umuchima address below
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {fulfilmentMethod === 'delivery' && (
          <TextInput
            style={[
              styles.addressInput,
              { backgroundColor: colors.inputBackground, color: colors.text },
            ]}
            placeholder="Eziobodo or Umuchima address (e.g. Lodge, room, landmarks)"
            placeholderTextColor={colors.icon}
            value={deliveryAddress}
            onChangeText={setDeliveryAddress}
            multiline
          />
        )}

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 8 }]}>
          Phone Number
        </Text>
        <TextInput
          style={[
            styles.phoneInput,
            { backgroundColor: colors.inputBackground, color: colors.text },
          ]}
          placeholder="Phone number (e.g. 08012345678)"
          placeholderTextColor={colors.icon}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />

        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: colors.text }]}>Items total</Text>
          <Text style={[styles.totalAmount, { color: colors.text }]}>
            ₦{itemsTotal.toFixed(2)}
          </Text>
        </View>

        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: colors.text }]}>Delivery</Text>
          <Text style={[styles.totalAmount, { color: colors.text }]}>
            {fulfilmentMethod === 'pickup'
              ? 'Free (Pickup)'
              : `₦${deliveryFee.toFixed(2)}`}
          </Text>
        </View>

        <View style={[styles.totalRow, styles.orderTotalRow]}>
          <Text
            style={[styles.totalLabel, styles.orderTotalLabel, { color: colors.text }]}
          >
            Order total
          </Text>
          <Text
            style={[
              styles.totalAmount,
              styles.orderTotalAmount,
              { color: colors.primary },
            ]}
          >
            ₦{grandTotal.toFixed(2)}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.checkoutButton,
            { backgroundColor: colors.primary },
            loading && styles.checkoutButtonDisabled,
          ]}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.checkoutButtonText}>Place Order</Text>
          )}
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  checkoutCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  fulfilmentRow: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 12,
  },
  fulfilmentOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  fulfilmentTextWrapper: {
    flex: 1,
  },
  fulfilmentTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  fulfilmentSubtitle: {
    fontSize: 12,
  },
  addressInput: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  phoneInput: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 14,
    minHeight: 48,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 14,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  orderTotalRow: {
    marginBottom: 20,
  },
  orderTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  orderTotalAmount: {
    fontSize: 20,
    fontWeight: '700',
  },
  checkoutButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  checkoutButtonDisabled: {
    opacity: 0.6,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});


