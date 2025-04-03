import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { sellerApi } from '../../src/api/sellerApi';
import { Ionicons } from '@expo/vector-icons';
import axios from '../../src/config/axios';
import { useLanguage } from '../../src/context/LanguageContext';

// Translations
const translations = {
  en: {
    availableProducts: "Available Products",
    outOfStockProducts: "Out of Stock Products",
    myProducts: "My Products",
    stock: "Stock"
  },
  hi: {
    availableProducts: "उपलब्ध प्रोडक्ट्स",
    outOfStockProducts: "स्टॉक खत्म प्रोडक्ट्स",
    myProducts: "मेरे प्रोडक्ट्स",
    stock: "स्टॉक"
  },
  mr: {
    availableProducts: "उपलब्ध उत्पादने",
    outOfStockProducts: "स्टॉक संपलेली उत्पादने",
    myProducts: "माझी उत्पादने",
    stock: "स्टॉक"
  },
  gu: {
    availableProducts: "ઉપલબ્ધ ઉત્પાદનો",
    outOfStockProducts: "સ્ટોક ખતમ ઉત્પાદનો",
    myProducts: "મારા ઉત્પાદનો",
    stock: "સ્ટોક"
  }
};

const ProductsScreen = () => {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const [products, setProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await sellerApi.getSellerProducts();
      if (response.success) {
        // Sort products: in-stock first, out-of-stock last
        const sortedProducts = response.products.sort((a, b) => {
          if (a.stock === 0 && b.stock !== 0) return 1;
          if (a.stock !== 0 && b.stock === 0) return -1;
          return 0;
        });
        setProducts(sortedProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Error', 'Failed to fetch products');
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  }, []);

  const renderProduct = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.productCard,
        item.stock === 0 && styles.outOfStockCard
      ]}
      onPress={() => router.push(`/(seller)/product-details/${item._id}`)}
    >
      {item.images && item.images.length > 0 ? (
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: item.images[0] }} 
            style={styles.productImage}
          />
        </View>
      ) : (
        <View style={[styles.productImage, styles.placeholderImage]}>
          <Ionicons name="image-outline" size={30} color="#CCC" />
        </View>
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>₹{item.price}</Text>
        <Text style={[
          styles.productStock,
          item.stock === 0 && styles.outOfStockText
        ]}>
          Stock: {item.stock}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#666" />
    </TouchableOpacity>
  );

  const renderSectionHeader = (title) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const inStockProducts = products.filter(p => p.stock > 0);
  const outOfStockProducts = products.filter(p => p.stock === 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.myProducts}</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/(seller)/add-product')}
        >
          <Ionicons name="add" size={24} color="#6C63FF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {products.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No products found</Text>
            <TouchableOpacity 
              style={styles.addFirstButton}
              onPress={() => router.push('/(seller)/add-product')}
            >
              <Text style={styles.addFirstButtonText}>Add Your First Product</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.productList}>
            {inStockProducts.length > 0 && (
              <>
                {renderSectionHeader(t.availableProducts)}
                {inStockProducts.map((item) => (
                  <View key={item._id}>
                    {renderProduct({ item })}
                  </View>
                ))}
              </>
            )}
            
            {outOfStockProducts.length > 0 && (
              <>
                {renderSectionHeader(t.outOfStockProducts)}
                {outOfStockProducts.map((item) => (
                  <View key={item._id}>
                    {renderProduct({ item })}
                  </View>
                ))}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#6C63FF',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
  },
  productList: {
    padding: 16,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: '#6C63FF',
    fontWeight: '500',
    marginBottom: 4,
  },
  productStock: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
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
  imageContainer: {
    position: 'relative',
  },
  outOfStockCard: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FEB2B2',
    borderWidth: 1,
    opacity: 0.8,
  },
  outOfStockText: {
    color: '#E53E3E',
    fontWeight: 'bold',
  },
  sectionHeader: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A5568',
  },
});

export default ProductsScreen; 