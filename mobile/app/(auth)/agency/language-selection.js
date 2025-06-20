import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../../src/context/LanguageContext';

const LanguageSelection = () => {
  const router = useRouter();
  const { updateLanguage } = useLanguage();

  const handleLanguageSelect = async (language) => {
    try {
      await updateLanguage(language);
      router.push('/(auth)/agency/login');
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.topSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="language-outline" size={28} color="#6C63FF" />
          </View>

          <Text style={styles.title}>Choose Your Language</Text>
          <Text style={styles.subtitle}>अपनी भाषा चुनें</Text>

          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Welcome to Agency Portal</Text>
            <Text style={styles.welcomeTextHindi}>एजेंसी पोर्टल में आपका स्वागत है</Text>
          </View>
        </View>

        <View style={styles.languageSection}>
          <TouchableOpacity 
            style={styles.languageButton}
            onPress={() => handleLanguageSelect('en')}
          >
            <View style={styles.languageInfo}>
              <Text style={styles.languageName}>English</Text>
              <Text style={styles.languageLocal}>Continue in English</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6C63FF" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.languageButton}
            onPress={() => handleLanguageSelect('hi')}
          >
            <View style={styles.languageInfo}>
              <Text style={styles.languageName}>हिंदी</Text>
              <Text style={styles.languageLocal}>हिंदी में जारी रखें</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6C63FF" />
          </TouchableOpacity>
        </View>
      </View>
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
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  topSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  welcomeTextHindi: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
  },
  languageSection: {
    gap: 12,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  languageLocal: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
});

export default LanguageSelection; 