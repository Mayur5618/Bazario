import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import axios from '../config/axios';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';

const ProductDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params;
  const { addToCart, updateQuantity, cart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showQuantityControls, setShowQuantityControls] = useState(false);
  const [activeTab, setActiveTab] = useState('description'); // 'description' or 'reviews'

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

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

  const handleQuantityChange = (value) => {
    const newQuantity = quantity + value;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (!showQuantityControls) {
      setShowQuantityControls(true);
    } else {
      addToCart(product._id, quantity);
      setShowQuantityControls(false);
      setQuantity(1);
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <TouchableOpacity>
          <Ionicons name="share-social-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Main Product Image */}
        <Image
          source={{ uri: product.images[activeImageIndex] }}
          style={styles.mainImage}
          resizeMode="cover"
        />

        {/* Thumbnail Images */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.thumbnailContainer}
        >
          {product.images.map((image, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setActiveImageIndex(index)}
              style={[
                styles.thumbnailWrapper,
                activeImageIndex === index && styles.activeThumbnail
              ]}
            >
              <Image
                source={{ uri: image }}
                style={styles.thumbnail}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Product Info Card */}
        <View style={styles.productInfoCard}>
          <Text style={styles.productName}>{product.name}</Text>
          
          {/* Rating */}
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <FontAwesome 
                key={star}
                name="star-o"
                size={16}
                color="#FFD700"
              />
            ))}
            <Text style={styles.reviewCount}>({product.numReviews} reviews)</Text>
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{product.price}</Text>
            <Text style={styles.perKg}>per kg</Text>
            <TouchableOpacity style={styles.wishlistButton}>
              <Ionicons name="heart-outline" size={24} color="#FF69B4" />
            </TouchableOpacity>
          </View>

          {/* Stock Status */}
          <View style={styles.stockContainer}>
            <View style={styles.stockHeader}>
              <MaterialIcons name="inventory" size={20} color="#4169E1" />
              <Text style={styles.stockTitle}>Stock Status</Text>
            </View>
            <View style={styles.stockInfo}>
              <Text style={styles.stockText}>{product.stock} kgs available</Text>
              <View style={styles.stockBadge}>
                <Text style={styles.stockStatus}>Plenty in stock</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'description' && styles.activeTab]}
            onPress={() => setActiveTab('description')}
          >
            <Text style={[styles.tabText, activeTab === 'description' && styles.activeTabText]}>
              Description
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
            onPress={() => setActiveTab('reviews')}
          >
            <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
              Reviews
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'description' ? (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText}>{product.description}</Text>
          </View>
        ) : (
          <View style={styles.reviewsContainer}>
            {/* Rating Summary */}
            <View style={styles.ratingSummary}>
              <Text style={styles.averageRating}>4.0</Text>
              <View style={styles.ratingStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <FontAwesome key={star} name="star" size={16} color="#FFD700" />
                ))}
              </View>
              <Text style={styles.basedOnText}>Based on 1 review</Text>

              {/* Rating Bars */}
              <View style={styles.ratingBars}>
                {[5, 4, 3, 2, 1].map((star) => (
                  <View key={star} style={styles.ratingBarRow}>
                    <Text style={styles.starText}>{star} star</Text>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { width: star === 4 ? '100%' : '0%' }
                        ]} 
                      />
                    </View>
                    <Text style={styles.percentageText}>
                      {star === 4 ? '100%' : '0%'}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Individual Reviews */}
            <View style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewerInfo}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>M</Text>
                  </View>
                  <View>
                    <Text style={styles.reviewerName}>Mayuresh Thavle</Text>
                    <Text style={styles.reviewDate}>1/18/2025</Text>
                  </View>
                </View>
                <View style={styles.reviewRating}>
                  {[1, 2, 3, 4].map((star) => (
                    <FontAwesome key={star} name="star" size={14} color="#FFD700" />
                  ))}
                </View>
              </View>
              <Text style={styles.reviewText}>cbcbcbcbcb</Text>
              <View style={styles.reviewActions}>
                <TouchableOpacity style={styles.reviewAction}>
                  <Ionicons name="heart-outline" size={20} color="#666" />
                  <Text style={styles.actionCount}>0</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.reviewAction}>
                  <Ionicons name="chatbubble-outline" size={20} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.reviewAction}>
                  <Ionicons name="flag-outline" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.footer}>
        {showQuantityControls ? (
          <>
            <View style={styles.quantityControls}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(-1)}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityValue}>{quantity}</Text>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={styles.addToCartButton}
              onPress={handleAddToCart}
            >
              <Text style={styles.addToCartText}>Apply</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity 
            style={[styles.addToCartButton, styles.fullWidthButton]}
            onPress={handleAddToCart}
          >
            <Ionicons name="cart-outline" size={24} color="#FFF" style={styles.cartIcon} />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  mainImage: {
    width: '100%',
    height: 300,
  },
  thumbnailContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  thumbnailWrapper: {
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 2,
  },
  activeThumbnail: {
    borderColor: '#4169E1',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 6,
  },
  productInfoCard: {
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  productName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewCount: {
    marginLeft: 8,
    color: '#666',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4169E1',
  },
  perKg: {
    marginLeft: 8,
    color: '#666',
  },
  wishlistButton: {
    marginLeft: 'auto',
  },
  stockContainer: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
  },
  stockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stockTitle: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  stockInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockText: {
    fontSize: 14,
    color: '#333',
  },
  stockStatus: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    margin: 16,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#FFF',
    borderRadius: 6,
  },
  tabText: {
    color: '#666',
  },
  activeTabText: {
    color: '#4169E1',
    fontWeight: '600',
  },
  descriptionContainer: {
    padding: 16,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  ratingSummary: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
  },
  averageRating: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
  },
  ratingStars: {
    flexDirection: 'row',
    marginRight: 16,
  },
  basedOnText: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  ratingBars: {
    flex: 1,
  },
  ratingBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  starText: {
    width: 50,
    fontSize: 12,
    color: '#666',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 2,
    marginHorizontal: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 2,
  },
  percentageText: {
    width: 40,
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  reviewsContainer: {
    padding: 16,
  },
  reviewItem: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4169E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
  },
  reviewText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  reviewAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionCount: {
    marginLeft: 4,
    color: '#666',
    fontSize: 14,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 4,
    marginRight: 12,
  },
  quantityButton: {
    width: 36,
    height: 36,
    backgroundColor: '#4169E1',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: '600',
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
    minWidth: 24,
    textAlign: 'center',
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#4169E1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  addToCartText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  fullWidthButton: {
    flex: 1,
    marginHorizontal: 16,
  },
  cartIcon: {
    marginRight: 8,
  },
});

export default ProductDetailScreen; 