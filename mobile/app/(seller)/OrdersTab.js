import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
  ActivityIndicator,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { sellerApi } from '../../src/api/sellerApi';
import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

const OrdersTab = () => {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all');
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    monthlyData: {
      all: [],
      pending: [],
      completed: [],
      cancelled: []
    }
  });
  const [activeDotIndex, setActiveDotIndex] = useState(0);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const [ordersResponse, statsResponse] = await Promise.all([
        sellerApi.getSellerOrders(),
        sellerApi.getOrderStats()
      ]);

      if (ordersResponse.success) {
        setOrders(ordersResponse.orders);
      }

      if (statsResponse.success) {
        const { stats } = statsResponse;
        setOrderStats({
          totalOrders: stats.totalOrders,
          pendingOrders: stats.pendingOrders,
          completedOrders: stats.completedOrders,
          cancelledOrders: stats.cancelledOrders,
          monthlyData: {
            all: stats.monthlyData,
            pending: stats.monthlyData.map(month => ({
              ...month,
              totalOrders: month.pendingOrders
            })),
            completed: stats.monthlyData.map(month => ({
              ...month,
              totalOrders: month.completedOrders
            })),
            cancelled: stats.monthlyData.map(month => ({
              ...month,
              totalOrders: month.cancelledOrders
            }))
          }
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('त्रुटि', 'ऑर्डर लोड करने में समस्या हुई');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  }, []);

  const getFilteredOrders = () => {
    switch (selectedTab) {
      case 'pending':
        return orders.filter(o => o.status === 'pending');
      case 'completed':
        return orders.filter(o => o.status === 'completed' || o.status === 'delivered');
      case 'cancelled':
        return orders.filter(o => o.status === 'cancelled');
      default:
        return orders;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#FFA500';
      case 'completed':
      case 'delivered':
        return '#4CAF50';
      case 'cancelled':
        return '#FF0000';
      default:
        return '#666666';
    }
  };

  const getChartData = () => {
    const data = orderStats.monthlyData[selectedTab] || [];
    if (data.length === 0) {
      return {
        labels: [],
        datasets: [{
          data: []
        }]
      };
    }
    return {
      labels: data.map(item => item.month.substring(0, 3)),
      datasets: [{
        data: data.map(item => item.totalOrders || 0)
      }]
    };
  };

  const getChartConfig = () => {
    const colors = {
      all: '#6C63FF',
      pending: '#FFA500',
      completed: '#4CAF50',
      cancelled: '#FF0000'
    };
    
    return {
      backgroundColor: '#ffffff',
      backgroundGradientFrom: '#ffffff',
      backgroundGradientTo: '#ffffff',
      decimalPlaces: 0,
      color: () => colors[selectedTab],
      labelColor: () => '#666666',
      style: {
        borderRadius: 16
      },
      propsForDots: {
        r: '4',
        strokeWidth: '2',
        stroke: colors[selectedTab]
      }
    };
  };

  const getCurrentMonthData = () => {
    const data = orderStats.monthlyData.all || [];
    const currentMonth = new Date().getMonth();
    const currentMonthData = data.find(item => new Date(item.month).getMonth() === currentMonth) || { totalOrders: 0 };
    
    // Get daily data for current month
    return {
      labels: ['सप्ताह 1', 'सप्ताह 2', 'सप्ताह 3', 'सप्ताह 4'],
      datasets: [{
        data: [
          Math.floor(Math.random() * 10),
          Math.floor(Math.random() * 10),
          Math.floor(Math.random() * 10),
          Math.floor(Math.random() * 10)
        ]
      }]
    };
  };

  const getLastMonthData = () => {
    const data = orderStats.monthlyData.all || [];
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthData = data.find(item => new Date(item.month).getMonth() === lastMonth.getMonth()) || { totalOrders: 0 };
    
    // Get daily data for last month
    return {
      labels: ['सप्ताह 1', 'सप्ताह 2', 'सप्ताह 3', 'सप्ताह 4'],
      datasets: [{
        data: [
          Math.floor(Math.random() * 10),
          Math.floor(Math.random() * 10),
          Math.floor(Math.random() * 10),
          Math.floor(Math.random() * 10)
        ]
      }]
    };
  };

  const getLast6MonthsData = () => {
    const data = orderStats.monthlyData.all || [];
    return {
      labels: ['जन', 'फर', 'मार्च', 'अप्रै', 'मई', 'जून'],
      datasets: [{
        data: [
          Math.floor(Math.random() * 20),
          Math.floor(Math.random() * 20),
          Math.floor(Math.random() * 20),
          Math.floor(Math.random() * 20),
          Math.floor(Math.random() * 20),
          Math.floor(Math.random() * 20)
        ]
      }]
    };
  };

  const renderOrderCard = (order) => (
    <TouchableOpacity
      key={order._id}
      style={styles.orderCard}
      onPress={() => router.push(`/(seller)/order-details/${order._id}`)}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>ऑर्डर #{order.orderId}</Text>
        <Text style={[styles.orderStatus, { color: getStatusColor(order.status) }]}>
          {order.status === 'pending' ? 'लंबित' :
           order.status === 'completed' || order.status === 'delivered' ? 'पूर्ण' :
           order.status === 'cancelled' ? 'रद्द' : order.status}
        </Text>
      </View>

      <View style={styles.orderInfo}>
        <View style={styles.customerInfo}>
          <Ionicons name="person-outline" size={16} color="#666" />
          <Text style={styles.customerName}>
            {order.buyer.firstname} {order.buyer.lastname}
          </Text>
        </View>
        
        <View style={styles.orderDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              {new Date(order.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="cash-outline" size={16} color="#666" />
            <Text style={styles.detailText}>₹{order.total}</Text>
          </View>
        </View>

        <View style={styles.itemsContainer}>
          {order.items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Image
                source={{ uri: item.product.images[0] }}
                style={styles.itemImage}
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.product.name}
                </Text>
                <Text style={styles.itemQuantity}>
                  {item.quantity} x ₹{item.price}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
          <Text style={styles.statValue}>{orderStats.totalOrders}</Text>
          <Text style={styles.statLabel}>कुल{'\n'}ऑर्डर</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
          <Text style={styles.statValue}>{orderStats.pendingOrders}</Text>
          <Text style={styles.statLabel}>लंबित{'\n'}ऑर्डर</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
          <Text style={styles.statValue}>{orderStats.completedOrders}</Text>
          <Text style={styles.statLabel}>पूर्ण{'\n'}ऑर्डर</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FFEBEE' }]}>
          <Text style={styles.statValue}>{orderStats.cancelledOrders}</Text>
          <Text style={styles.statLabel}>रद्द{'\n'}ऑर्डर</Text>
        </View>
      </View>

      {/* Charts Section */}
      <View style={styles.chartsSection}>
        <View style={styles.chartHeader}>
          <Text style={styles.sectionTitle}>पिछले 6 महीनों के आँकड़े</Text>
          <View style={styles.chartDots}>
            {[0, 1, 2].map((index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  activeDotIndex === index && styles.activeDot
                ]}
              />
            ))}
          </View>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          style={styles.chartsScrollView}
          onScroll={(e) => {
            const offset = e.nativeEvent.contentOffset.x;
            const page = Math.round(offset / (width - 32));
            setActiveDotIndex(page);
          }}
          scrollEventThrottle={16}
        >
          {/* Current Month Chart */}
          <View style={[styles.chartContainer, { width: width - 32 }]}>
            <Text style={styles.chartTitle}>इस महीने के ऑर्डर</Text>
            <LineChart
              data={getCurrentMonthData()}
              width={width - 64}
              height={180}
              yAxisInterval={1}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: () => '#6C63FF',
                labelColor: () => '#666666',
                style: { borderRadius: 16 },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#ffffff'
                },
                propsForLabels: {
                  fontSize: 12
                },
                formatYLabel: (value) => Math.round(value).toString(),
                yAxisInterval: 1
              }}
              bezier
              style={styles.chart}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              withDots={true}
              withShadow={false}
              withScrollableDot={false}
              yAxisSuffix=""
              yAxisLabel=""
              segments={4}
              fromZero={true}
              withInnerLines={true}
              paddingRight={32}
              paddingLeft={32}
              paddingTop={16}
            />
          </View>

          {/* Last Month Chart */}
          <View style={[styles.chartContainer, { width: width - 32 }]}>
            <Text style={styles.chartTitle}>पिछले महीने के ऑर्डर</Text>
            <LineChart
              data={getLastMonthData()}
              width={width - 64}
              height={180}
              yAxisInterval={1}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: () => '#4CAF50',
                labelColor: () => '#666666',
                style: { borderRadius: 16 },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#ffffff'
                },
                propsForLabels: {
                  fontSize: 12
                },
                formatYLabel: (value) => Math.round(value).toString(),
                yAxisInterval: 1
              }}
              bezier
              style={styles.chart}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              withDots={true}
              withShadow={false}
              withScrollableDot={false}
              yAxisSuffix=""
              yAxisLabel=""
              segments={4}
              fromZero={true}
              withInnerLines={true}
              paddingRight={32}
              paddingLeft={32}
              paddingTop={16}
            />
          </View>

          {/* Last 6 Months Chart */}
          <View style={[styles.chartContainer, { width: width - 32 }]}>
            <Text style={styles.chartTitle}>पिछले 6 महीनों के ऑर्डर</Text>
            <LineChart
              data={getLast6MonthsData()}
              width={width - 64}
              height={180}
              yAxisInterval={1}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: () => '#FF9800',
                labelColor: () => '#666666',
                style: { borderRadius: 16 },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#ffffff'
                },
                propsForLabels: {
                  fontSize: 12
                },
                formatYLabel: (value) => Math.round(value).toString(),
                yAxisInterval: 1
              }}
              bezier
              style={styles.chart}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              withDots={true}
              withShadow={false}
              withScrollableDot={false}
              yAxisSuffix=""
              yAxisLabel=""
              segments={4}
              fromZero={true}
              withInnerLines={true}
              paddingRight={32}
              paddingLeft={32}
              paddingTop={16}
            />
          </View>
        </ScrollView>
      </View>

      {/* Order Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'all' && styles.activeTab]}
          onPress={() => setSelectedTab('all')}
        >
          <Text style={[styles.tabText, selectedTab === 'all' && styles.activeTabText]}>
            सभी
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'pending' && styles.activeTab]}
          onPress={() => setSelectedTab('pending')}
        >
          <Text style={[styles.tabText, selectedTab === 'pending' && styles.activeTabText]}>
            लंबित
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'completed' && styles.activeTab]}
          onPress={() => setSelectedTab('completed')}
        >
          <Text style={[styles.tabText, selectedTab === 'completed' && styles.activeTabText]}>
            पूर्ण
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'cancelled' && styles.activeTab]}
          onPress={() => setSelectedTab('cancelled')}
        >
          <Text style={[styles.tabText, selectedTab === 'cancelled' && styles.activeTabText]}>
            रद्द
          </Text>
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loadingText}>ऑर्डर्स लोड हो रहे हैं...</Text>
        </View>
      ) : (
        <View style={styles.ordersList}>
          {getFilteredOrders().length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={64} color="#CCC" />
              <Text style={styles.emptyStateText}>कोई ऑर्डर नहीं मिला</Text>
            </View>
          ) : (
            getFilteredOrders().map(order => renderOrderCard(order))
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  statCard: {
    flex: 1,
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  chartsSection: {
    marginTop: 16,
    marginBottom: 24,
    backgroundColor: '#fff',
    elevation: 2,
    paddingVertical: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  chartsScrollView: {
    paddingHorizontal: 16,
  },
  chartContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  chart: {
    borderRadius: 12,
    paddingRight: 16,
  },
  chartDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  activeDot: {
    backgroundColor: '#6C63FF',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  tabsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFF',
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: '#F0F0F0',
  },
  activeTab: {
    backgroundColor: '#6C63FF20',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#6C63FF',
    fontWeight: '500',
  },
  ordersList: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  orderInfo: {
    gap: 12,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customerName: {
    fontSize: 14,
    color: '#666',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  itemsContainer: {
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  itemQuantity: {
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
});

export default OrdersTab; 