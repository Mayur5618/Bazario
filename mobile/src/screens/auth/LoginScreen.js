// Use the LoginScreen code we created earlier
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions, Alert, ActivityIndicator, ScrollView, BackHandler } from 'react-native';
import axios from '../../config/axios';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const LoginScreen = () => {
  const router = useRouter();
  const { reset } = useLocalSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    mobileno: '',
    password: '',
    userType: 'buyer'
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { login } = useAuth();

  // Handle back button press when reset is true
  useEffect(() => {
    if (reset === 'true') {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => backHandler.remove();
    }
  }, [reset]);

  // Validation function
  const validateField = (name, value) => {
    switch (name) {
      case 'mobileno':
        return value.trim() === ''
          ? 'Mobile number is required'
          : !/^[0-9]{10}$/.test(value)
          ? 'Must be 10 digits'
          : '';
      case 'password':
        return value.trim() === ''
          ? 'Password is required'
          : value.length < 8
          ? 'Password must be at least 8 characters'
          : '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    setIsSubmitted(true);
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setServerError('');

    try {
      const response = await axios.post('/api/users/signin', {
        mobileno: formData.mobileno,
        password: formData.password,
        userType: formData.userType
      });

      // Handle successful response
      if (response?.data?.success) {
        const userData = response.data.data;
        const token = userData._id;
        await login(userData, token);
        router.replace('/(app)/home');
      } else {
        // Handle unsuccessful login but valid response
        setServerError(response.data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      setServerError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (text) => {
    // Only allow numbers and limit to 10 digits
    const numericValue = text.replace(/[^0-9]/g, '');
    if (numericValue.length <= 10) {
      setFormData(prev => ({ ...prev, mobileno: numericValue }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <View style={styles.logoBox}>
              <Ionicons name="shield-checkmark" size={40} color="#6C63FF" />
            </View>
            <Text style={styles.headerTitle}>Welcome to Bazario</Text> 
            <Text style={styles.headerSubtitle}>Your trusted service partner</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <View style={styles.inputBox}>
                <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Mobile Number"
                  keyboardType="phone-pad"
                  placeholderTextColor="#666"
                  autoCapitalize="none"
                  value={formData.mobileno}
                  onChangeText={handlePhoneChange}
                  maxLength={10}
                />
              </View>
              {isSubmitted && errors.mobileno && (
                <Text style={styles.errorText}>{errors.mobileno}</Text>
              )}

              <View style={styles.inputBox}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#666"
                  autoCapitalize="none"
                  value={formData.password}
                  onChangeText={(text) => {
                    setFormData(prev => ({ ...prev, password: text }));
                    setErrors(prev => ({ ...prev, password: validateField('password', text) }));
                  }}
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
              {isSubmitted && errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            {serverError ? (
              <Text style={styles.serverError}>{serverError}</Text>
            ) : null}

            <TouchableOpacity 
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Business Accounts</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.businessButtonsContainer}>
              <TouchableOpacity 
                style={styles.businessButton} 
                onPress={() => router.push('/(auth)/language-selection')}
              >
                <View style={styles.businessIconContainer}>
                  <Ionicons name="storefront-outline" size={24} color="#6C63FF" />
                </View>
                <View style={styles.businessTextContainer}>
                  <Text style={styles.businessButtonTitle}>Seller Account</Text>
                  <Text style={styles.businessButtonSubtext}>For individual sellers and shops</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#6C63FF" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.businessButton}
                onPress={() => router.push('/(auth)/agency/language-selection')}
              >
                <View style={styles.businessIconContainer}>
                  <Ionicons name="business-outline" size={24} color="#6C63FF" />
                </View>
                <View style={styles.businessTextContainer}>
                  <Text style={styles.businessButtonTitle}>Agency Account</Text>
                  <Text style={styles.businessButtonSubtext}>For agencies and organizations</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#6C63FF" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.registerButton} 
              onPress={() => router.push('/(auth)/register')}
            >
              <Text style={styles.registerText}>
                Don't have an account? <Text style={styles.registerLink}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logoBox: {
    width: 80,
    height: 80,
    backgroundColor: '#F0EEFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
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
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8E8E8',
  },
  dividerText: {
    paddingHorizontal: 16,
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  businessButtonsContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 24,
  },
  businessButton: {
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
  businessIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F0EEFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  businessTextContainer: {
    flex: 1,
  },
  businessButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  businessButtonSubtext: {
    fontSize: 13,
    color: '#666',
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
  errorText: {
    color: '#FF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  serverError: {
    color: '#FF4444',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
});

export default LoginScreen;