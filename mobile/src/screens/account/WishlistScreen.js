// mobile/src/screens/account/WishlistScreen.js
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  StyleSheet,
  Alert 
} from 'react-native';
import { useWishlist } from '../../contexts/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from '../../config/axios';

const WishlistScreen = () => {
  const { wishlistItems, removeFromWishlist, getWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch wishlist products with details
  const fetchWishlistProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/wishlist');
      console.log('Wishlist Response:', response.data); // Debug log

      if (response.data.success) {
        const products = response.data.wishlist || [];
        console.log('Fetched Products:', products); // Debug log
        setWishlistProducts(products);
      } else {
        throw new Error(response.data.message || 'Failed to fetch wishlist');
      }
    } catch (error) {
      console.error('Error fetching wishlist products:', error);
      Alert.alert('Error', 'Failed to load wishlist items');
      setWishlistProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlistProducts();
    } else {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated]);

  const handleRemoveFromWishlist = async (productId) => {
    try {
      const response = await axios.delete(`/api/wishlist/remove/${productId}`);
      if (response.data.success) {
        await fetchWishlistProducts(); // Refresh the list after removal
        Alert.alert('Success', 'Product removed from wishlist');
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      Alert.alert('Error', 'Failed to remove product from wishlist');
    }
  };

  const handleViewDetails = (productId) => {
    router.push({
      pathname: "/(app)/product/[id]",
      params: { id: productId }
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading wishlist...</Text>
      </View>
    );
  }

  if (!wishlistProducts?.length) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="heart-outline" size={64} color="#ccc" />
        <Text style={styles.emptyText}>Your wishlist is empty</Text>
        <TouchableOpacity 
          style={styles.shopNowButton}
          onPress={() => router.push('/(app)')}
        >
          <Text style={styles.shopNowText}>Shop Now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderWishlistItem = ({ item }) => (
    <View style={styles.productCard}>
      <Image 
        source={{ uri: item.images[0] }} 
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productPrice}>₹{item.price}</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.viewButton}
            onPress={() => handleViewDetails(item._id)}
          >
            <Text style={styles.buttonText}>View Details</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={() => handleRemoveFromWishlist(item._id)}
          >
            <Ionicons name="trash-outline" size={20} color="#FF4B4B" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={wishlistProducts}
        renderItem={renderWishlistItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  listContainer: {
    padding: 16
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between'
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  viewButton: {
    backgroundColor: '#4169E1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginRight: 12
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500'
  },
  removeButton: {
    padding: 8
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24
  },
  shopNowButton: {
    backgroundColor: '#FF4B4B',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8
  },
  shopNowText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500'
  }
});

export default WishlistScreen;