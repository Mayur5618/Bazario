import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  StatusBar,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from '../config/axios';

const CheckoutScreen = () => {
  const router = useRouter();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [newAddress, setNewAddress] = useState('');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNewAddressInput, setShowNewAddressInput] = useState(false);

  // Fetch saved addresses when component mounts
  useEffect(() => {
    if (user) {
      fetchSavedAddresses();
    }
  }, [user]);

  const fetchSavedAddresses = async () => {
    try {
      const response = await axios.get('/api/users/addresses', {
        params: { userId: user._id }
      });
      
      if (response.data.success) {
        setSavedAddresses(response.data.addresses || []);
        // Set first address as default selected
        if (response.data.addresses && response.data.addresses.length > 0) {
          setSelectedAddress(response.data.addresses[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      Alert.alert('Error', 'Failed to load saved addresses');
    }
  };

  const handleAddressSelection = (address) => {
    event.preventDefault();
    setSelectedAddress(address);
    setShowNewAddressInput(false);
  };

  const handleNewAddress = () => {
    setShowNewAddressInput(true);
    setSelectedAddress(null); // Clear selected address when adding new
  };

  const handlePlaceOrder = async () => {
    const deliveryAddress = selectedAddress || newAddress.trim();
    
    if (!deliveryAddress) {
      Alert.alert('Error', 'Please select or enter delivery address');
      return;
    }

    try {
      setLoading(true);
      
      // Add your order placement API call here
      const response = await axios.post('/api/orders/create', {
        userId: user._id,
        items: Object.values(cartItems),
        address: deliveryAddress,
        totalAmount: cartTotal
      });

      if (response.data.success) {
        clearCart();
        Alert.alert(
          'Success',
          'Order placed successfully!',
          [{ text: 'OK', onPress: () => router.push('/(app)/orders') }]
        );
      }
    } catch (error) {
      console.error('Order error:', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#4169E1" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.rightHeader} />
      </View>

      <ScrollView style={styles.content}>
        {/* Delivery Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Delivery Address</Text>
          
          {/* Modified Saved Addresses */}
          {savedAddresses.map((address, index) => (
            <View key={index} style={styles.addressWrapper}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={[
                  styles.addressCard,
                  selectedAddress === address && styles.selectedAddressCard
                ]}
                onPress={() => {
                  setSelectedAddress(address);
                  setShowNewAddressInput(false);
                }}
              >
                <View style={styles.radioButton}>
                  <View style={[
                    styles.radioCircle,
                    selectedAddress === address && styles.radioCircleSelected
                  ]} />
                </View>
                <Text style={styles.addressText}>{address}</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Add New Address Button */}
          <TouchableOpacity
            style={styles.addAddressButton}
            onPress={handleNewAddress}
          >
            <Ionicons name="add-circle-outline" size={24} color="#4169E1" />
            <Text style={styles.addAddressText}>Add New Address</Text>
          </TouchableOpacity>

          {/* New Address Input */}
          {showNewAddressInput && (
            <TextInput
              style={styles.addressInput}
              placeholder="Enter your delivery address"
              value={newAddress}
              onChangeText={setNewAddress}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          )}
        </View>

        {/* Order Summary Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {Object.values(cartItems).map((item) => (
            <View key={item.product._id} style={styles.itemRow}>
              <Image 
                source={{ uri: item.product.images[0] }} 
                style={styles.productImage}
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.product.name}</Text>
                <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
                <Text style={styles.itemPrice}>₹{item.product.price * item.quantity}</Text>
              </View>
            </View>
          ))}

          {/* Total Section */}
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalAmount}>₹{cartTotal}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <TouchableOpacity
        style={[styles.placeOrderButton, loading && styles.disabledButton]}
        onPress={handlePlaceOrder}
        disabled={loading}
      >
        <Text style={styles.placeOrderButtonText}>
          {loading ? 'Placing Order...' : `Place Order • ₹${cartTotal}`}
        </Text>
      </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  rightHeader: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1A1A1A',
  },
  addressInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    fontSize: 16,
  },
  itemRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4169E1',
  },
  totalSection: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4169E1',
  },
  placeOrderButton: {
    backgroundColor: '#4169E1',
    margin: 16,
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
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  addressWrapper: {
    marginBottom: 12,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    backgroundColor: '#FFF',
  },
  selectedAddressCard: {
    borderColor: '#4169E1',
    backgroundColor: '#F5F8FF',
  },
  addressText: {
    marginLeft: 12,
    fontSize: 14,
    flex: 1,
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginTop: 8,
  },
  addAddressText: {
    marginLeft: 8,
    color: '#4169E1',
    fontSize: 16,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4169E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  radioCircleSelected: {
    backgroundColor: '#4169E1',
  },
});

export default CheckoutScreen; 