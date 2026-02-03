import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { BookCard } from '../../components/BookCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import type { Book } from '../../types';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

export default function HomeScreen() {
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const data = await apiService.getBooks();
      const sorted = [...data].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setBooks(sorted.slice(0, 8));
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBooks();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Welcome to FUBOOKS
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          {isAuthenticated
            ? isAdmin
              ? 'Admin Dashboard'
              : 'Discover your next book'
            : 'Browse our collection'}
        </ThemedText>
      </View>

      {!isAuthenticated && (
        <View style={styles.authPrompt}>
          <Text style={styles.authText}>Sign in to add books to cart</Text>
          <TouchableOpacity
            style={styles.authButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.authButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={books}
        renderItem={({ item }) => <BookCard book={item} />}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        scrollEnabled={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No books available</Text>
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  authPrompt: {
    margin: 20,
    padding: 16,
    backgroundColor: '#f0f7ff',
    borderRadius: 12,
    alignItems: 'center',
  },
  authText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  authButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  authButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    padding: 12,
  },
  row: {
    justifyContent: 'flex-start',
    paddingHorizontal: 4,
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
