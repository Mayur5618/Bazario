import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  SafeAreaView,
  Alert,
  TextInput
} from 'react-native';
import { router, useRouter } from 'expo-router';
import axios from '../config/axios';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { useToast } from '../hooks/useToast';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // For 2 cards per row with proper spacing

const HomeScreen = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      // Fetch featured products using your API
      const response = await axios.get('/api/products', {
        params: {
          limit: 5,
          sortBy: 'rating'
        }
      });
      setFeaturedProducts(response.data.products);
      
      // Sample categories - you can fetch from API if available
      setCategories([
        {
          id: 1,
          name: 'Fresh Vegetables',
          image: 'https://i.pinimg.com/736x/1f/8d/cd/1f8dcd9fad685de5025213d4b846848b.jpg',
        },
        {
          id: 2,
          name: 'Home-Cooked Meals',
          image: 'https://i.pinimg.com/736x/87/55/50/8755508c64ce14492a4f622ed29762a2.jpg',
        },
        {
          id: 3,
          name: 'Traditional Pickles',
          image: 'https://i.pinimg.com/736x/4c/6c/ba/4c6cbae47f19fb1a628624afc83d4406.jpg',
        },  
        {
          id: 4,
          name: "Seasonal Specials",
          image: "https://i.pinimg.com/736x/8b/62/58/8b62584beeeb75fe5db7efc1d3dd2545.jpg",
        },
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }

    try {
      await axios.post('/api/cart/add', {
        productId: product._id,
        quantity: 1
      });
      
      // Show success message using Alert directly
      Alert.alert('Success', 'Product added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add product to cart');
    }
  };

  const renderFeaturedProducts = () => (
    <View style={styles.productsGrid}>
      {featuredProducts.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          onAddToCart={handleAddToCart}
        />
      ))}
    </View>
  );

  const renderCategories = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity 
            key={category.id} 
            style={styles.categoryCard}
            activeOpacity={0.7}
          >
            <Image 
              source={{ uri: category.image }}
              style={styles.categoryImage}
              resizeMode="cover"
            />
            <View style={styles.categoryNameContainer}>
              <Text style={styles.categoryName} numberOfLines={2}>
                {category.name}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const handleNavigation = (route) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    router.push(route);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.brandText}>Bazario</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <Text style={styles.searchPlaceholder}>Search products...</Text>
        </View>

        {/* Categories */}
        {renderCategories()}

        {/* Featured Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <TouchableOpacity onPress={() => router.push('/products')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {renderFeaturedProducts()}
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
  header: {
    padding: 16,
    paddingTop: 20,
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
  },
  brandText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4169E1',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  searchPlaceholder: {
    marginLeft: 8,
    color: '#666',
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#fff',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAll: {
    color: '#4169E1',
    fontSize: 14,
    fontWeight: '500',
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 0,
    marginLeft: 16,
    gap: 8,
  },
  categoryCard: {
    width: 92,
    height: 140,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'visible',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  categoryImage: {
    width: '100%',
    height: 92,
    borderRadius: 12,
  },
  categoryNameContainer: {
    width: '100%',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 6,
    marginTop: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 35,
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    lineHeight: 14,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
});

export default HomeScreen;