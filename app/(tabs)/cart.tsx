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
import { useRouter } from 'expo-router';
import { Image as ExpoImage } from 'expo-image';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { cartStorage } from '../../utils/storage';
import type { CartItem } from '../../types';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

export default function CartScreen() {
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

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
  };

  const removeItem = async (bookId: string) => {
    const updatedCart = cart.filter((item) => item.book.id !== bookId);
    setCart(updatedCart);
    await cartStorage.saveCart(updatedCart);
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + Number(item.book.price) * item.quantity,
    0
  );

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

    if (!deliveryAddress || deliveryAddress.length < 10) {
      Alert.alert('Error', 'Please enter a valid delivery address (at least 10 characters)');
      return;
    }

    setLoading(true);
    try {
      const order = await apiService.createOrder({
        items: cart.map((item) => ({
          bookId: item.book.id,
          quantity: item.quantity,
        })),
        deliveryAddress,
      });

      await cartStorage.clearCart();
      setCart([]);
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
      <ThemedView style={styles.container}>
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
      <ThemedView style={styles.container}>
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
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Shopping Cart
      </ThemedText>

      <FlatList
        data={cart}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            {getCoverSrc(item.book.coverImage) && (
              <ExpoImage
                source={{ uri: getCoverSrc(item.book.coverImage) }}
                style={styles.itemImage}
                contentFit="cover"
              />
            )}
            <View style={styles.itemDetails}>
              <Text style={styles.itemTitle}>{item.book.title}</Text>
              <Text style={styles.itemAuthor}>by {item.book.author}</Text>
              <Text style={styles.itemPrice}>₦{Number(item.book.price).toFixed(2)}</Text>

              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item.book.id, item.quantity - 1)}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantity}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item.book.id, item.quantity + 1)}
                  disabled={item.quantity >= item.book.stock}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.itemTotal}>
                Total: ₦{(Number(item.book.price) * item.quantity).toFixed(2)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeItem(item.book.id)}
            >
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item) => item.book.id}
        contentContainerStyle={styles.list}
      />

      <View style={styles.checkoutSection}>
        <TextInput
          style={styles.addressInput}
          placeholder="Delivery Address (min 10 characters)"
          placeholderTextColor="#999"
          value={deliveryAddress}
          onChangeText={setDeliveryAddress}
          multiline
        />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>₦{totalAmount.toFixed(2)}</Text>
        </View>

        {!isAuthenticated ? (
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.checkoutButtonText}>Sign In to Checkout</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.checkoutButton, loading && styles.checkoutButtonDisabled]}
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
    backgroundColor: '#fff',
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
    color: '#666',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
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
    color: '#333',
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
    backgroundColor: '#fff',
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
    backgroundColor: '#f5f5f5',
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
    color: '#007AFF',
  },
  checkoutButton: {
    backgroundColor: '#007AFF',
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
});

