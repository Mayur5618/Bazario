import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useLanguage } from '../../src/context/LanguageContext';

const translations = {
  en: {
    welcome: 'Welcome',
    dashboard: 'Agency Dashboard',
    stats: {
      title: 'Overview',
      totalBookings: 'Total Bookings',
      activeBookings: 'Active Bookings',
      completedBookings: 'Completed',
      revenue: 'Total Revenue',
    },
    menu: {
      profile: 'Profile',
      bookings: 'Bookings',
      services: 'Services',
      payments: 'Payments',
      settings: 'Settings',
      logout: 'Logout',
    },
  },
  hi: {
    welcome: 'स्वागत है',
    dashboard: 'एजेंसी डैशबोर्ड',
    stats: {
      title: 'अवलोकन',
      totalBookings: 'कुल बुकिंग',
      activeBookings: 'सक्रिय बुकिंग',
      completedBookings: 'पूर्ण बुकिंग',
      revenue: 'कुल राजस्व',
    },
    menu: {
      profile: 'प्रोफ़ाइल',
      bookings: 'बुकिंग',
      services: 'सेवाएं',
      payments: 'भुगतान',
      settings: 'सेटिंग्स',
      logout: 'लॉगआउट',
    },
  },
};

const AgencyDashboard = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)/agency/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    { icon: 'person', title: t.menu.profile, onPress: () => router.push('/(agency)/profile') },
    { icon: 'calendar', title: t.menu.bookings, onPress: () => router.push('/(agency)/bookings') },
    { icon: 'list', title: t.menu.services, onPress: () => router.push('/(agency)/services') },
    { icon: 'card', title: t.menu.payments, onPress: () => router.push('/(agency)/payments') },
    { icon: 'settings', title: t.menu.settings, onPress: () => router.push('/(agency)/settings') },
    { icon: 'log-out', title: t.menu.logout, onPress: handleLogout },
  ];

  return (
    <SafeAreaView style={styles.container}>
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
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>{t.stats.totalBookings}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>{t.stats.activeBookings}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>{t.stats.completedBookings}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>₹0</Text>
              <Text style={styles.statLabel}>{t.stats.revenue}</Text>
            </View>
          </View>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <Ionicons name={item.icon} size={24} color="#6C63FF" />
              <Text style={styles.menuText}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '600',
    color: '#6C63FF',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  menuContainer: {
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 16,
  },
});

export default AgencyDashboard; 