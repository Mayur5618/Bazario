import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { useLanguage } from '../../src/context/LanguageContext';
import { MaterialIcons } from '@expo/vector-icons';
import { sellerApi } from '../../src/api/sellerApi';
import { BlurView } from 'expo-blur';
import ProductsTab from '../../src/components/ProductsTab';
import OrdersTab from './OrdersTab';
import ReviewsTab from './ReviewsTab';
import ProfileTab from './profile';
import B2BDashboard from '../../src/components/B2BDashboard';
import B2BProductsTab from '../../src/components/b2b-productTab';

// Translations for all UI text
const translations = {
  en: {
    totalProducts: 'Total Products',
    totalOrders: 'Total Orders',
    pendingOrders: 'Pending Orders',
    revenue: 'Revenue',
    sellerRating: 'Seller Rating',
    reviews: 'Reviews',
    latestProducts: 'Latest Products',
    latestReview: 'Latest Review',
    viewAll: 'View All',
    dashboard: 'Dashboard',
    products: 'Products',
    orders: 'Orders',
    reviews: 'Reviews',
    profile: 'Profile',
    personal: 'Personal',
    business: 'Business',
    noProductsYet: 'No products added yet'
  },
  hi: {
    totalProducts: 'कुल उत्पाद',
    totalOrders: 'कुल ऑर्डर',
    pendingOrders: 'लंबित ऑर्डर',
    revenue: 'कमाई',
    sellerRating: 'विक्रेता रेटिंग',
    reviews: 'समीक्षाएं',
    latestProducts: 'नवीनतम उत्पाद',
    latestReview: 'नवीनतम समीक्षा',
    viewAll: 'सभी देखें',
    dashboard: 'डैशबोर्ड',
    products: 'उत्पाद',
    orders: 'ऑर्डर',
    reviews: 'समीक्षाएं',
    profile: 'प्रोफाइल',
    personal: 'व्यक्तिगत',
    business: 'व्यापार',
    noProductsYet: 'अभी तक कोई उत्पाद नहीं जोड़ा गया'
  },
  mr: {
    totalProducts: 'एकूण उत्पादने',
    totalOrders: 'एकूण ऑर्डर',
    pendingOrders: 'प्रलंबित ऑर्डर',
    revenue: 'महसूल',
    sellerRating: 'विक्रेता रेटिंग',
    reviews: 'समीक्षा',
    latestProducts: 'नवीनतम उत्पादने',
    latestReview: 'नवीनतम समीक्षा',
    viewAll: 'सर्व पहा',
    dashboard: 'डॅशबोर्ड',
    products: 'उत्पादने',
    orders: 'ऑर्डर',
    reviews: 'समीक्षा',
    profile: 'प्रोफाइल',
    personal: 'वैयक्तिक',
    business: 'व्यवसाय',
    noProductsYet: 'अजून कोणतेही उत्पाद जोडले नाही'
  },
  gu: {
    totalProducts: 'કુલ ઉત્પાદનો',
    totalOrders: 'કુલ ઓર્ડર',
    pendingOrders: 'બાકી ઓર્ડર',
    revenue: 'આવક',
    sellerRating: 'વિક્રેતા રેટિંગ',
    reviews: 'સમીક્ષાઓ',
    latestProducts: 'નવીનતમ ઉત્પાદનો',
    latestReview: 'નવીનતમ સમીક્ષા',
    viewAll: 'બધા જુઓ',
    dashboard: 'ડેશબોર્ડ',
    products: 'ઉત્પાદનો',
    orders: 'ઓર્ડર',
    reviews: 'સમીક્ષાઓ',
    profile: 'પ્રોફાઇલ',
    personal: 'વ્યક્તિગત',
    business: 'વ્યાપાર',
    noProductsYet: 'હજી સુધી કોઈ ઉત્પાદન ઉમેર્યું નથી'
  }
};

const { width } = Dimensions.get('window');
const cardWidth = width - 40; // Full width cards with padding

const SellerDashboard = () => {
  const router = useRouter();
  const { user, logout, businessMode, setBusinessMode } = useAuth();
  const { language } = useLanguage();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mode, setMode] = useState('personal');
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    revenue: 0,
    totalReviews: 0,
    latestProducts: [],
    latestReview: null,
    sellerRating: 0,
  });
  const [loading, setLoading] = useState(false);

  // Get translations for current language
  const t = translations[language] || translations.en;

  useEffect(() => {
    fetchDashboardStats();
  }, [businessMode]);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)/seller/login');
    } catch (error) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchDashboardStats();
    setRefreshing(false);
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const [statsResponse, productsResponse] = await Promise.all([
        sellerApi.getDashboardStats(),
        sellerApi.getSellerProducts({ 
          limit: 3, 
          sort: '-createdAt',
          platformType: businessMode === 'business' ? 'b2b' : 'b2c'
        })
      ]);

      if (statsResponse.success && productsResponse.success) {
        setStats({
          ...statsResponse.stats,
          latestProducts: productsResponse.products.slice(0, 3) // Ensure only 3 products
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      Alert.alert('Error', 'Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const DashboardCard = ({ title, value, icon, color, onPress, subtitle }) => (
    <TouchableOpacity 
      style={[styles.card, { borderLeftColor: color }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardValue}>{value}</Text>
        {subtitle && (
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
        )}
      </View>
      <View style={[styles.cardIcon, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
    </TouchableOpacity>
  );

  const QuickAction = ({ title, icon, onPress, color }) => (
    <TouchableOpacity 
      style={[styles.quickAction, { backgroundColor: `${color}10` }]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={24} color={color} />
      <Text style={[styles.quickActionText, { color }]}>{title}</Text>
    </TouchableOpacity>
  );

  const ProductAnalyticsCard = ({ product }) => (
    <TouchableOpacity 
      style={[styles.analyticsCard, { width: width - 32 }]}
      onPress={() => router.push(`/(seller)/product-details/${product._id}`)}
    >
      <View style={styles.analyticsHeader}>
        <View style={styles.headerLeft}>
          <Image 
            source={{ uri: product.images[0] }} 
            style={styles.productThumbnail}
            resizeMode="cover"
          />
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
            <Text style={styles.productPrice}>₹{product.price}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => router.push(`/(seller)/edit-product/${product._id}`)}
        >
          <Ionicons name="create-outline" size={20} color="#6C63FF" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.analyticsStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{product.stock}</Text>
          <Text style={styles.statLabel}>Stock</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{product.pendingOrders || 0}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{product.rating?.toFixed(1) || 'New'}</Text>
          <Text style={styles.statLabel}>Rating ({product.numReviews})</Text>
        </View>
      </View>

      {product.numReviews > 0 && (
        <View style={styles.reviewPreview}>
          <View style={styles.reviewHeader}>
            <View style={styles.reviewerInfo}>
              <Ionicons name="person-circle-outline" size={20} color="#666" />
              <Text style={styles.reviewerName}>Latest Review</Text>
            </View>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>{product.latestReview?.rating || product.rating}</Text>
            </View>
          </View>
          {product.latestReview?.comment && (
            <Text style={styles.reviewComment} numberOfLines={2}>
              "{product.latestReview.comment}"
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.nameText}>{user?.firstname} {user?.lastname}</Text>
      </View>
      
      <View style={styles.modeToggle}>
        <TouchableOpacity 
          style={[styles.modeButton, businessMode === 'personal' && styles.activeModeButton]}
          onPress={() => setBusinessMode('personal')}
        >
          <Text style={[styles.modeButtonText, businessMode === 'personal' && styles.activeModeButtonText]}>
            {t.personal}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.modeButton, businessMode === 'business' && styles.activeModeButton]}
          onPress={() => setBusinessMode('business')}
        >
          <Text style={[styles.modeButtonText, businessMode === 'business' && styles.activeModeButtonText]}>
            {t.business}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDashboardContent = () => {
    if (businessMode === 'business') {
      return <B2BDashboard />;
    }

    return (
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.statsContainer}>
          <DashboardCard 
            title={t.totalProducts}
            value={stats.totalProducts}
            icon="cube-outline"
            color="#6C63FF"
            onPress={() => router.push('/(seller)/products')}
          />
          <DashboardCard 
            title={t.totalOrders}
            value={stats.totalOrders}
            icon="cart-outline"
            color="#00C853"
          />
          <DashboardCard 
            title={t.pendingOrders}
            value={stats.pendingOrders}
            icon="time-outline"
            color="#FF9800"
            onPress={() => router.push('/pending-orders')}
          />
          <DashboardCard 
            title={t.revenue}
            value={`₹${stats.revenue}`}
            icon="cash-outline"
            color="#2196F3"
          />
          <DashboardCard 
            title={t.sellerRating}
            value={stats.sellerRating > 0 ? `${stats.sellerRating} ★` : 'New'}
            icon="star-outline"
            color="#FFD700"
            subtitle={`${stats.totalReviews} reviews`}
          />
        </View>

        {/* Latest Products Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t.latestProducts}</Text>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => router.push('/(seller)/products')}
            >
              <Text style={styles.viewAllText}>{t.viewAll}</Text>
              <Ionicons name="chevron-forward" size={16} color="#6C63FF" />
            </TouchableOpacity>
          </View>
          <View style={styles.analyticsContainer}>
            {stats.latestProducts && stats.latestProducts.length > 0 ? (
              stats.latestProducts.map((product) => (
                <ProductAnalyticsCard key={product._id} product={product} />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="cube-outline" size={48} color="#666" />
                <Text style={styles.emptyStateText}>{t.noProductsYet}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Latest Review Section */}
        {stats.latestReview && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.latestReview}</Text>
            <View style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewUser}>
                  <Ionicons name="person-circle-outline" size={24} color="#666" />
                  <Text style={styles.reviewUserName}>{stats.latestReview.userName}</Text>
                </View>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.ratingText}>{stats.latestReview.rating}</Text>
                </View>
              </View>
              <Text style={styles.reviewText}>{stats.latestReview.comment}</Text>
              <Text style={styles.reviewDate}>
                {new Date(stats.latestReview.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return businessMode === 'business' ? <B2BDashboard /> : renderDashboardContent();
      case 'products':
        return businessMode === 'business' ? <B2BProductsTab /> : <ProductsTab />;
      case 'orders':
        return businessMode === 'business' ? null : <OrdersTab />;
      case 'reviews':
        return <ReviewsTab />;
      case 'profile':
        return <ProfileTab />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      {renderHeader()}

      {/* Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'dashboard' && styles.activeNavItem]}
          onPress={() => setActiveTab('dashboard')}
        >
          <Ionicons
            name={activeTab === 'dashboard' ? 'grid' : 'grid-outline'}
            size={24}
            color={activeTab === 'dashboard' ? '#6C63FF' : '#666'}
          />
          <Text style={[styles.navText, activeTab === 'dashboard' && styles.activeNavText]}>
            {t.dashboard}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'products' && styles.activeNavItem]}
          onPress={() => setActiveTab('products')}
        >
          <Ionicons
            name={activeTab === 'products' ? 'cube' : 'cube-outline'}
            size={24}
            color={activeTab === 'products' ? '#6C63FF' : '#666'}
          />
          <Text style={[styles.navText, activeTab === 'products' && styles.activeNavText]}>
            {t.products}
          </Text>
        </TouchableOpacity>

        {businessMode !== 'business' && (
          <TouchableOpacity
            style={[styles.navItem, activeTab === 'orders' && styles.activeNavItem]}
            onPress={() => setActiveTab('orders')}
          >
            <Ionicons
              name={activeTab === 'orders' ? 'cart' : 'cart-outline'}
              size={24}
              color={activeTab === 'orders' ? '#6C63FF' : '#666'}
            />
            <Text style={[styles.navText, activeTab === 'orders' && styles.activeNavText]}>
              {t.orders}
            </Text>
          </TouchableOpacity>
        )}

        {businessMode !== 'business' && (
          <TouchableOpacity
            style={[styles.navItem, activeTab === 'reviews' && styles.activeNavItem]}
            onPress={() => setActiveTab('reviews')}
          >
            <Ionicons
              name={activeTab === 'reviews' ? 'star' : 'star-outline'}
              size={24}
              color={activeTab === 'reviews' ? '#6C63FF' : '#666'}
            />
            <Text style={[styles.navText, activeTab === 'reviews' && styles.activeNavText]}>
              {t.reviews}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'profile' && styles.activeNavItem]}
          onPress={() => setActiveTab('profile')}
        >
          <Ionicons
            name={activeTab === 'profile' ? 'person' : 'person-outline'}
            size={24}
            color={activeTab === 'profile' ? '#6C63FF' : '#666'}
          />
          <Text style={[styles.navText, activeTab === 'profile' && styles.activeNavText]}>
            {t.profile}
          </Text>
        </TouchableOpacity>
      </View>
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
    backgroundColor: '#FFFFFF',
  },
  headerLeft: {
    flex: 1,
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
  },
  modeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  activeModeButton: {
    backgroundColor: '#6C63FF',
  },
  modeButtonText: {
    fontSize: 14,
    color: '#666',
  },
  activeModeButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  statsContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  analyticsContainer: {
    paddingHorizontal: 20,
  },
  analyticsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignSelf: 'center',
  },
  analyticsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  productThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#F5F5F5',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#6C63FF',
  },
  editButton: {
    padding: 8,
    backgroundColor: '#6C63FF20',
    borderRadius: 8,
    marginLeft: 12,
  },
  analyticsStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: '#F0F0F0',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  reviewPreview: {
    borderTopWidth: 1,
    borderColor: '#F0F0F0',
    paddingTop: 12,
    marginTop: 4,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reviewerName: {
    fontSize: 13,
    color: '#666',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFB800',
    marginLeft: 2,
  },
  reviewComment: {
    fontSize: 13,
    color: '#444',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reviewUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewUserName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  reviewText: {
    fontSize: 14,
    color: '#666',
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,

  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
  },
  actionButton: {
    width: '46%',
    margin: '2%',
    height: 100,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addProductButton: {
    backgroundColor: '#6B46C110',
  },
  viewOrdersButton: {
    backgroundColor: '#48BB7810',
  },
  actionButtonText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  quickActionButton: {
    width: '46%',
    margin: '2%',
    height: 100,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickAction: {
    width: '46%',
    margin: '2%',
    height: 100,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    justifyContent: 'space-between',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
    color: '#666',
  },
  activeNavItem: {
    color: '#6C63FF',
    fontWeight: '500',
  },
  activeNavText: {
    color: '#6C63FF',
    fontWeight: '500',
  },
  comingSoon: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6C63FF10',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: '#6C63FF',
    marginRight: 4,
  },
});

export default SellerDashboard; 