import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from '../config/axios';
import { useAuth } from '../context/AuthContext';

const CartScreen = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [total, setTotal] = useState(0);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
      return;
    }
    fetchCartItems();
  }, [isAuthenticated]);

  const fetchCartItems = async () => {
    try {
      const response = await axios.get('/api/cart/getCartItems');
      if (response.data.success) {
        setCartItems(response.data.cart?.items || []);
        setTotal(response.data.cart?.total || 0);
      } else {
        setCartItems([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCartItems([]);
      setTotal(0);
      Alert.alert('Error', 'Unable to fetch cart items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    try {
      if (newQuantity < 1) {
        await handleRemoveItem(productId);
        return;
      }

      const response = await axios.put(`/api/cart/update/${productId}`, {
        quantity: newQuantity
      });

      if (response.data.success) {
        fetchCartItems();
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      Alert.alert('Error', 'Failed to update quantity');
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      const response = await axios.delete(`/api/cart/remove/${productId}`);

      if (response.data.success) {
        fetchCartItems();
      }
    } catch (error) {
      console.error('Error removing item:', error);
      Alert.alert('Error', 'Failed to remove item');
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      Alert.alert('Error', 'Please enter a coupon code');
      return;
    }

    try {
      const response = await axios.post('/api/cart/apply-coupon', {
        code: couponCode
      });
      
      if (response.data.success) {
        Alert.alert('Success', 'Coupon applied successfully!');
        setTotal(response.data.newTotal);
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to apply coupon');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading cart...</Text>
      </View>
    );
  }

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={80} color="#ccc" />
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => router.push('/(app)/home')}
        >
          <Text style={styles.shopButtonText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : cartItems.length === 0 ? (
        <View style={styles.emptyCart}>
          <Ionicons name="cart-outline" size={64} color="#ccc" />
          <Text style={styles.emptyCartText}>Your cart is empty</Text>
          <TouchableOpacity
            style={styles.continueShopping}
            onPress={() => router.push('/(app)/home')}
          >
            <Text style={styles.continueShoppingText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView style={styles.cartList}>
            {cartItems.map((item) => (
              <View key={item._id} style={styles.cartItem}>
                <Image 
                  source={{ uri: item.product.images[0] }} 
                  style={styles.productImage}
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.product.name}</Text>
                  <Text style={styles.productPrice}>₹{item.product.price}</Text>
                  <View style={styles.quantityControls}>
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                    >
                      <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantity}>{item.quantity}</Text>
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                    >
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveItem(item.product._id)}
                >
                  <Ionicons name="trash-outline" size={24} color="#FF4444" />
                </TouchableOpacity>
              </View>
            ))}

            {/* Coupon Section */}
            <View style={styles.couponContainer}>
              <TextInput
                style={styles.couponInput}
                placeholder="Enter coupon code"
                value={couponCode}
                onChangeText={setCouponCode}
              />
              <TouchableOpacity 
                style={styles.applyButton}
                onPress={handleApplyCoupon}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.summary}>
            <View style={styles.row}>
              <Text style={styles.summaryText}>Subtotal</Text>
              <Text style={styles.summaryValue}>₹{total}</Text>
            </View>
            <TouchableOpacity 
              style={styles.checkoutButton}
              onPress={() => router.push('/(app)/checkout')}
            >
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  cartList: {
    flex: 1,
  },
  cartItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    marginLeft: 16,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
    marginBottom: 8,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    alignSelf: 'flex-start',
    borderRadius: 8,
    padding: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 6,
  },
  quantityButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
  quantity: {
    marginHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  removeButton: {
    padding: 8,
  },
  couponContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 48,
  },
  applyButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    justifyContent: 'center',
    borderRadius: 8,
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  summary: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  checkoutButton: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCartText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  continueShopping: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  continueShoppingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
    fontWeight: '500',
  },
  shopButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    shadowColor: '#2563eb',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CartScreen; 