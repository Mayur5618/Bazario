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
import { useLanguage } from '../../src/context/LanguageContext';

const { width } = Dimensions.get('window');

// Translations for orders tab
const translations = {
  en: {
    totalOrders: "Total Orders",
    pendingOrders: "Pending Orders",
    completedOrders: "Completed Orders",
    cancelledOrders: "Cancelled Orders",
    lastMonthStats: "Last 6 Months Statistics",
    ordersInCurrentMonth: "Orders in Current Month",
    all: "All",
    pending: "Pending",
    completed: "Completed",
    cancelled: "Cancelled",
    noOrders: "No orders found",
    loadingOrders: "Loading orders...",
    orderNumber: "Order #",
    customer: "Customer",
    date: "Date",
    amount: "Amount",
    week: "Week"
  },
  hi: {
    totalOrders: "कुल ऑर्डर",
    pendingOrders: "लंबित ऑर्डर",
    completedOrders: "पूर्ण ऑर्डर",
    cancelledOrders: "रद्द ऑर्डर",
    lastMonthStats: "पिछले 6 महीने का आंकड़ा",
    ordersInCurrentMonth: "वर्तमान महीने के ऑर्डर",
    all: "सभी",
    pending: "लंबित",
    completed: "पूर्ण",
    cancelled: "रद्द",
    noOrders: "कोई ऑर्डर नहीं मिला",
    loadingOrders: "ऑर्डर लोड हो रहे हैं...",
    orderNumber: "ऑर्डर #",
    customer: "ग्राहक",
    date: "दिनांक",
    amount: "राशि",
    week: "सप्ताह"
  },
  mr: {
    totalOrders: "एकूण ऑर्डर",
    pendingOrders: "प्रलंबित ऑर्डर",
    completedOrders: "पूर्ण ऑर्डर",
    cancelledOrders: "रद्द ऑर्डर",
    lastMonthStats: "मागील 6 महिन्यांचे आकडे",
    ordersInCurrentMonth: "चालू महिन्यातील ऑर्डर",
    all: "सर्व",
    pending: "प्रलंबित",
    completed: "पूर्ण",
    cancelled: "रद्द",
    noOrders: "कोणतेही ऑर्डर सापडले नाही",
    loadingOrders: "ऑर्डर लोड होत आहेत...",
    orderNumber: "ऑर्डर #",
    customer: "ग्राहक",
    date: "दिनांक",
    amount: "रक्कम",
    week: "आठवडा"
  },
  gu: {
    totalOrders: "કુલ ઓર્ડર",
    pendingOrders: "બાકી ઓર્ડર",
    completedOrders: "પૂર્ણ ઓર્ડર",
    cancelledOrders: "રદ્દ ઓર્ડર",
    lastMonthStats: "છેલ્લા 6 મહિનાનાં આંકડા",
    ordersInCurrentMonth: "વર્તમાન મહિનાના ઓર્ડર",
    all: "બધા",
    pending: "બાકી",
    completed: "પૂર્ણ",
    cancelled: "રદ્દ",
    noOrders: "કોઈ ઓર્ડર મળ્યો નથી",
    loadingOrders: "ઓર્ડર લોડ થઈ રહ્યા છે...",
    orderNumber: "ઓર્ડર #",
    customer: "ગ્રાહક",
    date: "તારીખ",
    amount: "રકમ",
    week: "અઠવાડિયું"
  }
};

const OrdersTab = () => {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all');
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    monthlyData: [],
    currentMonthWeeklyData: [0, 0, 0, 0],
    lastMonthWeeklyData: [0, 0, 0, 0]
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

      if (statsResponse.success && statsResponse.stats) {
        const { stats } = statsResponse;
        setOrderStats({
          totalOrders: stats.totalOrders || 0,
          pendingOrders: stats.pendingOrders || 0,
          completedOrders: stats.completedOrders || 0,
          cancelledOrders: stats.cancelledOrders || 0,
          monthlyData: stats.monthlyData || [],
          currentMonthWeeklyData: stats.currentMonthWeeklyData || [0, 0, 0, 0],
          lastMonthWeeklyData: stats.lastMonthWeeklyData || [0, 0, 0, 0]
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', 'Failed to load orders');
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

  const getCurrentMonthData = () => {
    if (!orderStats || !orderStats.currentMonthWeeklyData) {
      return {
        labels: [
          `${t.week} 1`, 
          `${t.week} 2`, 
          `${t.week} 3`, 
          `${t.week} 4`
        ],
        datasets: [{
          data: [0, 0, 0, 0],
          color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
          strokeWidth: 2
        }]
      };
    }

    return {
      labels: [
        `${t.week} 1`, 
        `${t.week} 2`, 
        `${t.week} 3`, 
        `${t.week} 4`
      ],
      datasets: [{
        data: orderStats.currentMonthWeeklyData,
        color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
        strokeWidth: 2
      }]
    };
  };

  const getLastMonthData = () => {
    if (!orderStats || !orderStats.lastMonthWeeklyData) {
      return {
        labels: [
          `${t.week} 1`, 
          `${t.week} 2`, 
          `${t.week} 3`, 
          `${t.week} 4`
        ],
        datasets: [{
          data: [0, 0, 0, 0],
          color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
          strokeWidth: 2
        }]
      };
    }

    return {
      labels: [
        `${t.week} 1`, 
        `${t.week} 2`, 
        `${t.week} 3`, 
        `${t.week} 4`
      ],
      datasets: [{
        data: orderStats.lastMonthWeeklyData,
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
        strokeWidth: 2
      }]
    };
  };

  const getLast6MonthsData = () => {
    if (!orderStats || !orderStats.monthlyData) {
      return {
        labels: [],
        datasets: [{
          data: [],
          color: (opacity = 1) => `rgba(255, 152, 0, ${opacity})`,
          strokeWidth: 2
        }]
      };
    }

    const monthlyData = orderStats.monthlyData;
    return {
      labels: monthlyData.map(item => item?.month?.substring(0, 3) || ''),
      datasets: [{
        data: monthlyData.map(item => item?.totalOrders || 0),
        color: (opacity = 1) => `rgba(255, 152, 0, ${opacity})`,
        strokeWidth: 2
      }]
    };
  };

  const getChartConfig = () => {
    return {
      backgroundColor: '#ffffff',
      backgroundGradientFrom: '#ffffff',
      backgroundGradientTo: '#ffffff',
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      style: {
        borderRadius: 16,
        paddingLeft: 0,
        paddingRight: 15,
        marginLeft: 0
      },
      propsForDots: {
        r: '6',
        strokeWidth: '2',
        stroke: '#ffffff'
      },
      propsForLabels: {
        fontSize: 12,
        fontWeight: '600'
      },
      propsForVerticalLabels: {
        fontSize: 12,
        fontWeight: '600',
        paddingRight: 5
      },
      propsForHorizontalLabels: {
        fontSize: 12,
        fontWeight: '600'
      },
      fillShadowGradient: 'rgba(108, 99, 255, 0.2)',
      fillShadowGradientOpacity: 0.5,
      useShadowColorFromDataset: false,
      formatYLabel: (value) => Math.round(value).toString(),
      yAxisInterval: 2,
      yAxisSuffix: '',
      yAxisLabel: '',
      horizontalLabelRotation: 0,
      verticalLabelRotation: 0
    };
  };

  const renderChart = (data, height = 180) => {
    return (
      <LineChart
        data={data}
        width={width - 32}
        height={height}
        chartConfig={getChartConfig()}
        bezier
        style={[styles.chart]}
        withVerticalLabels={true}
        withHorizontalLabels={true}
        withDots={true}
        withShadow={false}
        withScrollableDot={false}
        yAxisInterval={2}
        segments={4}
        fromZero={true}
        withInnerLines={true}
        yAxisLabel=""
        yAxisSuffix=""
        horizontalLabelRotation={0}
        verticalLabelRotation={0}
      />
    );
  };

  const renderOrderCard = (order) => (
    <TouchableOpacity
      key={order._id}
      style={styles.orderCard}
      onPress={() => router.push(`/(seller)/order-details/${order._id}`)}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>{t.orderNumber}{order.orderId}</Text>
        <Text style={[styles.orderStatus, { color: getStatusColor(order.status) }]}>
          {order.status === 'pending' ? t.pending :
           order.status === 'completed' || order.status === 'delivered' ? t.completed :
           order.status === 'cancelled' ? t.cancelled : order.status}
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
          <Text style={styles.statLabel}>{t.totalOrders}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
          <Text style={styles.statValue}>{orderStats.pendingOrders}</Text>
          <Text style={styles.statLabel}>{t.pendingOrders}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
          <Text style={styles.statValue}>{orderStats.completedOrders}</Text>
          <Text style={styles.statLabel}>{t.completedOrders}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FFEBEE' }]}>
          <Text style={styles.statValue}>{orderStats.cancelledOrders}</Text>
          <Text style={styles.statLabel}>{t.cancelledOrders}</Text>
        </View>
      </View>

      {/* Charts Section */}
      <View style={styles.chartsSection}>
        <View style={styles.chartHeader}>
          <Text style={styles.sectionTitle}>{t.lastMonthStats}</Text>
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
            <Text style={styles.chartTitle}>{t.ordersInCurrentMonth}</Text>
            {renderChart(getCurrentMonthData())}
          </View>

          {/* Last Month Chart */}
          <View style={[styles.chartContainer, { width: width - 32 }]}>
            <Text style={styles.chartTitle}>Orders in Last Month</Text>
            {renderChart(getLastMonthData())}
          </View>

          {/* Last 6 Months Chart */}
          <View style={[styles.chartContainer, { width: width - 32 }]}>
            <Text style={styles.chartTitle}>Orders in Last 6 Months</Text>
            {renderChart(getLast6MonthsData())}
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
            {t.all}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'pending' && styles.activeTab]}
          onPress={() => setSelectedTab('pending')}
        >
          <Text style={[styles.tabText, selectedTab === 'pending' && styles.activeTabText]}>
            {t.pending}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'completed' && styles.activeTab]}
          onPress={() => setSelectedTab('completed')}
        >
          <Text style={[styles.tabText, selectedTab === 'completed' && styles.activeTabText]}>
            {t.completed}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'cancelled' && styles.activeTab]}
          onPress={() => setSelectedTab('cancelled')}
        >
          <Text style={[styles.tabText, selectedTab === 'cancelled' && styles.activeTabText]}>
            {t.cancelled}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loadingText}>{t.loadingOrders}</Text>
        </View>
      ) : (
        <View style={styles.ordersList}>
          {getFilteredOrders().length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={64} color="#CCC" />
              <Text style={styles.emptyStateText}>{t.noOrders}</Text>
              <Text style={styles.emptyStateSubtext}>Orders will appear here when customers place them</Text>
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
    paddingRight: 10,
    marginLeft: -25
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
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
});

export default OrdersTab; 