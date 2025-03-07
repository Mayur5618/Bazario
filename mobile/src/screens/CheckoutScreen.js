import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  Image,
  Dimensions,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from '../config/axios';
import { useDispatch } from 'react-redux';
import { clearCart as clearReduxCart } from '../store/slices/cartSlice';

const { width } = Dimensions.get('window');

const CheckoutScreen = () => {
  const router = useRouter();
  const { cartItems, cartTotal, getCart, setCartItems } = useCart();
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  
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

  // Automatically fetch user profile when component mounts
  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
    // Fetch cart items when component mounts
    getCart();
  }, [user]); // Re-run when user changes

  // Fetch user profile for auto-fill
  const fetchUserProfile = async () => {
    setIsProfileLoading(true);
    try {
      // Check if user is logged in
      if (!user) {
        console.log('No user found in context:', user);
        Alert.alert('Login Required', 'Please login to auto-fill your details.');
        return;
      }

      console.log('Fetching user profile with token:', user.token);
      const response = await axios.get('/api/users/profile');  // Changed endpoint to /api/users/profile
      console.log('API Response:', response.data);
      
      if (response.data && response.data.user) {
        const userData = response.data.user;
        console.log('User data received:', userData);
        setFormData({
          ...formData,
          firstName: userData.firstname || userData.firstName || '',
          lastName: userData.lastname || userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || userData.mobileno || '',
          street: userData.address || userData.street || '',
          city: userData.city || '',
          state: userData.state || '',
          pincode: userData.pincode || userData.zipcode || '',
          paymentMethod: 'COD'
        });
        Alert.alert('Success', 'Profile details loaded successfully!');
      } else {
        console.log('No user data in response:', response.data);
        throw new Error('No profile data found');
      }
    } catch (error) {
      console.error('Profile fetch error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to load profile. Please try again.'
      );
    } finally {
      setIsProfileLoading(false);
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.firstName) errors.push('First name is required');
    if (!formData.lastName) errors.push('Last name is required');
    if (!formData.email) errors.push('Email is required');
    if (!/\S+@\S+\.\S+/.test(formData.email)) errors.push('Invalid email format');
    if (!formData.phone) errors.push('Phone number is required');
    if (!/^\d{10}$/.test(formData.phone)) errors.push('Invalid phone number');
    if (!formData.street) errors.push('Street address is required');
    if (!formData.city) errors.push('City is required');
    if (!formData.state) errors.push('State is required');
    if (!formData.pincode) errors.push('Pincode is required');
    if (!/^\d{6}$/.test(formData.pincode)) errors.push('Invalid pincode');

    if (errors.length > 0) {
      Alert.alert('Validation Error', errors.join('\n'));
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      return;
    }

    if (!cartItems || Object.keys(cartItems).length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    try {
      setLoading(true);
      
      // Prepare order items
      const orderItems = Object.values(cartItems).map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
        seller: item.seller._id
      }));

      console.log('Cart Items:', cartItems);
      console.log('Order Items:', orderItems);
      
      const orderData = {
        items: orderItems,
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
        totalAmount: cartTotal
      };

      console.log('Sending order data:', orderData);
      
      const response = await axios.post('/api/orders/create', orderData);

      console.log('Order response:', response.data);

      if (response.data && response.data.success) {
        const orderId = response.data.orders[0]._id;
        
        // Show success popup first
        Alert.alert(
          'Order Successful! 🎉',
          'Your order has been placed successfully. Thank you for shopping with us!',
          [
            {
              text: 'View Order',
              onPress: async () => {
                try {
                  // Clear cart in Redux
                  dispatch(clearReduxCart());
                  
                  // Clear cart items state
                  setCartItems({});
                  
                  // Navigate to success screen with correct route
                  router.push({
                    pathname: '/orders/[orderId]',
                    params: { orderId }
                  });
                } catch (error) {
                  console.error('Error clearing cart:', error);
                  // Still navigate even if cart clearing fails
                  router.push({
                    pathname: '/orders/[orderId]',
                    params: { orderId }
                  });
                }
              }
            }
          ],
          { cancelable: false }
        );
      } else {
        throw new Error(response.data?.message || 'Invalid response from server');
      }
    } catch (error) {
      console.error('Order error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || error.message || 'Failed to place order. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, value, onChangeText, placeholder, keyboardType = 'default', error, multiline = false }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label} *</Text>
      <TextInput
        style={[
          styles.input, 
          error && styles.inputError,
          multiline && styles.multilineInput
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        autoCapitalize="words"
        autoCorrect={false}
        blurOnSubmit={!multiline}
        returnKeyType={multiline ? 'default' : 'next'}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView 
          style={styles.content} 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Auto-fill Button */}
          <TouchableOpacity
            style={styles.autoFillButton}
            onPress={fetchUserProfile}
            disabled={isProfileLoading}
          >
            <Ionicons name="person" size={20} color="#fff" />
            <Text style={styles.autoFillButtonText}>
              {isProfileLoading ? 'Loading Profile...' : 'Auto-fill My Details'}
            </Text>
          </TouchableOpacity>

          {/* Shipping Details Form */}
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Shipping Details</Text>
            
            <InputField
              label="First Name"
              value={formData.firstName}
              onChangeText={(text) => setFormData({...formData, firstName: text})}
              placeholder="Enter your first name"
              autoCapitalize="words"
            />

            <InputField
              label="Last Name"
              value={formData.lastName}
              onChangeText={(text) => setFormData({...formData, lastName: text})}
              placeholder="Enter your last name"
              autoCapitalize="words"
            />

            <InputField
              label="Email"
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <InputField
              label="Phone Number"
              value={formData.phone}
              onChangeText={(text) => setFormData({...formData, phone: text})}
              placeholder="Enter 10-digit phone number"
              keyboardType="phone-pad"
            />

            <InputField
              label="Street Address"
              value={formData.street}
              onChangeText={(text) => setFormData({...formData, street: text})}
              placeholder="Enter your street address"
              multiline={true}
            />

            <InputField
              label="City"
              value={formData.city}
              onChangeText={(text) => setFormData({...formData, city: text})}
              placeholder="Enter your city"
              autoCapitalize="words"
            />

            <InputField
              label="State"
              value={formData.state}
              onChangeText={(text) => setFormData({...formData, state: text})}
              placeholder="Enter your state"
              autoCapitalize="words"
            />

            <InputField
              label="Pincode"
              value={formData.pincode}
              onChangeText={(text) => setFormData({...formData, pincode: text})}
              placeholder="Enter 6-digit pincode"
              keyboardType="numeric"
            />
          </View>

          {/* Payment Method */}
          <View style={styles.paymentSection}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <View style={styles.paymentOption}>
              <Ionicons name="cash-outline" size={24} color="#4CAF50" />
              <Text style={styles.paymentText}>Cash on Delivery</Text>
            </View>
          </View>

          {/* Order Summary Section */}
          <View style={styles.orderSummaryContainer}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            {/* Display cart items */}
            {Object.values(cartItems).map((item) => (
              <View key={item.product._id} style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  {item.product.name} (x{item.quantity})
                </Text>
                <Text style={styles.summaryValue}>
                  ₹{item.product.price * item.quantity}
                </Text>
              </View>
            ))}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery:</Text>
              <Text style={styles.summaryValue}>Free</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalValue}>₹{cartTotal}</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Place Order Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.placeOrderButton, loading && styles.disabledButton]}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.placeOrderButtonText}>Place Order</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90, // Add extra padding at bottom for Place Order button
  },
  autoFillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4169E1',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  autoFillButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 48,
  },
  inputError: {
    borderColor: '#ff4444',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 4,
  },
  paymentSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 8,
  },
  paymentText: {
    marginLeft: 12,
    fontSize: 16,
  },
  orderSummaryContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    elevation: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  placeOrderButton: {
    backgroundColor: '#4169E1',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  placeOrderButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.7,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
});

export default CheckoutScreen; 