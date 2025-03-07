// mobile/src/screens/OrderHistoryScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  Image, 
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import { orderApi } from '../api/orderApi';
import Toast from 'react-native-root-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OrderHistoryScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderApi.getMyOrders();
      console.log('Orders response:', response);
      if (response && response.success && response.orders) {
        // Sort orders - pending first, then completed
        const sortedOrders = [...response.orders].sort((a, b) => {
          if (a.status.toLowerCase() === 'pending' && b.status.toLowerCase() !== 'pending') return -1;
          if (a.status.toLowerCase() !== 'pending' && b.status.toLowerCase() === 'pending') return 1;
          // If both are pending or both are completed, sort by date (newest first)
          return new Date(b.orderDate) - new Date(a.orderDate);
        });
        console.log('Sorted orders:', sortedOrders);
        setOrders(sortedOrders);
      } else {
        setOrders([]);
        Toast.show('No orders found', {
          duration: Toast.durations.LONG,
          position: Toast.positions.BOTTOM,
          shadow: true,
          animation: true,
        });
      }
    } catch (error) {
      console.error('Error in fetchOrders:', error);
      Toast.show(error.message || 'Failed to fetch orders', {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
        shadow: true,
        animation: true,
      });
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, []);

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return {
          container: {
            backgroundColor: '#10B981',
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 12,
          },
          text: { color: '#FFFFFF', fontSize: 12 }
        };
      case 'pending':
        return {
          container: {
            backgroundColor: '#3B82F6',
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 12,
          },
          text: { color: '#FFFFFF', fontSize: 12 }
        };
      default:
        return {
          container: {
            backgroundColor: '#6B7280',
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 12,
          },
          text: { color: '#FFFFFF', fontSize: 12 }
        };
    }
  };

  const OrderCard = ({ order }) => {
    const statusStyle = getStatusStyle(order.status);
    const isCompleted = order.status.toLowerCase() === 'completed';
    
    return (
      <TouchableOpacity 
        onPress={() => router.push({
          pathname: "/orders/[id]",
          params: { id: order._id }
        })}
        style={[
          styles.orderCard,
          isCompleted && styles.completedOrderCard
        ]}
      >
        <View style={styles.orderHeader}>
          <View>
            <Text style={[
              styles.orderId,
              isCompleted && styles.completedOrderText
            ]}>
              Order #{order.orderId}
            </Text>
            <Text style={styles.dateText}>
              Placed on {new Date(order.orderDate).toLocaleDateString()}
            </Text>
          </View>
          <View style={statusStyle.container}>
            <Text style={statusStyle.text}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Text>
          </View>
        </View>

        {order.items.map((item, index) => (
          <View 
            key={index} 
            style={[
              styles.itemContainer,
              isCompleted && styles.completedItemContainer
            ]}
          >
            <Image 
              source={{ uri: item.product.images[0] }}
              style={[
                styles.itemImage,
                isCompleted && styles.completedItemImage
              ]}
            />
            <View style={styles.itemDetails}>
              <Text style={[
                styles.itemName,
                isCompleted && styles.completedOrderText
              ]}>
                {item.product.name}
              </Text>
              <Text style={styles.quantityText}>
                Quantity: {item.quantity}
              </Text>
              <Text style={[
                styles.priceText,
                isCompleted && styles.completedOrderText
              ]}>
                ₹{item.price}
              </Text>
            </View>
          </View>
        ))}

        <View style={[
          styles.totalContainer,
          isCompleted && styles.completedTotalContainer
        ]}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={[
            styles.totalAmount,
            isCompleted && styles.completedOrderText
          ]}>
            ₹{order.total}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderOrders = () => {
    const pendingOrders = orders.filter(order => 
      order.status.toLowerCase() === 'pending'
    );
    const completedOrders = orders.filter(order => 
      order.status.toLowerCase() === 'completed'
    );

    return (
      <View style={styles.ordersContainer}>
        {/* Pending Orders Section */}
        {pendingOrders.length > 0 && (
          <View style={styles.orderSection}>
            <Text style={styles.sectionTitle}>Pending Orders</Text>
            {pendingOrders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </View>
        )}

        {/* Completed Orders Section */}
        {completedOrders.length > 0 && (
          <View style={styles.orderSection}>
            <Text style={styles.sectionTitle}>Completed Orders</Text>
            {completedOrders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No orders found</Text>
        </View>
      ) : (
        renderOrders()
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 16,
    color: '#1F2937',
  },
  ordersContainer: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
  },
  itemContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  itemDetails: {
    marginLeft: 12,
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  quantityText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  orderSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  completedOrderCard: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    opacity: 0.9,
  },
  completedOrderText: {
    color: '#64748B',
  },
  completedItemContainer: {
    borderBottomColor: '#E2E8F0',
  },
  completedItemImage: {
    opacity: 0.8,
  },
  completedTotalContainer: {
    borderTopColor: '#E2E8F0',
  },
});

export default OrderHistoryScreen;