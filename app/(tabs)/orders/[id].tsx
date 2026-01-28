import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { apiService } from '../../../services/api';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import type { Order } from '../../../types';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadOrder = async () => {
    try {
      const data = await apiService.getOrderById(id!);
      setOrder(data);
    } catch {
      Alert.alert('Error', 'Failed to load order details');
      router.back();
    } finally {
      setLoading(false);
    }
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

  if (!order) {
    return (
      <ThemedView style={styles.container}>
        <Text style={styles.errorText}>Order not found</Text>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Order Details
        </ThemedText>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Order ID:</Text>
            <Text style={styles.value}>{order.id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>
              {new Date(order.createdAt).toLocaleString()}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Delivery Address:</Text>
            <Text style={styles.value}>{order.deliveryAddress}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(order.orderStatus) },
              ]}
            >
              <Text style={styles.statusText}>Order: {order.orderStatus}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getPaymentColor(order.paymentStatus) },
              ]}
            >
              <Text style={styles.statusText}>Payment: {order.paymentStatus}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          {order.orderItems.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.book.title}</Text>
                <Text style={styles.itemAuthor}>by {item.book.author}</Text>
                <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>
                ₦{(Number(item.price) * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalAmount}>₦{Number(order.totalAmount).toFixed(2)}</Text>
          </View>
        </View>

        {order.paymentStatus === 'pending' && (
          <TouchableOpacity
            style={styles.paymentButton}
            onPress={() => router.push(`/(tabs)/orders/${order.id}/payment`)}
          >
            <Text style={styles.paymentButtonText}>Complete Payment</Text>
          </TouchableOpacity>
        )}
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
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemInfo: {
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
  itemQuantity: {
    fontSize: 12,
    color: '#999',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#007AFF',
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  paymentButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  paymentButtonText: {
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

