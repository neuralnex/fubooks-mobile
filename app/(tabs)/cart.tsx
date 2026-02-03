import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Image as ExpoImage } from 'expo-image';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function CartScreen() {
  const { isAuthenticated, isAdmin } = useAuth();
  const { cart, refreshCart, setItemQuantity, removeItem, clearCart } = useCart();
  const { showToast } = useToast();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useFocusEffect(
    React.useCallback(() => {
      refreshCart();
    }, [refreshCart])
  );

  const updateQuantity = async (bookId: string, newQuantity: number) => {
    try {
      await setItemQuantity(bookId, newQuantity);
      showToast('Cart updated', 'success', 900);
    } catch {
      showToast('Failed to update cart', 'error', 1200);
    }
  };

  const removeCartItem = async (bookId: string) => {
    try {
      await removeItem(bookId);
      showToast('Cart updated', 'success', 900);
    } catch {
      showToast('Failed to update cart', 'error', 1200);
    }
  };

  const confirmClearCart = async () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearCart();
              showToast('Cart updated', 'success', 900);
            } catch {
              showToast('Failed to clear cart', 'error', 1200);
            }
          },
        },
      ]
    );
  };

  const itemsTotal = cart.reduce(
    (sum, item) => sum + Number(item.book.price) * item.quantity,
    0
  );

  const goToCheckout = () => {
    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'Please sign in to checkout', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }

    if (isAdmin) {
      Alert.alert('Admin Account', 'Admin accounts cannot place orders');
      return;
    }

    router.push('/(tabs)/checkout' as any);
  };

  const getCoverSrc = (coverImage?: string) => {
    if (!coverImage) return undefined;
    return coverImage.startsWith('data:image')
      ? coverImage
      : `data:image/jpeg;base64,${coverImage}`;
  };

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
            onPress={() => router.push('/(tabs)/books')}
          >
            <Text style={styles.buttonText}>Browse Books</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <ThemedText type="title" style={styles.title}>
          Shopping Cart
        </ThemedText>
        <TouchableOpacity
          style={[styles.clearButton, { borderColor: colors.error }]}
          onPress={confirmClearCart}
        >
          <Text style={[styles.clearButtonText, { color: colors.error }]}>
            Clear Cart
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={cart}
        renderItem={({ item }) => (
          <View
            style={[
              styles.cartItem,
              { backgroundColor: colors.cardBackground, shadowColor: '#000' },
            ]}
          >
            {getCoverSrc(item.book.coverImage) && (
              <ExpoImage
                source={{ uri: getCoverSrc(item.book.coverImage) }}
                style={styles.itemImage}
                contentFit="cover"
              />
            )}
            <View style={styles.itemDetails}>
              <Text style={[styles.itemTitle, { color: colors.text }]}>{item.book.title}</Text>
              <Text style={[styles.itemAuthor, { color: colors.icon }]}>
                by {item.book.author}
              </Text>
              <Text style={[styles.itemPrice, { color: colors.accent }]}>
                ₦{Number(item.book.price).toFixed(2)}
              </Text>

              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item.book.id, item.quantity - 1)}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={[styles.quantity, { color: colors.text }]}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item.book.id, item.quantity + 1)}
                  disabled={item.quantity >= item.book.stock}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.itemTotal, { color: colors.text }]}>
                Total: ₦{(Number(item.book.price) * item.quantity).toFixed(2)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeCartItem(item.book.id)}
            >
              <Text style={[styles.removeButtonText, { color: colors.error }]}>
                Remove
              </Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item) => item.book.id}
        contentContainerStyle={styles.list}
        ListFooterComponent={
          <View style={styles.summaryBar}>
            <View>
              <Text style={[styles.summaryLabel, { color: colors.icon }]}>
                Items total
              </Text>
              <Text style={[styles.summaryAmount, { color: colors.text }]}>
                ₦{itemsTotal.toFixed(2)}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.summaryCheckoutButton, { backgroundColor: colors.primary }]}
              onPress={goToCheckout}
            >
              <Text style={styles.summaryCheckoutText}>Go to Checkout</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    flex: 1,
  },
  clearButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryBar: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  summaryCheckoutButton: {
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  summaryCheckoutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    paddingBottom: 20,
  },
  cartItem: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemAuthor: {
    fontSize: 14,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  quantity: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'center',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '600',
  },
  removeButton: {
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  removeButtonText: {
    color: '#ff3b30',
    fontSize: 14,
    fontWeight: '600',
  },
  checkoutSection: {
    marginTop: 16,
    width: '100%',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    borderTopColor: '#f0f0f0',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  checkoutButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  checkoutButtonDisabled: {
    opacity: 0.6,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
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
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  fulfilmentRow: {
    marginBottom: 16,
    gap: 10,
  },
  fulfilmentOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    marginRight: 8,
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
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  fulfilmentSubtitle: {
    fontSize: 13,
  },
  orderTotalRow: {
    marginTop: 4,
  },
  orderTotalLabel: {
    fontSize: 18,
  },
  orderTotalAmount: {
    fontSize: 24,
  },
});

