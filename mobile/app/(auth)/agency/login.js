import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../../src/context/LanguageContext';
import axios from '../../../src/config/axios';
import { useAuth } from '../../../src/context/AuthContext';
import { Alert } from 'react-native';

// Translations for all UI text
const translations = {
  en: {
    title: 'Agency Login',
    subtitle: 'Welcome back! Login to manage your agency',
    mobileNumber: 'Mobile Number',
    password: 'Password',
    login: 'Login',
    forgotPassword: 'Forgot Password?',
    noAccount: "Don't have an agency account?",
    register: 'Register Now',
  },
  hi: {
    title: 'एजेंसी लॉगिन',
    subtitle: 'वापसी पर स्वागत है! अपनी एजेंसी प्रबंधित करने के लिए लॉगिन करें',
    mobileNumber: 'मोबाइल नंबर',
    password: 'पासवर्ड',
    login: 'लॉगिन करें',
    forgotPassword: 'पासवर्ड भूल गए?',
    noAccount: 'एजेंसी खाता नहीं है?',
    register: 'अभी रजिस्टर करें',
  }
};

const AgencyLogin = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { language, setLanguage } = useLanguage();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    mobileno: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If language parameter is passed, update the language context
    if (params.language && params.language !== language) {
      setLanguage(params.language);
    }
  }, [params.language]);

  // Get translations for current language
  const t = translations[language] || translations.en;

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      
      // Validate input
      if (!formData.mobileno || !formData.password) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }

      const response = await axios.post('/api/agency/login', {
        mobileno: formData.mobileno,
        password: formData.password
      });

      if (response?.data?.success) {
        const userData = response.data.data;
        // Check if the user is an agency
        if (userData.userType !== 'agency') {
          Alert.alert('Error', 'This account is not an agency account');
          return;
        }
        await login(userData, userData.token);
        router.replace('/(agency)/dashboard');
      } else {
        Alert.alert('Error', response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.push('/(auth)/agency')}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="business" size={40} color="#6C63FF" />
        </View>
        
        <Text style={styles.title}>{t.title}</Text>
        <Text style={styles.subtitle}>{t.subtitle}</Text>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Ionicons name="call" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder={t.mobileNumber}
              value={formData.mobileno}
              onChangeText={(text) => setFormData({ ...formData, mobileno: text })}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder={t.password}
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>{t.forgotPassword}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.loginButtonText}>{t.login}</Text>
          )}
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>{t.noAccount} </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/agency/registration')}>
            <Text style={styles.registerLink}>{t.register}</Text>
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
  backButton: {
    padding: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#F0F0FF',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    gap: 16,
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#6C63FF',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: '#666',
    fontSize: 14,
  },
  registerLink: {
    color: '#6C63FF',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
});

export default AgencyLogin; 