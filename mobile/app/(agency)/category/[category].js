import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import axios from '../../../src/config/axios';
import { ActivityIndicator } from 'react-native-paper';
import { AntDesign } from '@expo/vector-icons';
import { format } from 'date-fns';

const CategoryProducts = () => {
  const { category } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching products for category:', category);
      
      // Decode the category name from URL
      const decodedCategory = decodeURIComponent(category);
      console.log('Decoded category:', decodedCategory);
      
      const response = await axios.get(`/api/products/b2b/category/${decodedCategory}`);
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        setData(response.data);
        setError(null);
      } else {
        setError(response.data.message || 'कुछ गलत हो गया');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.response?.data?.message || 'डेटा लोड करने में समस्या हुई');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return format(new Date(date), 'dd MMM yyyy, hh:mm a');
  };

  const ProductCard = ({ product }) => {
    const isBidIncreasing = product.currentHighestBid > (product.minPrice || 0);

    const handleProductPress = () => {
      router.push(`/product/${product._id}`);
    };

    return (
      <TouchableOpacity 
        style={styles.productCard}
        onPress={handleProductPress}
        activeOpacity={0.7}
      >
        <Image 
          source={{ uri: product.images[0] }} 
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.productDetails}>
          <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
          <Text style={styles.description} numberOfLines={2}>{product.description || 'कोई विवरण उपलब्ध नहीं है'}</Text>
          
          <View style={styles.bidInfo}>
            <View style={styles.priceContainer}>
              <Text style={styles.label}>वर्तमान बोली:</Text>
              <View style={styles.bidContainer}>
                <Text style={styles.currentBid}>
                  ₹{product.currentHighestBid || product.minPrice}
                </Text>
                {product.currentHighestBid > 0 && (
                  <AntDesign 
                    name={isBidIncreasing ? "arrowup" : "arrowdown"} 
                    size={16} 
                    color={isBidIncreasing ? "#4CAF50" : "#F44336"}
                    style={styles.arrow}
                  />
                )}
              </View>
            </View>

            <View style={styles.stockContainer}>
              <Text style={styles.label}>स्टॉक:</Text>
              <Text style={styles.value}>{product.totalStock} {product.unitType}</Text>
            </View>
          </View>

          <View style={styles.auctionEndContainer}>
            <Text style={styles.label}>नीलामी समाप्ति:</Text>
            <Text style={styles.value}>{formatDate(product.auctionEndDate)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.categoryTitle}>{category}</Text>
      
      {data?.subcategories.map((subcategory, index) => (
        <View key={index} style={styles.subcategoryContainer}>
          <View style={styles.subcategoryHeader}>
            <Text style={styles.subcategoryTitle}>{subcategory.subcategory}</Text>
            <View style={styles.priceRangeContainer}>
              <Text style={styles.priceRangeText}>
                मूल्य सीमा: ₹{subcategory.priceRange.min} - ₹{subcategory.priceRange.max}
              </Text>
            </View>
          </View>

          <View style={styles.productsGrid}>
            {subcategory.products.map((product, productIndex) => (
              <ProductCard key={productIndex} product={product} />
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  subcategoryContainer: {
    marginBottom: 24,
  },
  subcategoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subcategoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
  },
  priceRangeContainer: {
    backgroundColor: '#E3F2FD',
    padding: 8,
    borderRadius: 8,
  },
  priceRangeText: {
    color: '#1976D2',
    fontSize: 12,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage: {
    width: '100%',
    height: 120,
  },
  productDetails: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  description: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  bidInfo: {
    flexDirection: 'column',
    marginBottom: 8,
  },
  priceContainer: {
    marginBottom: 8,
  },
  bidContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentBid: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  arrow: {
    marginLeft: 4,
  },
  stockContainer: {
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  value: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  auctionEndContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
    marginTop: 4,
  },
  errorText: {
    color: '#F44336',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default CategoryProducts; 