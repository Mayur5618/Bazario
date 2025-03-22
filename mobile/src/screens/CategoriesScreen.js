import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity,
    Image,
  ActivityIndicator,
    Dimensions,
  RefreshControl
} from 'react-native';
import { router } from 'expo-router';
import axios from '../config/axios';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

const { width } = Dimensions.get('window');
const cardWidth = (width - 32) / 2;

const CategoriesScreen = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/products/categories');
      if (response.data.success) {
        const uniqueCategories = response.data.categories;
        
        // For each category, fetch best rated product
        const categoriesWithData = await Promise.all(
          uniqueCategories.map(async (category) => {
            try {
              const productsResponse = await axios.get('/api/products', {
                params: {
                  category,
                  sort: 'rating',
                  limit: 1
                }
              });

              if (productsResponse.data.success && productsResponse.data.products.length > 0) {
                const product = productsResponse.data.products[0];
                return {
                  id: category.toLowerCase().replace(/\s+/g, '-'),
                  title: category,
                  description: `Explore our ${category} collection`,
                  image: product.images[0],
                  totalProducts: productsResponse.data.total
                };
              }
              return null;
            } catch (err) {
              console.error(`Error fetching products for ${category}:`, err);
              return null;
            }
          })
        );

        setCategories(categoriesWithData.filter(cat => cat !== null));
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
        } finally {
            setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCategories();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

    return (
        <ScrollView 
            style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
        >
            <Text style={styles.header}>Categories</Text>
            <Text style={styles.subHeader}>Explore our curated collection</Text>

            <View style={styles.categoriesGrid}>
        {categories.map((category, index) => (
          <Animatable.View
            key={category.id}
            animation="fadeInUp"
            delay={index * 100}
            style={styles.categoryWrapper}
          >
            <TouchableOpacity
              style={styles.categoryCard}
              onPress={() => router.push(`/(app)/category/${category.id}`)}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: category.image }}
                style={styles.categoryImage}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
                style={styles.gradient}
              >
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <Text style={styles.categoryDescription}>{category.description}</Text>
                <View style={styles.productsCount}>
                  <Text style={styles.productsCountText}>
                    {category.totalProducts} Products
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>
                ))}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    },
    header: {
    fontSize: 28,
        fontWeight: 'bold',
    color: '#1F2937',
    paddingHorizontal: 16,
    paddingTop: 20,
    },
    subHeader: {
        fontSize: 16,
    color: '#6B7280',
    paddingHorizontal: 16,
    paddingBottom: 20,
    },
    categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  categoryWrapper: {
    width: '50%',
    padding: 8,
    },
    categoryCard: {
    width: '100%',
    aspectRatio: 1,
        borderRadius: 16,
        overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    padding: 16,
    justifyContent: 'flex-end',
  },
  categoryTitle: {
    fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    marginBottom: 4,
    },
    categoryDescription: {
    fontSize: 12,
        color: '#fff',
        opacity: 0.9,
    marginBottom: 8,
  },
  productsCount: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  productsCountText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
    },
});

export default CategoriesScreen; 