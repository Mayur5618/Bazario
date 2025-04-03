import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../src/context/AuthContext';
import { useLanguage } from '../../../src/context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';

const translations = {
  en: {
    profile: 'Profile',
    editProfile: 'Edit Profile',
    personalInfo: 'Personal Information',
    agencyName: 'Agency Name',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    city: 'City',
    state: 'State',
    settings: {
      title: 'Settings',
      notifications: 'Notifications',
      language: 'Language',
      darkMode: 'Dark Mode',
      help: 'Help & Support',
      about: 'About Us',
      logout: 'Logout',
    },
  },
  hi: {
    profile: 'प्रोफ़ाइल',
    editProfile: 'प्रोफ़ाइल संपादित करें',
    personalInfo: 'व्यक्तिगत जानकारी',
    agencyName: 'एजेंसी का नाम',
    email: 'ईमेल',
    phone: 'फ़ोन',
    address: 'पता',
    city: 'शहर',
    state: 'राज्य',
    settings: {
      title: 'सेटिंग्स',
      notifications: 'सूचनाएं',
      language: 'भाषा',
      darkMode: 'डार्क मोड',
      help: 'सहायता और समर्थन',
      about: 'हमारे बारे में',
      logout: 'लॉगआउट',
    },
  },
};

const ProfileItem = ({ icon, label, value }) => (
  <View style={styles.profileItem}>
    <View style={styles.profileItemIcon}>
      <Ionicons name={icon} size={20} color="#6C63FF" />
    </View>
    <View style={styles.profileItemContent}>
      <Text style={styles.profileItemLabel}>{label}</Text>
      <Text style={styles.profileItemValue}>{value}</Text>
    </View>
  </View>
);

const SettingsItem = ({ icon, title, onPress }) => (
  <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
    <View style={styles.settingsItemLeft}>
      <Ionicons name={icon} size={24} color="#6C63FF" />
      <Text style={styles.settingsItemTitle}>{title}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#666" />
  </TouchableOpacity>
);

const Profile = () => {
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Profile Header */}
        <View style={styles.header}>
          <Image
            source={{ uri: user?.profileImage || 'https://via.placeholder.com/150' }}
            style={styles.profileImage}
          />
          <Text style={styles.agencyName}>{user?.agencyName}</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push('/(agency)/edit-profile')}
          >
            <Text style={styles.editButtonText}>{t.editProfile}</Text>
          </TouchableOpacity>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.personalInfo}</Text>
          <View style={styles.card}>
            <ProfileItem
              icon="business"
              label={t.agencyName}
              value={user?.agencyName}
            />
            <ProfileItem
              icon="mail"
              label={t.email}
              value={user?.email}
            />
            <ProfileItem
              icon="call"
              label={t.phone}
              value={user?.phone}
            />
            <ProfileItem
              icon="location"
              label={t.address}
              value={user?.address}
            />
            <ProfileItem
              icon="business"
              label={t.city}
              value={user?.city}
            />
            <ProfileItem
              icon="map"
              label={t.state}
              value={user?.state}
            />
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.settings.title}</Text>
          <View style={styles.card}>
            <SettingsItem
              icon="notifications"
              title={t.settings.notifications}
              onPress={() => router.push('/(agency)/notifications-settings')}
            />
            <SettingsItem
              icon="language"
              title={t.settings.language}
              onPress={() => router.push('/(agency)/language-settings')}
            />
            <SettingsItem
              icon="moon"
              title={t.settings.darkMode}
              onPress={() => router.push('/(agency)/theme-settings')}
            />
            <SettingsItem
              icon="help-circle"
              title={t.settings.help}
              onPress={() => router.push('/(agency)/help')}
            />
            <SettingsItem
              icon="information-circle"
              title={t.settings.about}
              onPress={() => router.push('/(agency)/about')}
            />
            <SettingsItem
              icon="log-out"
              title={t.settings.logout}
              onPress={handleLogout}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  agencyName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#6C63FF',
    borderRadius: 20,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  profileItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileItemContent: {
    flex: 1,
  },
  profileItemLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  profileItemValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsItemTitle: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
});

export default Profile; 