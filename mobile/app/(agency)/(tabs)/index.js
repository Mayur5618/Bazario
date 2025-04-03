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
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../src/context/AuthContext';
import { useLanguage } from '../../../src/context/LanguageContext';
import axios from '../../../src/config/axios';

const translations = {
  en: {
    welcome: 'Welcome',
    dashboard: 'Agency Dashboard',
    stats: {
      title: 'Overview',
      totalAuctions: 'Total Auctions',
      activeAuctions: 'Active Auctions',
      wonAuctions: 'Won Auctions',
      investment: 'Total Investment',
    },
    liveAuctions: 'Live Auctions',
    viewAll: 'View All',
    bidNow: 'Bid Now',
    perKg: '/kg',
    endingIn: 'Ending in',
    days: 'days',
    currentBid: 'Current Bid',
    yourLastBid: 'Your Last Bid',
    noAuctions: 'No live auctions available',
    categories: 'Categories',
    products: 'Products',
  },
  hi: {
    welcome: 'स्वागत है',
    dashboard: 'एजेंसी डैशबोर्ड',
    stats: {
      title: 'अवलोकन',
      totalAuctions: 'कुल नीलामी',
      activeAuctions: 'सक्रिय नीलामी',
      wonAuctions: 'जीती हुई नीलामी',
      investment: 'कुल निवेश',
    },
    liveAuctions: 'लाइव नीलामी',
    viewAll: 'सभी देखें',
    bidNow: 'बोली लगाएं',
    perKg: '/किलो',
    endingIn: 'समाप्त होने में',
    days: 'दिन',
    currentBid: 'वर्तमान बोली',
    yourLastBid: 'आपकी पिछली बोली',
    noAuctions: 'कोई लाइव नीलामी उपलब्ध नहीं है',
    categories: 'श्रेणियां',
    products: 'उत्पाद',
  },
};

const StatsCard = ({ icon, number, label, color, onPress }) => (
  <TouchableOpacity onPress={onPress} style={[styles.statCard, { borderLeftWidth: 4, borderLeftColor: color }]}>
    <View style={styles.statIconContainer}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <View style={styles.statContent}>
      <Text style={[styles.statNumber, { color }]}>{number}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  </TouchableOpacity>
);

const Dashboard = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const [liveAuctions, setLiveAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    won: 0,
    investment: 0
  });

  // Fetch active auctions count
  useEffect(() => {
    fetchActiveAuctions();
  }, []);

  const fetchActiveAuctions = async () => {
    try {
      // Fetch active auctions count
      const activeAuctionsResponse = await axios.get('/api/bids/active-auctions');
      if (activeAuctionsResponse.data.success) {
        setStats(prevStats => ({
          ...prevStats,
          active: activeAuctionsResponse.data.totalActiveAuctions
        }));
      }

      // Fetch user's active bids
      const response = await axios.get(`/api/bids/agency-active-bids/${user._id}`);
      if (response.data.success) {
        setLiveAuctions(response.data.products.map(auction => ({
          id: auction.productId,
          name: auction.name,
          image: auction.image,
          currentBid: auction.currentHighestBid,
          yourLastBid: auction.myLastBid,
          isHighestBidder: auction.isHighestBidder,
          auctionEndDate: auction.auctionEndDate,
          stock: auction.stock,
          unitType: auction.unitType,
          daysLeft: Math.ceil((new Date(auction.auctionEndDate) - new Date()) / (1000 * 60 * 60 * 24))
        })));
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching active auctions:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>{t.welcome}</Text>
            <Text style={styles.agencyName}>{user?.agencyName || 'Agency'}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(agency)/notifications')}>
            <Ionicons name="notifications" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>{t.stats.title}</Text>
            <View style={styles.statsGrid}>
              <StatsCard
                icon="bar-chart"
                number={stats.total}
                label={t.stats.totalAuctions}
                color="#4CAF50"
              />
              <StatsCard
                icon="timer"
                number={stats.active}
                label={t.stats.activeAuctions}
                color="#2196F3"
                onPress={() => router.push('/(agency)/(tabs)/auctions')}
              />
              <StatsCard
                icon="trophy"
                number={stats.won}
                label={t.stats.wonAuctions}
                color="#FF9800"
              />
              <StatsCard
                icon="wallet"
                number={`₹${stats.investment}`}
                label={t.stats.investment}
                color="#9C27B0"
              />
            </View>
          </View>

          <View style={styles.liveAuctionsContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t.liveAuctions}</Text>
              <TouchableOpacity onPress={() => router.push('/(agency)/(tabs)/auctions')}>
                <Text style={styles.viewAllText}>{t.viewAll}</Text>
              </TouchableOpacity>
            </View>

            {liveAuctions.length > 0 ? (
              liveAuctions.map((auction) => (
                <View key={auction.id} style={styles.auctionCard}>
                  {!auction.isHighestBidder && (
                    <TouchableOpacity 
                      style={styles.topRightBidButton}
                      onPress={() => router.push({
                        pathname: '/product/[id]',
                        params: { id: auction.id }
                      })}
                    >
                      <Text style={styles.bidButtonText}>{t.bidNow}</Text>
                    </TouchableOpacity>
                  )}
                  <View style={styles.auctionHeader}>
                    <View style={styles.auctionTitleContainer}>
                      <Image 
                        source={{ uri: auction.image }} 
                        style={styles.productImage}
                        resizeMode="cover"
                      />
                      <View style={styles.productInfo}>
                        <Text style={styles.auctionTitle}>{auction.name}</Text>
                        <Text style={styles.quantityText}>{auction.stock} {auction.unitType}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.auctionDetails}>
                    <View style={styles.bidInfo}>
                      <Text style={styles.bidLabel}>{t.currentBid}</Text>
                      <Text style={styles.bidValue}>₹{auction.currentBid}{t.perKg}</Text>
                    </View>
                    <View style={styles.bidInfo}>
                      <Text style={styles.bidLabel}>{t.yourLastBid}</Text>
                      <Text style={[
                        styles.lastBidValue,
                        auction.isHighestBidder ? styles.highestBidderValue : null
                      ]}>₹{auction.yourLastBid}{t.perKg}</Text>
                    </View>
                    <View style={styles.bidInfo}>
                      <Text style={styles.bidLabel}>{t.endingIn}</Text>
                      <Text style={styles.endingValue}>{auction.daysLeft} {t.days}</Text>
                    </View>
                  </View>
                  {auction.isHighestBidder && (
                    <View style={styles.highestBidderBadge}>
                      <Text style={styles.highestBidderText}>Current Highest Bidder</Text>
                    </View>
                  )}
                </View>
              ))
            ) : (
              <View style={styles.noAuctionsContainer}>
                <Text style={styles.noAuctionsText}>{t.noAuctions}</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
  },
  agencyName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    paddingLeft: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  statIconContainer: {
    marginBottom: 12,
  },
  statContent: {
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  liveAuctionsContainer: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  viewAllText: {
    color: '#6C63FF',
    fontSize: 14,
  },
  auctionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    position: 'relative',
  },
  auctionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  auctionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  auctionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  quantityText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  auctionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
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
  lastBidValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00C853',
  },
  endingValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3D00',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  highestBidderValue: {
    color: '#4CAF50',
  },
  highestBidderBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  highestBidderText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  topRightBidButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#6C63FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    zIndex: 1,
  },
  bidButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default Dashboard; 