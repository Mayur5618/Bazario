import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { sellerApi } from '../../src/api/sellerApi';

const ReviewsTab = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalReviews28Days: 0,
    repliedReviews: 0,
    pendingReplies: 0
  });
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchReviewsData();
  }, []);

  const fetchReviewsData = async () => {
    try {
      setLoading(true);
      // Fetch reviews stats for last 28 days
      const statsResponse = await sellerApi.getReviewStats();
      if (statsResponse.success) {
        setStats(statsResponse.stats);
      }

      // Fetch latest 3 reviews
      const reviewsResponse = await sellerApi.getLatestReviews();
      if (reviewsResponse.success) {
        setReviews(reviewsResponse.reviews);
      }
    } catch (error) {
      console.error('Error fetching reviews data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchReviewsData();
    setRefreshing(false);
  }, []);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await sellerApi.searchProductReviews(searchQuery);
      if (response.success) {
        setReviews(response.reviews);
      }
    } catch (error) {
      console.error('Error searching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('hi-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderReviewCard = (review) => (
    <View key={review._id} style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: review.buyer.profileImage || 'https://via.placeholder.com/40' }}
            style={styles.userImage}
          />
          <View>
            <Text style={styles.userName}>
              {review.buyer.firstname} {review.buyer.lastname}
            </Text>
            <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
          </View>
        </View>
        <View style={styles.productInfo}>
          <Image
            source={{ uri: review.product.images[0] }}
            style={styles.productImage}
          />
          <Text style={styles.productName} numberOfLines={1}>
            {review.product.name}
          </Text>
        </View>
      </View>

      <Text style={styles.reviewText}>{review.comment}</Text>

      {review.images && review.images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
          {review.images.map((image, index) => (
            <Image key={index} source={{ uri: image }} style={styles.reviewImage} />
          ))}
        </ScrollView>
      )}

      {review.replies && review.replies.length > 0 ? (
        <View style={styles.replyContainer}>
          <Text style={styles.replyLabel}>आपका जवाब:</Text>
          <Text style={styles.replyText}>{review.replies[0].comment}</Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.replyButton}>
          <Text style={styles.replyButtonText}>जवाब दें</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
          <Text style={styles.statValue}>{stats.totalReviews28Days}</Text>
          <Text style={styles.statLabel}>पिछले 28 दिनों{'\n'}के रिव्यू</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
          <Text style={styles.statValue}>{stats.repliedReviews}</Text>
          <Text style={styles.statLabel}>जवाब दिए{'\n'}गए रिव्यू</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
          <Text style={styles.statValue}>{stats.pendingReplies}</Text>
          <Text style={styles.statLabel}>बिना जवाब{'\n'}के रिव्यू</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="प्रोडक्ट का नाम खोजें..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Ionicons name="search" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Reviews List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loadingText}>रिव्यू लोड हो रहे हैं...</Text>
        </View>
      ) : (
        <View style={styles.reviewsList}>
          {reviews.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubble-outline" size={64} color="#CCC" />
              <Text style={styles.emptyStateText}>कोई रिव्यू नहीं मिला</Text>
            </View>
          ) : (
            reviews.map(review => renderReviewCard(review))
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFF',
    elevation: 2,
  },
  statCard: {
    flex: 1,
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFF',
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#F5F5F5',
    borderRadius: 22,
    paddingHorizontal: 16,
    marginRight: 8,
    fontSize: 16,
  },
  searchButton: {
    width: 44,
    height: 44,
    backgroundColor: '#6C63FF',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewsList: {
    padding: 16,
  },
  reviewCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 32,
    height: 32,
    borderRadius: 6,
    marginRight: 8,
  },
  productName: {
    fontSize: 14,
    color: '#666',
    maxWidth: 100,
  },
  reviewText: {
    fontSize: 14,
    color: '#1A1A1A',
    marginBottom: 12,
    lineHeight: 20,
  },
  imageScroll: {
    marginBottom: 12,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  replyContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  replyLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  replyText: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  replyButton: {
    backgroundColor: '#6C63FF20',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  replyButtonText: {
    color: '#6C63FF',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
});

export default ReviewsTab;