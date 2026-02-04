import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect, useMemo } from 'react';
import { cartStorage } from '../utils/storage';
import type { Book, CartItem } from '../types';

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  refreshCart: () => Promise<void>;
  getItemQuantity: (bookId: string) => number;
  addToCart: (book: Book, quantity?: number) => Promise<void>;
  setItemQuantity: (bookId: string, quantity: number) => Promise<void>;
  removeItem: (bookId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const refreshCart = useCallback(async () => {
    try {
      const savedCart = await cartStorage.getCart();
      // Only update if we have data, to prevent flashing
      if (savedCart && savedCart.length >= 0) {
        setCart(savedCart);
      }
    } catch {
      // Don't clear cart on error, keep existing state
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const getItemQuantity = useCallback(
    (bookId: string) => cart.find((item) => item.book.id === bookId)?.quantity ?? 0,
    [cart]
  );

  const persistCart = useCallback(async (nextCart: CartItem[]) => {
    setCart(nextCart);
    await cartStorage.saveCart(nextCart);
  }, []);

  const addToCart = useCallback(
    async (book: Book, quantity: number = 1) => {
      const nextCart = [...cart];
      const existing = nextCart.find((item) => item.book.id === book.id);

      if (existing) {
        existing.quantity += quantity;
      } else {
        nextCart.push({ book, quantity });
      }

      await persistCart(nextCart);
    },
    [cart, persistCart]
  );

  const setItemQuantity = useCallback(
    async (bookId: string, quantity: number) => {
      if (quantity <= 0) {
        await persistCart(cart.filter((item) => item.book.id !== bookId));
        return;
      }

      const nextCart = cart.map((item) =>
        item.book.id === bookId ? { ...item, quantity } : item
      );
      await persistCart(nextCart);
    },
    [cart, persistCart]
  );

  const removeItem = useCallback(
    async (bookId: string) => {
      await persistCart(cart.filter((item) => item.book.id !== bookId));
    },
    [cart, persistCart]
  );

  const clearCart = useCallback(async () => {
    setCart([]);
    await cartStorage.clearCart();
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        refreshCart,
        getItemQuantity,
        addToCart,
        setItemQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

