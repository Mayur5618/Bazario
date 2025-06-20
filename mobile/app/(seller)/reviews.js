import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { sellerApi } from '../../src/api/sellerApi';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const RatingStars = ({ rating }) => (
  <View style={styles.ratingContainer}>
    {[1, 2, 3, 4, 5].map((star) => (
      <Ionicons
        key={star}
        name={star <= rating ? "star" : "star-outline"}
        size={16}
        color={star <= rating ? "#FFD700" : "#666"}
      />
    ))}
  </View>
);

const ImageGalleryModal = ({ images, visible, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <Modal visible={visible} transparent={true} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={28} color="#FFF" />
        </TouchableOpacity>
        
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: images[currentIndex] }}
            style={styles.fullImage}
            resizeMode="contain"
          />
        </View>

        {images.length > 1 && (
          <View style={styles.navigationContainer}>
            {currentIndex > 0 && (
              <TouchableOpacity style={styles.navButton} onPress={goToPrevious}>
                <Ionicons name="chevron-back" size={30} color="#FFF" />
              </TouchableOpacity>
            )}
            
            <Text style={styles.imageCounter}>
              {currentIndex + 1} / {images.length}
            </Text>
            
            {currentIndex < images.length - 1 && (
              <TouchableOpacity style={styles.navButton} onPress={goToNext}>
                <Ionicons name="chevron-forward" size={30} color="#FFF" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </Modal>
  );
};

const ReviewCard = ({ review, onRefresh }) => {
  const [showGallery, setShowGallery] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleReply = async () => {
    if (!replyText.trim()) {
      Alert.alert('Error', 'Please enter a reply');
      return;
    }

    try {
      const response = await sellerApi.replyToReview(review._id, replyText);
      if (response.success) {
        Alert.alert('Success', 'Reply added successfully');
        setReplyText('');
        setShowReplyInput(false);
        onRefresh();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add reply');
    }
  };

  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.productInfo}>
          <Image
            source={{ uri: review.product.images[0] }}
            style={styles.productImage}
          />
          <View style={styles.productDetails}>
            <Text style={styles.productName}>{review.product.name}</Text>
            <Text style={styles.customerName}>
              by {review.buyer.firstname} {review.buyer.lastname}
            </Text>
          </View>
        </View>
        <RatingStars rating={review.rating} />
      </View>

      <Text style={styles.reviewText}>{review.comment}</Text>

      {review.images && review.images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageGallery}>
          {review.images.map((image, imgIndex) => (
            <TouchableOpacity
              key={imgIndex}
              onPress={() => {
                setSelectedImageIndex(imgIndex);
                setShowGallery(true);
              }}
            >
              <Image
                source={{ uri: image }}
                style={styles.reviewImage}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <View style={styles.reviewFooter}>
        <Text style={styles.reviewDate}>
          {new Date(review.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })}
        </Text>
        
        {!review.replies?.some(reply => reply.userType === 'seller') && (
          <TouchableOpacity 
            style={styles.replyButton}
            onPress={() => setShowReplyInput(!showReplyInput)}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#6C63FF" />
            <Text style={styles.replyButtonText}>Reply</Text>
          </TouchableOpacity>
        )}
      </View>

      {showReplyInput && (
        <View style={styles.replyContainer}>
          <TextInput
            style={styles.replyInput}
            placeholder="Write your reply..."
            value={replyText}
            onChangeText={setReplyText}
            multiline
          />
          <TouchableOpacity 
            style={styles.sendButton}
            onPress={handleReply}
          >
            <Ionicons name="send" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}

      {review.replies?.map((reply, replyIndex) => (
        <View key={replyIndex} style={styles.replyBox}>
          <Text style={styles.replyHeader}>
            Seller's Reply
          </Text>
          <Text style={styles.replyText}>{reply.comment}</Text>
        </View>
      ))}

      <ImageGalleryModal
        visible={showGallery}
        images={review.images || []}
        initialIndex={selectedImageIndex}
        onClose={() => setShowGallery(false)}
      />
    </View>
  );
};

const Reviews = () => {
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedRating, setSelectedRating] = useState(null);
  const [showImagesOnly, setShowImagesOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchReviews = async (isRefresh = false) => {
    try {
      setLoading(true);
      const params = {
        page: isRefresh ? 1 : page,
        search,
        rating: selectedRating,
        hasImages: showImagesOnly,
      };

      const response = await sellerApi.getReviews(params);
      
      if (response.success) {
        setReviews(isRefresh ? response.reviews : [...reviews, ...response.reviews]);
        setStats(response.stats);
        setHasMore(response.pagination.page < response.pagination.pages);
        if (isRefresh) setPage(1);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch reviews');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReviews(true);
  }, [search, selectedRating, showImagesOnly]);

  const onRefresh = async () => {
    setRefreshing(true);
    fetchReviews(true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      fetchReviews();
    }
  };

  const RatingFilter = ({ rating, count, isSelected, onPress }) => (
    <TouchableOpacity
      style={[
        styles.ratingFilter,
        isSelected && styles.ratingFilterSelected
      ]}
      onPress={onPress}
    >
      <RatingStars rating={rating} />
      <Text style={styles.ratingCount}>({count})</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Product Reviews',
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by product name"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[5, 4, 3, 2, 1].map((rating) => (
              <RatingFilter
                key={rating}
                rating={rating}
                count={stats[rating]}
                isSelected={selectedRating === rating}
                onPress={() => setSelectedRating(selectedRating === rating ? null : rating)}
              />
            ))}
          </ScrollView>
          <TouchableOpacity
            style={[styles.imageFilter, showImagesOnly && styles.imageFilterSelected]}
            onPress={() => setShowImagesOnly(!showImagesOnly)}
          >
            <Ionicons name="images-outline" size={20} color={showImagesOnly ? "#6C63FF" : "#666"} />
          </TouchableOpacity>
        </View>

        {/* Reviews List */}
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            const isEndReached = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
            if (isEndReached) loadMore();
          }}
          scrollEventThrottle={400}
        >
          {reviews.map((review, index) => (
            <ReviewCard 
              key={review._id} 
              review={review} 
              onRefresh={() => fetchReviews(true)} 
            />
          ))}

          {loading && <ActivityIndicator style={styles.loader} color="#6C63FF" />}
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    margin: 12,
    padding: 10,
    borderRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filtersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  ratingFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    elevation: 1,
  },
  ratingFilterSelected: {
    backgroundColor: '#6C63FF20',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingCount: {
    marginLeft: 4,
    color: '#666',
    fontSize: 12,
  },
  imageFilter: {
    padding: 8,
    backgroundColor: '#FFF',
    borderRadius: 20,
    elevation: 1,
  },
  imageFilterSelected: {
    backgroundColor: '#6C63FF20',
  },
  reviewCard: {
    backgroundColor: '#FFF',
    margin: 12,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  productImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  productDetails: {
    marginLeft: 12,
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  customerName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  reviewText: {
    fontSize: 14,
    color: '#1A1A1A',
    lineHeight: 20,
    marginBottom: 12,
  },
  imageGallery: {
    marginBottom: 12,
  },
  reviewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  loader: {
    padding: 16,
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
    zIndex: 1,
  },
  imageContainer: {
    width: screenWidth,
    height: screenHeight * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 40,
    width: '100%',
    paddingHorizontal: 20,
  },
  navButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    padding: 10,
  },
  imageCounter: {
    color: '#FFF',
    fontSize: 16,
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  replyButtonText: {
    color: '#6C63FF',
    marginLeft: 4,
    fontSize: 14,
  },
  replyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  replyInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 20,
    padding: 8,
  },
  replyBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  replyHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C63FF',
    marginBottom: 4,
  },
  replyText: {
    fontSize: 14,
    color: '#1A1A1A',
  },
});

export default Reviews; 