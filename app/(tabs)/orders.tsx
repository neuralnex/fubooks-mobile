import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { apiService } from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import Pagination from '../../components/Pagination';
import AnimatedView from '../../components/AnimatedView';
import TouchableRipple from '../../components/TouchableRipple';
import { SkeletonOrderCard } from '../../components/Skeleton';
import type { Order } from '../../types';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function OrdersScreenSmooth() {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const scrollY = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, currentPage]);

  useEffect(() => {
    // Scroll to top when page changes
    if (currentPage === 1 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    }
  }, [currentPage]);

  const loadOrders = useCallback(async () => {
    try {
      if (currentPage === 1) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      
      const data = await apiService.getOrdersPaginated(currentPage, 10, {
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      });
      
      setOrders(currentPage === 1 ? data.orders : [...orders, ...data.orders]);
      setTotalPages(data.totalPages);
      setTotalOrders(data.total);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setIsLoadingMore(false);
    }
  }, [currentPage, orders]);

  const onRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
  };

  const handleLoadMore = () => {
    if (!loading && !isLoadingMore && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
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

  const canCancelOrder = (order: Order) => {
    return (
      (order.paymentStatus === 'pending' || order.paymentStatus === 'failed') &&
      order.orderStatus !== 'delivered'
    );
  };

  const handleCancelOrder = useCallback(async (orderId: string) => {
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
              await loadOrders();
              showToast('Order cancelled successfully', 'success');
            } catch (error: any) {
              console.error('Cancel order error:', error);
              const errorMessage = error?.response?.data?.message || error?.message || 'Failed to cancel order';
              showToast(errorMessage, 'error');
            } finally {
              setCancellingOrderId(null);
            }
          },
        },
      ]
    );
  }, [loadOrders, showToast]);

  const toggleExpandOrder = useCallback((orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  }, [expandedOrderId]);

  const renderOrderItem = useCallback(({ item, index }: { item: Order; index: number }) => {
    const isExpanded = expandedOrderId === item.id;
    
    return (
      <AnimatedView
        animationType="slideUp"
        duration={400}
        delay={index * 30}
        style={styles.orderItem}
      >
        <TouchableRipple
          onPress={() => toggleExpandOrder(item.id)}
          style={[
            styles.orderCard,
            isExpanded && styles.orderCardExpanded
          ]}
        >
          <View>
            <View style={styles.orderHeader}>
              <View style={styles.orderInfo}>
                <ThemedText style={styles.orderId}>Order #{item.id.slice(0, 8)}</ThemedText>
                <Text style={styles.orderDate}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.orderAmount}>
                <Text style={styles.orderTotal}>₦{Number(item.totalAmount).toFixed(2)}</Text>
              </View>
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
              <Text style={styles.itemsCount}>{item.orderItems.length} items</Text>
            </View>

            {/* Expanded Order Details */}
            {isExpanded && (
              <AnimatedView animationType="slideDown" duration={300}>
                <View style={styles.expandedContent}>
                  <View style={styles.divider} />
                  <View style={styles.itemsList}>
                    {item.orderItems.map((orderItem) => (
                      <View key={orderItem.id} style={styles.itemRow}>
                        <View style={styles.itemInfo}>
                          <Text style={styles.itemTitle} numberOfLines={1}>
                            {orderItem.book.title}
                          </Text>
                          <Text style={styles.itemAuthor}>
                            by {orderItem.book.author}
                          </Text>
                        </View>
                        <Text style={styles.itemPrice}>
                          ₦{(orderItem.price * orderItem.quantity).toFixed(2)}
                        </Text>
                      </View>
                    ))}
                  </View>
                  
                  {item.paymentStatus === 'pending' && (
                    <TouchableRipple
                      onPress={() => router.push(`/(tabs)/orders/${item.id}/payment`)}
                      style={styles.completePaymentButton}
                    >
                      <Text style={styles.completePaymentText}>Complete Payment</Text>
                    </TouchableRipple>
                  )}
                  
                  {canCancelOrder(item) && (
                    <TouchableRipple
                      onPress={() => {
                        handleCancelOrder(item.id);
                      }}
                      style={[styles.cancelButton, { backgroundColor: colors.error }]}
                      disabled={cancellingOrderId === item.id}
                    >
                      {cancellingOrderId === item.id ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <Text style={styles.cancelButtonText}>Cancel Order</Text>
                      )}
                    </TouchableRipple>
                  )}
                </View>
              </AnimatedView>
            )}
          </View>
        </TouchableRipple>
      </AnimatedView>
    );
  }, [expandedOrderId, cancellingOrderId, colors, handleCancelOrder, router, toggleExpandOrder]);

  const renderSkeleton = useCallback(() => (
    <SkeletonOrderCard />
  ), []);

  if (!isAuthenticated) {
    return (
      <ThemedView style={styles.container}>
        <AnimatedView animationType="fadeIn" duration={500}>
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Please sign in to view your orders</Text>
            <TouchableRipple
              style={styles.button}
              onPress={() => router.push('/(auth)/login')}
            >
              <Text style={styles.buttonText}>Sign In</Text>
            </TouchableRipple>
          </View>
        </AnimatedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Animated.View
        style={[
          styles.header,
          {
            shadowOpacity: scrollY.interpolate({
              inputRange: [0, 50],
              outputRange: [0, 0.1],
              extrapolate: 'clamp',
            }),
          },
        ]}
      >
        <AnimatedView animationType="slideDown" duration={600}>
          <ThemedText type="title" style={styles.title}>
            My Orders
          </ThemedText>
        </AnimatedView>
        <AnimatedView animationType="fadeIn" duration={600} delay={100}>
          <Text style={styles.subtitle}>Track your purchases and delivery status</Text>
        </AnimatedView>
      </Animated.View>

      {loading && currentPage === 1 ? (
        <View style={styles.loadingContainer}>
          <FlatList
            data={Array.from({ length: 5 })}
            renderItem={renderSkeleton}
            keyExtractor={(_, i) => `skeleton-${i}`}
            contentContainerStyle={styles.list}
            scrollEnabled={false}
          />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          scrollEnabled={true}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor="#007AFF"
              colors={['#007AFF']}
            />
          }
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <AnimatedView animationType="fadeIn" duration={500}>
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No orders yet</Text>
                <TouchableRipple
                  style={styles.button}
                  onPress={() => router.push('/(tabs)/books')}
                >
                  <Text style={styles.buttonText}>Browse Books</Text>
                </TouchableRipple>
              </View>
            </AnimatedView>
          }
          ListFooterComponent={
            isLoadingMore ? (
              <AnimatedView animationType="fadeIn" duration={300}>
                <View style={styles.loader}>
                  <LoadingSpinner />
                </View>
              </AnimatedView>
            ) : orders.length > 0 ? (
              <AnimatedView animationType="fadeIn" duration={400}>
                <View style={styles.footer}>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => {
                      setCurrentPage(page);
                      if (page !== currentPage) {
                        setTimeout(() => {
                          flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
                        }, 100);
                      }
                    }}
                  />
                  <Text style={styles.footerText}>
                    Showing {orders.length} of {totalOrders} orders
                  </Text>
                </View>
              </AnimatedView>
            ) : null
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    zIndex: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a1a',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  list: {
    paddingBottom: 20,
  },
  orderItem: {
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  orderCardExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
  },
  orderDate: {
    fontSize: 13,
    color: '#6c757d',
    marginTop: 2,
  },
  orderAmount: {
    alignItems: 'flex-end',
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  orderAddress: {
    fontSize: 14,
    color: '#6c757d',
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
  itemsCount: {
    fontSize: 13,
    color: '#6c757d',
  },
  expandedContent: {
    backgroundColor: '#f8f9fa',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    padding: 16,
    marginTop: 0,
  },
  divider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginBottom: 12,
  },
  itemsList: {
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
  },
  itemAuthor: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  completePaymentButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  completePaymentText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
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
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    marginTop: 12,
  },
  footerText: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    paddingTop: 20,
  },
  loader: {
    padding: 20,
    alignItems: 'center',
  },
});
