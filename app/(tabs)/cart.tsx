import React, { useEffect, useState } from 'react';
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
import { apiService } from '../../services/api';
import { cartStorage } from '../../utils/storage';
import type { CartItem } from '../../types';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const DELIVERY_FEE_EZIOBODO = 500;

type FulfilmentMethod = 'pickup' | 'delivery';

export default function CartScreen() {
  const { isAuthenticated, isAdmin } = useAuth();
  const { refreshCartCount } = useCart();
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [fulfilmentMethod, setFulfilmentMethod] = useState<FulfilmentMethod>('pickup');
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useFocusEffect(
    React.useCallback(() => {
      loadCart();
      refreshCartCount();
    }, [refreshCartCount])
  );

  const loadCart = async () => {
    const savedCart = await cartStorage.getCart();
    setCart(savedCart);
  };

  const updateQuantity = async (bookId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(bookId);
      return;
    }
    const updatedCart = cart.map((item) =>
      item.book.id === bookId ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
    await cartStorage.saveCart(updatedCart);
    refreshCartCount();
  };

  const removeItem = async (bookId: string) => {
    const updatedCart = cart.filter((item) => item.book.id !== bookId);
    setCart(updatedCart);
    await cartStorage.saveCart(updatedCart);
    refreshCartCount();
  };

  const itemsTotal = cart.reduce(
    (sum, item) => sum + Number(item.book.price) * item.quantity,
    0
  );

  const deliveryFee = fulfilmentMethod === 'delivery' ? DELIVERY_FEE_EZIOBODO : 0;
  const grandTotal = itemsTotal + deliveryFee;

  const handleCheckout = async () => {
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

    setLoading(true);
    try {
      const order = await apiService.createOrder({
        items: cart.map((item) => ({
          bookId: item.book.id,
          quantity: item.quantity,
        })),
        deliveryAddress:
          fulfilmentMethod === 'pickup'
            ? 'SUG Building - Pickup Station'
            : deliveryAddress,
        deliveryMethod: fulfilmentMethod,
      });

      await cartStorage.clearCart();
      setCart([]);
      refreshCartCount();
      router.push(`/(tabs)/orders/${order.id}/payment`);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
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
      <ThemedText type="title" style={styles.title}>
        Shopping Cart
      </ThemedText>

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
              onPress={() => removeItem(item.book.id)}
            >
              <Text style={[styles.removeButtonText, { color: colors.error }]}>
                Remove
              </Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item) => item.book.id}
        contentContainerStyle={styles.list}
      />

      <View
        style={[
          styles.checkoutSection,
          { backgroundColor: colors.cardBackground, shadowColor: '#000' },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Delivery Options
        </Text>

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

        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: colors.text }]}>
            Items total
          </Text>
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
          <Text style={[styles.totalLabel, styles.orderTotalLabel, { color: colors.text }]}>
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

        {!isAuthenticated ? (
          <TouchableOpacity
            style={[styles.checkoutButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.checkoutButtonText}>Sign In to Checkout</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.checkoutButton,
              { backgroundColor: colors.primary },
              loading && styles.checkoutButtonDisabled,
            ]}
            onPress={handleCheckout}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
            )}
          </TouchableOpacity>
        )}
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
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
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

