import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useLanguage } from '../../src/context/LanguageContext';
import axios from '../../src/config/axios';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 48 = padding (16) * 2 + gap between cards (16)

const translations = {
  en: {
    title: 'Won Auctions',
    noAuctions: 'No won auctions available',
    finalPrice: 'Final Price',
    perKg: '/kg',
    stock: 'Stock',
    category: 'Category',
    subcategory: 'Subcategory',
    auctionEndDate: 'Auction End Date',
    viewDetails: 'View Details'
  },
  hi: {
    title: 'जीती हुई नीलामियां',
    noAuctions: 'कोई जीती हुई नीलामी उपलब्ध नहीं है',
    finalPrice: 'अंतिम मूल्य',
    perKg: '/किलो',
    stock: 'स्टॉक',
    category: 'श्रेणी',
    subcategory: 'उपश्रेणी',
    auctionEndDate: 'नीलामी समाप्ति तिथि',
    viewDetails: 'विवरण देखें'
  }
};

const WonAuctions = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const [wonAuctions, setWonAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWonAuctions = async () => {
    try {
      const response = await axios.get(`/api/b2b/won-auctions/${user._id}`);
      if (response.data.success) {
        setWonAuctions(response.data.wonAuctions);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching won auctions:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchWonAuctions();
    }
  }, [user?._id]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchWonAuctions();
    setRefreshing(false);
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderAuctionCard = (auction) => (
    <TouchableOpacity
      key={auction._id}
      style={styles.auctionCard}
      onPress={() => router.push(`/(agency)/product/${auction._id}`)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: auction.images[0] }}
        style={styles.productImage}
        resizeMode="cover"
      />
      
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{auction.name}</Text>
        
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryText} numberOfLines={1}>{auction.category}</Text>
          <Text style={styles.subcategoryText} numberOfLines={1}>{auction.subcategory}</Text>
        </View>

        <View style={styles.priceStockContainer}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>{t.finalPrice}</Text>
            <Text style={styles.priceValue}>₹{auction.finalPrice}</Text>
            <Text style={styles.perKg}>{t.perKg}</Text>
          </View>

          <View style={styles.stockContainer}>
            <Text style={styles.stockLabel}>{t.stock}</Text>
            <Text style={styles.stockValue}>{auction.stock}</Text>
            <Text style={styles.unitType}>{auction.unitType}</Text>
          </View>
        </View>

        <View style={styles.dateContainer}>
          <Ionicons name="calendar-outline" size={14} color="#666" />
          <Text style={styles.dateValue} numberOfLines={1}>
            {formatDate(auction.auctionEndDate)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.auctionsContainer}>
            {wonAuctions.length > 0 ? (
              <View style={styles.productsGrid}>
                {wonAuctions.map(renderAuctionCard)}
              </View>
            ) : (
              <View style={styles.noAuctionsContainer}>
                <Text style={styles.noAuctionsText}>{t.noAuctions}</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  auctionsContainer: {
    padding: 16,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  auctionCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  productImage: {
    width: '100%',
    height: CARD_WIDTH, // Square image
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  categoryInfo: {
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  subcategoryText: {
    fontSize: 12,
    color: '#888',
  },
  priceStockContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  priceContainer: {
    flex: 1,
  },
  stockContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  perKg: {
    fontSize: 11,
    color: '#666',
  },
  stockLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  stockValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  unitType: {
    fontSize: 11,
    color: '#666',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  dateValue: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  noAuctionsContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  noAuctionsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default WonAuctions; 