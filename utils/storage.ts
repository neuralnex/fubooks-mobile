import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CartItem } from '../types';

const CART_KEY = 'cart';

export const cartStorage = {
  async getCart(): Promise<CartItem[]> {
    try {
      const cartJson = await AsyncStorage.getItem(CART_KEY);
      return cartJson ? JSON.parse(cartJson) : [];
    } catch (error) {
      console.error('Error getting cart:', error);
      return [];
    }
  },

  async saveCart(cart: CartItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  },

  async clearCart(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CART_KEY);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  },
};

