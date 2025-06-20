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
  RefreshControl,
  Modal,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { sellerApi } from '../../src/api/sellerApi';
import { useLanguage } from '../../src/context/LanguageContext';

// Translations for reviews tab
const translations = {
  en: {
    reviews28Days: "Reviews in\nLast 28 Days",
    repliedReviews: "Replied\nReviews",
    pendingReplies: "Pending\nReplies",
    searchProduct: "Search for product...",
    loadingReviews: "Loading reviews...",
    noReviews: "No reviews found",
    noReviewsSubtext: "Reviews will appear here when customers rate your products",
    replyToReview: "Reply to Review",
    writeReply: "Write your reply...",
    sendReply: "Send Reply",
    yourReply: "Your Reply:",
    reply: "Reply",
    error: "Error",
    success: "Success",
    pleaseWriteReply: "Please write a reply",
    replyAddedSuccess: "Your reply has been added successfully"
  },
  hi: {
    reviews28Days: "पिछले 28 दिनों की\nसमीक्षाएं",
    repliedReviews: "जवाब दी गई\nसमीक्षाएं",
    pendingReplies: "लंबित\nजवाब",
    searchProduct: "उत्पाद खोजें...",
    loadingReviews: "समीक्षाएं लोड हो रही हैं...",
    noReviews: "कोई समीक्षा नहीं मिली",
    noReviewsSubtext: "जब ग्राहक आपके उत्पादों की रेटिंग करेंगे तो समीक्षाएं यहां दिखाई देंगी",
    replyToReview: "समीक्षा का जवाब दें",
    writeReply: "अपना जवाब लिखें...",
    sendReply: "जवाब भेजें",
    yourReply: "आपका जवाब:",
    reply: "जवाब दें",
    error: "त्रुटि",
    success: "सफल",
    pleaseWriteReply: "कृपया जवाब लिखें",
    replyAddedSuccess: "आपका जवाब सफलतापूर्वक जोड़ दिया गया है"
  },
  mr: {
    reviews28Days: "मागील 28 दिवसांच्या\nसमीक्षा",
    repliedReviews: "उत्तर दिलेल्या\nसमीक्षा",
    pendingReplies: "प्रलंबित\nउत्तरे",
    searchProduct: "उत्पाद शोधा...",
    loadingReviews: "समीक्षा लोड होत आहेत...",
    noReviews: "कोणतीही समीक्षा सापडली नाही",
    noReviewsSubtext: "ग्राहक आपल्या उत्पादांना रेटिंग देतील तेव्हा समीक्षा येथे दिसतील",
    replyToReview: "समीक्षेला उत्तर द्या",
    writeReply: "आपले उत्तर लिहा...",
    sendReply: "उत्तर पाठवा",
    yourReply: "तुमचे उत्तर:",
    reply: "उत्तर द्या",
    error: "त्रुटी",
    success: "यशस्वी",
    pleaseWriteReply: "कृपया उत्तर लिहा",
    replyAddedSuccess: "तुमचे उत्तर यशस्वीरित्या जोडले गेले आहे"
  },
  gu: {
    reviews28Days: "છેલ્લા 28 દિવસની\nસમીક્ષાઓ",
    repliedReviews: "જવાબ આપેલી\nસમીક્ષાઓ",
    pendingReplies: "બાકી\nજવાબો",
    searchProduct: "ઉત્પાદ શોધો...",
    loadingReviews: "સમીક્ષાઓ લોડ થઈ રહી છે...",
    noReviews: "કોઈ સમીક્ષા મળી નથી",
    noReviewsSubtext: "જ્યારે ગ્રાહકો તમારા ઉત્પાદોને રેટિંગ આપશે ત્યારે સમીક્ષાઓ અહીં દેખાશે",
    replyToReview: "સમીક્ષાનો જવાબ આપો",
    writeReply: "તમારો જવાબ લખો...",
    sendReply: "જવાબ મોકલો",
    yourReply: "તમારો જવાબ:",
    reply: "જવાબ આપો",
    error: "ભૂલ",
    success: "સફળ",
    pleaseWriteReply: "કૃપા કરી જવાબ લખો",
    replyAddedSuccess: "તમારો જવાબ સફળતાપૂર્વક ઉમેરાયો છે"
  }
};

const ReviewsTab = () => {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalReviews28Days: 0,
    repliedReviews: 0,
    pendingReplies: 0
  });
  const [reviews, setReviews] = useState([]);
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

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

  const handleReplyPress = (review) => {
    setSelectedReview(review);
    setReplyText('');
    setReplyModalVisible(true);
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim()) {
      Alert.alert(t.error, t.pleaseWriteReply);
      return;
    }

    try {
      setReplying(true);
      const response = await sellerApi.replyToReview(selectedReview._id, replyText.trim());
      
      if (response.success) {
        const updatedReviews = reviews.map(review => 
          review._id === selectedReview._id ? response.review : review
        );
        setReviews(updatedReviews);
        
        setStats(prev => ({
          ...prev,
          repliedReviews: prev.repliedReviews + 1,
          pendingReplies: prev.pendingReplies - 1
        }));

        setReplyModalVisible(false);
        Alert.alert(t.success, t.replyAddedSuccess);
      }
    } catch (error) {
      Alert.alert(t.error, error.message || 'Failed to submit reply');
    } finally {
      setReplying(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
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
          <Text style={styles.replyLabel}>{t.yourReply}</Text>
          <Text style={styles.replyText}>{review.replies[0].comment}</Text>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.replyButton}
          onPress={() => handleReplyPress(review)}
        >
          <Text style={styles.replyButtonText}>{t.reply}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <>
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
            <Text style={styles.statLabel}>{t.reviews28Days}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
            <Text style={styles.statValue}>{stats.repliedReviews}</Text>
            <Text style={styles.statLabel}>{t.repliedReviews}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
            <Text style={styles.statValue}>{stats.pendingReplies}</Text>
            <Text style={styles.statLabel}>{t.pendingReplies}</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={t.searchProduct}
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
            <Text style={styles.loadingText}>{t.loadingReviews}</Text>
          </View>
        ) : (
          <View style={styles.reviewsList}>
            {reviews.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="star-outline" size={64} color="#CCC" />
                <Text style={styles.emptyStateText}>{t.noReviews}</Text>
                <Text style={styles.emptyStateSubtext}>{t.noReviewsSubtext}</Text>
              </View>
            ) : (
              reviews.map(review => renderReviewCard(review))
            )}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={replyModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setReplyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.replyToReview}</Text>
              <TouchableOpacity 
                onPress={() => setReplyModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.replyInput}
              placeholder={t.writeReply}
              value={replyText}
              onChangeText={setReplyText}
              multiline
              textAlignVertical="top"
            />

            <TouchableOpacity 
              style={[styles.submitButton, replying && styles.submitButtonDisabled]}
              onPress={handleSubmitReply}
              disabled={replying}
            >
              {replying ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitButtonText}>{t.sendReply}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
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
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  closeButton: {
    padding: 5,
  },
  replyInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 15,
    minHeight: 120,
    fontSize: 16,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#A5A5A5',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReviewsTab;