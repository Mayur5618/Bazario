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
import { useCart } from '../context/CartContext';
// import axios from '../../config/axios';

const { width } = Dimensions.get('window');
const cardWidth = (width - 40) / 2; // Adjust the subtracted value to control spacing
const cardHeight = cardWidth * 1.4; // Proportional height

const HomeScreen = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const { cart, addToCart, updateQuantity, fetchCart, removeFromCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const handleAddToCart = async (product) => {
    const cartItem = cart.items.find(item => item.product._id === product._id);
    
    if (cartItem) {
      // Product exists in cart, show quantity controls
      return (
        <View style={styles.quantityControl}>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={async () => {
              try {
                if (cartItem.quantity === 1) {
                  // Remove item from cart using removeFromCart API
                  await removeFromCart(product._id);
                  // Refresh cart after removal
                  await fetchCart();
                } else {
                  await updateQuantity(product._id, cartItem.quantity - 1);
                }
              } catch (error) {
                console.error('Error updating cart:', error);
                Alert.alert(
                  'Error',
                  'Failed to update cart. Please try again.'
                );
              }
            }}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          
          <Text style={styles.quantityText}>{cartItem.quantity}</Text>
          
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={async () => {
              try {
                if (cartItem.quantity < product.stock) {
                  await updateQuantity(product._id, cartItem.quantity + 1);
                } else {
                  Alert.alert('Error', 'Cannot add more than available stock');
                }
              } catch (error) {
                console.error('Error updating cart:', error);
                Alert.alert(
                  'Error',
                  'Failed to update cart. Please try again.'
                );
              }
            }}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      // Product not in cart, show Add to Cart button
      const success = await addToCart(product._id, 1);
      if (success) {
        Alert.alert('Success', 'Item added to cart!');
      } else {
        Alert.alert('Error', 'Failed to add item to cart');
      }
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
        <TouchableOpacity style={styles.seeAllButton}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.productsList}>
        {featuredProducts.map((product) => {
          const cartItem = cart?.items?.find(item => item.product._id === product._id);
          
          return (
            <TouchableOpacity 
              key={product._id} 
              style={styles.productCard}
              activeOpacity={0.9}
            >
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: product.images[0] }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
              </View>

              <View style={styles.productInfo}>
                <View style={styles.productHeader}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productPrice}>
                    <Text style={styles.currencySymbol}>₹</Text>
                    {product.price}
                  </Text>
                </View>

                <View style={styles.productFooter}>
                  {cartItem ? (
                    <View style={styles.quantityControl}>
                      <TouchableOpacity 
                        style={[styles.quantityButton, styles.decrementButton]}
                        onPress={() => updateQuantity(product._id, cartItem.quantity - 1)}
                      >
                        <Text style={styles.quantityButtonText}>-</Text>
                      </TouchableOpacity>
                      
                      <Text style={styles.quantityText}>{cartItem.quantity}</Text>
                      
                      <TouchableOpacity 
                        style={[styles.quantityButton, styles.incrementButton]}
                        onPress={() => updateQuantity(product._id, cartItem.quantity + 1)}
                      >
                        <Text style={styles.quantityButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      style={styles.addButton}
                      onPress={() => addToCart(product._id)}
                    >
                      <Text style={styles.addButtonText}>Add to Cart</Text>
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
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignItems: 'center',
    gap: 2,
    height: 28,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F7FF',
    borderRadius: 4,
    height: 28,
    width: 80,
  },
  quantityButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FF',
    borderRadius: 4,
  },
  quantityButtonText: {
    fontSize: 16,
    color: '#4169E1',
    fontWeight: '600',
  },
  quantityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
    width: 24,
    textAlign: 'center',
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
  seeAllButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: '#4169E1',
  },
  productsList: {
    padding: 16,
  },
  productCard: {
    flexDirection: 'row',
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
    marginBottom: 12,
  },
  productImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  productInfo: {
    flex: 1,
    padding: 8,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  productName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  productPrice: {
    fontSize: 10,
    color: '#666',
  },
  currencySymbol: {
    fontSize: 10,
    color: '#666',
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  decrementButton: {
    backgroundColor: '#F5F7FF',
  },
  incrementButton: {
    backgroundColor: '#F5F7FF',
  },
});

export default HomeScreen;