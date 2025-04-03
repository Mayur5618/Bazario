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
  Alert,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { sellerApi } from '../../src/api/sellerApi';
import { formatDistanceToNow } from 'date-fns';
import { useLanguage } from '../../src/context/LanguageContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 48 = padding (16) * 2 + gap between cards (16)

// Translations
const translations = {
  en: {
    title: "Your B2B Products",
    noProducts: "No B2B products found",
    stock: "Stock",
    ends: "Ends",
    currentBid: "Current Bid",
    noBids: "No bids yet",
    auctionStatuses: {
      ended: "Auction Ended",
      cancelled: "Auction Cancelled",
      expired: "Auction Expired",
      active: "Auction Active"
    }
  },
  hi: {
    title: "आपके B2B प्रोडक्ट्स",
    noProducts: "कोई B2B प्रोडक्ट नहीं मिला",
    stock: "स्टॉक",
    ends: "समाप्ति",
    currentBid: "वर्तमान बोली",
    noBids: "कोई बोली नहीं",
    auctionStatuses: {
      ended: "नीलामी समाप्त",
      cancelled: "नीलामी रद्द",
      expired: "नीलामी समय समाप्त",
      active: "नीलामी सक्रिय"
    }
  },
  mr: {
    title: "तुमचे B2B प्रॉडक्ट्स",
    noProducts: "कोणतेही B2B प्रॉडक्ट्स सापडले नाहीत",
    stock: "स्टॉक",
    ends: "समाप्ती",
    currentBid: "सध्याची बोली",
    noBids: "कोणतीही बोली नाही",
    auctionStatuses: {
      ended: "लिलाव संपला",
      cancelled: "लिलाव रद्द",
      expired: "लिलाव कालबाह्य",
      active: "लिलाव सुरू"
    }
  },
  gu: {
    title: "તમારા B2B પ્રોડક્ટ્સ",
    noProducts: "કોઈ B2B પ્રોડક્ટ્સ મળ્યા નથી",
    stock: "સ્ટોક",
    ends: "સમાપ્તિ",
    currentBid: "વર્તમાન બોલી",
    noBids: "કોઈ બોલી નથી",
    auctionStatuses: {
      ended: "હરાજી સમાપ્ત",
      cancelled: "હરાજી રદ",
      expired: "હરાજી સમય પૂર્ણ",
      active: "હરાજી ચાલુ"
    }
  }
};

const B2BProductsScreen = () => {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = async () => {
    try {
      const response = await sellerApi.getSellerB2BProducts();
      if (response.success) {
        setProducts(response.data);
      } else {
        Alert.alert('Error', response.message);
      }
    } catch (error) {
      console.error('Error fetching B2B products:', error);
      Alert.alert('Error', 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  }, []);

  const getAuctionStatus = (product) => {
    const now = new Date();
    const endDate = new Date(product.auctionEndDate);
    
    if (product.auctionStatus === 'ended') {
      return { text: t.auctionStatuses.ended, color: '#FF4444' };
    } else if (product.auctionStatus === 'cancelled') {
      return { text: t.auctionStatuses.cancelled, color: '#666666' };
    } else if (endDate < now) {
      return { text: t.auctionStatuses.expired, color: '#FF4444' };
    } else {
      return { text: t.auctionStatuses.active, color: '#4CAF50' };
    }
  };

  const getTimeRemaining = (endDate) => {
    return formatDistanceToNow(new Date(endDate), { addSuffix: true });
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity 
      style={[styles.productCard, { width: CARD_WIDTH }]}
      onPress={() => router.push(`/(seller)/edit-b2b-product/${item._id}`)}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={item.images[0] ? { uri: item.images[0] } : { uri: 'https://via.placeholder.com/300x200?text=No+Image' }}
          style={styles.productImage}
        />
        <View style={[styles.statusBadge, { backgroundColor: getAuctionStatus(item).color }]}>
          <Text style={styles.statusText}>{getAuctionStatus(item).text}</Text>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.categoryText} numberOfLines={1}>{item.category}</Text>

        <View style={styles.stockContainer}>
          <Text style={styles.stockLabel}>{t.stock}:</Text>
          <Text style={styles.stockValue}>{item.stock} {item.unitType}</Text>
        </View>

        <View style={styles.auctionContainer}>
          <View style={styles.auctionInfo}>
            <Text style={styles.auctionLabel}>{t.ends}: </Text>
            <Text style={styles.auctionValue}>{getTimeRemaining(item.auctionEndDate)}</Text>
          </View>

          <View style={styles.bidInfo}>
            <Text style={styles.bidLabel}>{t.currentBid}: </Text>
            <Text style={styles.bidValue}>
              {item.currentHighestBid > 0 
                ? `₹${item.currentHighestBid}/${item.unitType}`
                : t.noBids
              }
            </Text>
          </View>
        </View>

        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={12} color="#666" />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.availableLocations.join(', ')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.title}</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/(seller)/add-b2b-product')}
        >
          <Ionicons name="add" size={24} color="#FFF" />
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
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={48} color="#666" />
            <Text style={styles.emptyText}>{t.noProducts}</Text>
          </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  addButton: {
    backgroundColor: '#6C63FF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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

export default B2BProductsScreen;