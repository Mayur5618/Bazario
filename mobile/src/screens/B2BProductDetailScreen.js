import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Modal,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import axios from '../config/axios';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { LineChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import { sellerApi } from '../api/sellerApi';

const { width } = Dimensions.get('window');

const B2BProductDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [showBidModal, setShowBidModal] = useState(false);
  const [bidHistory, setBidHistory] = useState([]);
  const [isFirstBid, setIsFirstBid] = useState(true);
  const [hasUserBid, setHasUserBid] = useState(false);
  const [isHighestBidder, setIsHighestBidder] = useState(false);

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch product details
      const productResponse = await axios.get(`/api/products/b2b/products/${id}`);
      const productData = productResponse.data.product;
      setProduct(productData);
      
      // Set initial states based on currentHighestBid
      setIsFirstBid(productData.currentHighestBid === 0);
      setBidAmount(productData.currentHighestBid?.toString() || productData.unitPrice?.toString());
      setBidHistory(productResponse.data.bidding?.bidHistory || []);

      // Fetch highest bidder info if there are bids
      if (productData.currentHighestBid > 0) {
        try {
          const highestBidderResponse = await axios.get(`/api/bids/highest-bidder/${id}`);
          const highestBidderData = highestBidderResponse.data.data;
          
          console.log('Current User:', user);
          console.log('Current User ID:', user?._id);
          console.log('Highest Bidder Data:', highestBidderData);
          console.log('Highest Bidder:', highestBidderData.currentHighestBidder);
          console.log('Highest Bidder ID:', highestBidderData.currentHighestBidder?._id);
          
          // Check if current user is highest bidder
          const currentUserId = user?._id?.toString();
          const highestBidderId = highestBidderData.currentHighestBidder?._id?.toString();
          
          console.log('Comparing IDs:');
          console.log('Current User ID (string):', currentUserId);
          console.log('Highest Bidder ID (string):', highestBidderId);
          
          const isUserWinning = currentUserId === highestBidderId;
          console.log('Is User Winning:', isUserWinning);
          
          setIsHighestBidder(isUserWinning);
        } catch (error) {
          console.error('Error fetching highest bidder:', error);
          setIsHighestBidder(false);
        }
      } else {
        setIsHighestBidder(false);
      }
      
    } catch (error) {
      console.error('Error fetching details:', error);
      setError('प्रोडक्ट विवरण लोड करने में विफल');
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'प्रोडक्ट विवरण लोड करने में विफल'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceBid = async () => {
    try {
      // Convert bid amount to number and ensure it's a valid number
      const numericBidAmount = Number(bidAmount);
      
      if (isNaN(numericBidAmount)) {
        Toast.show({
          type: 'error',
          text1: 'Invalid Bid',
          text2: 'Please enter a valid number'
        });
        return;
      }

      // For first bid, compare with exact unit price
      if (isFirstBid) {
        const basePrice = Number(product.unitPrice);
        console.log('First Bid - Comparing:', { 
          numericBidAmount, 
          basePrice, 
          isEqual: numericBidAmount === basePrice 
        });
        
        if (numericBidAmount !== basePrice) {
          Toast.show({
            type: 'error',
            text1: 'Invalid Bid',
            text2: `First bid must be ₹${basePrice}`
          });
          return;
        }
      } else {
        // For subsequent bids, check if higher than current highest bid
        if (numericBidAmount <= product.currentHighestBid) {
          Toast.show({
            type: 'error',
            text1: 'Invalid Bid',
            text2: `Bid must be higher than ₹${product.currentHighestBid}`
          });
          return;
        }
      }

      const response = await axios.post(`/api/bids/place`, {
        productId: id,
        agencyId: user._id,
        amount: numericBidAmount
      });

      // After successful bid, set this user as highest bidder
      setIsHighestBidder(true);
      setShowBidModal(false);

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Bid placed successfully!'
      });

      // Refresh product details
      fetchProductDetails();
    } catch (error) {
      console.error('Error placing bid:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to place bid'
      });
    }
  };

  const BidChart = () => {
    if (bidHistory.length < 2) return null;

    // Reverse the bid history array to show oldest to newest bids
    const sortedBidHistory = [...bidHistory].reverse();

    // Find min and max bid amounts
    const minBid = Math.min(...sortedBidHistory.map(bid => bid.amount));
    const maxBid = Math.max(...sortedBidHistory.map(bid => bid.amount));

    // Check if any bid has decimal points
    const hasDecimalBids = sortedBidHistory.some(bid => !Number.isInteger(bid.amount));
    
    // Calculate Y-axis range
    const yMin = Math.floor(minBid);
    const yMax = Math.ceil(maxBid);

    // Generate Y-axis values based on whether we have decimal bids
    const yAxisValues = [];
    if (hasDecimalBids) {
      // If we have decimal bids, use 0.50 intervals
      for (let i = yMin; i <= yMax; i += 0.5) {
        yAxisValues.push(i);
      }
    } else {
      // If all bids are whole numbers, use 1.0 intervals
      for (let i = yMin; i <= yMax; i += 1) {
        yAxisValues.push(i);
      }
    }

    const data = {
      labels: sortedBidHistory.map((_, index) => `Bid ${index + 1}`),
      datasets: [{
        data: sortedBidHistory.map(bid => bid.amount),
        color: (opacity = 1) => `rgba(0, 102, 204, ${opacity})`,
        strokeWidth: 2
      }]
    };

    const chartConfig = {
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
      // Configure Y-axis to show exact 0.50 steps
      yAxisInterval: 0.5,
      formatYLabel: (value) => {
        // Round to nearest 0.5 to handle floating point precision
        const rounded = Math.round(value * 2) / 2;
        // Only show values that are multiples of 0.5
        if (Math.abs(rounded - value) < 0.01) {
          return rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(2);
        }
        return '';
      },
      // Ensure min and max values are aligned with 0.50 steps
      min: Math.floor(minBid * 2) / 2,
      max: Math.ceil(maxBid * 2) / 2,
      // Calculate exact number of steps needed
      count: Math.round(((Math.ceil(maxBid * 2) / 2) - (Math.floor(minBid * 2) / 2)) / 0.5) + 1
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>बोली का इतिहास (Bid History)</Text>
        <LineChart
          data={data}
          width={width - 32}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16
          }}
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
    );
  };

  const BidModal = () => {
    // Initialize localBidAmount with the correct base price for first bid
    const [localBidAmount, setLocalBidAmount] = useState(
      isFirstBid ? product.unitPrice.toString() : bidAmount
    );

    const handlePlaceBidClick = async () => {
      try {
        const numericBidAmount = Number(localBidAmount);
        
        if (isNaN(numericBidAmount)) {
          Toast.show({
            type: 'error',
            text1: 'Invalid Bid',
            text2: 'Please enter a valid number'
          });
          return;
        }

        // For first bid, compare with exact unit price
        if (isFirstBid) {
          const basePrice = Number(product.unitPrice);
          console.log('First Bid - Comparing:', { 
            numericBidAmount, 
            basePrice, 
            isEqual: numericBidAmount === basePrice 
          });
          
          if (numericBidAmount !== basePrice) {
            Toast.show({
              type: 'error',
              text1: 'Invalid Bid',
              text2: `First bid must be ₹${basePrice}`
            });
            return;
          }
        } else {
          // For subsequent bids
          if (numericBidAmount <= product.currentHighestBid) {
            Toast.show({
              type: 'error',
              text1: 'Invalid Bid',
              text2: `Bid must be higher than ₹${product.currentHighestBid}`
            });
            return;
          }
        }

        const response = await axios.post(`/api/bids/place`, {
          productId: id,
          agencyId: user._id,
          amount: numericBidAmount
        });

        setIsHighestBidder(true);
        setShowBidModal(false);
        setBidAmount(localBidAmount);

        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Bid placed successfully!'
        });

        fetchProductDetails();
      } catch (error) {
        console.error('Error placing bid:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.response?.data?.message || 'Failed to place bid'
        });
      }
    };

    return (
      <Modal
        visible={showBidModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {isFirstBid ? (
              <>
                <Text style={styles.modalTitle}>Accept Base Price</Text>
                <View style={styles.modalBasePriceInfo}>
                  <Text style={styles.modalBasePrice}>₹{product.unitPrice}</Text>
                  <Text style={styles.modalPerUnit}>per {product.unitType}</Text>
                </View>
                <View style={styles.modalInfoBox}>
                  <Ionicons name="information-circle" size={24} color="#0066cc" />
                  <Text style={styles.modalInfoText}>
                    You'll be the first bidder for this product. The bid amount must match the base price set by the seller.
                  </Text>
                </View>
                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setShowBidModal(false)}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={handlePlaceBidClick}
                  >
                    <Text style={styles.modalButtonText}>Accept & Place Bid</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>Place Your Bid</Text>
                <View style={styles.currentBidInfo}>
                  <Text style={styles.modalLabel}>Current Highest Bid</Text>
                  <Text style={styles.modalCurrentBid}>₹{product.currentHighestBid}</Text>
                </View>
                <View style={styles.bidInputContainer}>
                  <Text style={styles.modalLabel}>Your Bid Amount</Text>
                  <TextInput
                    style={styles.bidInput}
                    value={localBidAmount}
                    onChangeText={(text) => {
                      // Only allow numeric input
                      const numericValue = text.replace(/[^0-9]/g, '');
                      setLocalBidAmount(numericValue);
                    }}
                    keyboardType="numeric"
                    placeholder={`Enter amount higher than ₹${product.currentHighestBid}`}
                  />
                </View>
                <View style={styles.modalInfoBox}>
                  <Ionicons name="arrow-up-circle" size={24} color="#0066cc" />
                  <Text style={styles.modalInfoText}>
                    Your bid must be higher than the current highest bid of ₹{product.currentHighestBid}
                  </Text>
                </View>
                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setShowBidModal(false)}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={handlePlaceBidClick}
                  >
                    <Text style={styles.modalButtonText}>Place Bid</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  const renderCurrentBidSection = () => {
    const now = new Date();
    const endDate = new Date(product.auctionEndDate);
    const isAuctionClosed = endDate < now || product.auctionStatus === 'closed' || product.auctionStatus === 'ended';
    const isNewProduct = !product.currentHighestBid || product.currentHighestBid === 0;

    // For closed auctions
    if (isAuctionClosed) {
      if (isHighestBidder) {
        // Winner's view
        return (
          <View style={styles.winnerMessageContainer}>
            <LinearGradient
              colors={['#4CAF50', '#2E7D32']}
              style={styles.congratsGradient}
            >
              <View style={styles.trophyContainer}>
                <Ionicons name="trophy" size={50} color="#FFD700" />
              </View>
              
              <Text style={styles.congratsTitle}>बधाई हो! 🎉</Text>
              
              <Text style={styles.congratsMessage}>
                आपने यह नीलामी जीत ली है
              </Text>

              <View style={styles.winningDetailsCard}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>विजयी बोली:</Text>
                  <Text style={styles.priceValue}>₹{product.currentHighestBid}</Text>
                </View>
                
                <View style={styles.unitRow}>
                  <Text style={styles.unitLabel}>प्रति इकाई:</Text>
                  <Text style={styles.unitValue}>{product.unitType}</Text>
                </View>

                <View style={styles.stockRow}>
                  <Text style={styles.stockLabel}>कुल मात्रा:</Text>
                  <Text style={styles.stockValue}>{product.totalStock} {product.unitType}</Text>
                </View>
              </View>

              <View style={styles.deliveryInfoContainer}>
                <Ionicons name="information-circle-outline" size={24} color="#fff" />
                <Text style={styles.deliveryInfoText}>
                  जल्द ही आपको इसकी डिलीवरी मिल जाएगी
                </Text>
              </View>
            </LinearGradient>
          </View>
        );
      } else {
        // Non-winner's view
        return (
          <View style={styles.lostAuctionContainer}>
            <View style={styles.betterLuckHeader}>
              <Ionicons name="information-circle" size={28} color="#666" />
              <Text style={styles.betterLuckTitle}>अगली बार बेहतर भाग्य!</Text>
            </View>
            <View style={styles.auctionResultCard}>
              <Text style={styles.resultLabel}>विजयी बोली:</Text>
              <Text style={styles.resultAmount}>₹{product.currentHighestBid} / {product.unitType}</Text>
              <Text style={styles.resultInfo}>
                यह {product.name} ₹{product.currentHighestBid} प्रति {product.unitType} की दर से बिक गया
              </Text>
            </View>
          </View>
        );
      }
    }

    // Rest of the existing conditions remain same...
    return (
      <View style={styles.bidSection}>
        {/* New Product - No Bids Yet */}
        {!isAuctionClosed && isNewProduct && (
          <View style={styles.currentBidContainer}>
            <View style={styles.bidAmountSection}>
              <Text style={styles.currentBidLabel}>Base Price</Text>
              <Text style={styles.currentBidAmount}>₹{product.unitPrice}</Text>
              <Text style={styles.perUnitText}>per {product.unitType}</Text>
              <View style={styles.newBidTag}>
                <Text style={styles.newBidTagText}>New</Text>
              </View>
            </View>
            <View style={styles.firstBidInfo}>
              <Ionicons name="information-circle-outline" size={20} color="#0066cc" />
              <Text style={styles.firstBidInfoText}>
                आप पहले बोलीदाता होंगे। बोली बेस प्राइस के बराबर होनी चाहिए।
              </Text>
            </View>
            <TouchableOpacity
              style={styles.acceptBasePriceButton}
              onPress={() => setShowBidModal(true)}
            >
              <Text style={styles.acceptBasePriceButtonText}>Accept Base Price</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Active Auction - User is Highest Bidder */}
        {!isAuctionClosed && isHighestBidder && !isNewProduct && (
          <View style={styles.winningBidContainer}>
            <View style={styles.winningBidHeader}>
              <Ionicons name="trophy" size={28} color="#FFD700" />
              <Text style={styles.winningBidTitle}>आपकी बोली सबसे ऊंची है!</Text>
            </View>
            <View style={styles.winningBidDetails}>
              <Text style={styles.winningBidAmount}>₹{product.currentHighestBid}</Text>
              <Text style={styles.winningBidUnit}>per {product.unitType}</Text>
            </View>
            <View style={styles.winningBidInfo}>
              <Ionicons name="checkmark-circle" size={20} color="#2e7d32" />
              <Text style={styles.winningBidText}>
                अगर कोई और उच्च बोली नहीं लगाता है, तो यह {product.totalStock} {product.unitType} {product.name} आपको मिल जाएगा।
              </Text>
            </View>
          </View>
        )}

        {/* Active Product - Others Have Bid Higher */}
        {!isAuctionClosed && !isNewProduct && !isHighestBidder && (
          <View style={styles.currentBidContainer}>
            <View style={styles.bidAmountSection}>
              <Text style={styles.currentBidLabel}>वर्तमान उच्चतम बोली</Text>
              <Text style={styles.currentBidAmount}>₹{product.currentHighestBid}</Text>
              <Text style={styles.perUnitText}>per {product.unitType}</Text>
            </View>
            <TouchableOpacity
              style={styles.placeBidButton}
              onPress={() => setShowBidModal(true)}
            >
              <Text style={styles.placeBidButtonText}>Place Higher Bid</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
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
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>प्रोडक्ट नहीं मिला (Product not found)</Text>
      </View>
    );
  }

  const status = getAuctionStatus();
  const isAuctionEnded = status.text === 'Auction Ended' || status.text === 'Expired';

  return (
    <ScrollView style={styles.container}>
      <BidModal />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
      </View>

      {/* Product Images with Gradient Overlay */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.images[0] }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.imageGradient}
        >
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.category}>{product.category} {'>'} {product.subcategory}</Text>
        </LinearGradient>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Stock Info */}
        <View style={styles.stockInfo}>
          <Text style={styles.stockText}>Available Stock: {product.totalStock} {product.unitType}</Text>
        </View>

        {/* Current Bid Section */}
        {renderCurrentBidSection()}

        {/* Auction Timer Card - Only show if auction is not closed */}
        {product.auctionStatus !== 'ended' && product.auctionStatus !== 'closed' && (
          <View style={styles.card}>
            <Text style={[styles.sectionTitle, { color: '#e74c3c' }]}>Auction Ends</Text>
            <View style={[styles.timerContainer, { backgroundColor: '#ffe6e6' }]}>
              <Ionicons name="time-outline" size={24} color="#e74c3c" />
              <Text style={[styles.timerText, { color: '#e74c3c' }]}>
                {new Date(product.auctionEndDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
          </View>
        )}

        {/* Bid History Chart Card - Only show if not first bid */}
        {!isFirstBid && bidHistory.length >= 2 && (
          <View style={[styles.card, styles.chartCard]}>
            <Text style={styles.sectionTitle}>Bid History</Text>
            <BidChart />
            <View style={styles.bidStatsContainer}>
              <View style={styles.bidStat}>
                <Text style={styles.bidStatLabel}>Total Bids</Text>
                <Text style={styles.bidStatValue}>{bidHistory.length}</Text>
              </View>
              <View style={styles.bidStat}>
                <Text style={styles.bidStatLabel}>Highest Bid</Text>
                <Text style={styles.bidStatValue}>₹{Math.max(...bidHistory.map(b => b.amount))}</Text>
              </View>
              <View style={styles.bidStat}>
                <Text style={styles.bidStatLabel}>Average Bid</Text>
                <Text style={styles.bidStatValue}>
                  ₹{Math.round(bidHistory.reduce((a, b) => a + b.amount, 0) / bidHistory.length)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Seller Information Card */}
        <View style={[styles.card, styles.sellerCard]}>
          <Text style={styles.sectionTitle}>Seller Information</Text>
          <View style={styles.sellerInfo}>
            <Image
              source={{ uri: product.seller.profileImage }}
              style={styles.sellerImage}
            />
            <View style={styles.sellerDetails}>
              <Text style={styles.sellerName}>{product.seller.name}</Text>
              <View style={styles.shopInfo}>
                <Ionicons name="business-outline" size={16} color="#666" />
                <Text style={styles.shopName}>{product.seller.shopName}</Text>
              </View>
              <View style={styles.locationInfo}>
                <Ionicons name="location-outline" size={16} color="#666" />
                <Text style={styles.location}>{product.seller.city}, {product.seller.state}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom Padding View */}
        <View style={styles.bottomPadding} />

        {/* Auction Winner Information */}
        {isAuctionEnded && product.winningBid && (
          <View style={styles.winnerContainer}>
            <Text style={styles.winnerLabel}>Auction Winner:</Text>
            <View style={styles.winnerInfo}>
              <Ionicons name="trophy-outline" size={20} color="#FFD700" />
              <Text style={styles.winnerName}>{product.winningBid.bidderName}</Text>
              <Text style={styles.winningBid}>
                Winning Bid: ₹{product.winningBid.amount}/{product.unitType}
              </Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    color: 'red',
    fontSize: 16,
  },
  imageContainer: {
    height: width * 0.8,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    paddingHorizontal: 16,
    paddingBottom: 16,
    justifyContent: 'flex-end',
  },
  mainContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  category: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  currentBidContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 16,
    borderRadius: 12,
    elevation: 3,
  },
  bidAmountSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  currentBidLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  currentBidAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  perUnitText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  placeBidButton: {
    backgroundColor: '#2e7d32',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  placeBidButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  winningBidContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginVertical: 16,
    borderRadius: 12,
    elevation: 3,
  },
  winningBidHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  winningBidTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginLeft: 12,
  },
  winningBidDetails: {
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  winningBidAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  winningBidUnit: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  winningBidInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  winningBidText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  auctionEndInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 8,
  },
  auctionEndText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  stockInfo: {
    backgroundColor: '#e3f2fd',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  stockText: {
    fontSize: 16,
    color: '#0066cc',
    fontWeight: '500',
    textAlign: 'center',
  },
  chartCard: {
    padding: 8,
  },
  bidStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  bidStat: {
    alignItems: 'center',
  },
  bidStatLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  bidStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  sellerCard: {
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
    marginRight: 16,
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  shopInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  shopName: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
  },
  bottomPadding: {
    height: 80,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: width - 40,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 24,
  },
  bidInputContainer: {
    marginVertical: 16,
  },
  bidInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginTop: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
  },
  confirmButton: {
    backgroundColor: '#0066cc',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalBasePriceInfo: {
    alignItems: 'center',
    marginVertical: 16,
  },
  modalBasePrice: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  modalPerUnit: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  modalInfoBox: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
    alignItems: 'flex-start',
  },
  modalInfoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  currentBidInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  modalCurrentBid: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  timerText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#0066cc',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  newBidTag: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  newBidTagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  firstBidInfo: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginVertical: 12,
    alignItems: 'flex-start',
  },
  firstBidInfoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#0066cc',
    lineHeight: 20,
  },
  minBidInfo: {
    flexDirection: 'row',
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
    marginVertical: 12,
    alignItems: 'flex-start',
  },
  minBidInfoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#2e7d32',
    lineHeight: 20,
  },
  acceptBasePriceButton: {
    backgroundColor: '#0066cc',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptBasePriceButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  winnerContainer: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  winnerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  winnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  winnerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 8,
    marginRight: 12,
  },
  winningBid: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  winnerMessageContainer: {
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
  },
  congratsGradient: {
    padding: 20,
    alignItems: 'center',
  },
  trophyContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 40,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  congratsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  congratsMessage: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  winningDetailsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginVertical: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  priceLabel: {
    fontSize: 16,
    color: '#666',
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  unitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  unitLabel: {
    fontSize: 16,
    color: '#666',
  },
  unitValue: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockLabel: {
    fontSize: 16,
    color: '#666',
  },
  stockValue: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  deliveryInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  deliveryInfoText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    flex: 1,
  },
  lostAuctionContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginVertical: 16,
  },
  betterLuckHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  betterLuckTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginLeft: 12,
  },
  auctionResultCard: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
  },
  resultLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  resultAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  resultInfo: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  bidSection: {
    // Add any necessary styles for the bid section
  },
});

export default B2BProductDetailScreen; 