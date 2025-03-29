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
import { useRouter } from 'expo-router';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
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

  const handlePlaceOrder = async () => {
    // First validate if cart has items
    if (!cartItems || Object.keys(cartItems).length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Your cart is empty',
        text2: 'Please add items to cart before placing order'
      });
      return;
    }

    // Convert cart items object to array
    const cartItemsArray = Object.values(cartItems);

    // Validate all fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'street', 'city', 'state', 'pincode'];
    const emptyFields = requiredFields.filter(field => !formData[field]);
    
    if (emptyFields.length > 0) {
      Toast.show({
        type: 'error',
        text1: 'Please fill all required fields',
        text2: `Missing: ${emptyFields.join(', ')}`
      });
      return;
    }

    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(formData.email)) {
      Toast.show({
        type: 'error',
        text1: 'Please enter a valid email address'
      });
      return;
    }

    // Validate phone number (assuming Indian format)
    if (!/^\d{10}$/.test(formData.phone)) {
      Toast.show({
        type: 'error',
        text1: 'Please enter a valid 10-digit phone number'
      });
      return;
    }

    try {
      setLoading(true);
      
      // Format shipping address according to the API requirements
      const orderData = {
        shippingAddress: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: 'India',
          fullName: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          phone: formData.phone
        },
        paymentMethod: formData.paymentMethod,
        items: cartItemsArray.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.price
        }))
      };

      console.log('Sending order data:', orderData);

      const response = await axios.post('/api/orders/create', orderData);

      if (response.data && response.data.success) {
        // Clear cart after successful order
        if (setCartItems) {
          setCartItems({});
        }
        dispatch(clearReduxCart());
        
        Toast.show({
          type: 'success',
          text1: 'Order placed successfully!',
          text2: `Order ID: ${response.data.orders[0].orderId}`
        });
        
        // Navigate to order success page with the order ID
        router.push({
          pathname: '/order-success/[orderId]',
          params: { orderId: response.data.orders[0]._id }
        });
      }
    } catch (error) {
      console.error('Order placement error:', error);
      let errorMessage = 'Please try again';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Toast.show({
        type: 'error',
        text1: 'Failed to place order',
        text2: errorMessage
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
            <View style={styles.summaryItem}>
              <Text>Ganpati Bappa with Hanuman (x1)</Text>
              <Text>₹3500</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text>Delivery:</Text>
              <Text>Free</Text>
            </View>
            <View style={[styles.summaryItem, styles.totalAmount]}>
              <Text style={styles.totalText}>Total Amount:</Text>
              <Text style={styles.totalText}>₹3500</Text>
            </View>
          </View>

          {/* Place Order Button */}
          <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder}>
            <Text style={styles.placeOrderText}>Place Order</Text>
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
});

export default CheckoutScreen;
