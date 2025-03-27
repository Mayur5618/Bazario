import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';

const languages = [
  {
    id: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧'
  },
  {
    id: 'hi',
    name: 'हिंदी',
    nativeName: 'Hindi',
    flag: '🇮🇳'
  },
  {
    id: 'mr',
    name: 'मराठी',
    nativeName: 'Marathi',
    flag: '🇮🇳'
  },
  {
    id: 'gu',
    name: 'ગુજરાતી',
    nativeName: 'Gujarati',
    flag: '🇮🇳'
  }
];

const LanguageSelectionScreen = () => {
  const router = useRouter();
  const { updateLanguage } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState(null);

  const handleLanguageSelect = async (language) => {
    try {
      setSelectedLanguage(language.id);
      await updateLanguage(language.id);
      router.replace('/(auth)/seller/login');
    } catch (error) {
      console.error('Error updating language:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="language" size={40} color="#6C63FF" />
          </View>
          <Text style={styles.title}>Choose Your Language</Text>
          <Text style={styles.subtitle}>
            अपनी भाषा चुनें / तुमची भाषा निवडा / તમારી ભાષા પસંદ કરો
          </Text>
        </View>

        <View style={styles.languageContainer}>
          {languages.map((language) => (
            <TouchableOpacity
              key={language.id}
              style={[
                styles.languageButton,
                selectedLanguage === language.id && styles.selectedLanguage
              ]}
              onPress={() => handleLanguageSelect(language)}
            >
              <Text style={styles.languageFlag}>{language.flag}</Text>
              <View style={styles.languageTextContainer}>
                <Text style={styles.languageName}>{language.name}</Text>
                <Text style={styles.languageNativeName}>{language.nativeName}</Text>
              </View>
              {selectedLanguage === language.id && (
                <Ionicons name="checkmark-circle" size={24} color="#6C63FF" />
              )}
            </TouchableOpacity>
          ))}
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#F0EEFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  languageContainer: {
    gap: 16,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedLanguage: {
    borderColor: '#6C63FF',
    backgroundColor: '#F8F9FF',
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 16,
  },
  languageTextContainer: {
    flex: 1,
  },
  languageName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  languageNativeName: {
    fontSize: 14,
    color: '#666',
  },
});

export default LanguageSelectionScreen; 