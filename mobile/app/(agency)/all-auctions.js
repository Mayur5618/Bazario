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
const CARD_WIDTH = (width - 48) / 2;

const translations = {
  en: {
    title: 'All Auctions',
    summary: 'Summary',
    totalAuctions: 'Total Auctions',
    won: 'Won',
    closed: 'Closed',
    active: 'Active',
    noAuctions: 'No auctions available',
    stock: 'Stock',
    currentBid: 'Current Bid',
    yourBid: 'Your Bid',
    perKg: '/kg',
    endingOn: 'Ending on',
    categories: 'Categories',
  },
  hi: {
    title: 'सभी नीलामियां',
    summary: 'सारांश',
    totalAuctions: 'कुल नीलामियां',
    won: 'जीती हुई',
    closed: 'बंद',
    active: 'सक्रिय',
    noAuctions: 'कोई नीलामी उपलब्ध नहीं है',
    stock: 'स्टॉक',
    currentBid: 'वर्तमान बोली',
    yourBid: 'आपकी बोली',
    perKg: '/किलो',
    endingOn: 'समाप्ति तिथि',
    categories: 'श्रेणियां',
  }
};

const AllAuctions = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [auctionData, setAuctionData] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');

  const fetchAuctions = async () => {
    try {
      const response = await axios.get(`/api/bids/category-wise-auctions/${user._id}`);
      if (response.data.success) {
        setAuctionData(response.data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching auctions:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchAuctions();
    }
  }, [user?._id]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchAuctions();
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

  const StatusTab = ({ status, count }) => (
    <TouchableOpacity
      style={[
        styles.statusTab,
        selectedStatus === status && styles.selectedStatusTab
      ]}
      onPress={() => setSelectedStatus(status)}
    >
      <Text style={[
        styles.statusTabText,
        selectedStatus === status && styles.selectedStatusTabText
      ]}>
        {t[status]} ({count})
      </Text>
    </TouchableOpacity>
  );

  const renderProductCard = (product, status) => (
    <TouchableOpacity
      key={product._id}
      style={styles.productCard}
      onPress={() => router.push(`/(agency)/product/${product._id}`)}
    >
      <Image
        source={{ uri: product.images[0] }}
        style={styles.productImage}
        resizeMode="cover"
      />
      
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
        <Text style={styles.categoryText} numberOfLines={1}>{product.subcategory}</Text>
        
        <View style={styles.bidInfo}>
          <Text style={styles.bidLabel}>{t.currentBid}</Text>
          <Text style={styles.bidAmount}>₹{product.currentHighestBid}{t.perKg}</Text>
        </View>

        {product.yourLastBid > 0 && (
          <View style={styles.bidInfo}>
            <Text style={styles.bidLabel}>{t.yourBid}</Text>
            <Text style={[styles.bidAmount, { color: '#4CAF50' }]}>
              ₹{product.yourLastBid}{t.perKg}
            </Text>
          </View>
        )}

        <View style={styles.stockInfo}>
          <Text style={styles.stockText}>
            {product.stock} {product.unitType}
          </Text>
        </View>

        <View style={styles.dateInfo}>
          <Ionicons name="calendar-outline" size={12} color="#666" />
          <Text style={styles.dateText}>{formatDate(product.auctionEndDate)}</Text>
        </View>
      </View>

      {status === 'won' && (
        <View style={styles.wonBadge}>
          <Ionicons name="trophy" size={12} color="#FFD700" />
          <Text style={styles.wonText}>{t.won}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{
            title: t.title,
            headerTitleStyle: styles.headerTitle,
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
          headerTitleStyle: styles.headerTitle,
        }}
      />
      
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {auctionData && (
          <>
            <View style={styles.summaryContainer}>
              <Text style={styles.sectionTitle}>{t.summary}</Text>
              <View style={styles.summaryStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{auctionData.totalAuctions}</Text>
                  <Text style={styles.statLabel}>{t.totalAuctions}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{auctionData.categorySummary.won}</Text>
                  <Text style={styles.statLabel}>{t.won}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{auctionData.categorySummary.active}</Text>
                  <Text style={styles.statLabel}>{t.active}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{auctionData.categorySummary.closed}</Text>
                  <Text style={styles.statLabel}>{t.closed}</Text>
                </View>
              </View>
            </View>

            <View style={styles.statusTabsContainer}>
              <StatusTab status="all" count={auctionData.totalAuctions} />
              <StatusTab status="won" count={auctionData.categorySummary.won} />
              <StatusTab status="active" count={auctionData.categorySummary.active} />
              <StatusTab status="closed" count={auctionData.categorySummary.closed} />
            </View>

            <View style={styles.categoriesContainer}>
              {Object.entries(auctionData.categoryGroups).map(([category, products]) => {
                let productsToShow = [];
                if (selectedStatus === 'all') {
                  productsToShow = [
                    ...products.won.map(p => ({ ...p, status: 'won' })),
                    ...products.active.map(p => ({ ...p, status: 'active' })),
                    ...products.closed.map(p => ({ ...p, status: 'closed' }))
                  ];
                } else {
                  productsToShow = products[selectedStatus].map(p => ({ ...p, status: selectedStatus }));
                }

                if (productsToShow.length === 0) return null;

                return (
                  <View key={category} style={styles.categorySection}>
                    <Text style={styles.categoryTitle}>{category}</Text>
                    <View style={styles.productsGrid}>
                      {productsToShow.map(product => renderProductCard(product, product.status))}
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryContainer: {
    padding: 16,
    backgroundColor: '#F8F9FA',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6C63FF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statusTabsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  statusTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  selectedStatusTab: {
    backgroundColor: '#6C63FF',
  },
  statusTabText: {
    color: '#666',
    fontSize: 14,
  },
  selectedStatusTabText: {
    color: '#FFFFFF',
  },
  categoriesContainer: {
    padding: 16,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: CARD_WIDTH,
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
  categoryText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  bidInfo: {
    marginBottom: 4,
  },
  bidLabel: {
    fontSize: 11,
    color: '#666',
  },
  bidAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C63FF',
  },
  stockInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  stockText: {
    fontSize: 12,
    color: '#666',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  dateText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
  wonBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  wonText: {
    fontSize: 10,
    color: '#B8860B',
    marginLeft: 4,
    fontWeight: '600',
  },
});

export default AllAuctions; 