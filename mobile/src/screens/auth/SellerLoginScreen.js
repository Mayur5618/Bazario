import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import axios from '../../config/axios';
import { useAuth } from '../../context/AuthContext';

// Translations for all UI text
const translations = {
  en: {
    title: 'Seller Login',
    subtitle: 'Welcome back! Login to manage your shop',
    mobileNumber: 'Mobile Number',
    password: 'Password',
    login: 'Login',
    forgotPassword: 'Forgot Password?',
    noAccount: "Don't have a seller account?",
    register: 'Register Now',
    mobileError: 'Please enter a valid 10-digit mobile number',
    passwordError: 'Password must be at least 8 characters',
  },
  hi: {
    title: 'विक्रेता लॉगिन',
    subtitle: 'वापसी पर स्वागत है! अपनी दुकान प्रबंधित करने के लिए लॉगिन करें',
    mobileNumber: 'मोबाइल नंबर',
    password: 'पासवर्ड',
    login: 'लॉगिन करें',
    forgotPassword: 'पासवर्ड भूल गए?',
    noAccount: 'विक्रेता खाता नहीं है?',
    register: 'अभी रजिस्टर करें',
    mobileError: 'कृपया 10 अंकों का सही मोबाइल नंबर दर्ज करें',
    passwordError: 'पासवर्ड कम से कम 8 अक्षर का होना चाहिए',
  },
  mr: {
    title: 'विक्रेता लॉगिन',
    subtitle: 'पुन्हा स्वागत आहे! तुमचे दुकान व्यवस्थापित करण्यासाठी लॉगिन करा',
    mobileNumber: 'मोबाईल नंबर',
    password: 'पासवर्ड',
    login: 'लॉगिन करा',
    forgotPassword: 'पासवर्ड विसरलात?',
    noAccount: 'विक्रेता खाते नाही?',
    register: 'आता नोंदणी करा',
    mobileError: 'कृपया 10 अंकी वैध मोबाईल नंबर टाका',
    passwordError: 'पासवर्ड किमान 8 अक्षरे असावा',
  },
  gu: {
    title: 'વિક્રેતા લૉગિન',
    subtitle: 'પાછા આવ્યા! તમારી દુકાન મેનેજ કરવા માટે લૉગિન કરો',
    mobileNumber: 'મોબાઇલ નંબર',
    password: 'પાસવર્ડ',
    login: 'લૉગિન કરો',
    forgotPassword: 'પાસવર્ડ ભૂલી ગયા?',
    noAccount: 'વિક્રેતા એકાઉન્ટ નથી?',
    register: 'અત્યારે રજિસ્ટર કરો',
    mobileError: 'કૃપા કરી 10 અંકનો માન્ય મોબાઇલ નંબર દાખલ કરો',
    passwordError: 'પાસવર્ડ ઓછામાં ઓછા 8 અક્ષરનો હોવો જોઈએ',
  }
};

const SellerLoginScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { language, setLanguage } = useLanguage();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    mobileno: '',
    password: '',
    userType: 'seller',
    platformType: ['b2c']
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If language parameter is passed, update the language context
    if (params.language && params.language !== language) {
      setLanguage(params.language);
    }
  }, [params.language]);

  // Get translations for current language
  const t = translations[language] || translations.en;

  const validateForm = () => {
    const newErrors = {};
    if (!/^[0-9]{10}$/.test(formData.mobileno)) {
      newErrors.mobileno = t.mobileError;
    }
    if (formData.password.length < 8) {
      newErrors.password = t.passwordError;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await axios.post('/api/users/signin', {
        mobileno: formData.mobileno,
        password: formData.password,
        userType: 'seller',
        platformType: ['b2c']
      });

      if (response?.data?.success) {
        const userData = response.data.data;
        // Check if the user is a seller
        if (userData.userType !== 'seller') {
          Alert.alert('Error', 'This account is not a seller account');
          return;
        }
        await login(userData, userData.token);
        router.replace('/(seller)/dashboard');
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
            <Ionicons name="storefront" size={40} color="#6C63FF" />
          </View>
          <Text style={styles.title}>{t.title}</Text>
          <Text style={styles.subtitle}>{t.subtitle}</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <View style={styles.inputBox}>
              <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t.mobileNumber}
                keyboardType="phone-pad"
                value={formData.mobileno}
                onChangeText={(text) => {
                  const numericValue = text.replace(/[^0-9]/g, '');
                  if (numericValue.length <= 10) {
                    setFormData(prev => ({ ...prev, mobileno: numericValue }));
                  }
                }}
                maxLength={10}
              />
            </View>
            {errors.mobileno && (
              <Text style={styles.errorText}>{errors.mobileno}</Text>
            )}

            <View style={styles.inputBox}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t.password}
                secureTextEntry={!showPassword}
                value={formData.password}
                onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
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

          <TouchableOpacity 
            style={styles.registerButton}
            onPress={() => router.push('/(auth)/seller/register')}
          >
            <Text style={styles.registerText}>
              {t.noAccount} <Text style={styles.registerLink}>{t.register}</Text>
            </Text>
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
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    gap: 16,
    marginBottom: 16,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
  },
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    color: '#FF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#6C63FF',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#6C63FF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    alignItems: 'center',
    padding: 16,
  },
  registerText: {
    fontSize: 14,
    color: '#666',
  },
  registerLink: {
    color: '#6C63FF',
    fontWeight: '600',
  },
});

export default SellerLoginScreen; 