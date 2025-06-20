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
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import axios from '../../../src/config/axios';
import { useLanguage } from '../../../src/context/LanguageContext';
import { useAuth } from '../../../src/context/AuthContext';

const translations = {
  en: {
    title: 'Live Auctions',
    noAuctions: 'No active auctions available',
    currentBid: 'Current Bid',
    totalBids: 'Total Bids',
    endingIn: 'Ending in',
    days: 'days',
    bidNow: 'Bid Now',
    perKg: '/kg',
    stock: 'Stock',
    category: 'Category',
    subcategory: 'Subcategory',
    bidChange: 'Bid Change'
  },
  hi: {
    title: 'लाइव नीलामी',
    noAuctions: 'कोई सक्रिय नीलामी उपलब्ध नहीं है',
    currentBid: 'वर्तमान बोली',
    totalBids: 'कुल बोलियां',
    endingIn: 'समाप्त होने में',
    days: 'दिन',
    bidNow: 'बोली लगाएं',
    perKg: '/किलो',
    stock: 'स्टॉक',
    category: 'श्रेणी',
    subcategory: 'उपश्रेणी',
    bidChange: 'बोली परिवर्तन'
  },
  mr: {
    title: 'लाइव्ह लिलाव',
    noAuctions: 'कोणतेही सक्रिय लिलाव उपलब्ध नाहीत',
    currentBid: 'सध्याची बोली',
    totalBids: 'एकूण बोली',
    endingIn: 'संपण्यास',
    days: 'दिवस',
    bidNow: 'बोली लावा',
    perKg: '/किलो',
    stock: 'साठा',
    category: 'श्रेणी',
    subcategory: 'उपश्रेणी',
    bidChange: 'बोली बदल'
  },
  gu: {
    title: 'લાઈવ હરાજી',
    noAuctions: 'કોઈ સક્રિય હરાજી ઉપલબ્ધ નથી',
    currentBid: 'વર્તમાન બોલી',
    totalBids: 'કુલ બોલી',
    endingIn: 'સમાપ્ત થવામાં',
    days: 'દિવસ',
    bidNow: 'બોલી લગાવો',
    perKg: '/કિલો',
    stock: 'સ્ટોક',
    category: 'શ્રેણી',
    subcategory: 'ઉપશ્રેણી',
    bidChange: 'બોલી બદલાવ'
  }
};

const LiveAuctions = () => {
  const router = useRouter();
  const { language } = useLanguage();
  const { user } = useAuth();
  const t = translations[language] || translations.en;
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?._id) {
      fetchAuctions();
    }
  }, [user]);

  const fetchAuctions = async () => {
    try {
      const response = await axios.get('/api/bids/active-auctions');
      if (response.data.success) {
        setAuctions(response.data.auctions);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching auctions:', error);
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchAuctions();
    setRefreshing(false);
  }, []);

  const calculateDaysLeft = (endDate) => {
    return Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
  };

  const renderBidChange = (bidChange) => {
    if (bidChange === 0) return null;
    
    const isIncrease = bidChange > 0;
    return (
      <View style={[styles.bidChangeContainer, isIncrease ? styles.bidIncreased : styles.bidDecreased]}>
        <MaterialIcons 
          name={isIncrease ? "arrow-upward" : "arrow-downward"} 
          size={14} 
          color={isIncrease ? "#4CAF50" : "#F44336"} 
        />
        <Text style={[styles.bidChangeText, isIncrease ? styles.bidIncreasedText : styles.bidDecreasedText]}>
          ₹{Math.abs(bidChange)}
        </Text>
      </View>
    );
  };

  const renderAuctionCard = (auction) => (
    <TouchableOpacity
      key={auction._id}
      style={styles.auctionCard}
      onPress={() => router.push({
        pathname: '/product/[id]',
        params: { id: auction._id }
      })}
    >
      <Image
        source={{ uri: auction.images[0] }}
        style={styles.productImage}
        resizeMode="cover"
      />
      
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{auction.name}</Text>
        
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryText}>{auction.category}</Text>
          <Text style={styles.subcategoryText}>{auction.subcategory}</Text>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t.currentBid}</Text>
            <View style={styles.bidAmountContainer}>
              <Text style={styles.bidAmount}>₹{auction.currentHighestBid}{t.perKg}</Text>
              {renderBidChange(auction.bidChange)}
            </View>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t.stock}</Text>
            <Text style={styles.stockValue}>{auction.stock} {auction.unitType}</Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t.totalBids}</Text>
            <Text style={styles.totalBidsValue}>{auction.totalBids || 0}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t.endingIn}</Text>
            <Text style={styles.daysValue}>{calculateDaysLeft(auction.auctionEndDate)} {t.days}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.bidButton}
          onPress={() => router.push({
            pathname: '/product/[id]',
            params: { id: auction._id }
          })}
        >
          <Text style={styles.bidButtonText}>{t.bidNow}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (!user?._id) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{
            title: t.title,
            headerShown: true,
          }} 
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: t.title,
          headerShown: true,
        }} 
      />
      
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
            {auctions.length > 0 ? (
              auctions.map(renderAuctionCard)
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
  auctionCard: {
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
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  productInfo: {
    padding: 16,
  },
  productName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  categoryInfo: {
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  subcategoryText: {
    fontSize: 12,
    color: '#888',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  bidAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bidAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6C63FF',
  },
  stockValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  totalBidsValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  daysValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF3D00',
  },
  bidChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bidIncreased: {
    backgroundColor: '#E8F5E9',
  },
  bidDecreased: {
    backgroundColor: '#FFEBEE',
  },
  bidChangeText: {
    fontSize: 12,
    marginLeft: 2,
    fontWeight: '500',
  },
  bidIncreasedText: {
    color: '#4CAF50',
  },
  bidDecreasedText: {
    color: '#F44336',
  },
  bidButton: {
    backgroundColor: '#6C63FF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  bidButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  noAuctionsContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noAuctionsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  }
});

export default LiveAuctions; 