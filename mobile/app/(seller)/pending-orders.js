import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { sellerApi } from '../../src/api/sellerApi';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '../../src/context/LanguageContext';

// Translations for all UI text
const translations = {
  en: {
    title: 'Pending Orders',
    noOrders: 'No pending orders found',
    orderId: 'Order #',
    newCustomer: 'New Customer',
    repeatCustomer: 'Repeat Customer',
    qty: 'Qty:',
    totalAmount: 'Total Amount',
    viewDetails: 'View Details'
  },
  hi: {
    title: 'लंबित आदेश',
    noOrders: 'कोई लंबित आदेश नहीं मिला',
    orderId: 'आदेश #',
    newCustomer: 'नया ग्राहक',
    repeatCustomer: 'नियमित ग्राहक',
    qty: 'मात्रा:',
    totalAmount: 'कुल राशि',
    viewDetails: 'विवरण देखें'
  },
  mr: {
    title: 'प्रलंबित ऑर्डर',
    noOrders: 'कोणतेही प्रलंबित ऑर्डर सापडले नाही',
    orderId: 'ऑर्डर #',
    newCustomer: 'नवीन ग्राहक',
    repeatCustomer: 'नियमित ग्राहक',
    qty: 'नग:',
    totalAmount: 'एकूण रक्कम',
    viewDetails: 'तपशील पहा'
  },
  gu: {
    title: 'બાકી ઓર્ડર',
    noOrders: 'કોઈ બાકી ઓર્ડર મળ્યા નથી',
    orderId: 'ઓર્ડર #',
    newCustomer: 'નવા ગ્રાહક',
    repeatCustomer: 'નિયમિત ગ્રાહક',
    qty: 'જથ્થો:',
    totalAmount: 'કુલ રકમ',
    viewDetails: 'વિગતો જુઓ'
  }
};

const PendingOrders = () => {
  const router = useRouter();
  const { language } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Get translations for current language
  const t = translations[language] || translations.en;

  const fetchPendingOrders = async () => {
    try {
      const response = await sellerApi.getPendingOrders();
      if (response.success) {
        setOrders(response.orders);
      }
    } catch (error) {
      console.error('Error fetching pending orders:', error);
      Alert.alert('Error', 'Failed to fetch pending orders');
    }
  };

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchPendingOrders();
    setRefreshing(false);
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'en' ? 'en-IN' : 'hi-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const OrderStatusBadge = ({ isRepeatCustomer }) => (
    <View style={[
      styles.badge,
      { backgroundColor: isRepeatCustomer ? '#4CAF50' : '#2196F3' }
    ]}>
      <Text style={styles.badgeText}>
        {isRepeatCustomer ? t.repeatCustomer : t.newCustomer}
      </Text>
    </View>
  );

  return (
    <>
      <Stack.Screen 
        options={{
          title: t.title,
          headerShown: true,
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: '#6C63FF',
          },
          headerTitleStyle: {
            color: '#fff',
            fontSize: 20,
            fontWeight: 'bold',
          },
          headerLeft: () => (
            <TouchableOpacity 
              style={{ marginLeft: 16 }}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }} 
      />
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={64} color="#666" />
            <Text style={styles.emptyText}>{t.noOrders}</Text>
          </View>
        ) : (
          orders.map((order) => (
            <TouchableOpacity
              key={order._id}
              style={styles.orderCard}
              onPress={() => router.push(`/(seller)/order-details/${order._id}`)}
            >
              <View style={styles.orderHeader}>
                <View style={styles.orderIdContainer}>
                  <Text style={styles.orderId}>{t.orderId}{order._id.slice(-6)}</Text>
                  <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
                </View>
                <OrderStatusBadge isRepeatCustomer={order.buyer.orderCount > 1} />
              </View>

              <View style={styles.customerSection}>
                <View style={styles.customerInfo}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="person-circle" size={24} color="#6C63FF" />
                  </View>
                  <Text style={styles.customerName}>
                    {order.buyer.firstname} {order.buyer.lastname}
                  </Text>
                </View>
                <View style={styles.addressInfo}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="location-outline" size={24} color="#666" />
                  </View>
                  <Text style={styles.addressText} numberOfLines={2}>
                    {order.shippingAddress?.street}, {order.shippingAddress?.city}, 
                    {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                  </Text>
                </View>
              </View>

              <View style={styles.itemsContainer}>
                {order.items.map((item, index) => {
                  if (!item.product) return null;
                  
                  return (
                    <View key={index} style={styles.itemRow}>
                      <Image 
                        source={{ uri: item.product.images[0] }} 
                        style={styles.productImage}
                      />
                      <View style={styles.itemDetails}>
                        <Text style={styles.itemName} numberOfLines={1}>
                          {item.product.name}
                        </Text>
                        <View style={styles.itemMetrics}>
                          <Text style={styles.itemQuantity}>{t.qty} {item.quantity}</Text>
                          <Text style={styles.itemPrice}>₹{item.price}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>

              <View style={styles.totalContainer}>
                <View>
                  <Text style={styles.totalLabel}>{t.totalAmount}</Text>
                  <Text style={styles.totalAmount}>
                    ₹{order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.viewDetailsButton}
                  onPress={() => router.push(`/(seller)/order-details/${order._id}`)}
                >
                  <Text style={styles.viewDetailsText}>{t.viewDetails}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#6C63FF" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  orderCard: {
    backgroundColor: '#FFF',
    margin: 12,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderIdContainer: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  customerSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 8,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    lineHeight: 20,
  },
  itemsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  itemMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 2,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewDetailsText: {
    color: '#6C63FF',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  replySection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  replyCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  replyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  replyUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  replyUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 2,
  },
  replyDate: {
    fontSize: 12,
    color: '#666',
  },
  replyComment: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});

export default PendingOrders; 
 