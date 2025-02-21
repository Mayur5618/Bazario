import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { orderApi } from '../api/orderApi';
import Toast from 'react-native-root-toast';

const OrderDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const response = await orderApi.getOrderDetails(id);
      setOrder(response.order);
    } catch (error) {
      Toast.show(error.message || 'Failed to fetch order details', {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Pending';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Order not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Order Status */}
      <View style={styles.section}>
        <View style={styles.statusRow}>
          <Text style={styles.sectionTitle}>Order Status</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: order.status.toLowerCase() === 'completed' ? '#10B981' : '#3B82F6' }
          ]}>
            <Text style={styles.statusText}>
              {getStatusText(order.status)}
            </Text>
          </View>
        </View>
      </View>

      {/* Order Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Order ID</Text>
          <Text style={styles.infoValue}>{order.orderId}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Order Date</Text>
          <Text style={styles.infoValue}>
            {new Date(order.orderDate).toLocaleDateString()}
          </Text>
        </View>
        {order.status === 'completed' && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Delivery Date</Text>
            <Text style={styles.infoValue}>
              {new Date().toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>

      {/* Order Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        {order.items.map((item, index) => (
          <View key={index} style={styles.itemContainer}>
            <Image 
              source={{ uri: item.product.images[0] }}
              style={styles.itemImage}
            />
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{item.product.name}</Text>
              <Text style={styles.quantityText}>Quantity: {item.quantity}</Text>
              <Text style={styles.priceText}>₹{item.price}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Price Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Price Details</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Items Total</Text>
          <Text style={styles.infoValue}>₹{order.items.reduce((total, item) => total + (item.price * item.quantity), 0)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Delivery Charges</Text>
          <Text style={styles.infoValue}>₹{order.deliveryCharge || 0}</Text>
        </View>
        <View style={[styles.infoRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>₹{order.total}</Text>
        </View>
      </View>

      {/* Delivery Address */}
      <View style={[styles.section, styles.lastSection]}>
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        <Text style={styles.addressText}>{order.shippingAddress.name}</Text>
        <Text style={styles.addressText}>{order.shippingAddress.street}</Text>
        <Text style={styles.addressText}>
          {order.shippingAddress.city}, {order.shippingAddress.state}
        </Text>
        <Text style={styles.addressText}>{order.shippingAddress.pincode}</Text>
        <Text style={styles.addressText}>
          Phone: {order.shippingAddress.phone}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  itemContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
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
    justifyContent: 'center',
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
  totalRow: {
    borderBottomWidth: 0,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  lastSection: {
    marginBottom: 24,
  },
  addressText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
  },
});

export default OrderDetailScreen; 