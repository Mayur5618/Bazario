import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { sellerApi } from '../api/sellerApi';
import { BlurView } from 'expo-blur';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');
const cardWidth = width / 2 - 24; // 2 cards per row with padding

// Translations for products tab
const translations = {
  en: {
    myProducts: "My Products",
    allProducts: "All Products",
    active: "Active",
    closed: "Closed",
    loadingProducts: "Loading products...",
    noProductsFound: "No products found",
    addFirstProduct: "Add First Product",
    inStockLabel: "in stock",
    soldLabel: "sold"
  },
  hi: {
    myProducts: "मेरे उत्पाद",
    allProducts: "सभी उत्पाद",
    active: "सक्रिय",
    closed: "बंद",
    loadingProducts: "उत्पाद लोड हो रहे हैं...",
    noProductsFound: "कोई उत्पाद नहीं मिला",
    addFirstProduct: "पहला उत्पाद जोड़ें",
    inStockLabel: "स्टॉक में",
    soldLabel: "बिक चुका"
  },
  mr: {
    myProducts: "माझी उत्पादने",
    allProducts: "सर्व उत्पादने",
    active: "सक्रिय",
    closed: "बंद",
    loadingProducts: "उत्पादने लोड होत आहेत...",
    noProductsFound: "कोणतीही उत्पादने सापडली नाहीत",
    addFirstProduct: "पहिले उत्पाद जोडा",
    inStockLabel: "स्टॉक मध्ये",
    soldLabel: "विकले"
  },
  gu: {
    myProducts: "મારા ઉત્પાદનો",
    allProducts: "બધા ઉત્પાદનો",
    active: "સક્રિય",
    closed: "બંધ",
    loadingProducts: "ઉત્પાદનો લોડ થઈ રહ્યા છે...",
    noProductsFound: "કોઈ ઉત્પાદન મળ્યું નથી",
    addFirstProduct: "પ્રથમ ઉત્પાદન ઉમેરો",
    inStockLabel: "સ્ટોકમાં",
    soldLabel: "વેચાયેલ"
  }
};

const B2BProductsTab = () => {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await sellerApi.getSellerProductsByStatus({
        status: selectedFilter
      });
      if (response.success) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  }, []);

  const getFilteredProducts = () => {
    switch (selectedFilter) {
      case 'active':
        return products.filter(p => p.auctionStatus === 'active');
      case 'closed':
        return products.filter(p => p.auctionStatus === 'closed');
      default:
        return products;
    }
  };

  const getTimeRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;
    
    if (diff <= 0) return 'Auction Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${days}d ${hours}h left`;
  };

  const renderProductCard = (product) => {
    const isAuctionClosed = product.auctionStatus === 'closed';
    
    return (
      <View
        key={product._id}
        style={styles.productCard}
      >
        <View style={styles.imageContainer}>
          {product.images && product.images.length > 0 ? (
            <Image
              source={{ uri: product.images[0] }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.productImage, styles.placeholderImage]}>
              <Ionicons name="image-outline" size={40} color="#CCC" />
            </View>
          )}
          {isAuctionClosed && (
            <BlurView intensity={70} style={styles.outOfStockOverlay}>
              <Text style={styles.outOfStockText}>{t.closed}</Text>
            </BlurView>
          )}
          <View style={styles.imageCount}>
            <Ionicons name="images-outline" size={12} color="#FFF" />
            <Text style={styles.imageCountText}>{product.images?.length || 0}</Text>
          </View>
        </View>
        
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Price Range:</Text>
            <Text style={styles.productPrice}>₹{product.minPrice} - ₹{product.maxPrice}</Text>
          </View>

          {product.currentHighestBid > 0 ? (
            <View style={styles.bidContainer}>
              <View style={styles.bidRow}>
                <Text style={styles.bidLabel}>
                  {isAuctionClosed ? 'Winning Bid:' : 'Current Bid:'}
                </Text>
                <Text style={styles.currentBid}>₹{product.currentHighestBid}</Text>
              </View>
              {product.currentHighestBidder && (
                <View style={styles.bidderInfo}>
                  <Ionicons name="business-outline" size={12} color="#666" />
                  <Text style={styles.bidderText} numberOfLines={1}>
                    {product.currentHighestBidder.agencyName}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.noBidContainer}>
              <Text style={styles.noBidText}>No bids yet</Text>
            </View>
          )}
          
          <View style={styles.statsContainer}>
            <View style={styles.statsColumn}>
              <View style={styles.statItem}>
                <Ionicons name="cube-outline" size={16} color="#666" />
                <Text style={styles.statText}>
                  {product.stock} {t.inStockLabel}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={16} color="#666" />
                <Text style={[
                  styles.statText,
                  getTimeRemaining(product.auctionEndDate).includes('Ended') && styles.endedText
                ]}>
                  {getTimeRemaining(product.auctionEndDate)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => router.push(`/(seller)/edit-product/${product._id}`)}
        >
          <Ionicons name="create-outline" size={20} color="#6C63FF" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Filters */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'all' && styles.activeFilter]}
          onPress={() => setSelectedFilter('all')}
        >
          <Text style={[styles.filterText, selectedFilter === 'all' && styles.activeFilterText]}>
            {t.allProducts}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'active' && styles.activeFilter]}
          onPress={() => setSelectedFilter('active')}
        >
          <Text style={[styles.filterText, selectedFilter === 'active' && styles.activeFilterText]}>
            {t.active}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'closed' && styles.activeFilter]}
          onPress={() => setSelectedFilter('closed')}
        >
          <Text style={[styles.filterText, selectedFilter === 'closed' && styles.activeFilterText]}>
            {t.closed}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loadingText}>{t.loadingProducts}</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.productsContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {getFilteredProducts().length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="cube-outline" size={64} color="#CCC" />
              <Text style={styles.emptyStateText}>{t.noProductsFound}</Text>
              <TouchableOpacity
                style={styles.addFirstButton}
                onPress={() => router.push('/(seller)/add-b2b-product')}
              >
                <Text style={styles.addFirstButtonText}>{t.addFirstProduct}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.productsGrid}>
              {getFilteredProducts().map(product => renderProductCard(product))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFF',
    elevation: 2,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
  },
  activeFilter: {
    backgroundColor: '#6C63FF20',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterText: {
    color: '#6C63FF',
    fontWeight: '500',
  },
  productsContainer: {
    flexGrow: 1,
    padding: 12,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: cardWidth,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: cardWidth,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  outOfStockText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  imageCount: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  imageCountText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1A1A1A',
    lineHeight: 22,
  },
  priceContainer: {
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
    padding: 8,
    borderRadius: 6,
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6C63FF',
  },
  bidContainer: {
    marginBottom: 8,
    backgroundColor: '#F0FFF4',
    padding: 8,
    borderRadius: 6,
  },
  bidRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bidLabel: {
    fontSize: 12,
    color: '#666',
  },
  currentBid: {
    fontSize: 15,
    color: '#28a745',
    fontWeight: '600',
  },
  bidderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  bidderText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  noBidContainer: {
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  noBidText: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  statsColumn: {
    flex: 1,
    gap: 6,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: '#666',
  },
  endedText: {
    color: '#dc3545',
    fontWeight: '500',
  },
  editButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFF',
    padding: 8,
    borderRadius: 20,
    elevation: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  addFirstButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default B2BProductsTab; 