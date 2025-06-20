import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { sellerApi } from '../api/sellerApi';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const SellerB2BProductDetailScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      const response = await sellerApi.getB2BProductDetails(id);
      if (response.success) {
        // Combine product and bidding data
        setProduct({
          ...response.product,
          bidding: response.bidding,
          similarProducts: response.similarProducts
        });
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAuctionStatus = () => {
    if (!product) return { text: '', color: '' };
    
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Product not found</Text>
      </View>
    );
  }

  const status = getAuctionStatus();
  const isAuctionEnded = status.text === 'Auction Ended' || status.text === 'Expired';

  // Prepare data for bidding chart
  const chartData = {
    labels: [...product.bidding?.bidHistory]
      .reverse()
      .map((_, index) => `Bid ${index + 1}`) || [],
    datasets: [{
      data: [...product.bidding?.bidHistory]
        .reverse()
        .map(bid => bid.amount) || [],
      color: (opacity = 1) => `rgba(0, 102, 204, ${opacity})`,
      strokeWidth: 2
    }]
  };

  const BidHistoryItem = ({ bid }) => (
    <View style={styles.bidItem}>
      <View style={styles.bidInfo}>
        <Text style={styles.bidderName}>
          {bid.bidder?.agencyName || "Unknown Agency"}
          <Text style={styles.bidLocation}>({bid.bidder?.city || "Unknown Location"})</Text>
        </Text>
        <Text style={styles.bidAmount}>₹{bid.amount}/{product?.unitType}</Text>
      </View>
      <Text style={styles.bidTime}>
        {new Date(bid.bidTime).toLocaleString()}
      </Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
      </View>

      <View style={styles.content}>
        {/* Product Images */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.imageContainer}
        >
          {product.images.map((image, index) => (
            <Image
              key={index}
              source={{ uri: image }}
              style={styles.productImage}
            />
          ))}
        </ScrollView>

        {/* Status Badge */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
            <Text style={styles.statusText}>{status.text}</Text>
          </View>
        </View>

        {/* Product Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.category}>{product.category}</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Available Stock:</Text>
            <Text style={styles.value}>{product.totalStock} {product.unitType}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Price Range:</Text>
            <Text style={styles.value}>₹{product.minPrice} - ₹{product.maxPrice}/{product.unitType}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Base Price:</Text>
            <Text style={styles.value}>₹{product.unitPrice}/{product.unitType}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Current Highest Bid:</Text>
            <Text style={styles.value}>
              {product.currentHighestBid > 0 
                ? `₹${product.currentHighestBid}/${product.unitType}`
                : 'No bids yet'
              }
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Total Bids:</Text>
            <Text style={styles.value}>{product.bidding?.stats?.totalBids || 0}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Auction Ends:</Text>
            <Text style={styles.value}>
              {new Date(product.auctionEndDate).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Winner Information - Show when auction has ended */}
        {isAuctionEnded && product.currentHighestBidder && (
          <View style={[styles.winnerContainer, { backgroundColor: '#FFF9E6', marginBottom: 16 }]}>
            <View style={styles.winnerHeader}>
              <Text style={styles.winnerTitle}>🏆 Auction Winner</Text>
            </View>
            <View style={styles.winnerDetails}>
              <Text style={styles.winnerAgencyName}>
                {product.currentHighestBidder.agencyName || "Unknown Agency"}
              </Text>
              <Text style={styles.winnerLocation}>
                {product.currentHighestBidder.city || "Unknown Location"}
              </Text>
              <Text style={styles.winningBidAmount}>
                Winning Bid: ₹{product.currentHighestBid}/{product.unitType}
              </Text>
            </View>
          </View>
        )}

        {/* Bidding Chart - Only show when there are more than 1 bids */}
        {product.bidding?.bidHistory?.length > 1 ? (
          <>
            <View style={styles.chartContainer}>
              <Text style={styles.sectionTitle}>बोली का इतिहास (Bid History)</Text>
              <LineChart
                data={chartData}
                width={width - 32}
                height={220}
                chartConfig={{
                  backgroundColor: '#fff',
                  backgroundGradientFrom: '#fff',
                  backgroundGradientTo: '#fff',
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(0, 102, 204, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#0066cc"
                  },
                  propsForBackgroundLines: {
                    strokeDasharray: "",
                    stroke: "#e3e3e3",
                    strokeWidth: 1
                  },
                  yAxisInterval: 0.5,
                  formatYLabel: (value) => {
                    const rounded = Math.round(value * 2) / 2;
                    if (Math.abs(rounded - value) < 0.01) {
                      return rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(2);
                    }
                    return '';
                  }
                }}
                bezier
                style={styles.chart}
                withVerticalLabels={true}
                withHorizontalLabels={true}
                withInnerLines={true}
                withOuterLines={true}
                withVerticalLines={true}
                withHorizontalLines={true}
                segments={3}
                fromZero={false}
              />
            </View>

            {/* Recent Bids - Show after chart when chart is visible */}
            {product.bidding?.bidHistory?.length > 0 && (
              <View style={styles.bidHistoryContainer}>
                <Text style={styles.sectionTitle}>Recent Bids</Text>
                {product.bidding.bidHistory.map((bid, index) => (
                  <BidHistoryItem key={index} bid={bid} />
                ))}
              </View>
            )}
          </>
        ) : (
          /* Show Recent Bids directly after product details when there's no chart */
          product.bidding?.bidHistory?.length > 0 && (
            <View style={styles.bidHistoryContainer}>
              <Text style={styles.sectionTitle}>Recent Bids</Text>
              {product.bidding.bidHistory.map((bid, index) => (
                <BidHistoryItem key={index} bid={bid} />
              ))}
            </View>
          )
        )}

        {/* Similar Products */}
        {product.similarProducts && product.similarProducts.length > 0 && (
          <View style={styles.similarProductsContainer}>
            <Text style={styles.sectionTitle}>Similar Products</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.similarProductsList}
            >
              {product.similarProducts.map((item) => (
                <TouchableOpacity 
                  key={item._id}
                  style={styles.similarProductCard}
                  onPress={() => {
                    setProduct(null);
                    setLoading(true);
                    router.push(`/seller/b2b-products/${item._id}`);
                  }}
                >
                  <Image 
                    source={{ uri: item.images[0] }} 
                    style={styles.similarProductImage}
                  />
                  <View style={styles.similarProductInfo}>
                    <Text style={styles.similarProductName}>{item.name}</Text>
                    <Text style={styles.similarProductPrice}>
                      ₹{item.minPrice} - ₹{item.maxPrice}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF4444',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  imageContainer: {
    marginBottom: 16,
  },
  productImage: {
    width: 300,
    height: 200,
    borderRadius: 12,
    marginRight: 16,
  },
  statusContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  detailsContainer: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  chartContainer: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  bidHistoryContainer: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  bidItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  bidInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  bidderName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  bidAmount: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  bidTime: {
    fontSize: 12,
    color: '#666',
  },
  bidLocation: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  winnerContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  winnerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  winnerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 8,
  },
  winnerDetails: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
  },
  winnerAgencyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  winnerLocation: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  winningBidAmount: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  sellerContainer: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  shopName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  location: {
    fontSize: 12,
    color: '#666',
  },
  similarProductsContainer: {
    marginBottom: 16,
  },
  similarProductsList: {
    marginTop: 12,
  },
  similarProductCard: {
    width: 160,
    marginRight: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    overflow: 'hidden',
  },
  similarProductImage: {
    width: '100%',
    height: 120,
  },
  similarProductInfo: {
    padding: 8,
  },
  similarProductName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  similarProductPrice: {
    fontSize: 12,
    color: '#4CAF50',
  },
});

export default SellerB2BProductDetailScreen; 