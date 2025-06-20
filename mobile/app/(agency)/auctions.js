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
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from '../../src/config/axios';
import { useLanguage } from '../../src/context/LanguageContext';
import { useAuth } from '../../src/context/AuthContext';

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
    highestBidder: 'Current Highest Bidder'
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
    highestBidder: 'वर्तमान उच्चतम बोलीदाता'
  },
};

const LiveAuctions = () => {
  const router = useRouter();
  const { language } = useLanguage();
  const { user } = useAuth();
  const t = translations[language] || translations.en;
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) {
      console.log('No user ID available, waiting...');
      return;
    }
    console.log('User ID available:', user._id);
    fetchAuctions();
  }, [user]);

  const fetchAuctions = async () => {
    try {
      console.log('Fetching active auctions');
      const response = await axios.get('/api/bids/active-auctions');
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        const auctionsWithDays = response.data.auctions.map(auction => ({
          _id: auction.productId,
          name: auction.name,
          image: auction.image,
          auctionEndDate: auction.auctionEndDate,
          totalBids: auction.totalBids,
          daysLeft: Math.ceil((new Date(auction.auctionEndDate) - new Date()) / (1000 * 60 * 60 * 24))
        }));
        console.log('Processed auctions:', auctionsWithDays);
        setAuctions(auctionsWithDays);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching auctions:', error);
      setLoading(false);
    }
  };

  if (!user?._id) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen
          options={{
            headerTitle: t.title,
          }}
        />
        <View style={styles.noAuctionsContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerTitle: t.title,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color="#6C63FF" style={styles.loader} />
        ) : auctions.length > 0 ? (
          <View style={styles.auctionsContainer}>
            {auctions.map((auction) => (
              <TouchableOpacity
                key={auction._id}
                style={styles.auctionCard}
                onPress={() => router.push({
                  pathname: '/product/[id]',
                  params: { id: auction._id }
                })}
              >
                <Image
                  source={{ uri: auction.image }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{auction.name}</Text>

                  <View style={styles.detailsContainer}>
                    <View style={styles.bidInfo}>
                      <Text style={styles.bidLabel}>{t.totalBids}</Text>
                      <Text style={styles.bidValue}>{auction.totalBids}</Text>
                    </View>
                    <View style={styles.bidInfo}>
                      <Text style={styles.bidLabel}>{t.endingIn}</Text>
                      <Text style={styles.endingValue}>{auction.daysLeft} {t.days}</Text>
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
            ))}
          </View>
        ) : (
          <View style={styles.noAuctionsContainer}>
            <Text style={styles.noAuctionsText}>{t.noAuctions}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  backButton: {
    marginLeft: 16,
  },
  loader: {
    marginTop: 20,
  },
  auctionsContainer: {
    padding: 16,
  },
  auctionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  productImage: {
    width: '100%',
    height: 200,
  },
  productInfo: {
    padding: 16,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  bidInfo: {
    alignItems: 'center',
  },
  bidLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  bidValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6C63FF',
  },
  endingValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3D00',
  },
  bidButton: {
    backgroundColor: '#6C63FF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  bidButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  noAuctionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  noAuctionsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default LiveAuctions; 