import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router, useRouter } from 'expo-router';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../context/AuthContext';
import axios from '../config/axios';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { reviewApi } from '../api/reviewApi';
import { Rating } from 'react-native-ratings';
import { LinearGradient } from 'expo-linear-gradient';
import ImageZoom from 'react-native-image-pan-zoom';
import ReviewItem from '../components/ReviewItem';
import { useReview } from '../context/ReviewContext';
import * as ImagePicker from 'expo-image-picker';

const CustomImageViewer = ({ visible, image, onClose }) => {
  if (!visible || !image) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.imageViewerContainer}>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={onClose}
        >
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        
        <ImageZoom
          cropWidth={Dimensions.get('window').width}
          cropHeight={Dimensions.get('window').height}
          imageWidth={Dimensions.get('window').width}
          imageHeight={Dimensions.get('window').height}
        >
          <Image
            source={{ uri: image }}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
        </ImageZoom>
      </View>
    </Modal>
  );
};

const ReviewForm = ({ onSubmit, productId }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleImagePick = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Toast.show({
          type: 'error',
          text1: 'Permission to access media library is required!'
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [4, 3],
        maxFiles: 5,
      });

      if (!result.canceled) {
        const selectedImages = result.assets.map(asset => asset.uri);
        if (selectedImages.length > 5) {
          Toast.show({
            type: 'error',
            text1: 'Maximum 5 images allowed'
          });
          return;
        }
        setImages(prevImages => [...prevImages, ...selectedImages].slice(0, 5));
        simulateUploadProgress();
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to pick image'
      });
    }
  };

  const simulateUploadProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!rating) {
      Toast.show({
        type: 'error',
        text1: 'Please select a rating'
      });
      return;
    }

    if (!comment.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Please write a review'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // First check if user can review
      const eligibilityResponse = await reviewApi.checkUserReview(productId);
      console.log('Eligibility response:', eligibilityResponse);

      if (!eligibilityResponse.data || !eligibilityResponse.data.orderId) {
        Toast.show({
          type: 'error',
          text1: 'You can only review products from completed orders'
        });
        return;
      }

      // Create review data object
      const reviewData = {
        rating,
        comment: comment.trim(),
        images,
        orderId: eligibilityResponse.data.orderId
      };

      // Submit the review
      const response = await axios.post(
        `/api/reviews/products/${productId}/reviews`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Review submitted successfully'
        });
        
        // Reset form
        setRating(0);
        setComment('');
        setImages([]);
        
        if (onSubmit) {
          onSubmit(response.data);
        }
      }
    } catch (error) {
      console.error('Review submission error:', error.response?.data || error);
      Toast.show({
        type: 'error',
        text1: error.response?.data?.message || 'Failed to submit review'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Animated.View style={styles.formContainer}>
      {/* Rating Section */}
      <View style={styles.ratingSection}>
        <Text style={styles.sectionTitle}>Rate this Product</Text>
        <View style={styles.starsContainer}>
          <Rating
            type="custom"
            ratingCount={5}
            imageSize={35}
            startingValue={rating}
            onFinishRating={setRating}
            ratingColor="#FFD700"
            ratingBackgroundColor="#d4d4d4"
            tintColor="#f8f8f8"
            showRating={false}
          />
          <Text style={styles.ratingText}>
            {rating > 0 ? `${rating} Stars` : 'Tap to rate'}
          </Text>
        </View>
      </View>

      {/* Review Text Section */}
      <View style={styles.reviewSection}>
        <Text style={styles.sectionTitle}>Write Your Review</Text>
        <TextInput
          style={styles.reviewInput}
          multiline
          numberOfLines={4}
          placeholder="Share your experience with this product..."
          placeholderTextColor="#999"
          value={comment}
          onChangeText={setComment}
          maxLength={500}
        />
        <Text style={styles.characterCount}>
          {comment.length}/500 characters
        </Text>
      </View>

      {/* Image Upload Section */}
      <View style={styles.imageSection}>
        <Text style={styles.sectionTitle}>Add Photos</Text>
        <Text style={styles.imageSubtitle}>
          Share photos of your experience (Optional)
        </Text>
        
        <View style={styles.imageGrid}>
          {images.map((uri, index) => (
            <View key={index} style={styles.imagePreviewContainer}>
              <Image 
                source={{ uri }} 
                style={styles.previewImage}
              />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => removeImage(index)}
              >
                <Ionicons name="close-circle" size={24} color="#FF4444" />
              </TouchableOpacity>
            </View>
          ))}
          
          {images.length < 5 && (
            <TouchableOpacity
              style={styles.addImageButton}
              onPress={handleImagePick}
            >
              <Ionicons name="camera" size={30} color="#666" />
              <Text style={styles.addImageText}>
                Add Photo
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {uploadProgress > 0 && uploadProgress < 100 && (
          <View style={styles.progressContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${uploadProgress}%` }
              ]} 
            />
            <Text style={styles.progressText}>
              Uploading... {uploadProgress}%
            </Text>
          </View>
        )}
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          isSubmitting && styles.submitButtonDisabled
        ]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.submitButtonText}>
            Submit Review
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const ProductDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const { cartItems, addToCart, updateQuantity } = useCart();
  const { wishlistItems, addToWishlist, removeFromWishlist } = useWishlist();
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  
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
  const [selectedImage, setSelectedImage] = useState(null);
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Add this animation value for tab bar
  const tabBarAnimation = useRef(new Animated.Value(1)).current;

  const { shouldRefresh, resetRefresh } = useReview();

  const [showReviewForm, setShowReviewForm] = useState(false);

  // Add this state variable
  const [hasReviewed, setHasReviewed] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      const response = await reviewApi.getProductReviews(id);
      if (response.success) {
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
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to load reviews'
      });
    }
  }, [id]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Add this function to check if user can review
  const checkReviewEligibility = async () => {
    if (!isAuthenticated || !id) return;

    try {
      const response = await reviewApi.checkUserReview(id);
      const { canReview: isEligible, hasReviewed: alreadyReviewed, orderId: completedOrderId } = response;
      
      setCanReview(isEligible);
      setHasReviewed(alreadyReviewed);
      setOrderId(completedOrderId);

      if (!completedOrderId && isEligible) {
        Toast.show({
          type: 'error',
          text1: 'You can only review products from completed orders'
        });
      }
    } catch (error) {
      console.error('Error checking review eligibility:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && id) {
      checkReviewEligibility();
    }
  }, [isAuthenticated, id]);

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
      await addToCart(id, 1);
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

  // Update handleReviewSubmit to set hasReviewed
  const handleReviewSubmit = async (reviewData) => {
    try {
      const formData = new FormData();
      formData.append('rating', reviewData.rating.toString());
      formData.append('comment', reviewData.comment);
      formData.append('orderId', reviewData.orderId);

      // Add images if any
      if (reviewData.images && reviewData.images.length > 0) {
        reviewData.images.forEach((image, index) => {
          const imageFile = {
            uri: image,
            type: 'image/jpeg',
            name: `review_image_${index}.jpg`
          };
          formData.append('images', imageFile);
        });
      }

      console.log('Submitting review with formData:', {
        productId: id,
        rating: reviewData.rating,
        comment: reviewData.comment,
        orderId: reviewData.orderId,
        imagesCount: reviewData.images?.length || 0
      });

      const response = await axios.post(
        `/api/reviews/products/${id}/reviews`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Review submitted successfully'
        });
        setShowReviewForm(false);
        setHasReviewed(true);
        setCanReview(false);
        fetchReviews();
      }
    } catch (error) {
      console.error('Create review error:', error.response?.data || error);
      Toast.show({
        type: 'error',
        text1: error.response?.data?.message || 'Failed to submit review'
      });
    }
  };

  // Add this function to handle review likes
  const handleReviewLike = async (reviewId) => {
    if (!isAuthenticated) {
      Toast.show({
        type: 'error',
        text1: 'Please login to like reviews'
      });
      return;
    }

    try {
      const response = await reviewApi.toggleReviewLike(reviewId);
      if (response.success) {
        // Update reviews state to reflect the new like status
        setReviews(prevReviews => 
          prevReviews.map(review => {
            if (review._id === reviewId) {
              const userLikedIndex = review.likes.indexOf(user._id);
              const updatedLikes = [...review.likes];
              
              if (userLikedIndex === -1) {
                // Add like
                updatedLikes.push(user._id);
              } else {
                // Remove like
                updatedLikes.splice(userLikedIndex, 1);
              }
              
              return {
                ...review,
                likes: updatedLikes
              };
            }
            return review;
          })
        );
      }
    } catch (error) {
      console.error('Error toggling review like:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to update like'
      });
    }
  };

  // Update handleReviewDelete to reset hasReviewed
  const handleReviewDelete = async (reviewId) => {
    if (!isAuthenticated) {
      Toast.show({
        type: 'error',
        text1: 'Please login to delete review'
      });
      return;
    }

    try {
      const response = await reviewApi.deleteReview(reviewId);
      if (response.success) {
        // Remove the deleted review from state
        setReviews(prevReviews => prevReviews.filter(review => review._id !== reviewId));
        
        // Update review stats
        setRatingStats(prevStats => ({
          ...prevStats,
          totalReviews: prevStats.totalReviews - 1
        }));

        setHasReviewed(false);
        setCanReview(true);
        Toast.show({
          type: 'success',
          text1: 'Review deleted successfully'
        });
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      Toast.show({
        type: 'error',
        text1: error.message || 'Failed to delete review'
      });
    }
  };

  // Add this function to handle review editing
  const handleReviewEdit = async (reviewId, updatedData) => {
    if (!isAuthenticated) {
      Toast.show({
        type: 'error',
        text1: 'Please login to edit review'
      });
      return;
    }

    try {
      const response = await reviewApi.updateReview(reviewId, updatedData);
      if (response.success) {
        // Update the edited review in state
        setReviews(prevReviews =>
          prevReviews.map(review =>
            review._id === reviewId ? { ...review, ...updatedData } : review
          )
        );

        Toast.show({
          type: 'success',
          text1: 'Review updated successfully'
        });
      }
    } catch (error) {
      console.error('Error updating review:', error);
      Toast.show({
        type: 'error',
        text1: error.message || 'Failed to update review'
      });
    }
  };

  // Modify the reviews section to include the "Write Review" button
  const renderReviewsHeader = () => (
    <View style={styles.reviewsHeader}>
      <Text style={styles.reviewsTitle}>Reviews ({reviews.length})</Text>
      {canReview && !hasReviewed && (
        <TouchableOpacity
          style={styles.writeReviewButton}
          onPress={() => setShowReviewForm(true)}
        >
          <Text style={styles.writeReviewButtonText}>Write Review</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Add this modal to your render method
  const renderReviewFormModal = () => (
    <Modal
      visible={showReviewForm}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowReviewForm(false)}
    >
      <View style={styles.modalOverlay}>
        <ReviewForm
          productId={id}
          onSubmit={handleReviewSubmit}
        />
      </View>
    </Modal>
  );

  const renderReviewSection = () => {
    return (
      <View style={styles.reviewsSection}>
        <Text style={styles.sectionTitle}>Reviews</Text>

        {isAuthenticated ? (
          <>
            {canReview && !hasReviewed ? (
              <ReviewForm 
                productId={id}
                onSubmit={handleReviewSubmit}
              />
            ) : hasReviewed ? (
              <View style={styles.messageContainer}>
                <Text style={styles.messageText}>
                  You have already reviewed this product
                </Text>
              </View>
            ) : (
              <View style={styles.messageContainer}>
                <Text style={styles.messageText}>
                  Only customers who have purchased and received this product can write a review
                </Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>
              Please login to write a review
            </Text>
          </View>
        )}

        {/* Existing reviews list */}
        <View style={styles.reviewsList}>
          {reviews.map(review => (
            <ReviewItem 
              key={review._id}
              review={review}
              currentUserId={user?._id}
              onLike={handleReviewLike}
            />
          ))}
        </View>
      </View>
    );
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
                  onPress={() => handleUpdateQuantity(id, cartItem.quantity, -1)}
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
                  onPress={() => handleUpdateQuantity(id, cartItem.quantity, 1)}
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

        {renderReviewSection()}
      </ScrollView>

      {/* Add the review form modal */}
      {renderReviewFormModal()}

      {/* Image Viewer Modal */}
      <CustomImageViewer
        visible={!!selectedImage}
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
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
  reviewsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 999,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  fullImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  formContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  starsContainer: {
    alignItems: 'center',
  },
  ratingText: {
    marginTop: 8,
    color: '#666',
    fontSize: 16,
  },
  reviewSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  imageSection: {
    marginBottom: 24,
  },
  imageSubtitle: {
    color: '#666',
    fontSize: 14,
    marginBottom: 12,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imagePreviewContainer: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 2,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  addImageText: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
  progressContainer: {
    marginTop: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#4CAF50',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#B0C4DE',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  writeReviewButton: {
    backgroundColor: '#4169E1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  writeReviewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  imageViewerContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  messageContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
  },
  messageText: {
    color: '#666',
    fontSize: 16,
  },
  reviewsList: {
    marginTop: 16,
  },
});

export default ProductDetailScreen; 