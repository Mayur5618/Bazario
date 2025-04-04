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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [categorizedProducts, setCategorizedProducts] = useState({});
  const [tabs, setTabs] = useState(['all']);

  useEffect(() => {
    fetchSellerDetails();
  }, [id]);

  const fetchSellerDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/users/sellers/${id}`);
      if (response.data.success) {
        const { seller, categorizedProducts } = response.data;
        setSeller(seller);
        setCategorizedProducts(categorizedProducts);

        // Generate tabs from categories
        const generatedTabs = ['all'];
        
        // Add category tabs
        if (categorizedProducts.byCategory) {
          Object.keys(categorizedProducts.byCategory).forEach(category => {
            if (categorizedProducts.byCategory[category].length > 0) {
              generatedTabs.push(`category_${category}`);
            }
          });
        }

        // Add subcategory tabs
        if (categorizedProducts.bySubCategory) {
          Object.keys(categorizedProducts.bySubCategory).forEach(subCategory => {
            if (categorizedProducts.bySubCategory[subCategory].length > 0) {
              generatedTabs.push(`subcategory_${subCategory}`);
            }
          });
        }

        setTabs(generatedTabs);
      } else {
        setError('Failed to fetch seller data');
      }
    } catch (error) {
      console.error('Error fetching seller details:', error);
      setError(error.response?.data?.message || 'Failed to fetch seller data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSellerDetails();
    setRefreshing(false);
  };

  // Function to get products based on active tab
  const getFilteredProducts = () => {
    if (!categorizedProducts) return [];

    if (activeTab === 'all') {
      return categorizedProducts.all || [];
    }

    const [type, category] = activeTab.split('_');
    
    if (type === "category" && categorizedProducts.byCategory) {
      return categorizedProducts.byCategory[category] || [];
    }

    if (type === "subcategory" && categorizedProducts.bySubCategory) {
      return categorizedProducts.bySubCategory[category] || [];
    }

    return [];
  };

  // Function to format tab label
  const getTabLabel = (tabId) => {
    if (tabId === "all") return "All Products";

    const [type, category] = tabId.split('_');
    return category.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4169E1" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
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
                <Text style={styles.sellerSubName}>
                  {seller.firstname} {seller.lastname}
                </Text>
                <View style={styles.sellerStats}>
                  <View style={styles.statItem}>
                    <Ionicons name="star" size={20} color="#FFD700" />
                    <Text style={styles.statText}>
                      {seller.stats.averageRating} ({seller.stats.totalReviews})
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="cube-outline" size={20} color="#fff" />
                    <Text style={styles.statText}>
                      {seller.stats.totalProducts} Products
                    </Text>
                  </View>
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactText}>📱 {seller.mobileno}</Text>
                  <Text style={styles.contactText}>📍 {seller.city}, {seller.state}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Category Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.tabsScrollView}
        >
          <View style={styles.tabsContainer}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.activeTab]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                  {getTabLabel(tab)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Products Grid */}
        <View style={styles.productsGrid}>
          {getFilteredProducts().map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onPress={() => router.push(`/product/${product._id}`)}
            />
          ))}
          {getFilteredProducts().length === 0 && (
            <View style={styles.noProductsContainer}>
              <Ionicons name="cube-outline" size={48} color="#666" />
              <Text style={styles.noProductsText}>No products found</Text>
            </View>
          )}
        </View>
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
    alignItems: 'flex-start',
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
    marginBottom: 4,
  },
  sellerSubName: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 8,
  },
  sellerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 4,
  },
  contactInfo: {
    marginTop: 4,
  },
  contactText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 2,
  },
  tabsScrollView: {
    marginBottom: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
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
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  noProductsContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  noProductsText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
});

export default SellerProfileScreen; 