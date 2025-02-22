import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Toast from 'react-native-toast-message';

const ProductCard = ({ product }) => {
  const router = useRouter();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        'Please login to add items to cart',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => router.push('/(auth)/login') }
        ]
      );
      return;
    }

    try {
      setLoading(true);
      // Debug log
      console.log('Adding product to cart:', product._id);
      
      await addToCart(product._id, 1);
      
      Toast.show({
        type: 'success',
        text1: 'Added to cart successfully',
        position: 'bottom'
      });
    } catch (error) {
      console.error('Add to cart error:', error);
      Toast.show({
        type: 'error',
        text1: error.response?.data?.message || 'Failed to add to cart',
        position: 'bottom'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push(`/(app)/product/${product._id}`)}
    >
      <Image 
        source={{ uri: product.images[0] }} 
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.price}>₹{product.price}</Text>
        
        <TouchableOpacity 
          style={[styles.addButton, loading && styles.addButtonDisabled]}
          onPress={handleAddToCart}
          disabled={loading}
        >
          <Text style={styles.addButtonText}>
            {loading ? 'Adding...' : 'Add'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    margin: 8,
    flex: 1,
  },
  image: {
    width: '100%',
    height: 150,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B6BFB',
  },
  addButton: {
    backgroundColor: '#4B0082',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 6,
    gap: 4,
  },
  addButtonDisabled: {
    opacity: 0.7,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ProductCard; 