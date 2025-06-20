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
    inStock: "In Stock",
    outOfStock: "Out of Stock",
    loadingProducts: "Loading products...",
    noProductsFound: "No products found",
    addFirstProduct: "Add First Product",
    inStockLabel: "in stock",
    soldLabel: "sold"
  },
  hi: {
    myProducts: "मेरे उत्पाद",
    allProducts: "सभी उत्पाद",
    inStock: "स्टॉक में",
    outOfStock: "स्टॉक ख़त्म",
    loadingProducts: "उत्पाद लोड हो रहे हैं...",
    noProductsFound: "कोई उत्पाद नहीं मिला",
    addFirstProduct: "पहला उत्पाद जोड़ें",
    inStockLabel: "स्टॉक में",
    soldLabel: "बिक चुका"
  },
  mr: {
    myProducts: "माझी उत्पादने",
    allProducts: "सर्व उत्पादने",
    inStock: "स्टॉक मध्ये",
    outOfStock: "स्टॉक संपला",
    loadingProducts: "उत्पादने लोड होत आहेत...",
    noProductsFound: "कोणतीही उत्पादने सापडली नाहीत",
    addFirstProduct: "पहिले उत्पाद जोडा",
    inStockLabel: "स्टॉक मध्ये",
    soldLabel: "विकले"
  },
  gu: {
    myProducts: "મારા ઉત્પાદનો",
    allProducts: "બધા ઉત્પાદનો",
    inStock: "સ્ટોકમાં",
    outOfStock: "સ્ટોક ખતમ",
    loadingProducts: "ઉત્પાદનો લોડ થઈ રહ્યા છે...",
    noProductsFound: "કોઈ ઉત્પાદન મળ્યું નથી",
    addFirstProduct: "પ્રથમ ઉત્પાદન ઉમેરો",
    inStockLabel: "સ્ટોકમાં",
    soldLabel: "વેચાયેલ"
  }
};

const ProductsTab = () => {
  const router = useRouter();
  const { businessMode } = useAuth();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, [businessMode]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await sellerApi.getSellerProducts({
        platformType: businessMode === 'business' ? 'b2b' : 'b2c'
      });
      if (response.success) {
        setProducts(response.products);
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
      case 'inStock':
        return products.filter(p => p.stock > 0);
      case 'outOfStock':
        return products.filter(p => p.stock === 0);
      default:
        return products;
    }
  };

  const renderProductCard = (product) => {
    const isOutOfStock = product.stock === 0;
    
    return (
      <TouchableOpacity
        key={product._id}
        style={styles.productCard}
        onPress={() => router.push(`/(seller)/product-details/${product._id}`)}
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
          {isOutOfStock && (
            <BlurView intensity={70} style={styles.outOfStockOverlay}>
              <Text style={styles.outOfStockText}>{t.outOfStock}</Text>
            </BlurView>
          )}
        </View>
        
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.productPrice}>₹{product.price}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="cube-outline" size={16} color="#666" />
              <Text style={styles.statText}>{product.stock} {t.inStockLabel}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="cart-outline" size={16} color="#666" />
              <Text style={styles.statText}>{product.numSales || 0} {t.soldLabel}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => router.push(`/(seller)/edit-product/${product._id}`)}
        >
          <Ionicons name="create-outline" size={20} color="#6C63FF" />
        </TouchableOpacity>
      </TouchableOpacity>
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
          style={[styles.filterButton, selectedFilter === 'inStock' && styles.activeFilter]}
          onPress={() => setSelectedFilter('inStock')}
        >
          <Text style={[styles.filterText, selectedFilter === 'inStock' && styles.activeFilterText]}>
            {t.inStock}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'outOfStock' && styles.activeFilter]}
          onPress={() => setSelectedFilter('outOfStock')}
        >
          <Text style={[styles.filterText, selectedFilter === 'outOfStock' && styles.activeFilterText]}>
            {t.outOfStock}
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
                onPress={() => router.push('/(seller)/add-product')}
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
    elevation: 2,
    overflow: 'hidden',
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
    backgroundColor: '#F0F0F0',
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
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  outOfStockText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    color: '#1A1A1A',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6C63FF',
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
  editButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFF',
    padding: 6,
    borderRadius: 16,
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

export default ProductsTab; 