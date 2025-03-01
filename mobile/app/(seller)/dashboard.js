import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';

const SellerDashboard = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    revenue: 0
  });

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)/seller/login');
    } catch (error) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // TODO: Fetch updated data here
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const DashboardCard = ({ title, value, icon, color }) => (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardValue}>{value}</Text>
      </View>
      <View style={[styles.cardIcon, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
    </View>
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

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.nameText}>{user?.firstname} {user?.lastname}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#FF4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <DashboardCard 
          title="Total Products"
          value={stats.totalProducts}
          icon="cube-outline"
          color="#6C63FF"
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
        />
        <DashboardCard 
          title="Revenue"
          value={`₹${stats.revenue}`}
          icon="cash-outline"
          color="#2196F3"
        />
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsContainer}>
        <QuickAction 
          title="Add Product"
          icon="add-circle-outline"
          color="#6C63FF"
          onPress={() => router.push('/(seller)/add-product')}
        />
        <QuickAction 
          title="View Orders"
          icon="list-outline"
          color="#00C853"
          onPress={() => {/* TODO: Navigate to orders */}}
        />
        <QuickAction 
          title="Profile"
          icon="person-outline"
          color="#2196F3"
          onPress={() => {/* TODO: Navigate to profile */}}
        />
        <QuickAction 
          title="Settings"
          icon="settings-outline"
          color="#FF9800"
          onPress={() => {/* TODO: Navigate to settings */}}
        />
      </View>
    </ScrollView>
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
  welcomeText: {
    fontSize: 16,
    color: '#666',
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  logoutButton: {
    padding: 8,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    padding: 20,
    paddingBottom: 12,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
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
});

export default SellerDashboard; 