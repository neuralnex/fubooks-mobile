import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Image as ExpoImage } from 'expo-image';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { cartStorage } from '../utils/storage';
import { Colors } from '../constants/theme';
import { useColorScheme } from '../hooks/use-color-scheme';
import type { Book } from '../types';

interface BookCardProps {
  book: Book;
  onCartUpdate?: () => void;
}

export function BookCard({ book, onCartUpdate }: BookCardProps) {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuth();
  const { showToast } = useToast();
  const [quantity, setQuantity] = useState(1);
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

    if (book.stock < quantity) {
      Alert.alert('Error', 'Insufficient stock');
      return;
    }

    setAddingToCart(true);
    try {
      const cart = await cartStorage.getCart();
      const existingItem = cart.find((item) => item.book.id === book.id);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.push({ book, quantity });
      }

      await cartStorage.saveCart(cart);
      if (onCartUpdate) {
        onCartUpdate();
      }
      // Force tab layout to refresh cart count
      setTimeout(() => {
        // This will trigger a re-render in the tab layout
      }, 100);
      showToast('Book added to cart successfully! 🎉', 'success');
      setQuantity(1);
    } catch {
      Alert.alert('Error', 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleQuantityChange = (change: number, e: any) => {
    e.stopPropagation();
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= book.stock) {
      setQuantity(newQuantity);
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
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={(e) => handleQuantityChange(-1, e)}
                disabled={quantity <= 1}
              >
                <Text style={[styles.quantityButtonText, quantity <= 1 && styles.quantityButtonDisabled]}>
                  -
                </Text>
              </TouchableOpacity>
              <Text style={[styles.quantity, { color: colors.text }]}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={(e) => handleQuantityChange(1, e)}
                disabled={quantity >= book.stock}
              >
                <Text style={[styles.quantityButtonText, quantity >= book.stock && styles.quantityButtonDisabled]}>
                  +
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[
                styles.addButton,
                { backgroundColor: colors.primary },
                addingToCart && styles.addButtonDisabled,
              ]}
              onPress={handleAddToCart}
              disabled={addingToCart || quantity > book.stock}
            >
              {addingToCart ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.addButtonText}>Add to Cart</Text>
              )}
            </TouchableOpacity>
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
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
    flex: 1,
    marginHorizontal: 6,
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 3 / 4,
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
