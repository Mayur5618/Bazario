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
  TextInput,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { router, useRouter } from 'expo-router';
import axios from '../config/axios';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { useToast } from '../hooks/useToast';
import { useCart } from '../context/CartContext';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, updateQuantity, removeFromCart } from '../store/cartSlice';
// import axios from '../../config/axios';

const { width } = Dimensions.get('window');
const cardWidth = (width - 40) / 2; // Adjust the subtracted value to control spacing
const cardHeight = cardWidth * 1.4; // Proportional height

const HomeScreen = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const { cart, addToCart, updateQuantity, fetchCart, removeFromCart } = useCart();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items) || {};
  console.log('Current cart items:', cartItems); // Debug log
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch cart data when component mounts
  useEffect(() => {
    fetchCart();
  }, []);

  // Fetch featured products
  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await axios.get('/api/products', {
        params: {
          limit: 6,
          sortBy: 'rating'
        }
      });
      setFeaturedProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleAddToCart = (product) => {
    try {
      // Dispatch the action with correct payload structure
      dispatch(addToCart({
        productId: product._id,
        price: product.price,
        name: product.name,
        image: product.images[0]
      }));
      
      // Optional: Show success message
      Alert.alert('Success', 'Product added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart');
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    try {
      if (newQuantity < 1) {
        const response = await axios.delete(`/api/cart/remove/${productId}`);
        if (response.data.success) {
          dispatch(removeFromCart(productId));
        }
      } else {
        const response = await axios.put(`/api/cart/update/${productId}`, {
          quantity: newQuantity
        });
        if (response.data.success) {
          dispatch(updateQuantity({ productId, quantity: newQuantity }));
        }
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      Alert.alert('Error', 'Failed to update quantity');
    }
  };

  // Helper function to render stars
  const renderStars = (rating) => {
    const filledStars = Math.floor(rating);
    const stars = [];
    
    // Filled stars
    for (let i = 0; i < filledStars; i++) {
      stars.push(
        <Ionicons 
          key={`filled-${i}`} 
          name="star" 
          size={10} 
          color="#FFB100" 
        />
      );
    }
    
    // Empty stars
    for (let i = filledStars; i < 5; i++) {
      stars.push(
        <Ionicons 
          key={`empty-${i}`} 
          name="star" 
          size={10} 
          color="#D1D5DB" 
        />
      );
    }
    
    return stars;
  };

  const renderFeaturedProducts = () => (
    <View style={styles.featuredSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured Products</Text>
        <TouchableOpacity onPress={() => router.push('/(app)/products')}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.productsGrid}>
        {featuredProducts.map((product) => {
          const cartItem = cartItems[product._id];
          console.log('Cart item for product:', cartItem); // Debug log
          
          return (
            <TouchableOpacity 
              key={product._id} 
              style={styles.gridCard}
              onPress={() => router.push(`/(app)/product/${product._id}`)}
              activeOpacity={0.9}
            >
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: product.images[0] }}
                  style={styles.gridImage}
                  resizeMode="cover"
                />
                <TouchableOpacity style={styles.wishlistButton}>
                  <Ionicons name="heart-outline" size={18} color="#666" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.gridInfo}>
                <Text style={styles.gridName} numberOfLines={2}>{product.name}</Text>
                
                <View style={styles.priceRow}>
                  <Text style={styles.gridPrice}>₹{product.price}</Text>
                  <Text style={styles.unitText}>per {product.unitSize} {product.unitType}</Text>
                </View>

                <View style={styles.bottomRow}>
                  <Text style={styles.ratingText}>
                    ⭐ {product.rating.toFixed(1)} ({product.numReviews})
                  </Text>
                  
                  {cartItem ? (
                    <View style={styles.quantityControl}>
                      <TouchableOpacity 
                        style={styles.quantityButton}
                        onPress={() => handleUpdateQuantity(product._id, cartItem.quantity - 1)}
                      >
                        <Text style={styles.quantityButtonText}>-</Text>
                      </TouchableOpacity>
                      
                      <Text style={styles.quantityText}>{cartItem.quantity}</Text>
                      
                      <TouchableOpacity 
                        style={styles.quantityButton}
                        onPress={() => handleUpdateQuantity(product._id, cartItem.quantity + 1)}
                      >
                        <Text style={styles.quantityButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      style={styles.addButton}
                      onPress={() => handleAddToCart(product)}
                    >
                      <Ionicons name="add-circle" size={18} color="#FFF" />
                      <Text style={styles.addButtonText}>Add</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderCategories = () => (
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
          onPress={() => router.push(`/(app)/category/${category.id}`)}
        >
          <Image 
            source={{ uri: category.image }}
            style={styles.categoryImage}
            resizeMode="cover"
          />
          <View style={styles.categoryNameContainer}>
            <Text style={styles.categoryName}>{category.name}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
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

  // Add search functionality
  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      if (searchQuery.trim()) {
        try {
          setIsSearching(true);
          const response = await axios.get(`/api/products?query=${searchQuery}`);
          setSearchResults(response.data.products.slice(0, 5));
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/(app)/products?query=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setSearchResults([]);
    }
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
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.brandText}>Bazario</Text>
        </View>

        {/* Search Bar */}
        <TouchableOpacity 
          style={styles.searchContainer}
          onPress={() => router.push('/(app)/search')}
        >
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#666" />
            <Text style={styles.searchPlaceholder}>Search products...</Text>
          </View>
        </TouchableOpacity>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <View style={styles.searchResults}>
            {searchResults.map((product) => (
              <TouchableOpacity
                key={product._id}
                style={styles.searchResultItem}
                onPress={() => {
                  router.push(`/(app)/product/${product._id}`);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
              >
                <View style={styles.searchResultContent}>
                  {product.images[0] && (
                    <Image
                      source={{ uri: product.images[0] }}
                      style={styles.searchResultImage}
                    />
                  )}
                  <View style={styles.searchResultInfo}>
                    <Text style={styles.searchResultName}>{product.name}</Text>
                    <Text style={styles.searchResultPrice}>₹{product.price}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.seeAllResults}
              onPress={handleSearch}
            >
              <Text style={styles.seeAllResultsText}>See all results</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading State */}
        {isSearching && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#666" />
          </View>
        )}

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity onPress={() => router.push('/(app)/categories')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {renderCategories()}
        </View>

        {/* Featured Products */}
        <View style={styles.section}>
          {renderFeaturedProducts()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
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
    marginHorizontal: 16,
    marginBottom: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
  searchResults: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxHeight: 300,
  },
  searchResultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchResultContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchResultImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  searchResultPrice: {
    fontSize: 14,
    color: '#666',
  },
  seeAllResults: {
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  seeAllResultsText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
    fontWeight: '600',
    color: '#333',
  },
  seeAll: {
    fontSize: 14,
    color: '#4169E1',
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingLeft: 16,
    paddingRight: 8,
    gap: 12,
  },
  categoryCard: {
    width: 100,
    height: 130,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryImage: {
    width: '100%',
    height: 85,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  categoryNameContainer: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 6,
    paddingHorizontal: 8,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    lineHeight: 16,
  },
  categorySubtext: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center', // Center the products
    paddingHorizontal: 8,
    gap: 8,
  },
  gridCard: {
    width: cardWidth,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 0.5,
    borderColor: '#f0f0f0',
    marginHorizontal: 4, // Add horizontal margin
  },
  imageContainer: {
    width: '100%',
    height: cardWidth * 0.75,
    backgroundColor: '#f8f8f8',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  wishlistButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 4,
  },
  gridInfo: {
    padding: 8,
    paddingHorizontal: 10,
  },
  gridName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
    height: 18,
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 4,
  },
  gridPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4169E1',
    marginRight: 4,
  },
  unitText: {
    fontSize: 10,
    color: '#666',
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
    backgroundColor:'blue'
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E5',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewCount: {
    fontSize: 9,
    color: '#666',
    marginLeft: 2,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#4169E1',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    paddingHorizontal: 4,
  },
  quantityButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 16,
    color: '#4169E1',
    fontWeight: '600',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
    marginHorizontal: 8,
  },
  featuredSection: {
    paddingTop: 16,
    backgroundColor: '#FFF',
  },
  seeAllText: {
    fontSize: 14,
    color: '#4169E1',
    fontWeight: '600',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
  },
});

export default HomeScreen;