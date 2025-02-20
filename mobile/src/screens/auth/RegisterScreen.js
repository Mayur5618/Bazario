import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import axios from '../../config/axios';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

const RegisterScreen = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    mobileno: "",
    password: "",
    confirmPassword: "",
    detailAddress: "",
    address: "",
    country: "",
    state: "",
    city: "",
    pincode: "",
    userType: "buyer",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);

  // Validation function
  const validateField = (name, value) => {
    switch (name) {
      case 'firstname':
        return !value.trim() ? 'First name is required' : '';
      case 'lastname':
        return !value.trim() ? 'Last name is required' : '';
      case 'mobileno':
        return !value.trim() 
          ? 'Mobile number is required' 
          : !/^[0-9]{10}$/.test(value) 
          ? 'Mobile number must be 10 digits' 
          : '';
      case 'password':
        return !value 
          ? 'Password is required' 
          : value.length < 8 
          ? 'Password must be at least 8 characters' 
          : '';
      case 'confirmPassword':
        return !value 
          ? 'Please confirm password' 
          : value !== formData.password 
          ? 'Passwords do not match' 
          : '';
      case 'detailAddress':
        return !value.trim() ? 'Detailed address is required' : '';
      case 'address':
        return !value.trim() ? 'Address is required' : '';
      case 'country':
        return !value.trim() ? 'Country is required' : '';
      case 'state':
        return !value.trim() ? 'State is required' : '';
      case 'city':
        return !value.trim() ? 'City is required' : '';
      case 'pincode':
        return !value.trim() 
          ? 'Pincode is required' 
          : !/^[0-9]{6}$/.test(value) 
          ? 'Invalid pincode' 
          : '';
      default:
        return '';
    }
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateStep = (currentStep) => {
    const fieldsToValidate = currentStep === 1 
      ? ['firstname', 'lastname', 'mobileno', 'password', 'confirmPassword']
      : ['detailAddress', 'address', 'country', 'state', 'city', 'pincode'];

    const newErrors = {};
    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        Alert.alert(
          "Location Access",
          "Would you like to use your current location to fill address details?",
          [
            {
              text: "No",
              style: "cancel"
            },
            {
              text: "Yes",
              onPress: () => getCurrentLocation()
            }
          ]
        );
      } else {
        Alert.alert(
          "Permission Denied",
          "Please enter your address manually."
        );
      }
    } catch (error) {
      console.log('Error requesting location permission:', error);
    }
  };

  const getCurrentLocation = async () => {
    setIsLocationLoading(true);
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });

      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address) {
        // Format the detailed address
        const detailedAddress = [
          address.name,
          address.streetNumber,
          address.street,
          address.district,
          address.subregion,
          address.region,
          address.postalCode,
          address.country
        ].filter(Boolean).join(', ');

        // Format the street address
        const streetAddress = [
          address.streetNumber,
          address.street,
          address.district,
        ].filter(Boolean).join(', ');

        setFormData(prev => ({
          ...prev,
          detailAddress: detailedAddress || '',
          address: streetAddress || '',
          country: address.country || '',
          state: address.region || '',
          city: address.city || '',
          pincode: address.postalCode || ''
        }));
      }
    } catch (error) {
      console.log('Error getting location:', error);
      Alert.alert(
        "Location Error",
        "Could not get your location. Please enter address manually."
      );
    } finally {
      setIsLocationLoading(false);
    }
  };

  const handleNextStep = async () => {
    if (validateStep(1)) {
      try {
        const response = await axios.post('/api/users/check-mobile', {
          mobileno: formData.mobileno
        });
        
        if (response.data.exists) {
          setErrors(prev => ({
            ...prev,
            mobileno: "Mobile number already registered"
          }));
          return;
        }
        
        setStep(2);
        // Request location permission when moving to step 2
        requestLocationPermission();
      } catch (error) {
        setErrors(prev => ({
          ...prev,
          general: "Error checking mobile number"
        }));
      }
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) {
      return;
    }

    setIsLoading(true);
    try {
      const { confirmPassword, ...dataToSubmit } = formData;
      const response = await axios.post('/api/users/signup', dataToSubmit);
      
      if (response.data.success) {
        Alert.alert(
          "Success",
          "Account created successfully!",
          [
            {
              text: "Login Now",
              onPress: () => router.replace('/(auth)/login')
            }
          ]
        );
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        general: error.response?.data?.message || 'Registration failed'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const renderAddressFields = () => (
    <View style={styles.inputGroup}>
      <View style={styles.inputBox}>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Detailed Address (e.g., Flat No, Building Name, Street, Area)"
          value={formData.detailAddress}
          onChangeText={(text) => handleChange('detailAddress', text)}
          editable={!isLocationLoading}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
        {isLocationLoading && (
          <ActivityIndicator 
            style={styles.loadingIndicator} 
            size="small" 
            color="#6C63FF" 
          />
        )}
      </View>
      {errors.detailAddress && (
        <Text style={styles.errorText}>{errors.detailAddress}</Text>
      )}

      <TouchableOpacity 
        style={styles.locationButton}
        onPress={requestLocationPermission}
      >
        <Ionicons name="location" size={20} color="#6C63FF" />
        <Text style={styles.locationButtonText}>Use Current Location</Text>
      </TouchableOpacity>

      <View style={styles.inputBox}>
        <TextInput
          style={styles.input}
          placeholder="Landmark/Street"
          value={formData.address}
          onChangeText={(text) => handleChange('address', text)}
          editable={!isLocationLoading}
        />
        {isLocationLoading && (
          <ActivityIndicator 
            style={styles.loadingIndicator} 
            size="small" 
            color="#6C63FF" 
          />
        )}
      </View>
      {errors.address && (
        <Text style={styles.errorText}>{errors.address}</Text>
      )}

      <View style={styles.inputBox}>
        <TextInput
          style={styles.input}
          placeholder="Country"
          value={formData.country}
          onChangeText={(text) => handleChange('country', text)}
          editable={!isLocationLoading}
        />
        {isLocationLoading && (
          <ActivityIndicator 
            style={styles.loadingIndicator} 
            size="small" 
            color="#6C63FF" 
          />
        )}
      </View>
      {errors.country && (
        <Text style={styles.errorText}>{errors.country}</Text>
      )}

      <View style={styles.inputBox}>
        <TextInput
          style={styles.input}
          placeholder="State"
          value={formData.state}
          onChangeText={(text) => handleChange('state', text)}
          editable={!isLocationLoading}
        />
        {isLocationLoading && (
          <ActivityIndicator 
            style={styles.loadingIndicator} 
            size="small" 
            color="#6C63FF" 
          />
        )}
      </View>
      {errors.state && (
        <Text style={styles.errorText}>{errors.state}</Text>
      )}

      <View style={styles.inputBox}>
        <TextInput
          style={styles.input}
          placeholder="City"
          value={formData.city}
          onChangeText={(text) => handleChange('city', text)}
          editable={!isLocationLoading}
        />
        {isLocationLoading && (
          <ActivityIndicator 
            style={styles.loadingIndicator} 
            size="small" 
            color="#6C63FF" 
          />
        )}
      </View>
      {errors.city && (
        <Text style={styles.errorText}>{errors.city}</Text>
      )}

      <View style={styles.inputBox}>
        <TextInput
          style={styles.input}
          placeholder="Pincode"
          value={formData.pincode}
          onChangeText={(text) => handleChange('pincode', text)}
          keyboardType="numeric"
          maxLength={6}
          editable={!isLocationLoading}
        />
        {isLocationLoading && (
          <ActivityIndicator 
            style={styles.loadingIndicator} 
            size="small" 
            color="#6C63FF" 
          />
        )}
      </View>
      {errors.pincode && (
        <Text style={styles.errorText}>{errors.pincode}</Text>
      )}
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.formContainer}>
      {renderAddressFields()}
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => setStep(1)}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.registerButton, isLoading && styles.disabledButton]} 
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.headerContainer}>
          <View style={styles.logoBox}>
            <Ionicons name="person-add" size={40} color="#6C63FF" />
          </View>
          <Text style={styles.headerTitle}>Create Account</Text>
          <Text style={styles.headerSubtitle}>Step {step} of 2</Text>
        </View>

        {errors.general && (
          <Text style={styles.errorText}>{errors.general}</Text>
        )}

        {step === 1 ? (
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <View style={styles.nameContainer}>
                <View style={[styles.inputBox, { flex: 1 }]}>
                  <TextInput
                    style={styles.input}
                    placeholder="First Name"
                    value={formData.firstname}
                    onChangeText={(text) => handleChange('firstname', text)}
                  />
                </View>
                {errors.firstname && (
                  <Text style={styles.errorText}>{errors.firstname}</Text>
                )}

                <View style={[styles.inputBox, { flex: 1 }]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Last Name"
                    value={formData.lastname}
                    onChangeText={(text) => handleChange('lastname', text)}
                  />
                </View>
              </View>
              {errors.lastname && (
                <Text style={styles.errorText}>{errors.lastname}</Text>
              )}

              <View style={styles.inputBox}>
                <TextInput
                  style={styles.input}
                  placeholder="Mobile Number"
                  keyboardType="numeric"
                  maxLength={10}
                  value={formData.mobileno}
                  onChangeText={(text) => handleChange('mobileno', text)}
                />
              </View>
              {errors.mobileno && (
                <Text style={styles.errorText}>{errors.mobileno}</Text>
              )}

              <View style={styles.inputBox}>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  secureTextEntry={!showPassword}
                  value={formData.password}
                  onChangeText={(text) => handleChange('password', text)}
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

              <View style={styles.inputBox}>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  secureTextEntry={!showPassword}
                  value={formData.confirmPassword}
                  onChangeText={(text) => handleChange('confirmPassword', text)}
                />
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            <TouchableOpacity 
              style={styles.nextButton} 
              onPress={handleNextStep}
            >
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </View>
        ) : (
          renderStep2()
        )}

        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={() => router.push('/auth/login')}
        >
          <Text style={styles.loginText}>
            Already have an account? <Text style={styles.loginLink}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  nameContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  inputBox: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    paddingHorizontal: 16,
    minHeight: 56,
  },
  input: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  nextButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerButton: {
    flex: 2,
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  loginButton: {
    alignItems: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
    color: '#666',
  },
  loginLink: {
    color: '#6C63FF',
    fontWeight: '600',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
  },
  loadingIndicator: {
    position: 'absolute',
    right: 16,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'top',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginVertical: 8,
    backgroundColor: '#F0EEFF',
    borderRadius: 12,
  },
  locationButtonText: {
    marginLeft: 8,
    color: '#6C63FF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RegisterScreen;