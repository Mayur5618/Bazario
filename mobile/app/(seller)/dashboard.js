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
import { MaterialIcons } from '@expo/vector-icons';
import { sellerApi } from '../../src/api/sellerApi';
import { BlurView } from 'expo-blur';
import ProductsTab from '../../src/components/ProductsTab';
import OrdersTab from './OrdersTab';
import ReviewsTab from './ReviewsTab';
import ProfileTab from './profile';

const { width } = Dimensions.get('window');
const cardWidth = width - 40; // Full width cards with padding

const SellerDashboard = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
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

  useEffect(() => {
    fetchDashboardStats();
  }, []);

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
        sellerApi.getSellerProducts({ limit: 3, sort: '-createdAt' })
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
      <TouchableOpacity 
        onPress={() => router.push('/(seller)/profile')}
        style={styles.headerRight}
      >
        {user?.profileImage ? (
          <Image
            source={{ uri: user.profileImage }}
            style={styles.profileImage}
          />
        ) : (
          <View style={styles.profileImagePlaceholder}>
            <Ionicons name="person" size={24} color="#666" />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderDashboardContent = () => (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.statsContainer}>
        <DashboardCard 
          title="Total Products"
          value={stats.totalProducts}
          icon="cube-outline"
          color="#6C63FF"
          onPress={() => router.push('/(seller)/products')}
        />
        <DashboardCard 
          title="Total Orders"
          value={stats.totalOrders}
          icon="cart-outline"
          color="#00C853"
        />
        <DashboardCard 
          title="Pending Orders"
          value={stats.pendingOrders}
          icon="time-outline"
          color="#FF9800"
          onPress={() => router.push('/pending-orders')}
        />
        <DashboardCard 
          title="Revenue"
          value={`₹${stats.revenue}`}
          icon="cash-outline"
          color="#2196F3"
        />
        <DashboardCard 
          title="Seller Rating"
          value={stats.sellerRating > 0 ? `${stats.sellerRating} ★` : 'New'}
          icon="star-outline"
          color="#FFD700"
          subtitle={`${stats.totalReviews} reviews`}
        />
      </View>

      {/* Latest Products Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Latest Products</Text>
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => router.push('/(seller)/products')}
          >
            <Text style={styles.viewAllText}>View All</Text>
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
              <Text style={styles.emptyStateText}>No products added yet</Text>
            </View>
          )}
        </View>
      </View>

      {/* Latest Review Section */}
      {stats.latestReview && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Latest Review</Text>
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

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <ScrollView 
            style={styles.container}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {renderHeader()}
            {renderDashboardContent()}
          </ScrollView>
        );
      case 'products':
        return (
          <View style={styles.container}>
            {renderHeader()}
            <ProductsTab />
          </View>
        );
      case 'orders':
        return (
          <View style={styles.container}>
            {renderHeader()}
            <OrdersTab />
          </View>
        );
      case 'reviews':
        return (
          <View style={styles.container}>
            {renderHeader()}
            <ReviewsTab />
          </View>
        );
      case 'profile':
        return (
          <ScrollView style={styles.container}>
            {renderHeader()}
            <ProfileTab />
          </ScrollView>
        );
      default:
        return renderDashboardContent();
    }
  };

  return (
    <View style={styles.mainContainer}>
      {renderContent()}
      
      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('dashboard')}
        >
          <Ionicons
            name={activeTab === 'dashboard' ? 'grid' : 'grid-outline'}
            size={24}
            color={activeTab === 'dashboard' ? '#6C63FF' : '#666'}
          />
          <Text style={[styles.tabLabel, activeTab === 'dashboard' && styles.activeTabLabel]}>
            Dashboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('products')}
        >
          <Ionicons
            name={activeTab === 'products' ? 'cube' : 'cube-outline'}
            size={24}
            color={activeTab === 'products' ? '#6C63FF' : '#666'}
          />
          <Text style={[styles.tabLabel, activeTab === 'products' && styles.activeTabLabel]}>
            Products
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('orders')}
        >
          <Ionicons
            name={activeTab === 'orders' ? 'cart' : 'cart-outline'}
            size={24}
            color={activeTab === 'orders' ? '#6C63FF' : '#666'}
          />
          <Text style={[styles.tabLabel, activeTab === 'orders' && styles.activeTabLabel]}>
            Orders
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('reviews')}
        >
          <Ionicons
            name={activeTab === 'reviews' ? 'star' : 'star-outline'}
            size={24}
            color={activeTab === 'reviews' ? '#6C63FF' : '#666'}
          />
          <Text style={[styles.tabLabel, activeTab === 'reviews' && styles.activeTabLabel]}>
            Reviews
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => {
            setActiveTab('profile');
          }}
        >
          <Ionicons
            name={activeTab === 'profile' ? 'person' : 'person-outline'}
            size={24}
            color={activeTab === 'profile' ? '#6C63FF' : '#666'}
          />
          <Text style={[styles.tabLabel, activeTab === 'profile' && styles.activeTabLabel]}>
            Profile
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
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    position: 'absolute',
    right: 16,
    top: 8,
    zIndex: 1,
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  profileImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
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
  mainContainer: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  tabBar: {
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
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    color: '#666',
  },
  activeTabLabel: {
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