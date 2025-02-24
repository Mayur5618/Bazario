import React from 'react';
import { View, Text, Image, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const ReviewItem = ({ review, onLike, onDelete, onEdit, currentUserId }) => {
  const { user } = useAuth();
  const isLiked = review.likes?.includes(user?._id);
  const isOwnReview = currentUserId === review.buyer._id;

  const handleDelete = () => {
    Alert.alert(
      'Delete Review',
      'Are you sure you want to delete this review?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          onPress: () => onDelete(review._id),
          style: 'destructive'
        }
      ]
    );
  };

  return (
    <View style={styles.reviewCard}>
      {/* User Info Section */}
      <View style={styles.reviewHeader}>
        <View style={styles.userInfo}>
          {review.buyer.profilePic ? (
            <Image 
              source={{ uri: review.buyer.profilePic }}
              style={styles.profilePic}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {review.buyer.firstname?.[0]?.toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.nameAndDate}>
            <Text style={styles.userName}>{review.buyer.firstname}</Text>
            <Text style={styles.date}>
              {new Date(review.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Edit/Delete buttons for own review */}
        {isOwnReview && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              onPress={() => onEdit(review)}
              style={styles.actionButton}
            >
              <Ionicons name="pencil" size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleDelete}
              style={styles.actionButton}
            >
              <Ionicons name="trash" size={20} color="#FF4444" />
            </TouchableOpacity>
          </View>
        )}

        {/* Rating Stars */}
        <View style={styles.ratingContainer}>
          {[...Array(5)].map((_, index) => (
            <Ionicons
              key={index}
              name={index < review.rating ? "star" : "star-outline"}
              size={16}
              color="#FFD700"
            />
          ))}
        </View>
      </View>

      {/* Review Content */}
      <Text style={styles.comment}>{review.comment}</Text>

      {/* Review Images */}
      {review.images?.length > 0 && (
        <View style={styles.imagesContainer}>
          {review.images.map((image, index) => (
            <Image
              key={index}
              source={{ uri: image }}
              style={styles.reviewImage}
            />
          ))}
        </View>
      )}

      {/* Updated Like Button */}
      <TouchableOpacity 
        style={styles.likeButton}
        onPress={() => onLike(review._id)}
      >
        <Ionicons
          name={isLiked ? "heart" : "heart-outline"}
          size={20}
          color={isLiked ? "#FF5252" : "#A0A0A0"}
        />
        <Text style={[
          styles.likeCount,
          isLiked && styles.likedCount
        ]}>
          {review.likes?.length || 0}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  reviewCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: 'column',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    color: '#666',
  },
  nameAndDate: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  comment: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  reviewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  likeCount: {
    fontSize: 14,
    color: '#666',
  },
  likedCount: {
    color: '#FF5252',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
});

export default ReviewItem; 