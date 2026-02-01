import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { apiService } from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import type { Order } from '../../types';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function OrdersScreen() {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

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

  const canCancelOrder = (order: Order) => {
    // Can cancel if payment is pending or failed, and order is not delivered
    return (
      (order.paymentStatus === 'pending' || order.paymentStatus === 'failed') &&
      order.orderStatus !== 'delivered'
    );
  };

  const handleCancelOrder = async (orderId: string) => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setCancellingOrderId(orderId);
            try {
              await apiService.cancelOrder(orderId);
              setOrders((prev) => prev.filter((order) => order.id !== orderId));
              showToast('Order cancelled successfully', 'success');
            } catch (error: any) {
              showToast(
                error.response?.data?.message || 'Failed to cancel order',
                'error'
              );
            } finally {
              setCancellingOrderId(null);
            }
          },
        },
      ]
    );
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
          <View style={styles.orderCard}>
            <TouchableOpacity
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
            {canCancelOrder(item) && (
              <TouchableOpacity
                style={[
                  styles.cancelButton,
                  { backgroundColor: colors.error },
                  cancellingOrderId === item.id && styles.cancelButtonDisabled,
                ]}
                onPress={() => handleCancelOrder(item.id)}
                disabled={cancellingOrderId === item.id}
              >
                {cancellingOrderId === item.id ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.cancelButtonText}>Cancel Order</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
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
  cancelButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonDisabled: {
    opacity: 0.6,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

