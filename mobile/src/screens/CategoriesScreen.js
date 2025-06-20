import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  StatusBar,
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
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Categories</Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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
                onPress={() => router.push(`/(app)/category/${encodeURIComponent(category.title)}`)}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: category.image }}
                  style={styles.categoryImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.8)', 'rgba(0,0,0,0.9)']}
                  locations={[0, 0.5, 0.8, 1]}
                  style={styles.categoryNameContainer}
                >
                  <Text style={styles.categoryTitle}>{category.title}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animatable.View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  scrollContent: {
    padding: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryWrapper: {
    width: '50%',
    padding: 8,
  },
  categoryCard: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryNameContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    justifyContent: 'flex-end',
    paddingBottom: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 5,
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