import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
  SafeAreaView,
  StatusBar,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import axios from '../config/axios';
import Toast from 'react-native-toast-message';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useDispatch } from 'react-redux';
import { clearCart as clearReduxCart } from '../store/slices/cartSlice';

const { width } = Dimensions.get('window');

const CheckoutScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { cartItems, cartTotal, getCart } = useCart();
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'COD'
  });

  // Fetch cart data when component mounts
  useEffect(() => {
    fetchCartData();
  }, []);

  const fetchCartData = async () => {
    try {
      const response = await axios.get('/api/cart/getCartItems');
      if (response.data.success) {
        setCart(response.data.cart);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to load cart items'
      });
    }
  };

  // Parse items from params for direct order
  const orderItems = params.items ? JSON.parse(params.items) : null;
  const totalAmount = params.totalAmount ? parseFloat(params.totalAmount) : 0;
  const isBuyNow = params.buyNow === 'true';
  const isDirectOrder = params.directOrder === 'true';

  // Fetch saved addresses
  const fetchSavedAddresses = async () => {
    try {
      const response = await axios.get('/api/shipping-addresses');
      if (response.data && response.data.addresses) {
        setSavedAddresses(response.data.addresses);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to fetch saved addresses'
      });
    }
  };

  // Fetch user profile for auto-fill
  const fetchUserProfile = async () => {
    setIsProfileLoading(true);
    try {
      const response = await axios.get('/api/users/profile');
      console.log('Profile Response:', response.data);
      
      if (response.data && response.data.user) {
        const userData = response.data.user;
        setFormData({
          ...formData,
          firstName: userData.firstname || '',
          lastName: userData.lastname || '',
          email: userData.email || '',
          phone: userData.phone || '',
          street: userData.address || '',
          city: userData.city || '',
          state: userData.state || '',
          pincode: userData.pincode || '',
          paymentMethod: 'COD'
        });
        Toast.show({
          type: 'success',
          text1: 'Profile data loaded successfully'
        });
      } else {
        throw new Error('Invalid profile data received');
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to load profile data'
      });
    } finally {
      setIsProfileLoading(false);
      setShowAddressModal(false);
    }
  };

  // Load addresses when component mounts
  useEffect(() => {
    if (user) {
      fetchSavedAddresses();
    }
  }, [user]);

  const AddressModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showAddressModal}
      onRequestClose={() => setShowAddressModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Choose Auto-fill Source</Text>
          
          <TouchableOpacity 
            style={[styles.modalOption, isProfileLoading && styles.disabledButton]}
            onPress={fetchUserProfile}
            disabled={isProfileLoading}
          >
            <Ionicons name="person-outline" size={24} color="#4169E1" />
            <Text style={styles.modalOptionText}>
              {isProfileLoading ? 'Loading Profile...' : 'Use Profile Data'}
            </Text>
            {isProfileLoading && (
              <ActivityIndicator size="small" color="#4169E1" style={styles.loader} />
            )}
          </TouchableOpacity>

          <Text style={styles.savedAddressesTitle}>Saved Addresses</Text>
          
          {savedAddresses.length > 0 ? (
            savedAddresses.map((address, index) => (
              <TouchableOpacity
                key={address._id || index}
                style={styles.savedAddressItem}
                onPress={() => handleAutoFillFromAddress(address)}
              >
                <Ionicons name="location-outline" size={24} color="#4169E1" />
                <View style={styles.savedAddressDetails}>
                  <Text style={styles.savedAddressName}>{address.name}</Text>
                  <Text style={styles.savedAddressText}>
                    {address.street}, {address.city}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noAddressText}>No saved addresses found</Text>
          )}

          <TouchableOpacity 
            style={styles.modalCloseButton}
            onPress={() => setShowAddressModal(false)}
          >
            <Text style={styles.modalCloseButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const handleAutoFillFromAddress = (address) => {
    try {
      // Split the full name and handle last name correctly
      const nameParts = address.name.trim().split(' ');
      const firstName = nameParts[0] || ''; // First word is first name
      const lastName = nameParts.slice(1).join(' ') || ''; // Rest of the words form last name

      setFormData({
        ...formData,
        firstName,
        lastName,
        email: address.email || user?.email || '',
        phone: address.phone || '',
        street: address.street || '',
        city: address.city || '',
        state: address.state || '',
        pincode: address.pincode || '',
        paymentMethod: 'COD'
      });

      setShowAddressModal(false);
      Toast.show({
        type: 'success',
        text1: 'Address loaded successfully'
      });
    } catch (error) {
      console.error('Error auto-filling address:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to load address data'
      });
    }
  };

  // Add this function to get items to display
  const getOrderItems = () => {
    if (isDirectOrder && orderItems) {
      return orderItems;
    }
    // Return cart items from the fetched cart
    return cart?.items || [];
  };

  // Update calculate total function
  const calculateTotal = () => {
    if (isDirectOrder && orderItems) {
      return totalAmount;
    }
    
    const items = getOrderItems();
    if (!items || items.length === 0) return 0;

    return items.reduce((total, item) => {
      const price = item.product?.price || 0;
      const quantity = item.quantity || 0;
      return total + (price * quantity);
    }, 0);
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      Toast.show({
        type: 'error',
        text1: 'Please login to place order',
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 30,
        position: 'top'
      });
      router.push('/login');
      return;
    }

    // Validate form data
    const { firstName, lastName, email, phone, street, city, state, pincode } = formData;
    if (!firstName || !lastName || !email || !phone || !street || !city || !state || !pincode) {
      Toast.show({
        type: 'error',
        text1: 'Please fill all required fields',
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 30,
        position: 'top'
      });
      return;
    }

    setLoading(true);
    try {
      // Create order payload
      const orderData = {
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: 'India'
        },
        paymentMethod: formData.paymentMethod,
        buyNow: isDirectOrder
      };

      // Add items based on order type
      if (isDirectOrder) {
        // For direct orders (Shop Now)
        orderData.items = orderItems.map(item => ({
          product: {
            _id: item.product._id
          },
          quantity: item.quantity
        }));
      } else {
        // For cart orders
        if (!cart || !cart.items) {
          throw new Error('Cart is empty');
        }
        orderData.items = cart.items.map(item => ({
          product: item.product._id,
          quantity: item.quantity
        }));
      }

      // Choose API endpoint based on order type
      const endpoint = isDirectOrder ? '/api/orders/create-direct' : '/api/orders/create';
      
      const response = await axios.post(endpoint, orderData, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (response.data.success) {
        // Clear cart only for cart orders
        if (!isDirectOrder) {
          await dispatch(clearReduxCart());
        }

        // Get order ID from response
        const orderId = isDirectOrder ? 
          response.data.order?._id : 
          response.data.orders?.[0]?._id;

        if (orderId) {
          Toast.show({
            type: 'success',
            text1: 'Order placed successfully!',
            visibilityTime: 2000,
            autoHide: true,
            topOffset: 30,
            position: 'top'
          });
          
          // Add a small delay before navigation
          setTimeout(() => {
            router.replace(`/order-success/${orderId}`);
          }, 1500);
          return;
        }
        
        Toast.show({
          type: 'error',
          text1: 'Order placed but could not get order details',
          visibilityTime: 2000,
          autoHide: true,
          topOffset: 30,
          position: 'top'
        });
        router.push('/orders');
      } else {
        throw new Error(response.data.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Order creation error:', error);
      Toast.show({
        type: 'error',
        text1: error.response?.data?.message || 'Failed to create order',
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 30,
        position: 'top'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        enabled
      >
        <ScrollView 
          style={styles.content} 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
          showsVerticalScrollIndicator={false}
        >
          <AddressModal />

          {/* Auto-fill Button */}
          <TouchableOpacity
            style={styles.autoFillButton}
            onPress={() => setShowAddressModal(true)}
          >
            <Ionicons name="person" size={20} color="#fff" />
            <Text style={styles.autoFillButtonText}>
              Auto-fill My Details
            </Text>
          </TouchableOpacity>

          {/* Shipping Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shipping Details</Text>
            
            <TextInput
              style={styles.input}
              placeholder="First Name *"
              value={formData.firstName}
              onChangeText={(text) => setFormData({...formData, firstName: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Last Name *"
              value={formData.lastName}
              onChangeText={(text) => setFormData({...formData, lastName: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Email *"
              keyboardType="email-address"
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Phone Number *"
              keyboardType="phone-pad"
              maxLength={10}
              value={formData.phone}
              onChangeText={(text) => setFormData({...formData, phone: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Street Address *"
              value={formData.street}
              onChangeText={(text) => setFormData({...formData, street: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="City *"
              value={formData.city}
              onChangeText={(text) => setFormData({...formData, city: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="State *"
              value={formData.state}
              onChangeText={(text) => setFormData({...formData, state: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Pincode *"
              keyboardType="numeric"
              maxLength={6}
              value={formData.pincode}
              onChangeText={(text) => setFormData({...formData, pincode: text})}
            />
          </View>

          {/* Payment Method */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <View style={styles.paymentOption}>
              <MaterialIcons name="money" size={24} color="green" />
              <Text style={styles.paymentText}>Cash on Delivery</Text>
            </View>
          </View>

          {/* Order Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            
            {getOrderItems().length > 0 ? (
              <>
                {/* Products List */}
                {getOrderItems().map((item, index) => (
                  <View key={index} style={styles.orderItem}>
                    <View style={styles.productInfo}>
                      <View style={styles.productDetails}>
                        <Text style={styles.productName} numberOfLines={2}>
                          {item.product?.name || 'Product'}
                        </Text>
                        <Text style={styles.productMeta}>
                          Quantity: {item.quantity || 0}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.productPrice}>
                      ₹{((item.product?.price || 0) * (item.quantity || 0)).toFixed(2)}
                    </Text>
                  </View>
                ))}

                {/* Divider */}
                <View style={styles.divider} />

                {/* Price Details */}
                <View style={styles.priceDetails}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Subtotal:</Text>
                    <Text style={styles.summaryValue}>₹{calculateTotal().toFixed(2)}</Text>
                  </View>
                  
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Delivery:</Text>
                    <Text style={styles.summaryValue}>Free</Text>
                  </View>

                  <View style={[styles.summaryItem, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total Amount:</Text>
                    <Text style={styles.totalAmount}>₹{calculateTotal().toFixed(2)}</Text>
                  </View>
                </View>
              </>
            ) : (
              <Text style={styles.emptyCartText}>No items in cart</Text>
            )}
          </View>

          {/* Place Order Button */}
          <TouchableOpacity 
            style={[
              styles.placeOrderButton,
              loading && styles.disabledButton
            ]} 
            onPress={handlePlaceOrder}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.placeOrderText}>Place Order</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  autoFillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285f4',
    margin: 15,
    padding: 12,
    borderRadius: 8,
  },
  autoFillText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
  },
  section: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
  },
  paymentText: {
    marginLeft: 12,
    fontSize: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalAmount: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 8,
    paddingTop: 8,
  },
  totalText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  placeOrderButton: {
    backgroundColor: '#4285f4',
    margin: 15,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  placeOrderText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 15,
  },
  modalOptionText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#1F2937',
  },
  savedAddressesTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 15,
  },
  savedAddressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 10,
  },
  savedAddressDetails: {
    marginLeft: 10,
    flex: 1,
  },
  savedAddressName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  savedAddressText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  modalCloseButton: {
    backgroundColor: '#EF4444',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  modalCloseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.7,
  },
  loader: {
    marginLeft: 10,
  },
  noAddressText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 14,
    marginTop: 10,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 15,
  },
  autoFillButtonText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  productInfo: {
    flex: 1,
    marginRight: 12,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  productMeta: {
    fontSize: 13,
    color: '#6b7280',
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 15,
  },
  priceDetails: {
    gap: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  totalRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  emptyCartText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    paddingVertical: 20,
  },
});

export default CheckoutScreen;