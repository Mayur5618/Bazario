import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Easing,
  Modal,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../context/AuthContext';
import axios from '../config/axios';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { reviewApi } from '../api/reviewApi';
import { Rating } from 'react-native-ratings';

const ProductDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const { cartItems, addToCart, updateQuantity } = useCart();
  const { wishlistItems, addToWishlist, removeFromWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [cartItem, setCartItem] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [ratingStats, setRatingStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });
  const [canReview, setCanReview] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewImages, setReviewImages] = useState([]);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Add this animation value for tab bar
  const tabBarAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  useEffect(() => {
    if (cartItems && id) {
      setCartItem(cartItems[id]);
    }
  }, [cartItems, id]);

  useEffect(() => {
    if (wishlistItems && id) {
      setIsInWishlist(wishlistItems.includes(id));
    }
  }, [wishlistItems, id]);

  useEffect(() => {
    const checkReviewEligibility = async () => {
      if (!isAuthenticated || !product?._id) return;
      
      try {
        const { canReview: canReviewProduct, orderId: orderIdFromApi } = 
          await reviewApi.checkUserReview(product._id);
        setCanReview(canReviewProduct);
        setOrderId(orderIdFromApi);
      } catch (error) {
        console.error('Error checking review eligibility:', error);
      }
    };

    checkReviewEligibility();
  }, [isAuthenticated, product?._id]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!product?._id) return;
      try {
        const response = await reviewApi.getProductReviews(product._id);
        setReviews(response.reviews);
        
        // Calculate rating statistics
        const total = response.reviews.length;
        const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let sum = 0;
        
        response.reviews.forEach(review => {
          counts[review.rating] = (counts[review.rating] || 0) + 1;
          sum += review.rating;
        });

        setRatingStats({
          averageRating: total > 0 ? sum / total : 0,
          totalReviews: total,
          ratingCounts: counts
        });
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    fetchReviews();
  }, [product?._id]);

  const fetchProductDetails = async () => {
    try {
      const response = await axios.get(`/api/products/${id}`);
      setProduct(response.data.product);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const animateAddToCart = () => {
    // Reset animations
    scaleAnim.setValue(1);
    fadeAnim.setValue(1);
    bounceAnim.setValue(0);

    Animated.sequence([
      // First scale down
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      // Then bounce up with fade
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      // Finally settle to normal size
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      fadeAnim.setValue(1);
    });
  };

  const animateQuantityChange = () => {
    // Reset animations
    scaleAnim.setValue(1);
    bounceAnim.setValue(0);

    Animated.sequence([
      // Quick scale down
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.ease,
      }),
      // Bounce back
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
  };

  const handleAddToCart = async () => {
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
      animateAddToCart();
      await addToCart(product._id, 1);
      setCartItem({ quantity: 1 });
      Toast.show({
        type: 'success',
        text1: 'Added to cart successfully'
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to add to cart'
      });
    }
  };

  const handleUpdateQuantity = async (productId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    
    try {
      animateQuantityChange();
      await updateQuantity(productId, newQuantity);
      if (newQuantity === 0) {
        setCartItem(null);
      }
      Toast.show({
        type: 'success',
        text1: newQuantity === 0 ? 'Removed from cart' : 'Updated quantity'
      });
    } catch (error) {
      console.error('Error updating cart:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to update quantity'
      });
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        'Please login to add items to wishlist',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => router.push('/(auth)/login') }
        ]
      );
      return;
    }

    try {
      if (isInWishlist) {
        await removeFromWishlist(id);
        Toast.show({
          type: 'success',
          text1: 'Removed from wishlist'
        });
      } else {
        await addToWishlist(id);
        Toast.show({
          type: 'success',
          text1: 'Added to wishlist'
        });
      }
    } catch (error) {
      console.error('Wishlist operation failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to update wishlist'
      });
    }
  };

  // Fix the scroll handler
  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowScrollToTop(offsetY > 300);
    
    // Hide/show tab bar based on scroll direction
    if (offsetY > 50) {
      Animated.spring(tabBarAnimation, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(tabBarAnimation, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  const scrollToTop = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  // Add scroll view ref
  const scrollViewRef = useRef(null);

  // Add function to handle review submission
  const handleSubmitReview = async () => {
    if (!rating || !reviewText) {
      Toast.show({
        type: 'error',
        text1: 'Please provide both rating and review text'
      });
      return;
    }

    try {
      const reviewData = {
        rating,
        comment: reviewText,
        images: reviewImages,
        orderId
      };

      await reviewApi.createReview(product._id, reviewData);
      
      Toast.show({
        type: 'success',
        text1: 'Review submitted successfully'
      });
      
      setShowReviewModal(false);
      // Refresh reviews
      fetchReviews();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to submit review',
        text2: error.message
      });
    }
  };

  if (loading || !product) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <TouchableOpacity onPress={handleWishlistToggle} style={styles.wishlistButton}>
          <Ionicons 
            name={isInWishlist ? "heart" : "heart-outline"} 
            size={24} 
            color={isInWishlist ? "#FF4B4B" : "#666"}
          />
        </TouchableOpacity>
      </View>

      {/* Main Scrollable Content */}
      <ScrollView 
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Product Image */}
        <Image
          source={{ uri: product.images[activeImageIndex] }}
          style={styles.mainImage}
          resizeMode="contain"
          backgroundColor="#fff"
        />

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.price}>₹{product.price}</Text>
          <Text style={styles.description}>{product.description}</Text>
          
          <View style={styles.stockInfo}>
            <Text style={styles.stockLabel}>Stock Status:</Text>
            <Text style={[
              styles.stockValue,
              { color: product.stock > 0 ? '#4CAF50' : '#F44336' }
            ]}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </Text>
          </View>
        </View>

        {/* Action Buttons - Moved above reviews */}
        <View style={styles.actionButtonsContainer}>
          <View style={styles.buttonWrapper}>
            {!cartItem ? (
              <TouchableOpacity 
                style={[styles.actionButton, styles.addToCartButton]}
                onPress={handleAddToCart}
              >
                <Text style={styles.actionButtonText}>Add to Cart</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.quantityControlsContainer}>
                <TouchableOpacity 
                  style={styles.quantityButtonLeft}
                  onPress={() => handleUpdateQuantity(product._id, cartItem.quantity, -1)}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                
                <View style={styles.quantityTextContainer}>
                  <Animated.Text style={[
                    styles.quantityText,
                    {
                      transform: [{ scale: scaleAnim }]
                    }
                  ]}>
                    {cartItem.quantity}
                  </Animated.Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.quantityButtonRight}
                  onPress={() => handleUpdateQuantity(product._id, cartItem.quantity, 1)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          <View style={styles.buttonWrapper}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.buyNowButton]}
              onPress={() => router.push('/checkout')}
            >
              <Text style={styles.actionButtonText}>Buy Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reviews Section */}
        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>Customer Reviews</Text>
          
          {/* Rating Summary */}
          <View style={styles.ratingSummary}>
            <View style={styles.ratingHeader}>
              <Text style={styles.averageRating}>
                {ratingStats.averageRating.toFixed(1)}
              </Text>
              <Rating
                readonly
                startingValue={ratingStats.averageRating}
                imageSize={20}
                style={styles.ratingStars}
              />
              <Text style={styles.totalReviews}>
                {ratingStats.totalReviews} {ratingStats.totalReviews === 1 ? 'review' : 'reviews'}
              </Text>
            </View>

            {/* Rating Bars */}
            <View style={styles.ratingBars}>
              {[5, 4, 3, 2, 1].map(star => (
                <View key={star} style={styles.ratingBar}>
                  <Text style={styles.ratingLabel}>{star} star</Text>
                  <View style={styles.ratingBarContainer}>
                    <View 
                      style={[
                        styles.ratingBarFill,
                        { 
                          width: `${(ratingStats.ratingCounts[star] / ratingStats.totalReviews * 100) || 0}%`,
                          backgroundColor: star > 3 ? '#4CAF50' : star > 2 ? '#FFC107' : '#F44336'
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.ratingCount}>
                    {((ratingStats.ratingCounts[star] / ratingStats.totalReviews * 100) || 0).toFixed(0)}%
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Reviews List */}
          {reviews.map(review => (
            <View key={review._id} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <View style={styles.userInfo}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>
                      {review.buyer.firstname.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>
                      {review.buyer.firstname} {review.buyer.lastname}
                    </Text>
                    <View style={styles.ratingDateContainer}>
                      <Rating
                        readonly
                        startingValue={review.rating}
                        imageSize={14}
                        style={styles.rating}
                      />
                      <Text style={styles.reviewDate}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              <Text style={styles.reviewText}>{review.comment}</Text>
              {review.images?.length > 0 && (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.reviewImagesContainer}
                >
                  {review.images.map((image, index) => (
                    <Image
                      key={index}
                      source={{ uri: image }}
                      style={styles.reviewImage}
                    />
                  ))}
                </ScrollView>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Review Modal */}
      <Modal
        visible={showReviewModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowReviewModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Write a Review</Text>
            
            <Rating
              showRating
              onFinishRating={setRating}
              style={{ paddingVertical: 10 }}
            />
            
            <TextInput
              style={styles.reviewInput}
              multiline
              numberOfLines={4}
              placeholder="Write your review here..."
              value={reviewText}
              onChangeText={setReviewText}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowReviewModal(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSubmitReview}
              >
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  mainContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  mainImage: {
    width: '90%',
    height: 300,
    resizeMode: 'contain',
    backgroundColor: '#fff',
    alignSelf: 'center',
    marginVertical: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productInfo: {
    padding: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4169E1',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    lineHeight: 24,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stockLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  stockValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  scrollTopButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: '#4169E1',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  actionButtonsContainer: {
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 16, // Add some space above buttons
  },
  buttonWrapper: {
    width: '100%',
    height: 45,
    marginBottom: 12,
  },
  actionButton: {
    width: '100%',
    height: 45,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartButton: {
    backgroundColor: '#4169E1',
  },
  buyNowButton: {
    backgroundColor: '#22C55E',
    marginTop: 12,
  },
  quantityControlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 45,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4169E1',
    overflow: 'hidden',
  },
  quantityButtonLeft: {
    width: 45,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4169E1',
  },
  quantityButtonRight: {
    width: 45,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4169E1',
  },
  quantityTextContainer: {
    flex: 1,
    height: '100%',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '500',
  },
  quantityText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '500',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    padding: 8,
  },
  wishlistButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewsSection: {
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  reviewItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4169E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  ratingDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  rating: {
    marginRight: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
  },
  reviewText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginTop: 8,
  },
  reviewImagesContainer: {
    marginTop: 12,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  writeReviewButton: {
    backgroundColor: '#4169E1',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  writeReviewText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  noReviewsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noReviewsText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  noReviewsSubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginVertical: 16,
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  submitButton: {
    backgroundColor: '#4169E1',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  ratingSummary: {
    marginBottom: 16,
  },
  ratingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  averageRating: {
    fontSize: 20,
    fontWeight: '600',
    marginRight: 8,
  },
  ratingStars: {
    marginRight: 8,
  },
  totalReviews: {
    fontSize: 16,
    color: '#666',
  },
  ratingBars: {
    flexDirection: 'row',
    marginTop: 8,
  },
  ratingBar: {
    flex: 1,
    marginRight: 8,
  },
  ratingBarContainer: {
    height: 16,
    backgroundColor: '#eee',
    borderRadius: 8,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  ratingCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default ProductDetailScreen; 