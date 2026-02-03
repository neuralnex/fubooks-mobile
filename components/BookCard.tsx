import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Image as ExpoImage } from 'expo-image';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useCart } from '../contexts/CartContext';
import { Colors } from '../constants/theme';
import { useColorScheme } from '../hooks/use-color-scheme';
import type { Book } from '../types';

interface BookCardProps {
  book: Book;
  onCartUpdate?: () => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
// Match screen padding (~20 on each side) and card gap (~12 between cards)
const HORIZONTAL_PADDING = 32;
const CARD_GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP * 2) / 3;

export function BookCard({ book, onCartUpdate }: BookCardProps) {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuth();
  const { showToast } = useToast();
  const { getItemQuantity, addToCart, setItemQuantity } = useCart();
  const cartQty = getItemQuantity(book.id);
  const [addingToCart, setAddingToCart] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getCoverSrc = (coverImage?: string) => {
    if (!coverImage) return undefined;
    return coverImage.startsWith('data:image')
      ? coverImage
      : `data:image/jpeg;base64,${coverImage}`;
  };

  const handleAddToCart = async (e: any) => {
    e.stopPropagation();
    
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

    setAddingToCart(true);
    try {
      await addToCart(book, 1);
      if (onCartUpdate) {
        onCartUpdate();
      }
      showToast('Cart updated', 'success', 900);
    } catch {
      Alert.alert('Error', 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleInCartChange = async (delta: number, e: any) => {
    e.stopPropagation();

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

    const nextQty = cartQty + delta;
    if (nextQty > book.stock) {
      return;
    }

    try {
      await setItemQuantity(book.id, nextQty);
      if (onCartUpdate) {
        onCartUpdate();
      }
      showToast('Cart updated', 'success', 900);
    } catch {
      showToast('Failed to update cart', 'error', 1200);
    }
  };

  const handleCardPress = () => {
    router.push(`/(tabs)/books/${book.id}`);
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
      onPress={handleCardPress}
      activeOpacity={0.9}
    >
      <View style={styles.imageWrapper}>
        {getCoverSrc(book.coverImage) ? (
          <ExpoImage
            source={{ uri: getCoverSrc(book.coverImage) }}
            style={styles.image}
            contentFit="contain"
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={[styles.author, { color: colors.icon }]} numberOfLines={1}>
          by {book.author}
        </Text>
        <Text style={[styles.price, { color: colors.primary }]}>₦{Number(book.price).toFixed(2)}</Text>

        <View style={styles.deliveryBadges}>
          <View style={[styles.deliveryBadge, { backgroundColor: colors.success + '22' }]}>
            <Text style={[styles.deliveryBadgeText, { color: colors.success }]}>
              SUG pickup
            </Text>
          </View>
          <View style={[styles.deliveryBadge, { backgroundColor: colors.accent + '22' }]}>
            <Text style={[styles.deliveryBadgeText, { color: colors.accent }]}>
              Eziobodo / Umuchima delivery
            </Text>
          </View>
        </View>
        
        {book.stock > 0 && !isAdmin && (
          <View style={styles.cartSection}>
            {cartQty <= 0 ? (
              <TouchableOpacity
                style={[
                  styles.addButton,
                  { backgroundColor: colors.primary },
                  addingToCart && styles.addButtonDisabled,
                ]}
                onPress={handleAddToCart}
                disabled={addingToCart || book.stock <= 0}
              >
                {addingToCart ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.addButtonText}>Add to Cart</Text>
                )}
              </TouchableOpacity>
            ) : (
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={(e) => handleInCartChange(-1, e)}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={[styles.quantity, { color: colors.text }]}>{cartQty}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={(e) => handleInCartChange(1, e)}
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

        <View style={styles.stockBadgeContainer}>
          <View
            style={[
              styles.stockBadge,
              book.stock > 0 ? styles.inStock : styles.outOfStock,
            ]}
          >
            <Text
              style={[
                styles.stockText,
                book.stock > 0 ? styles.inStockText : styles.outOfStockText,
              ]}
            >
              {book.stock > 0 ? `In Stock (${book.stock})` : 'Out of Stock'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
    width: CARD_WIDTH,
    marginHorizontal: CARD_GAP / 2,
  },
  imageWrapper: {
    width: '100%',
    // 2:3 book ratio (height = 1.5 * width)
    aspectRatio: 2 / 3,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
    fontSize: 12,
  },
  content: {
    padding: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#000',
    minHeight: 36,
  },
  author: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  deliveryBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  deliveryBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  deliveryBadgeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  cartSection: {
    marginBottom: 8,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 12,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  quantityButtonDisabled: {
    color: '#ccc',
  },
  quantity: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 24,
    textAlign: 'center',
  },
  addButton: {
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  stockBadgeContainer: {
    alignItems: 'center',
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  inStock: {
    backgroundColor: '#d4edda',
  },
  outOfStock: {
    backgroundColor: '#f8d7da',
  },
  stockText: {
    fontSize: 10,
    fontWeight: '500',
  },
  inStockText: {
    color: '#155724',
  },
  outOfStockText: {
    color: '#721c24',
  },
});
