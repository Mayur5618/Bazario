import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const B2BDashboard = () => {
  const router = useRouter();

  const BulkOrderCard = ({ title, value, icon, color }) => (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardValue}>{value}</Text>
      </View>
      <View style={[styles.cardIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.statsContainer}>
        <BulkOrderCard
          title="Total Bulk Orders"
          value="0"
          icon="cube-outline"
          color="#FFB800"
        />
        <BulkOrderCard
          title="Active Business Clients"
          value="0"
          icon="people-outline"
          color="#0052CC"
        />
        <BulkOrderCard
          title="Pending Bulk Orders"
          value="0"
          icon="time-outline"
          color="#FF8B00"
        />
        <BulkOrderCard
          title="B2B Revenue"
          value="₹0"
          icon="cash-outline"
          color="#0747A6"
        />
      </View>

      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(seller)/add-bulk-product')}>
            <View style={[styles.actionIcon, { backgroundColor: '#FFB80015' }]}>
              <Ionicons name="add-circle-outline" size={24} color="#FFB800" />
            </View>
            <Text style={styles.actionText}>Add Bulk Product</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(seller)/business-clients')}>
            <View style={[styles.actionIcon, { backgroundColor: '#0052CC15' }]}>
              <Ionicons name="people-outline" size={24} color="#0052CC" />
            </View>
            <Text style={styles.actionText}>View Business Clients</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(seller)/bulk-orders')}>
            <View style={[styles.actionIcon, { backgroundColor: '#FF8B0015' }]}>
              <Ionicons name="cart-outline" size={24} color="#FF8B00" />
            </View>
            <Text style={styles.actionText}>Manage Bulk Orders</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(seller)/b2b-analytics')}>
            <View style={[styles.actionIcon, { backgroundColor: '#0747A615' }]}>
              <Ionicons name="bar-chart-outline" size={24} color="#0747A6" />
            </View>
            <Text style={styles.actionText}>B2B Analytics</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.emptyState, { backgroundColor: '#FFFDF7' }]}>
        <Ionicons name="business" size={64} color="#FFB800" />
        <Text style={[styles.emptyTitle, { color: '#0052CC' }]}>Welcome to B2B Mode!</Text>
        <Text style={styles.emptyText}>Start adding bulk products and connect with business clients</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFD',
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
    color: '#505F79',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#172B4D',
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  actionsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#172B4D',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    color: '#172B4D',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#505F79',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default B2BDashboard; 