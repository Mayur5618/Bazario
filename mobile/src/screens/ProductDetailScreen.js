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

const ReviewForm = ({ onSubmit, productId, orderId }) => {
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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [4, 3],
        selectionLimit: 5,
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

    if (!orderId) {
      Toast.show({
        type: 'error',
        text1: 'Order ID is missing'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const reviewData = {
        rating,
        comment: comment.trim(),
        images,
        orderId: orderId.toString()
      };

      console.log('ReviewForm - Submitting review with data:', reviewData);

      await onSubmit(reviewData);

      // Reset form
      setRating(0);
      setComment('');
      setImages([]);
      setUploadProgress(0);
    } catch (error) {
      console.error('Review submission error:', error);
      Toast.show({
        type: 'error',
        text1: error.message || 'Failed to submit review'
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

const AccordionSection = ({ title, isOpen, onToggle, children }) => {
  const animationHeight = useRef(new Animated.Value(isOpen ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animationHeight, {
      toValue: isOpen ? 1 : 0,
      duration: 150,
      useNativeDriver: true,
      easing: Easing.linear,
    }).start();
  }, [isOpen]);

  return (
    <View style={styles.accordionContainer}>
      <TouchableOpacity 
        style={[
          styles.accordionHeader,
          isOpen && styles.accordionHeaderActive
        ]} 
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <Text style={styles.accordionTitle}>{title}</Text>
        <Ionicons 
          name={isOpen ? 'chevron-up' : 'chevron-down'} 
          size={24} 
          color="#666"
        />
      </TouchableOpacity>
      
      {isOpen && (
        <Animated.View 
          style={[
            styles.accordionContent,
            {
              opacity: animationHeight,
              transform: [{
                translateY: animationHeight.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              }],
            }
          ]}
        >
          {children}
        </Animated.View>
      )}
    </View>
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
  const [buyerCity, setBuyerCity] = useState('');
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

  const [openSection, setOpenSection] = useState('');

  const imageScrollViewRef = useRef(null);

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

  useEffect(() => {
    fetchBuyerCity();
  }, []);

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
        console.log('Review eligibility response:', response);
        
        const { canReview: isEligible, hasReviewed: alreadyReviewed, orderId: completedOrderId } = response;
        
        setCanReview(isEligible);
        setHasReviewed(alreadyReviewed);
        setOrderId(completedOrderId);

        console.log('Review eligibility state:', {
            canReview: isEligible,
            hasReviewed: alreadyReviewed,
            orderId: completedOrderId
        });

        
    } catch (error) {
        console.error('Error checking review eligibility:', error);
        Toast.show({
            type: 'error',
            text1: 'Error checking review eligibility'
        });
    }
  };

  useEffect(() => {
    if (isAuthenticated && id) {
      checkReviewEligibility();
    }
  }, [isAuthenticated, id]);

  useEffect(() => {
    fetchProductDetails();
  }, [id, buyerCity]);

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
      const response = await axios.get(`/api/products/${id}`, {
        params: {
          city: buyerCity // Add buyer city to params
        }
      });
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
        text1: 'Added to cart successfully',
        visibilityTime: 1800,
        position: 'top'
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to add to cart',
        visibilityTime: 1800,
        position: 'top'
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
        text1: newQuantity === 0 ? 'Removed from cart' : 'Updated quantity',
        visibilityTime: 1800,
        position: 'top'
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
          text1: 'Removed from wishlist',
          visibilityTime: 1800,
          position: 'top'
        });
      } else {
        await addToWishlist(id);
        Toast.show({
          type: 'success',
          text1: 'Added to wishlist',
          visibilityTime: 1800,
          position: 'top'
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
        console.log('Current orderId in state:', orderId);
        
        if (!orderId) {
            Toast.show({
                type: 'error',
                text1: 'Order ID is missing'
            });
            return;
        }

        // Create the review data object with orderId
        const reviewPayload = {
            ...reviewData,
            orderId: orderId.toString() // Convert orderId to string
        };

        console.log('Submitting review with payload:', reviewPayload);

        const response = await reviewApi.createReview(id, reviewPayload);

        if (response.success) {
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
        console.error('Review submission error:', error);
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
            <View style={styles.modalContent}>
                <TouchableOpacity 
                    style={styles.closeModalButton}
                    onPress={() => setShowReviewForm(false)}
                >
                    <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
                <ReviewForm
                    productId={id}
                    orderId={orderId}
                    onSubmit={(reviewData) => {
                        handleReviewSubmit(reviewData);
                        setShowReviewForm(false);
                    }}
                />
            </View>
        </View>
    </Modal>
  );

  const renderReviewSection = () => {
    return (
      <View style={styles.reviewsSection}>
        {/* Reviews Stats Card */}
        <View style={styles.reviewStatsCard}>
          <View style={styles.ratingOverview}>
            <Text style={styles.averageRating}>
              {ratingStats.averageRating.toFixed(1)}
            </Text>
            <View style={styles.starsContainer}>
              <Rating
                type="custom"
                ratingCount={5}
                imageSize={24}
                readonly
                startingValue={ratingStats.averageRating}
                ratingColor="#FFD700"
                ratingBackgroundColor="#d4d4d4"
              />
            </View>
            <Text style={styles.totalReviews}>
              Based on {ratingStats.totalReviews} {ratingStats.totalReviews === 1 ? 'review' : 'reviews'}
            </Text>
          </View>

          {/* Rating Bars */}
          <View style={styles.ratingBars}>
            {[5, 4, 3, 2, 1].map((star) => (
              <View key={star} style={styles.ratingBarRow}>
                <Text style={styles.ratingBarLabel}>{star} star</Text>
                <View style={styles.ratingBarBackground}>
                  <View 
                    style={[
                      styles.ratingBarFill,
                      { 
                        width: `${(ratingStats.ratingCounts[star] / ratingStats.totalReviews) * 100 || 0}%`,
                        backgroundColor: star === 5 && (ratingStats.ratingCounts[star] / ratingStats.totalReviews) * 100 === 100 ? '#FFD700' : '#e0e0e0'
                      }
                    ]}
                  />
                </View>
                <Text style={styles.ratingCount}>
                  {((ratingStats.ratingCounts[star] / ratingStats.totalReviews) * 100 || 0).toFixed(0)}%
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Write Review Section */}
        {isAuthenticated ? (
          <>
            {canReview && !hasReviewed ? (
              <TouchableOpacity
                style={styles.writeReviewButton}
                onPress={() => setShowReviewForm(true)}
              >
                <Ionicons name="create-outline" size={20} color="#FFF" />
                <Text style={styles.writeReviewButtonText}>Write a Review</Text>
              </TouchableOpacity>
            ) : hasReviewed ? (
              <View style={styles.reviewedMessage}>
                <View style={styles.reviewedMessageContent}>
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  <Text style={styles.reviewedMessageText}>
                    You have already reviewed this product
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.cannotReviewMessage}>
                <View style={styles.cannotReviewContent}>
                  <Ionicons name="information-circle" size={20} color="#F4511E" />
                  <Text style={styles.cannotReviewMessageText}>
                    Only verified buyers can write a review
                  </Text>
                </View>
              </View>
            )}
          </>
        ) : (
          <TouchableOpacity
            style={styles.loginToReviewButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.loginToReviewText}>Login to Write a Review</Text>
          </TouchableOpacity>
        )}

        {/* Reviews List */}
        <View style={styles.reviewsList}>
          <Text style={styles.reviewsListTitle}>Customer Reviews</Text>
          {reviews && reviews.length > 0 ? (
            reviews.map((review, index) => (
              <View key={review._id} style={styles.reviewCard}>
                {/* User Info */}
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewerInfo}>
                    {review.buyer?.profileImage ? (
                      <Image 
                        source={{ uri: review.buyer.profileImage }}
                        style={styles.reviewerImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>
                          {review.buyer?.firstname?.[0]?.toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <View>
                      <Text style={styles.reviewerName}>
                        {review.buyer.firstname} {review.buyer.lastname}
                      </Text>
                      <Text style={styles.reviewDate}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <Rating
                    type="custom"
                    ratingCount={5}
                    imageSize={16}
                    readonly
                    startingValue={review.rating}
                    ratingColor="#FFD700"
                  />
                </View>

                {/* Review Content */}
                <Text style={styles.reviewComment}>{review.comment}</Text>

                {/* Seller Reply Section */}
                {review.replies && review.replies.length > 0 && (
                  <View style={styles.replySection}>
                    {review.replies.map((reply, replyIndex) => (
                      <View key={replyIndex} style={styles.replyCard}>
                        <View style={styles.replyHeader}>
                          <View style={styles.replyUserInfo}>
                            {product.seller.profileImage ? (
                              <Image 
                                source={{ uri: product.seller.profileImage }}
                                style={styles.replyUserImage}
                                resizeMode="cover"
                              />
                            ) : (
                              <View style={[styles.avatarContainer, { backgroundColor: '#4CAF50' }]}>
                                <Text style={styles.avatarText}>
                                  {product.seller.shopName?.[0]?.toUpperCase()}
                                </Text>
                              </View>
                            )}
                            <View style={styles.replyUserDetails}>
                              <View style={styles.replyUserNameContainer}>
                                <Text style={styles.replyUserName}>
                                  {product.seller.shopName}
                                </Text>
                                <View style={styles.sellerBadge}>
                                  <Ionicons name="shield-checkmark" size={12} color="#fff" />
                                  <Text style={styles.sellerBadgeText}>Seller</Text>
                                </View>
                              </View>
                              <Text style={styles.replyDate}>
                                {new Date(reply.createdAt).toLocaleDateString()}
                              </Text>
                            </View>
                          </View>
                        </View>
                        <Text style={styles.replyComment}>{reply.comment}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Review Images */}
                {review.images && review.images.length > 0 && (
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.reviewImagesContainer}
                  >
                    {review.images.map((image, imgIndex) => (
                      <TouchableOpacity
                        key={imgIndex}
                        onPress={() => setSelectedImage(image)}
                      >
                        <Image
                          source={{ uri: image }}
                          style={styles.reviewImage}
                        />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            ))
          ) : (
            <View style={styles.noReviewsContainer}>
              <Ionicons name="chatbubble-outline" size={40} color="#666" />
              <Text style={styles.noReviewsText}>No reviews yet</Text>
              <Text style={styles.noReviewsSubText}>Be the first to review this product</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderDescriptionSection = () => {
    console.log('Product data in description section:', product); // Debug log
    return (
      <AccordionSection
        title="Product Description"
        isOpen={openSection === 'description'}
        onToggle={() => setOpenSection(openSection === 'description' ? '' : 'description')}
      >
        <View style={styles.descriptionContent}>
          {product ? (
            <>
              <Text style={styles.descriptionText}>
                {product.description || 'No description available'}
              </Text>
              <View style={styles.specificationsList}>
                <View style={styles.specificationItem}>
                  <Text style={styles.specLabel}>Price:</Text>
                  <Text style={styles.specValue}>₹{product.price}</Text>
                </View>
                {product.unitSize && (
                  <View style={styles.specificationItem}>
                    <Text style={styles.specLabel}>Unit Size:</Text>
                    <Text style={styles.specValue}>{product.unitSize} {product.unitType}</Text>
                  </View>
                )}
                <View style={styles.specificationItem}>
                  <Text style={styles.specLabel}>Stock Status:</Text>
                  <Text style={[
                    styles.specValue,
                    { color: product.stock > 0 ? '#4CAF50' : '#F44336' }
                  ]}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </Text>
                </View>
                {product.category && (
                  <View style={styles.specificationItem}>
                    <Text style={styles.specLabel}>Category:</Text>
                    <Text style={styles.specValue}>{product.category}</Text>
                  </View>
                )}
              </View>
            </>
          ) : (
            <Text style={styles.noDescriptionText}>Loading product details...</Text>
          )}
        </View>
      </AccordionSection>
    );
  };

  const renderReviewsAccordion = () => (
    <AccordionSection
      title={`Reviews & Ratings (${product?.numReviews || 0})`}
      isOpen={openSection === 'reviews'}
      onToggle={() => setOpenSection(openSection === 'reviews' ? '' : 'reviews')}
    >
      <View style={styles.reviewsContent}>
        {renderReviewsHeader()}
        {renderReviewSection()}
      </View>
    </AccordionSection>
  );

  const renderRelatedProducts = () => {
    if (!product?.relatedProducts?.length) return null;

    const handleRelatedProductPress = (productId) => {
      // First scroll to top
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      // Then navigate to the product
      router.push(`/product/${productId}`);
    };

    return (
      <View style={styles.relatedProductsContainer}>
        <Text style={styles.relatedProductsTitle}>Related Products</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.relatedProductsSlider}
        >
          {product.relatedProducts.map((relatedProduct) => (
            <TouchableOpacity
              key={relatedProduct._id}
              style={styles.relatedProductCard}
              onPress={() => handleRelatedProductPress(relatedProduct._id)}
            >
              <Image
                source={{ uri: relatedProduct.images[0] }}
                style={styles.relatedProductImage}
              />
              <Text style={styles.relatedProductName} numberOfLines={2}>
                {relatedProduct.name}
              </Text>
              <Text style={styles.relatedProductPrice}>
                ₹{relatedProduct.price}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Update handleShopNow function
  const handleShopNow = async () => {
    if (!user) {
      Toast.show({
        type: 'error',
        text1: 'Please login to continue shopping'
      });
      router.push('/login');
      return;
    }

    if (product.stock <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Product is out of stock'
      });
      return;
    }

    // Create the order item with all necessary product details
    const orderItem = {
      product: {
        _id: product._id,
        name: product.name,
        price: product.price,
        images: product.images
      },
      quantity: 1
    };

    console.log('Shop Now - Order Item:', orderItem); // Debug log

    // Navigate to checkout with direct order data
    router.push({
      pathname: '/(app)/checkout',
      params: {
        items: JSON.stringify([orderItem]),
        totalAmount: product.price.toString(),
        buyNow: 'true',
        directOrder: 'true'
      }
    });
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
        {/* Product Images Slider */}
        <View style={styles.imageSliderContainer}>
          <ScrollView
            ref={imageScrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const offset = e.nativeEvent.contentOffset.x;
              const newIndex = Math.round(offset / Dimensions.get('window').width);
              setActiveImageIndex(newIndex);
            }}
            scrollEventThrottle={16}
          >
            {product.images.map((image, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedImage(image)}
                activeOpacity={0.9}
              >
                <Image
                  source={{ uri: image }}
                  style={styles.mainImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Image Indicators */}
          <View style={styles.indicatorContainer}>
            {product.images.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  imageScrollViewRef.current?.scrollTo({
                    x: index * Dimensions.get('window').width,
                    animated: true
                  });
                  setActiveImageIndex(index);
                }}
                style={[
                  styles.indicator,
                  index === activeImageIndex && styles.activeIndicator
                ]}
              />
            ))}
          </View>
        </View>

        {/* Product Details Card */}
        <View style={styles.detailsCard}>
          {/* Product Name */}
          <Text style={styles.productName}>{product.name}</Text>

          {/* Rating Section */}
          <View style={styles.ratingsContainer}>
            <View style={styles.ratingWrapper}>
              <Rating
                type="custom"
                ratingCount={5}
                imageSize={16}
                readonly
                startingValue={ratingStats.averageRating}
                ratingColor="#FFD700"
                ratingBackgroundColor="#d4d4d4"
              />
              <Text style={styles.reviewCount}>
                ({ratingStats.totalReviews} {ratingStats.totalReviews === 1 ? 'review' : 'reviews'})
              </Text>
            </View>
          </View>

          {/* Price Section */}
          <View style={styles.priceWrapper}>
            <View style={styles.priceContainer}>
              <Text style={styles.priceSymbol}>₹</Text>
              <Text style={styles.price}>{product.price}</Text>
              <Text style={styles.perPiece}>per {product.unitType}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            {!cartItem ? (
              <TouchableOpacity 
                style={[styles.actionButton, styles.addToCartButton]}
                onPress={handleAddToCart}
              >
                <Ionicons name="cart-outline" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.actionButtonText}>Add to Cart</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.quantityControlsContainer}>
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={() => handleUpdateQuantity(id, cartItem.quantity, -1)}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <View style={styles.quantityDisplay}>
                  <Text style={styles.quantityText}>{cartItem.quantity}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={() => handleUpdateQuantity(id, cartItem.quantity, 1)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity 
              style={[
                styles.shopNowButton,
                product.stock <= 0 && styles.disabledButton
              ]}
              onPress={handleShopNow}
              disabled={product.stock <= 0}
            >
              <Ionicons name="cart" size={24} color="#fff" />
              <Text style={styles.shopNowButtonText}>
                {product.stock <= 0 ? 'Out of Stock' : 'Shop Now'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Seller Info - Moved here */}
        <TouchableOpacity 
          style={styles.sellerInfoContainer}
          onPress={() => router.push(`/seller/${product.seller._id}`)}
        >
          <View style={styles.sellerInfoContent}>
            <View style={styles.sellerImageContainer}>
              {product.seller.profileImage ? (
                <Image 
                  source={{ uri: product.seller.profileImage }}
                  style={styles.sellerImage}
                />
              ) : (
                <View style={styles.sellerImagePlaceholder}>
                  <Text style={styles.sellerImagePlaceholderText}>
                    {product.seller.shopName.charAt(0)}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.sellerDetails}>
              <Text style={styles.sellerName}>{product.seller.shopName}</Text>
              <View style={styles.sellerStats}>
                <View style={styles.sellerRatingContainer}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.sellerRating}>
                    {product.seller.rating || "New"}
                  </Text>
                </View>
                <Text style={styles.sellerProductsCount}>
                  {product.seller.productsCount || product.seller.totalProducts || 0} Products
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </View>
        </TouchableOpacity>

        {renderDescriptionSection()}
        {renderReviewsAccordion()}
        {renderRelatedProducts()}
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
  imageSliderContainer: {
    position: 'relative',
    width: '100%',
    height: 300,
  },
  mainImage: {
    width: Dimensions.get('window').width,
    height: 300,
    backgroundColor: '#fff',
  },
  productInfo: {
    padding: 16,
  },
  productName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  price: {
    fontSize: 24,
    color: '#1a1a1a',
    fontWeight: '700',
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
    gap: 12,
    marginHorizontal: -8,
  },
  buttonWrapper: {
    width: '100%',
    height: 45,
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    elevation: 2,
    marginHorizontal: -4,
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
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#4169E1',
    marginHorizontal: -4,
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
    backgroundColor: '#fff',
    padding: 0,
    width: '100%',
    marginTop: 0,
  },
  reviewStatsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  ratingOverview: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  averageRating: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  starsContainer: {
    marginBottom: 8,
  },
  totalReviews: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  ratingBars: {
    width: '100%',
  },
  ratingBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    height: 24,
  },
  ratingBarLabel: {
    width: 60,
    fontSize: 14,
    color: '#666',
  },
  ratingBarBackground: {
    flex: 1,
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  ratingCount: {
    width: 40,
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  reviewsListTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
    marginTop: 0,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    width: '100%',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4169E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
  },
  reviewComment: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  reviewImagesContainer: {
    marginBottom: 8,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 6,
    marginRight: 8,
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
    marginTop: 8,
    width: '100%',
    paddingHorizontal: 0,
  },
  closeModalButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  accordionContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  accordionHeaderActive: {
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  accordionContent: {
    padding: 16,
    backgroundColor: '#fff',
  },
  descriptionContent: {
    padding: 20,
  },
  descriptionText: {
    fontSize: 16,
    color: '#4a4a4a',
    lineHeight: 24,
  },
  specificationsList: {
    marginTop: 20,
  },
  specificationItem: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  specLabel: {
    width: 120,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  specValue: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  reviewsContent: {
    padding: 0,
    width: '100%',
  },
  relatedProductsContainer: {
    marginTop: 24,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  relatedProductsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  relatedProductsSlider: {
    paddingHorizontal: 16,
  },
  relatedProductCard: {
    width: 140,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  relatedProductImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  relatedProductName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    padding: 8,
    height: 46,
    numberOfLines: 2,
    ellipsizeMode: 'tail',
  },
  relatedProductPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E31837',
    padding: 8,
    paddingTop: 0,
  },
  noDescriptionText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  leftButton: {
    left: 10,
  },
  rightButton: {
    right: 10,
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeIndicator: {
    backgroundColor: '#fff',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  reviewedMessage: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 16,
    paddingHorizontal: 20,
    marginHorizontal: 12,
    marginBottom: 8,
    width: '95%',
    alignSelf: 'center',
  },
  reviewedMessageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
  },
  reviewedMessageText: {
    flex: 1,
    fontSize: 14,
    color: '#2E7D32',
    marginLeft: 12,
    fontWeight: '500',
  },
  cannotReviewMessage: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  cannotReviewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cannotReviewMessageText: {
    flex: 1,
    fontSize: 14,
    color: '#F4511E',
    fontWeight: '500',
  },
  loginToReviewButton: {
    backgroundColor: '#4169E1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  loginToReviewText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  noReviewsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  noReviewsText: {
    fontSize: 16,
    color: '#333',
    marginTop: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  noReviewsSubText: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  sellerInfoContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    overflow: 'hidden',
  },
  sellerInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  sellerImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    marginRight: 12,
  },
  sellerImage: {
    width: '100%',
    height: '100%',
  },
  sellerImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#4169E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerImagePlaceholderText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  sellerStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  sellerRating: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  sellerProductsCount: {
    fontSize: 14,
    color: '#666',
  },
  detailsCard: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 16,
  },
  ratingsContainer: {
    marginBottom: 16,
  },
  ratingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
  },
  priceWrapper: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceSymbol: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '600',
    marginRight: 2,
  },
  price: {
    fontSize: 24,
    color: '#1a1a1a',
    fontWeight: '700',
  },
  perPiece: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  actionButtonsContainer: {
    gap: 12,
    marginHorizontal: -8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    elevation: 2,
    marginHorizontal: -4,
  },
  buttonIcon: {
    marginRight: 8,
  },
  addToCartButton: {
    backgroundColor: '#4169E1',
  },
  shopNowButton: {
    backgroundColor: '#6B46C1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  shopNowButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  quantityControlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#4169E1',
    marginHorizontal: -4,
  },
  quantityButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4169E1',
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  quantityDisplay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  replySection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  replyCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  replyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  replyUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  replyUserImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  replyUserDetails: {
    flex: 1,
  },
  replyUserNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  replyUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  sellerBadge: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  sellerBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  replyDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  replyComment: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  reviewerImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
});

export default ProductDetailScreen; 