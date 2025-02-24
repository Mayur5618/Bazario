import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Rating } from 'react-native-ratings';
import { reviewApi } from '../api/reviewApi';
import Toast from 'react-native-toast-message';
import { useReview } from '../context/ReviewContext';

const EditReviewScreen = () => {
  const router = useRouter();
  const { triggerRefresh } = useReview();
  const { reviewId, productId, onUpdate } = useLocalSearchParams();
  
  const [review, setReview] = useState({
    rating: 0,
    comment: '',
  });

  useEffect(() => {
    fetchReview();
  }, [reviewId]);

  const fetchReview = async () => {
    try {
      const response = await reviewApi.getReview(reviewId);
      if (response.success) {
        setReview({
          rating: response.review.rating,
          comment: response.review.comment,
        });
      }
    } catch (error) {
      console.error('Error fetching review:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to load review'
      });
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await reviewApi.editReview(reviewId, {
        rating: review.rating,
        comment: review.comment.trim()
      });

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Review updated successfully'
        });
        
        triggerRefresh();
        router.back();
      } else {
        throw new Error(response.message || 'Failed to update review');
      }
    } catch (error) {
      console.error('Submit error:', error);
      Toast.show({
        type: 'error',
        text1: error.message || 'Failed to update review'
      });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.ratingContainer}>
        <Text style={styles.label}>Rating</Text>
        <Rating
          type="star"
          ratingCount={5}
          imageSize={40}
          startingValue={review.rating}
          onFinishRating={(rating) => setReview(prev => ({ ...prev, rating }))}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Review</Text>
        <TextInput
          style={styles.textArea}
          multiline
          numberOfLines={4}
          value={review.comment}
          onChangeText={(text) => setReview(prev => ({ ...prev, comment: text }))}
          placeholder="Write your review here..."
        />
      </View>

      <TouchableOpacity 
        style={styles.submitButton}
        onPress={handleSubmit}
      >
        <Text style={styles.submitButtonText}>Update Review</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  ratingContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 20,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditReviewScreen; 