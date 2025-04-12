import React, { useState, useEffect, useRef } from 'react';
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
  FlatList,
  Animated,
  Platform
} from 'react-native';
import { router, useRouter } from 'expo-router';
import axios from '../config/axios';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { useToast } from '../hooks/useToast';
import { useCart } from '../context/CartContext';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, updateQuantity, removeFromCart } from '../store/cartSlice';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
// import axios from '../../config/axios';

const { width, height } = Dimensions.get('window');
const cardWidth = (width - 40) / 2;
const cardHeight = cardWidth * 1.4;

const HomeScreen = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const { cartItems, loading: cartLoading, getCart, updateQuantity, addToCart } = useCart();
  const dispatch = useDispatch();
  const cartItemsRedux = useSelector((state) => state.cart.items) || {};
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const [buyerCity, setBuyerCity] = useState('');

  // Fetch cart data when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    }
  }, [isAuthenticated]);

  const loadCart = async () => {
    try {
      await getCart();
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  // Fetch featured products
  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setFeaturedProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      // Fetch all products using your API
      const response = await axios.get('/api/products', {
        params: {
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

  // Update fetchCategories function
  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/products/categories');
      if (response.data.success) {
        const uniqueCategories = response.data.categories;
        
        // Define the 4 main categories we want to show
        const mainCategories = [
          'Creative & Artistic Products',
          'Eco-Friendly & Recycled Products',
          'Home-Made',
          'Organic Vegetables & Fruits'
        ];

        // Filter categories to only include main categories
        const filteredCategories = uniqueCategories.filter(category => 
          mainCategories.includes(category)
        );
        
        // For each category, fetch best rated product
        const categoriesWithData = await Promise.all(
          filteredCategories.map(async (category) => {
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
                const aiImage = getCategoryImage(category);
                
                return {
                  id: category,
                  name: category,
                  description: '',
                  image: product.images[0],
                  totalProducts: productsResponse.data.total,
                  featuredProduct: {
                    _id: product._id,
                    name: product.name,
                    price: product.price,
                    rating: product.rating,
                    reviews: product.reviews?.length || 0,
                    images: product.images
                  }
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
    }
  };

  // Update useEffect to fetch both data and categories
  useEffect(() => {
    fetchData();
    fetchCategories();
  }, []);

  // Update onRefresh to fetch both data and categories
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchData(), fetchCategories()]);
    setRefreshing(false);
  };

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        'Please login to add items to cart',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => router.push('/(auth)/login') }
        ]
      );
      return;
    }

    try {
      await addToCart(product._id, 1);
      Alert.alert('Success', 'Product added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart');
    }
  };

  const handleUpdateQuantity = async (productId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) {
      Alert.alert(
        'Remove Item',
        'Do you want to remove this item from cart?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: async () => {
              try {
                await updateQuantity(productId, 0);
              } catch (error) {
                Alert.alert('Error', 'Failed to remove item');
              }
            }
          }
        ]
      );
    } else {
      try {
        await updateQuantity(productId, newQuantity);
      } catch (error) {
        Alert.alert('Error', 'Failed to update quantity');
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
        <TouchableOpacity onPress={() => router.push('/(app)/products')}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.productsGrid}>
        {featuredProducts.map((product) => {
          // Find the cart item for this product
          const cartItem = cartItems?.[product._id];
          
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
              </View>
              
              <View style={styles.gridInfo}>
                <Text style={styles.gridName} numberOfLines={2}>{product.name}</Text>
                
                <View style={styles.priceRow}>
                  <Text style={styles.gridPrice}>₹{product.price}</Text>
                  <Text style={styles.unitText}>per {product.unitSize} {product.unitType}</Text>
                </View>

                <View style={styles.bottomRow}>
                  <Text style={styles.ratingText}>
                    ⭐ {product.rating?.toFixed(1) || '0.0'} ({product.numReviews || 0})
                  </Text>
                  
                  {cartItem ? (
                    <View style={styles.quantityControl}>
                      <TouchableOpacity 
                        style={styles.quantityButton}
                        onPress={() => handleUpdateQuantity(product._id, cartItem.quantity, -1)}
                      >
                        <Text style={styles.quantityButtonText}>-</Text>
                      </TouchableOpacity>
                      
                      <Text style={styles.quantityText}>{cartItem.quantity}</Text>
                      
                      <TouchableOpacity 
                        style={styles.quantityButton}
                        onPress={() => handleUpdateQuantity(product._id, cartItem.quantity, 1)}
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
          onPress={() => router.push(`/(app)/category/${encodeURIComponent(category.name)}`)}
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

  // Update getCategoryImage function with specific images for main categories
  const getCategoryImage = (category) => {
    const categoryImages = {
      'Creative & Artistic Products': [
        'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2070&auto=format&fit=crop'
      ],
      'Eco-Friendly & Recycled Products': [
        'https://images.unsplash.com/photo-1528805639423-c9818ad54888?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=80&w=2070&auto=format&fit=crop'
      ],
      'Home-Made': [
        'https://images.unsplash.com/photo-1606787366850-de6330128bfc?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1493770348161-369560ae357d?q=80&w=2070&auto=format&fit=crop'
      ],
      'Organic Vegetables & Fruits': [
        'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2074&auto=format&fit=crop'
      ]
    };

    // Get image array for the category
    const images = categoryImages[category] || [
      'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop'
    ];

    // Use the date string to select an image
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const imageIndex = dayOfYear % images.length;
    
    return images[imageIndex];
  };

  // Update auto-slide effect with slower transition
  useEffect(() => {
    const autoPlayInterval = setInterval(() => {
      if (flatListRef.current && categories.length > 0) {
        const nextIndex = (currentIndex + 1) % categories.length;
        flatListRef.current.scrollToIndex({
          index: nextIndex,
          animated: true,
          viewPosition: 0,
          viewOffset: 0,
        });
        setCurrentIndex(nextIndex);
      }
    }, 5000); // Changed from 3000 to 5000 for slower transitions

    return () => clearInterval(autoPlayInterval);
  }, [currentIndex, categories.length]);

  const renderCategoryShowcase = () => {
    if (!categories.length) return null;

    return (
      <View style={styles.carouselContainer}>
        <Animated.FlatList
          ref={flatListRef}
          data={categories}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
          onMomentumScrollEnd={(event) => {
            const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
            setCurrentIndex(newIndex);
          }}
          renderItem={({ item, index }) => (
            <View style={styles.carouselSlide}>
              <Image
                source={{ uri: getCategoryImage(item.name) }}
                style={styles.carouselBackground}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.8)']}
                locations={[0, 0.6, 1]}
                style={styles.gradientOverlay}
              >
                <View style={styles.carouselContentWrapper}>
                  <View style={styles.carouselTextContent}>
                    <Animatable.Text 
                      animation="fadeInDown"
                      duration={800}
                      delay={300}
                      useNativeDriver
                      iterationCount={1}
                      key={`title-${currentIndex}`}
                      style={styles.carouselTitle}
                    >
                      {item.name}
                    </Animatable.Text>
                    
                    <Animatable.View
                      animation="fadeInUp"
                      duration={800}
                      delay={500}
                      useNativeDriver
                      iterationCount={1}
                      key={`button-${currentIndex}`}
                    >
                      <TouchableOpacity
                        style={styles.exploreButton}
                        onPress={() => router.push(`/(app)/category/${encodeURIComponent(item.name)}`)}
                      >
                        <LinearGradient
                          colors={['#4F46E5', '#7C3AED']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.exploreButtonGradient}
                        >
                          <Text style={styles.exploreButtonText}>Explore Now</Text>
                          <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
                        </LinearGradient>
                      </TouchableOpacity>
                    </Animatable.View>
                  </View>

                  {item.featuredProduct && (
                    <Animatable.View
                      animation="fadeInRight"
                      duration={800}
                      delay={400}
                      useNativeDriver
                      iterationCount={1}
                      key={`product-${currentIndex}`}
                      style={styles.featuredProductPreview}
                    >
                      <Image
                        source={{ uri: item.featuredProduct.images[0] }}
                        style={styles.featuredProductImage}
                        resizeMode="cover"
                      />
                      <LinearGradient
                        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.3)']}
                        style={styles.productGradient}
                      />
                    </Animatable.View>
                  )}
                </View>
              </LinearGradient>
            </View>
          )}
          keyExtractor={(item) => item.id}
          decelerationRate={0.85}
          snapToInterval={width}
          snapToAlignment="center"
          scrollEventThrottle={16}
        />

        <View style={styles.indicatorContainer}>
          {categories.map((_, index) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width
            ];

            const scale = scrollX.interpolate({
              inputRange,
              outputRange: [0.8, 1.4, 0.8],
              extrapolate: 'clamp',
            });

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.4, 1, 0.4],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.indicator,
                  {
                    opacity,
                    transform: [{ scale }],
                    backgroundColor: currentIndex === index ? '#fff' : 'rgba(255,255,255,0.5)'
                  }
                ]}
              />
            );
          })}
        </View>
      </View>
    );
  };

  // Trust features data with corrected icon names
  const trustFeatures = [
    {
      icon: 'shield',
      title: "Secure Shopping",
      description: "100% secure payment"
    },
    {
      icon: 'truck',
      title: "Fast Delivery",
      description: "Quick delivery to you"
    },
    {
      icon: 'refresh',
      title: "Easy Returns",
      description: "Hassle-free returns"
    },
    {
      icon: 'headset',
      title: "24/7 Support",
      description: "Always here to help"
    }
  ];

  const renderTrustFeatures = () => (
    <View style={styles.trustContainer}>
      <Text style={styles.trustTitle}>Why Choose Us</Text>
      <View style={styles.trustGrid}>
        {trustFeatures.map((feature, index) => (
          <Animatable.View
            key={index}
            animation="fadeInUp"
            delay={index * 100}
            style={styles.trustCard}
          >
            <FontAwesome5 name={feature.icon} size={24} color="#7C3AED" />
            <Text style={styles.trustCardTitle}>{feature.title}</Text>
            <Text style={styles.trustCardDescription}>{feature.description}</Text>
          </Animatable.View>
        ))}
      </View>
    </View>
  );

  // Add state for category products
  const [categoryProducts, setCategoryProducts] = useState({});

  // Add function to fetch buyer city
  const fetchBuyerCity = async () => {
    try {
      const response = await axios.get('/api/buyer/city');
      if (response.data.success) {
        setBuyerCity(response.data.city);
      }
    } catch (error) {
      console.error('Error fetching buyer city:', error);
    }
  };

  // Update useEffect to fetch buyer city
  useEffect(() => {
    fetchBuyerCity();
  }, []);

  // Update fetchCategoryProducts function
  const fetchCategoryProducts = async (categoryTitle) => {
    try {
      const response = await axios.get(`/api/products`, {
        params: {
          category: categoryTitle,
          limit: 4,
          sort: '-createdAt',
          buyerCity: buyerCity // Add buyer city to params
        }
      });
      return response.data.products;
    } catch (error) {
      console.error('Error fetching category products:', error);
      return [];
    }
  };

  // Update useEffect to fetch category products when buyerCity changes
  useEffect(() => {
    const loadCategoryProducts = async () => {
      if (!buyerCity) return; // Only fetch if we have buyer's city
      
      const productsMap = {};
      for (const category of categories) {
        const products = await fetchCategoryProducts(category.name);
        productsMap[category.name] = products;
      }
      setCategoryProducts(productsMap);
    };

    if (categories.length > 0) {
      loadCategoryProducts();
    }
  }, [categories, buyerCity]); // Add buyerCity to dependencies

  // Update renderCategoryProducts function
  const renderCategoryProducts = () => (
    <View style={styles.categoryProductsContainer}>
      {categories.map((category) => {
        const products = categoryProducts[category.name] || [];
        if (products.length === 0) return null;

        return (
          <View key={category.id} style={styles.categorySection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{category.name}</Text>
              <TouchableOpacity onPress={() => router.push(`/(app)/category/${encodeURIComponent(category.name)}`)}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.productsGrid}>
              {products.map((product) => {
                const cartItem = cartItems?.[product._id];
                return (
                  <TouchableOpacity 
                    key={product._id} 
                    style={styles.productCard}
                    onPress={() => router.push(`/(app)/product/${product._id}`)}
                    activeOpacity={0.9}
                  >
                    <Image 
                      source={{ uri: product.images[0] }}
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                    <View style={styles.productInfo}>
                      <Text style={styles.productName} numberOfLines={2}>
                        {product.name}
                      </Text>
                      <View style={styles.priceRow}>
                        <Text style={styles.productPrice}>₹{product.price}</Text>
                        <Text style={styles.unitText}>
                          per {product.unitSize} {product.unitType}
                        </Text>
                      </View>
                      <View style={styles.productBottom}>
                        <View style={styles.ratingContainer}>
                          <Ionicons name="star" size={12} color="#FFB100" />
                          <Text style={styles.ratingText}>
                            {product.rating?.toFixed(1) || '0.0'}
                          </Text>
                        </View>
                        {cartItem ? (
                          <View style={styles.quantityControl}>
                            <TouchableOpacity 
                              style={styles.quantityButton}
                              onPress={() => handleUpdateQuantity(product._id, cartItem.quantity, -1)}
                            >
                              <Text style={styles.quantityButtonText}>-</Text>
                            </TouchableOpacity>
                            <Text style={styles.quantityText}>{cartItem.quantity}</Text>
                            <TouchableOpacity 
                              style={styles.quantityButton}
                              onPress={() => handleUpdateQuantity(product._id, cartItem.quantity, 1)}
                            >
                              <Text style={styles.quantityButtonText}>+</Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <TouchableOpacity 
                            style={styles.addButton}
                            onPress={() => handleAddToCart(product)}
                          >
                            <Ionicons name="add" size={16} color="#FFF" />
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
      })}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Bazario</Text>
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={() => router.push('/(app)/search')}
          >
            <Ionicons name="search" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Category Showcase */}
        {renderCategoryShowcase()}

        {/* Shop by Category Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Shop by Category</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#2563eb" />
          ) : (
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
                    onPress={() => router.push(`/(app)/category/${encodeURIComponent(category.name)}`)}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: category.image }}
                      style={styles.categoryImage}
                      resizeMode="cover"
                    />
                    <LinearGradient
                      colors={[
                        'transparent',
                        'rgba(0,0,0,0.6)',
                        'rgba(0,0,0,0.8)',
                        'rgba(0,0,0,0.9)'
                      ]}
                      locations={[0, 0.5, 0.8, 1]}
                      style={styles.categoryGradient}
                    >
                      <Text style={styles.categoryTitle} numberOfLines={2}>
                        {category.name}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animatable.View>
              ))}
            </View>
          )}
        </View>

        {/* Category Products */}
        {renderCategoryProducts()}

        {/* Trust Features */}
        {renderTrustFeatures()}

        {/* Quality Guarantee */}
        <LinearGradient
          colors={['#3B82F6', '#7C3AED']}
          style={styles.guaranteeContainer}
        >
          <Text style={styles.guaranteeTitle}>Our Quality Guarantee</Text>
          <Text style={styles.guaranteeText}>
            We ensure that every product meets the highest standards of quality. Your satisfaction is our top priority.
          </Text>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  searchButton: {
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  categoryWrapper: {
    width: '50%',
    padding: 6,
  },
  categoryCard: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
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
  categoryGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    paddingVertical: 16,
    justifyContent: 'flex-end',
    height: '55%',
  },
  categoryTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 5,
    letterSpacing: 0.3,
    lineHeight: 18,
    paddingHorizontal: 6,
    flexWrap: 'wrap',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  productCard: {
    width: '48%',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  productImage: {
    width: '100%',
    aspectRatio: 1,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  productInfo: {
    padding: 10,
    backgroundColor: '#fff',
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
    height: 20,
    lineHeight: 20,
    numberOfLines: 1,
    ellipsizeMode: 'tail',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
    marginRight: 4,
  },
  unitText: {
    fontSize: 12,
    color: '#6B7280',
  },
  productBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#1F2937',
    marginLeft: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 4,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    paddingHorizontal: 4,
  },
  quantityButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '600',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginHorizontal: 8,
  },
  showcaseContainer: {
    height: height * 0.45,
    width: width,
    position: 'relative',
  },
  gradientOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  showcaseImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.6,
  },
  showcaseContent: {
    marginBottom: 40,
  },
  showcaseTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  showcaseDescription: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 20,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: '#fff',
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
    marginHorizontal: 4,
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
  trustContainer: {
    padding: 20,
    backgroundColor: '#F3F4F6',
  },
  trustTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  trustGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  trustCard: {
    width: (width - 60) / 2,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  trustCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  trustCardDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  guaranteeContainer: {
    padding: 32,
    alignItems: 'center',
  },
  guaranteeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  guaranteeText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
  },
  categoryProductsContainer: {
    paddingTop: 16,
    backgroundColor: '#fff',
  },
  categorySection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  carouselContainer: {
    height: height * 0.35,
    position: 'relative',
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  carouselSlide: {
    width: width,
    height: height * 0.35,
    position: 'relative',
  },
  carouselBackground: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    opacity: 0.75,
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    justifyContent: 'center',
    padding: 16,
  },
  carouselContentWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  carouselTextContent: {
    flex: 1,
    marginRight: 16,
  },
  carouselTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  exploreButton: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    overflow: 'hidden',
  },
  exploreButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  featuredProductPreview: {
    width: width * 0.32,
    height: width * 0.32,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  featuredProductImage: {
    width: '100%',
    height: '100%',
  },
  productGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  indicatorContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  indicator: {
    height: 6,
    width: 6,
    borderRadius: 3,
    marginHorizontal: 3,
    backgroundColor: '#fff',
  },
});

export default HomeScreen;