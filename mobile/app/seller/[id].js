import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  RefreshControl
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from '../../src/config/axios';
import { Rating } from 'react-native-ratings';
import Toast from 'react-native-toast-message';

const SellerProfileScreen = () => {
  const { id } = useLocalSearchParams();
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    averageRating: 0,
    totalCustomers: 0
  });

  const fetchSellerDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/sellers/${id}`);
      setSeller(response.data.seller);
      setProducts(response.data.products || []);
      setStats(response.data.stats || {});
    } catch (error) {
      console.error('Error fetching seller details:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to load seller details'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerDetails();
  }, [id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSellerDetails();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4169E1" />
      </View>
    );
  }

  if (!seller) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Seller not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seller Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={styles.scrollView}
      >
        {/* Seller Info Card */}
        <View style={styles.sellerCard}>
          <View style={styles.sellerHeader}>
            <View style={styles.sellerImageContainer}>
              {seller.profileImage ? (
                <Image
                  source={{ uri: seller.profileImage }}
                  style={styles.sellerImage}
                />
              ) : (
                <View style={styles.sellerImagePlaceholder}>
                  <Text style={styles.sellerImagePlaceholderText}>
                    {seller.shopName?.[0]?.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.sellerInfo}>
              <Text style={styles.shopName}>{seller.shopName}</Text>
              <View style={styles.ratingContainer}>
                <Rating
                  type="custom"
                  readonly
                  startingValue={stats.averageRating || 0}
                  imageSize={16}
                  style={styles.rating}
                />
                <Text style={styles.ratingText}>
                  {stats.averageRating?.toFixed(1) || 'New'}
                </Text>
              </View>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalProducts}</Text>
              <Text style={styles.statLabel}>Products</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalCustomers}</Text>
              <Text style={styles.statLabel}>Customers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>₹{stats.totalSales}</Text>
              <Text style={styles.statLabel}>Sales</Text>
            </View>
          </View>
        </View>

        {/* Products Section */}
        <View style={styles.productsSection}>
          <Text style={styles.sectionTitle}>Products</Text>
          <View style={styles.productsGrid}>
            {products.map((product) => (
              <TouchableOpacity
                key={product._id}
                style={styles.productCard}
                onPress={() => router.push(`/product/${product._id}`)}
              >
                <Image
                  source={{ uri: product.images[0] }}
                  style={styles.productImage}
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text style={styles.productPrice}>₹{product.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
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
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
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
    color: '#666',
  },
  sellerCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sellerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sellerImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    marginRight: 16,
  },
  sellerImage: {
    width: '100%',
    height: '100%',
  },
  sellerImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#4169E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerImagePlaceholderText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '600',
  },
  sellerInfo: {
    flex: 1,
  },
  shopName: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4169E1',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  productsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: (Dimensions.get('window').width - 48) / 2,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 8,
  },
  productName: {
    fontSize: 14,
    marginBottom: 4,
    height: 40,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4169E1',
  },
});

export default SellerProfileScreen; 