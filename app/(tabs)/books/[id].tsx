import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image as ExpoImage } from 'expo-image';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { useCart } from '../../../contexts/CartContext';
import { apiService } from '../../../services/api';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import type { Book } from '../../../types';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuth();
  const { showToast } = useToast();
  const { getItemQuantity, addToCart, setItemQuantity } = useCart();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    if (id) {
      loadBook();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadBook = async () => {
    try {
      const data = await apiService.getBookById(id!);
      setBook(data);
    } catch {
      Alert.alert('Error', 'Failed to load book details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'Please sign in to add items to cart', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }

    if (isAdmin) {
      Alert.alert('Admin Account', 'Admin accounts cannot add items to cart');
      return;
    }

    if (!book || book.stock <= 0) {
      Alert.alert('Error', 'Out of stock');
      return;
    }

    setAddingToCart(true);
    try {
      await addToCart(book, 1);
      showToast('Cart updated', 'success', 900);
    } catch {
      showToast('Failed to add to cart', 'error');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleInCartChange = async (delta: number) => {
    if (!book) return;

    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'Please sign in to update your cart', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }

    if (isAdmin) {
      Alert.alert('Admin Account', 'Admin accounts cannot place orders');
      return;
    }

    const currentQty = getItemQuantity(book.id);
    const nextQty = currentQty + delta;
    if (nextQty > book.stock) return;

    try {
      await setItemQuantity(book.id, nextQty);
      showToast('Cart updated', 'success', 900);
    } catch {
      showToast('Failed to update cart', 'error', 1200);
    }
  };

  const getCoverSrc = (coverImage?: string) => {
    if (!coverImage) return undefined;
    return coverImage.startsWith('data:image')
      ? coverImage
      : `data:image/jpeg;base64,${coverImage}`;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!book) {
    return (
      <ThemedView style={styles.container}>
        <Text style={styles.errorText}>Book not found</Text>
      </ThemedView>
    );
  }

  const cartQty = getItemQuantity(book.id);

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        {getCoverSrc(book.coverImage) ? (
          <ExpoImage
            source={{ uri: getCoverSrc(book.coverImage) }}
            style={styles.image}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Text style={styles.placeholderText}>No Image Available</Text>
          </View>
        )}

        <View style={styles.details}>
          <ThemedText type="title" style={styles.title}>
            {book.title}
          </ThemedText>
          <ThemedText style={styles.author}>by {book.author}</ThemedText>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Price:</Text>
            <Text style={styles.price}>₦{Number(book.price).toFixed(2)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Category:</Text>
            <Text style={styles.value}>{book.category}</Text>
          </View>

          {book.classFormLevel && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Level:</Text>
              <Text style={styles.value}>{book.classFormLevel}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.label}>Stock:</Text>
            <Text
              style={[
                styles.value,
                book.stock > 0 ? styles.inStock : styles.outOfStock,
              ]}
            >
              {book.stock > 0 ? `${book.stock} available` : 'Out of Stock'}
            </Text>
          </View>

          {book.stock > 0 && !isAdmin && (
            <View style={styles.cartSection}>
              {cartQty <= 0 ? (
                <TouchableOpacity
                  style={[styles.addButton, addingToCart && styles.addButtonDisabled]}
                  onPress={handleAddToCart}
                  disabled={addingToCart}
                >
                  {addingToCart ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.addButtonText}>Add to Cart</Text>
                  )}
                </TouchableOpacity>
              ) : (
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleInCartChange(-1)}
                  >
                    <Text style={styles.quantityButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={[styles.quantity, { color: colors.text }]}>{cartQty}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleInCartChange(1)}
                    disabled={cartQty >= book.stock}
                  >
                    <Text
                      style={[
                        styles.quantityButtonText,
                        cartQty >= book.stock && styles.quantityButtonDisabled,
                      ]}
                    >
                      +
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  image: {
    width: '100%',
    height: 400,
    borderRadius: 12,
    marginBottom: 20,
  },
  placeholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
    fontSize: 16,
  },
  details: {
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  author: {
    fontSize: 18,
    opacity: 0.7,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  inStock: {
    color: '#155724',
  },
  outOfStock: {
    color: '#721c24',
  },
  cartSection: {
    marginTop: 24,
    gap: 16,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  quantityButtonDisabled: {
    color: '#ccc',
  },
  quantity: {
    fontSize: 20,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
  },
});

