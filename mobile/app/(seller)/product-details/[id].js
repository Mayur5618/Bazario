import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { sellerApi } from '../../../src/api/sellerApi';
import { useLanguage } from '../../../src/context/LanguageContext';

const { width } = Dimensions.get('window');

// Translations for product details
const translations = {
  en: {
    productDetails: "Product Details",
    inStock: "In Stock",
    outOfStock: "Out of Stock",
    perPiece: "per piece",
    stock: "Stock",
    sold: "Sold",
    rating: "Rating",
    description: "Description",
    categoryAndTags: "Category and Tags",
    additionalInfo: "Additional Information",
    productId: "Product ID",
    created: "Created",
    updated: "Updated",
    loading: "Loading product details...",
    error: "Error",
    loadError: "Failed to load product details",
    shareProduct: "Share Product",
    shareText: "Check out this product:",
    shareError: "Error sharing product"
  },
  hi: {
    productDetails: "उत्पाद विवरण",
    inStock: "स्टॉक में",
    outOfStock: "स्टॉक ख़त्म",
    perPiece: "प्रति नग",
    stock: "स्टॉक",
    sold: "बिका",
    rating: "रेटिंग",
    description: "विवरण",
    categoryAndTags: "श्रेणी और टैग",
    additionalInfo: "अतिरिक्त जानकारी",
    productId: "उत्पाद आईडी",
    created: "बनाया गया",
    updated: "अपडेट किया गया",
    loading: "उत्पाद विवरण लोड हो रहा है...",
    error: "त्रुटि",
    loadError: "उत्पाद विवरण लोड करने में विफल",
    shareProduct: "उत्पाद शेयर करें",
    shareText: "इस उत्पाद को देखें:",
    shareError: "उत्पाद शेयर करने में त्रुटि"
  },
  mr: {
    productDetails: "उत्पाद तपशील",
    inStock: "स्टॉक मध्ये",
    outOfStock: "स्टॉक संपला",
    perPiece: "प्रति नग",
    stock: "स्टॉक",
    sold: "विकले",
    rating: "रेटिंग",
    description: "वर्णन",
    categoryAndTags: "श्रेणी आणि टॅग्स",
    additionalInfo: "अतिरिक्त माहिती",
    productId: "उत्पाद आयडी",
    created: "तयार केले",
    updated: "अपडेट केले",
    loading: "उत्पाद तपशील लोड होत आहे...",
    error: "त्रुटी",
    loadError: "उत्पाद तपशील लोड करण्यात अयशस्वी",
    shareProduct: "उत्पाद शेअर करा",
    shareText: "हे उत्पाद पहा:",
    shareError: "उत्पाद शेअर करण्यात त्रुटी"
  },
  gu: {
    productDetails: "ઉત્પાદ વિગતો",
    inStock: "સ્ટોકમાં છે",
    outOfStock: "સ્ટોક ખતમ",
    perPiece: "પ્રતિ નંગ",
    stock: "સ્ટોક",
    sold: "વેચાયેલ",
    rating: "રેટિંગ",
    description: "વર્ણન",
    categoryAndTags: "શ્રેણી અને ટેગ્સ",
    additionalInfo: "વધારાની માહિતી",
    productId: "ઉત્પાદ આઈડી",
    created: "બનાવ્યું",
    updated: "અપડેટ કર્યું",
    loading: "ઉત્પાદ વિગતો લોડ થઈ રહી છે...",
    error: "ભૂલ",
    loadError: "ઉત્પાદ વિગતો લોડ કરવામાં નિષ્ફળ",
    shareProduct: "ઉત્પાદ શેર કરો",
    shareText: "આ ઉત્પાદ જુઓ:",
    shareError: "ઉત્પાદ શેર કરવામાં ભૂલ"
  }
};

const ProductDetails = () => {
  const params = useLocalSearchParams();
  const { id, shouldRefresh } = params;
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  // Add new effect to handle refresh
  useEffect(() => {
    if (shouldRefresh) {
      fetchProductDetails();
    }
  }, [shouldRefresh]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await sellerApi.getProductDetails(id);
      if (response.success) {
        setProduct(response.product);
      } else {
        Alert.alert(t.error, t.loadError);
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      Alert.alert(t.error, t.loadError);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = () => {
    router.push(`/(seller)/edit-product/${id}`);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${t.shareText}\n${product.name} - ₹${product.price}`,
      });
    } catch (error) {
      Alert.alert(t.error, t.shareError);
    }
  };

  const handleNextImage = () => {
    if (product.images && product.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handlePrevImage = () => {
    if (product.images && product.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>{t.loading}</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{t.error}</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.productDetails}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
            <Ionicons name="share-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleEditProduct} style={styles.headerButton}>
            <Ionicons name="create-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          {product.images && product.images.length > 0 ? (
            <>
              <Image 
                source={{ uri: product.images[currentImageIndex] }}
                style={styles.mainImage}
                resizeMode="cover"
              />
              {product.images.length > 1 && (
                <View style={styles.imageNavigation}>
                  <TouchableOpacity onPress={handlePrevImage} style={styles.navButton}>
                    <Ionicons name="chevron-back" size={24} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleNextImage} style={styles.navButton}>
                    <Ionicons name="chevron-forward" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}
              <View style={styles.imagePagination}>
                {product.images.map((_, index) => (
                  <View 
                    key={index} 
                    style={[
                      styles.paginationDot,
                      index === currentImageIndex && styles.paginationDotActive
                    ]} 
                  />
                ))}
              </View>
            </>
          ) : (
            <View style={styles.noImageContainer}>
              <Ionicons name="image-outline" size={80} color="#CCC" />
              <Text style={styles.noImageText}>No photos available</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <View style={styles.basicInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.productName}>{product.name}</Text>
              <View style={[
                styles.stockBadge,
                { backgroundColor: product.stock > 0 ? '#E9FBF0' : '#FEE2E2' }
              ]}>
                <Text style={[
                  styles.stockText,
                  { color: product.stock > 0 ? '#059669' : '#DC2626' }
                ]}>
                  {product.stock > 0 ? t.inStock : t.outOfStock}
                </Text>
              </View>
            </View>
            
            <View style={styles.priceContainer}>
              <Text style={styles.price}>₹{product.price}</Text>
              <Text style={styles.unit}>{t.perPiece}</Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <MaterialIcons name="inventory" size={24} color="#6C63FF" />
              <Text style={styles.statValue}>{product.stock}</Text>
              <Text style={styles.statLabel}>{t.stock}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <FontAwesome5 name="shopping-cart" size={22} color="#6C63FF" />
              <Text style={styles.statValue}>{product.totalSold || 0}</Text>
              <Text style={styles.statLabel}>{t.sold}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <MaterialIcons name="star-rate" size={24} color="#6C63FF" />
              <Text style={styles.statValue}>{product.rating || 0}</Text>
              <Text style={styles.statLabel}>{t.rating}</Text>
            </View>
          </View>

          {product.unitType === 'kg' && product.subUnitPrices && (
            <View style={styles.subPrices}>
              <Text style={styles.sectionTitle}>Price in Smaller Units</Text>
              <View style={styles.subPriceGrid}>
                {Object.entries(product.subUnitPrices).map(([unit, price]) => (
                  <View key={unit} style={styles.subPriceItem}>
                    <Text style={styles.subPriceValue}>₹{price}</Text>
                    <Text style={styles.subPriceUnit}>{unit}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {product.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t.description}</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.categoryAndTags}</Text>
            <View style={styles.categoryContainer}>
              <View style={styles.categoryBadge}>
                <MaterialIcons name="category" size={20} color="#6C63FF" />
                <Text style={styles.categoryText}>{product.category}</Text>
              </View>
            </View>
            {product.tags && product.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {product.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.additionalInfo}</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>{t.productId}</Text>
                <Text style={styles.infoValue}>{product._id}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>{t.created}</Text>
                <Text style={styles.infoValue}>
                  {new Date(product.createdAt).toLocaleDateString('en-US')}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>{t.updated}</Text>
                <Text style={styles.infoValue}>
                  {new Date(product.updatedAt).toLocaleDateString('en-US')}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Full Screen Image Modal */}
      <Modal
        visible={showImageModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setShowImageModal(false)}
          >
            <Ionicons name="close" size={30} color="#FFF" />
          </TouchableOpacity>
          {selectedImage && (
            <Image 
              source={{ uri: selectedImage }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#6C63FF',
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#fff',
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imageNavigation: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    top: '50%',
    paddingHorizontal: 16,
    transform: [{ translateY: -20 }],
  },
  navButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  imagePagination: {
    position: 'absolute',
    bottom: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#fff',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  noImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  noImageText: {
    marginTop: 12,
    color: '#666',
    fontSize: 16,
  },
  productInfo: {
    padding: 16,
  },
  basicInfo: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    flex: 1,
    marginRight: 12,
  },
  stockBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  stockText: {
    fontSize: 14,
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 12,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6C63FF',
  },
  unit: {
    fontSize: 16,
    color: '#718096',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#718096',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#4A5568',
    lineHeight: 24,
  },
  subPrices: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  subPriceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  subPriceItem: {
    backgroundColor: '#F7FAFC',
    padding: 12,
    borderRadius: 8,
    marginRight: 12,
    marginBottom: 8,
    alignItems: 'center',
    minWidth: 80,
  },
  subPriceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6C63FF',
  },
  subPriceUnit: {
    fontSize: 14,
    color: '#718096',
    marginTop: 4,
  },
  categoryContainer: {
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: '#6C63FF20',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  categoryText: {
    color: '#6C63FF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#EDF2F7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#4A5568',
    fontSize: 14,
  },
  infoGrid: {
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    padding: 12,
  },
  infoItem: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#2D3748',
    fontWeight: '500',
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  fullScreenImage: {
    width: '100%',
    height: '80%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#4A5568',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  errorText: {
    fontSize: 18,
    color: '#E53E3E',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ProductDetails; 