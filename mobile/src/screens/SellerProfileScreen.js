import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from '../config/axios';
import ProductCard from '../components/ProductCard';
import { LinearGradient } from 'expo-linear-gradient';

const SellerProfileScreen = () => {
  const { id } = useLocalSearchParams();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('trending'); // trending, all, about

  useEffect(() => {
    fetchSellerDetails();
  }, [id]);

  const fetchSellerDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/users/sellers/${id}`);
      if (response.data.success) {
        setSeller(response.data.seller);
        setProducts(response.data.products || []);
      }
    } catch (error) {
      console.error('Error fetching seller details:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSellerDetails();
    setRefreshing(false);
  };

  const getTrendingProducts = () => {
    // Sort products by rating and return top products
    return [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 6);
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

  const renderContent = () => {
    switch (activeTab) {
      case 'trending':
        return (
          <View style={styles.productsGrid}>
            {getTrendingProducts().map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onPress={() => router.push(`/product/${product._id}`)}
              />
            ))}
            {getTrendingProducts().length === 0 && (
              <View style={styles.noProductsContainer}>
                <Ionicons name="trending-up" size={48} color="#666" />
                <Text style={styles.noProductsText}>No trending products yet</Text>
              </View>
            )}
          </View>
        );
      case 'all':
        return (
          <View style={styles.productsGrid}>
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onPress={() => router.push(`/product/${product._id}`)}
              />
            ))}
            {products.length === 0 && (
              <View style={styles.noProductsContainer}>
                <Ionicons name="cube-outline" size={48} color="#666" />
                <Text style={styles.noProductsText}>No products found</Text>
              </View>
            )}
          </View>
        );
      case 'about':
        return (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>About {seller.shopName}</Text>
            <Text style={styles.descriptionText}>
              {seller.description || 'No description available'}
            </Text>
            {seller.businessType && (
              <View style={styles.businessInfo}>
                <Text style={styles.businessInfoTitle}>Business Type</Text>
                <Text style={styles.businessInfoText}>{seller.businessType}</Text>
              </View>
            )}
            {seller.city && seller.state && (
              <View style={styles.businessInfo}>
                <Text style={styles.businessInfoTitle}>Location</Text>
                <Text style={styles.businessInfoText}>{`${seller.city}, ${seller.state}`}</Text>
              </View>
            )}
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seller Profile</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Seller Info Card */}
        <View style={styles.sellerCard}>
          <LinearGradient
            colors={['#4169E1', '#1E90FF']}
            style={styles.sellerGradient}
          >
            <View style={styles.sellerInfo}>
              <View style={styles.sellerImageContainer}>
                {seller.profileImage ? (
                  <Image
                    source={{ uri: seller.profileImage }}
                    style={styles.sellerImage}
                  />
                ) : (
                  <View style={styles.sellerImagePlaceholder}>
                    <Text style={styles.sellerImagePlaceholderText}>
                      {seller.shopName.charAt(0)}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.sellerDetails}>
                <Text style={styles.sellerName}>{seller.shopName}</Text>
                <View style={styles.sellerStats}>
                  <View style={styles.statItem}>
                    <Ionicons name="star" size={20} color="#FFD700" />
                    <Text style={styles.statText}>
                      {seller.rating || "New"}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="cube-outline" size={20} color="#fff" />
                    <Text style={styles.statText}>
                      {products.length} Products
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'trending' && styles.activeTab]}
            onPress={() => setActiveTab('trending')}
          >
            <Text style={[styles.tabText, activeTab === 'trending' && styles.activeTabText]}>
              Trending
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && styles.activeTab]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
              All Products
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'about' && styles.activeTab]}
            onPress={() => setActiveTab('about')}
          >
            <Text style={[styles.tabText, activeTab === 'about' && styles.activeTabText]}>
              About
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content based on active tab */}
        {renderContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
  },
  scrollView: {
    flex: 1,
  },
  sellerCard: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  sellerGradient: {
    padding: 20,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#fff',
  },
  sellerImage: {
    width: '100%',
    height: '100%',
  },
  sellerImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerImagePlaceholderText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#4169E1',
  },
  sellerDetails: {
    marginLeft: 16,
    flex: 1,
  },
  sellerName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  sellerStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 4,
  },
  descriptionContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#4169E1',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    justifyContent: 'space-between',
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
  noProductsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  noProductsText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  businessInfo: {
    marginTop: 16,
  },
  businessInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  businessInfoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default SellerProfileScreen; 