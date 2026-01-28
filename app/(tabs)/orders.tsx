import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import type { Order } from '../../types';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

export default function OrdersScreen() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadOrders = async () => {
    try {
      const data = await apiService.getOrders();
      const sorted = [...data].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(sorted);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return '#28a745';
      case 'delivering':
        return '#17a2b8';
      case 'purchased':
        return '#007AFF';
      default:
        return '#ffc107';
    }
  };

  const getPaymentColor = (status: string) => {
    switch (status) {
      case 'paid':
        return '#28a745';
      case 'pending':
        return '#ffc107';
      default:
        return '#dc3545';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Please sign in to view your orders</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        My Orders
      </ThemedText>

      <FlatList
        data={orders}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.orderCard}
            onPress={() => router.push(`/(tabs)/orders/${item.id}`)}
          >
            <View style={styles.orderHeader}>
              <Text style={styles.orderId}>Order #{item.id.slice(0, 8)}</Text>
              <Text style={styles.orderDate}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>

            <Text style={styles.orderAddress} numberOfLines={1}>
              {item.deliveryAddress}
            </Text>

            <View style={styles.orderFooter}>
              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(item.orderStatus) },
                  ]}
                >
                  <Text style={styles.statusText}>{item.orderStatus}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getPaymentColor(item.paymentStatus) },
                  ]}
                >
                  <Text style={styles.statusText}>{item.paymentStatus}</Text>
                </View>
              </View>
              <Text style={styles.orderTotal}>₦{Number(item.totalAmount).toFixed(2)}</Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No orders yet</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push('/(tabs)/books')}
            >
              <Text style={styles.buttonText}>Browse Books</Text>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  list: {
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  orderAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
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

