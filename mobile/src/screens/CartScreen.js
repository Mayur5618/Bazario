import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const { width, height } = Dimensions.get('window');

const CartScreen = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { cartItems, loading, getCart, updateQuantity } = useCart();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    }
  }, [isAuthenticated]);

  const loadCart = async () => {
    try {
      setIsLoading(true);
      await getCart();
    } catch (error) {
      console.error('Error loading cart:', error);
      Alert.alert('Error', 'Failed to load cart items');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) {
      Alert.alert(
        'Remove Item',
        'Do you want to remove this item from cart?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: async () => {
              try {
                await updateQuantity(productId, 0);
              } catch (error) {
                Alert.alert('Error', 'Failed to remove item');
              }
            }
          }
        ]
      );
    } else {
      try {
        await updateQuantity(productId, newQuantity);
      } catch (error) {
        Alert.alert('Error', 'Failed to update quantity');
      }
    }
  };

  const calculateTotal = () => {
    return Object.values(cartItems).reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.messageText}>Please login to view your cart</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4B0082" />
      </View>
    );
  }

  const cartItemsArray = Object.values(cartItems);

  if (cartItemsArray.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />
        
        <View style={styles.emptyCartContainer}>
          <View style={styles.emptyCartContent}>
            <Ionicons name="cart-outline" size={80} color="#4169E1" style={styles.emptyCartIcon} />
            
            <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
            <Text style={styles.emptyCartMessage}>
              Looks like you haven't made your choice yet...
            </Text>
            
            <TouchableOpacity
              style={styles.startShoppingButton}
              onPress={() => router.push('/(app)')}
            >
              <Text style={styles.startShoppingButtonText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>My Cart</Text>
        <View style={styles.rightHeader}>
          <TouchableOpacity onPress={() => router.push('/(app)/search')}>
            <Ionicons name="search" size={24} color="#4169E1" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.cartList}>
        {cartItemsArray.map((item) => (
          <View key={item.product._id} style={styles.cartItem}>
            <Image
              source={{ uri: item.product.images[0] }}
              style={styles.productImage}
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.product.name}</Text>
              <Text style={styles.productPrice}>₹{item.product.price}</Text>
              
              <View style={styles.quantityControl}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleUpdateQuantity(item.product._id, item.quantity, -1)}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                
                <Text style={styles.quantityText}>{item.quantity}</Text>
                
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleUpdateQuantity(item.product._id, item.quantity, 1)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Total:</Text>
          <Text style={styles.totalAmount}>₹{calculateTotal()}</Text>
        </View>
        
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() => router.push('/(app)/checkout')}
        >
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    elevation: 2, // for Android shadow
    shadowColor: '#000', // for iOS shadow
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  messageText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#4169E1',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  shopButton: {
    backgroundColor: '#4169E1',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cartList: {
    flex: 1,
  },
  cartItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
    color: '#4169E1',
    fontWeight: '600',
    marginBottom: 8,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  quantityButton: {
    padding: 8,
  },
  quantityButtonText: {
    fontSize: 18,
    color: '#4169E1',
    fontWeight: '600',
  },
  quantityText: {
    fontSize: 16,
    marginHorizontal: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  totalText: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4169E1',
  },
  checkoutButton: {
    backgroundColor: '#4169E1',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  emptyCartContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
    width: '100%',
  },
  emptyCartIcon: {
    marginBottom: 20,
  },
  emptyCartTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyCartMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  startShoppingButton: {
    backgroundColor: '#4169E1',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
    width: '80%',
    alignItems: 'center',
  },
  startShoppingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CartScreen; 