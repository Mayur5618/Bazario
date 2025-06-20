import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { sellerApi } from '../api/sellerApi';
import { formatDistanceToNow } from 'date-fns';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 48 = padding (16) * 2 + gap between cards (16)

const B2BProductList = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = async () => {
    try {
      const response = await sellerApi.getSellerB2BProducts();
      if (response.success) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const handleProductPress = (productId) => {
    router.push({
      pathname: "/seller/b2b-products/[id]",
      params: { id: productId }
    });
  };

  const getTimeRemaining = (endDate) => {
    return formatDistanceToNow(new Date(endDate), { addSuffix: true });
  };

  const getAuctionStatus = (product) => {
    const now = new Date();
    const endDate = new Date(product.auctionEndDate);
    
    if (product.auctionStatus === 'ended') {
      return { text: 'Auction Ended', color: '#FF4444' };
    } else if (product.auctionStatus === 'cancelled') {
      return { text: 'Cancelled', color: '#666666' };
    } else if (endDate < now) {
      return { text: 'Expired', color: '#FF4444' };
    } else {
      return { text: 'Active', color: '#4CAF50' };
    }
  };

  const renderProduct = ({ item }) => {
    const status = getAuctionStatus(item);
    const timeLeft = new Date(item.auctionEndDate) - new Date();
    const daysLeft = Math.max(0, Math.ceil(timeLeft / (1000 * 60 * 60 * 24)));

    return (
      <TouchableOpacity 
        style={[styles.productCard, { width: CARD_WIDTH }]}
        onPress={() => handleProductPress(item._id)}
      >
        <View style={styles.imageContainer}>
          <Image 
            source={item.images[0] ? { uri: item.images[0] } : { uri: 'https://via.placeholder.com/300x200?text=No+Image' }}
            style={styles.productImage}
          />
          <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
            <Text style={styles.statusText}>{status.text}</Text>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.categoryText} numberOfLines={1}>{item.category}</Text>

          <View style={styles.stockContainer}>
            <Text style={styles.stockLabel}>Stock:</Text>
            <Text style={styles.stockValue}>{item.stock} {item.unitType}</Text>
          </View>

          <View style={styles.auctionContainer}>
            <View style={styles.auctionInfo}>
              <Text style={styles.auctionLabel}>Ends: </Text>
              <Text style={styles.auctionValue}>
                {status.text === 'Active' 
                  ? `Ends in ${daysLeft} days`
                  : 'Auction ended'
                }
              </Text>
            </View>

            <View style={styles.bidInfo}>
              <Text style={styles.bidLabel}>Current Bid: </Text>
              <Text style={styles.bidValue}>
                {item.currentHighestBid > 0 
                  ? `₹${item.currentHighestBid}/${item.unitType}`
                  : 'No bids yet'
                }
              </Text>
            </View>
          </View>

          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={12} color="#666" />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.availableLocations?.join(', ') || 'Location not specified'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cube-outline" size={48} color="#666" />
        <Text style={styles.emptyText}>No B2B products found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Products</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/(seller)/add-b2b-product')}
        >
          <View style={styles.addButtonCircle}>
            <Ionicons name="add" size={24} color="#6B46C1" />
          </View>
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContainer}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#6B46C1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  addButton: {
    padding: 8,
    marginRight: -8,
  },
  addButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  listContainer: {
    padding: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 150,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  contentContainer: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 2,
    height: 32,
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
    padding: 6,
    borderRadius: 6,
  },
  stockLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 4,
  },
  stockValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  auctionContainer: {
    backgroundColor: '#F8F9FA',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  auctionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  auctionLabel: {
    fontSize: 12,
    color: '#666',
  },
  auctionValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF9800',
  },
  bidInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bidLabel: {
    fontSize: 12,
    color: '#666',
  },
  bidValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 10,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
});

export default B2BProductList; 