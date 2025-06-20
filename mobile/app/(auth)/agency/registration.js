import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from '../../../src/config/axios';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const translations = {
  en: {
    header: 'Agency Registration',
    steps: {
      personalDetails: 'Personal Details',
      contacts: 'Contacts',
      accountInfo: 'Account Info',
      review: 'Review',
    },
    sections: {
      personalInfo: 'Personal Information',
      agencyInfo: 'Agency Information',
      address: 'Address',
      bankDetails: 'Bank Details',
    },
    labels: {
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      mobile: 'Mobile Number',
      password: 'Password',
      agencyName: 'Agency Name',
      contactPerson: 'Contact Person',
      alternateContact: 'Alternate Contact',
      gst: 'GST Number',
      businessLicense: 'Business License',
      website: 'Website (Optional)',
      pincode: 'PIN Code',
      address: 'Address',
      city: 'City',
      state: 'State',
      accountHolder: 'Account Holder Name',
      accountNumber: 'Account Number',
      ifsc: 'IFSC Code',
      bankName: 'Bank Name',
      confirmPassword: 'Confirm Password',
    },
    placeholders: {
      firstName: 'Enter first name',
      lastName: 'Enter last name',
      email: 'Enter email',
      mobile: 'Enter mobile number',
      password: 'Enter password',
      agencyName: 'Enter agency name',
      contactPerson: 'Enter contact person name',
      alternateContact: 'Enter alternate contact',
      gst: 'Enter GST number',
      businessLicense: 'Enter business license number',
      website: 'Enter website',
      pincode: 'Enter PIN code',
      address: 'Enter address',
      city: 'Enter city',
      state: 'Enter state',
      accountHolder: 'Enter account holder name',
      accountNumber: 'Enter account number',
      ifsc: 'Enter IFSC code',
      bankName: 'Enter bank name',
      confirmPassword: 'Confirm your password',
    },
    buttons: {
      next: 'Next',
      register: 'Register',
      uploadLogo: 'Upload Agency Logo',
      changeLogo: 'Change Logo',
    },
    alerts: {
      success: 'Success',
      error: 'Error',
      registrationSuccess: 'Agency registration successful',
      fillAllFields: 'Please fill all required fields',
      invalidEmail: 'Please enter a valid email',
      invalidMobile: 'Please enter a valid mobile number',
      invalidPassword: 'Password must be at least 6 characters',
      invalidGST: 'Please enter a valid GST number',
      invalidLicense: 'Please enter a valid business license number',
      invalidPincode: 'Please enter a valid PIN code',
      invalidAccount: 'Account number should:\n- Be 9-18 digits long\n- Start with non-zero digit\n- Contain only numbers\n- Not be all same digits',
      invalidIFSC: 'IFSC code should:\n- Be 11 characters long\n- First 4 letters should be bank code\n- 5th character should be 0\n- Last 6 characters should be branch code',
      uploadError: 'Error uploading logo',
      registrationError: 'Error in registration',
    }
  },
  hi: {
    header: 'एजेंसी रजिस्ट्रेशन',
    steps: {
      personalDetails: 'व्यक्तिगत विवरण',
      contacts: 'संपर्क',
      accountInfo: 'खाता जानकारी',
      review: 'समीक्षा',
    },
    sections: {
      personalInfo: 'व्यक्तिगत जानकारी',
      agencyInfo: 'एजेंसी की जानकारी',
      address: 'पता',
      bankDetails: 'बैंक विवरण',
    },
    labels: {
      firstName: 'पहला नाम',
      lastName: 'अंतिम नाम',
      email: 'ईमेल',
      mobile: 'मोबाइल नंबर',
      password: 'पासवर्ड',
      agencyName: 'एजेंसी का नाम',
      contactPerson: 'संपर्क व्यक्ति',
      alternateContact: 'वैकल्पिक संपर्क नंबर',
      gst: 'GST नंबर',
      businessLicense: 'बिजनेस लाइसेंस नंबर',
      website: 'वेबसाइट (वैकल्पिक)',
      pincode: 'पिन कोड',
      address: 'पता',
      city: 'शहर',
      state: 'राज्य',
      accountHolder: 'खाताधारक का नाम',
      accountNumber: 'खाता संख्या',
      ifsc: 'IFSC कोड',
      bankName: 'बैंक का नाम',
      confirmPassword: 'पासवर्ड की पुष्टि करें',
    },
    placeholders: {
      firstName: 'पहला नाम दर्ज करें',
      lastName: 'अंतिम नाम दर्ज करें',
      email: 'ईमेल दर्ज करें',
      mobile: 'मोबाइल नंबर दर्ज करें',
      password: 'पासवर्ड दर्ज करें',
      agencyName: 'एजेंसी का नाम दर्ज करें',
      contactPerson: 'संपर्क व्यक्ति दर्ज करें',
      alternateContact: 'वैकल्पिक संपर्क नंबर दर्ज करें',
      gst: 'GST नंबर दर्ज करें',
      businessLicense: 'बिजनेस लाइसेंस नंबर दर्ज करें',
      website: 'वेबसाइट दर्ज करें',
      pincode: 'पिन कोड दर्ज करें',
      address: 'पता दर्ज करें',
      city: 'शहर दर्ज करें',
      state: 'राज्य दर्ज करें',
      accountHolder: 'खाताधारक का नाम दर्ज करें',
      accountNumber: 'खाता संख्या दर्ज करें',
      ifsc: 'IFSC कोड दर्ज करें',
      bankName: 'बैंक का नाम दर्ज करें',
      confirmPassword: 'पासवर्ड की पुष्टि करें',
    },
    buttons: {
      next: 'अगला',
      register: 'रजिस्टर करें',
      uploadLogo: 'एजेंसी लोगो अपलोड करें',
      changeLogo: 'लोगो बदलें',
    },
    alerts: {
      success: 'सफल',
      error: 'एरर',
      registrationSuccess: 'एजेंसी रजिस्ट्रेशन सफल हुआ है',
      fillAllFields: 'कृपया सभी आवश्यक जानकारी भरें',
      invalidEmail: 'कृपया सही ईमेल आईडी दर्ज करें',
      invalidMobile: 'कृपया सही मोबाइल नंबर दर्ज करें',
      invalidPassword: 'पासवर्ड कम से कम 6 अक्षर का होना चाहिए',
      invalidGST: 'कृपया सही GST नंबर दर्ज करें',
      invalidLicense: 'बिजनेस लाइसेंस नंबर का फॉर्मेट सही नहीं है। यह:\n- अंग्रेजी कैपिटल लेटर से शुरू होना चाहिए\n- 6-20 अक्षर लंबा होना चाहिए\n- केवल अंग्रेजी कैपिटल लेटर, नंबर और हाइफन (-) का उपयोग कर सकते हैं',
      invalidPincode: 'कृपया सही पिन कोड दर्ज करें',
      invalidAccount: 'खाता संख्या:\n- 9-18 अंकों की होनी चाहिए\n- 0 से शुरू नहीं होनी चाहिए\n- केवल नंबर होने चाहिए\n- सभी अंक एक समान नहीं होने चाहिए',
      invalidIFSC: 'IFSC कोड:\n- 11 अक्षरों का होना चाहिए\n- पहले 4 अक्षर बैंक कोड होने चाहिए\n- 5वां अक्षर 0 होना चाहिए\n- अंतिम 6 अक्षर ब्रांच कोड होने चाहिए',
      uploadError: 'लोगो अपलोड करने में समस्या हुई',
      registrationError: 'रजिस्ट्रेशन में समस्या हुई',
    }
  }
};

const STEPS = [
  { id: 1, title: 'Agency Details' },
  { id: 2, title: 'Address Details' },
  { id: 3, title: 'Bank Details' },
  { id: 4, title: 'Account Details' },
];

const AgencyRegistration = () => {
  const router = useRouter();
  const [language, setLanguage] = useState('en');
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1 - Agency Details
    agencyName: '',
    contactPerson: '',
    gstNumber: '',
    businessLicenseNumber: '',
    website: '',
    logoUrl: '',
    platformType: ['b2b'],

    // Step 2 - Address Details
    pincode: '',
    address: '',
    country: 'India',
    state: '',
    city: '',

    // Step 3 - Bank Details
    bankDetails: {
      accountHolderName: '',
      accountNumber: '',
      ifscCode: '',
      bankName: '',
    },

    // Step 4 - Account Details
    email: '',
    mobileno: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
      if (savedLanguage) {
        setLanguage(savedLanguage);
        console.log('Loaded language:', savedLanguage);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const t = translations[language] || translations.en;

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setIsUploading(true);
        try {
          const uploadResponse = await axios.post('/api/upload/firebase', {
            file: result.assets[0].base64,
            path: `agency-logos/${Date.now()}.jpg`,
          });

          if (uploadResponse.data?.success && uploadResponse.data?.url) {
            setFormData(prev => ({
              ...prev,
              logoUrl: uploadResponse.data.url
            }));
            Alert.alert('Success', 'Logo uploaded successfully');
          }
        } catch (error) {
          Alert.alert('Error', 'Failed to upload logo');
        } finally {
          setIsUploading(false);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const validateGSTNumber = (gst) => {
    // Format: 2 digits state code + 10 chars PAN + 1 digit entity + 1 digit check sum + 'Z' + 1 char
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    
    if (!gstRegex.test(gst)) {
      return false;
    }

    // Validate state code (01-37)
    const stateCode = parseInt(gst.substr(0, 2));
    if (stateCode < 1 || stateCode > 37) {
      return false;
    }

    return true;
  };

  const validateBusinessLicense = (license) => {
    // Format validation:
    // 1. Must be 6-20 characters long
    // 2. Must start with a letter
    // 3. Can contain uppercase letters, numbers and hyphens
    // 4. No special characters except hyphen
    const licenseRegex = /^[A-Z][A-Z0-9-]{5,19}$/;
    
    if (!licenseRegex.test(license)) {
      return false;
    }

    // Additional checks
    // 1. Should not have consecutive hyphens
    if (license.includes('--')) {
      return false;
    }
    
    // 2. Should not end with a hyphen
    if (license.endsWith('-')) {
      return false;
    }

    return true;
  };

  const validateAccountNumber = (account) => {
    // Rules for account number:
    // 1. Should be numeric only
    // 2. Length should be between 9 to 18 digits (as per most Indian banks)
    // 3. Should not contain any spaces or special characters
    // 4. Should not be all zeros
    // 5. Should not start with 0
    
    // Basic format check
    const accountRegex = /^[1-9][0-9]{8,17}$/;
    
    if (!accountRegex.test(account)) {
      return false;
    }

    // Check if not all same digits
    if (/^(.)\1+$/.test(account)) {
      return false;
    }

    return true;
  };

  const validateIFSC = (ifsc) => {
    // IFSC Code format:
    // First 4 characters: Bank code (alphabets only)
    // 5th character: 0 (zero)
    // Last 6 characters: Branch code (alphanumeric)
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    
    if (!ifscRegex.test(ifsc)) {
      return false;
    }

    // Additional check for common bank codes
    const bankCode = ifsc.slice(0, 4);
    const commonBankCodes = ['SBIN', 'HDFC', 'ICIC', 'AXIS', 'PUNB', 'IDIB', 'UTIB', 'BARB'];
    if (!commonBankCodes.includes(bankCode)) {
      // Even if bank code is not in common list, we'll allow it as there are many other valid banks
      console.log('Uncommon bank code:', bankCode);
    }

    return true;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const fetchAddressFromPincode = async (pincode) => {
    try {
      setLoading(true);
      const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
      if (response.data[0].Status === "Success") {
        const postOffice = response.data[0].PostOffice[0];
        setFormData(prev => ({
          ...prev,
          city: postOffice.District,
          state: postOffice.State
        }));
      } else {
        Alert.alert(t.alerts.error, 'Invalid PIN Code');
        setFormData(prev => ({
          ...prev,
          city: '',
          state: ''
        }));
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      Alert.alert(t.alerts.error, 'Error fetching address details');
      setFormData(prev => ({
        ...prev,
        city: '',
        state: ''
      }));
    } finally {
      setLoading(false);
    }
  };

  const validateStep = () => {
    const getMissingFields = () => {
      switch (currentStep) {
        case 1:
          return {
            required: ['agencyName', 'contactPerson', 'gstNumber', 'businessLicenseNumber'],
            fields: {
              agencyName: t.labels.agencyName,
              contactPerson: t.labels.contactPerson,
              gstNumber: t.labels.gst,
              businessLicenseNumber: t.labels.businessLicense,
            }
          };
        case 2:
          return {
            required: ['pincode', 'address', 'state', 'city'],
            fields: {
              pincode: t.labels.pincode,
              address: t.labels.address,
              state: t.labels.state,
              city: t.labels.city,
            }
          };
        case 3:
          return {
            required: ['bankDetails.accountHolderName', 'bankDetails.accountNumber', 'bankDetails.ifscCode', 'bankDetails.bankName'],
            fields: {
              'bankDetails.accountHolderName': t.labels.accountHolder,
              'bankDetails.accountNumber': t.labels.accountNumber,
              'bankDetails.ifscCode': t.labels.ifsc,
              'bankDetails.bankName': t.labels.bankName,
            }
          };
        case 4:
          return {
            required: ['email', 'mobileno', 'password', 'confirmPassword'],
            fields: {
              email: t.labels.email,
              mobileno: t.labels.mobile,
              password: t.labels.password,
              confirmPassword: t.labels.confirmPassword,
            }
          };
        default:
          return { required: [], fields: {} };
      }
    };

    const { required, fields } = getMissingFields();
    const missingFields = required.filter(field => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return !formData[parent][child];
      }
      return !formData[field];
    });

    if (missingFields.length > 0) {
      const missingFieldNames = missingFields.map(field => {
        if (field.includes('.')) {
          return fields[field];
        }
        return fields[field];
      }).join(', ');
      Alert.alert(t.alerts.error, `${t.alerts.fillAllFields}: ${missingFieldNames}`);
      return false;
    }

    // Additional validations for each step
    if (currentStep === 1) {
      if (!validateGSTNumber(formData.gstNumber)) {
        Alert.alert(t.alerts.error, t.alerts.invalidGST);
        return false;
      }
      if (!validateBusinessLicense(formData.businessLicenseNumber)) {
        Alert.alert(t.alerts.error, t.alerts.invalidLicense);
        return false;
      }
    }

    if (currentStep === 2) {
      if (formData.pincode.length !== 6) {
        Alert.alert(t.alerts.error, t.alerts.invalidPincode);
        return false;
      }
    }

    if (currentStep === 3) {
      if (!validateAccountNumber(formData.bankDetails.accountNumber)) {
        Alert.alert(t.alerts.error, t.alerts.invalidAccount);
        return false;
      }
      if (!validateIFSC(formData.bankDetails.ifscCode)) {
        Alert.alert(t.alerts.error, t.alerts.invalidIFSC);
        return false;
      }
    }

    if (currentStep === 4) {
      if (!validateEmail(formData.email)) {
        Alert.alert(t.alerts.error, t.alerts.invalidEmail);
        return false;
      }
      if (formData.mobileno.length !== 10) {
        Alert.alert(t.alerts.error, t.alerts.invalidMobile);
        return false;
      }
      if (formData.password.length < 6) {
        Alert.alert(t.alerts.error, t.alerts.invalidPassword);
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        Alert.alert(t.alerts.error, t.alerts.passwordsDontMatch);
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    try {
      setLoading(true);
      const response = await axios.post('/api/agency/signup', {
        email: formData.email,
        mobileno: formData.mobileno,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        address: formData.address,
        country: formData.country,
        state: formData.state,
        city: formData.city,
        pincode: formData.pincode,
        agencyName: formData.agencyName,
        contactPerson: formData.contactPerson,
        alternateContactNumber: formData.alternateContactNumber,
        gstNumber: formData.gstNumber,
        businessLicenseNumber: formData.businessLicenseNumber,
        bankDetails: formData.bankDetails,
        website: formData.website,
        logoUrl: formData.logoUrl,
        platformType: formData.platformType
      });
      
      if (response.data.success) {
        Alert.alert(
          t.alerts.success,
          t.alerts.registrationSuccess,
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(auth)/agency/login')
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        t.alerts.error,
        error.response?.data?.message || t.alerts.registrationError
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => {
    return (
      <View style={styles.stepsContainer}>
        <View style={styles.stepsWrapper}>
          {STEPS.map((step, index) => (
            <React.Fragment key={step.id}>
              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    currentStep === step.id && styles.activeStep,
                    currentStep > step.id && styles.completedStep,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepNumber,
                      (currentStep === step.id || currentStep > step.id) && styles.activeStepText,
                    ]}
                  >
                    {step.id}
                  </Text>
                </View>
                <Text style={[
                  styles.stepTitle,
                  currentStep === step.id && styles.activeStepTitle,
                ]}>
                  {t.steps[step.title]}
                </Text>
              </View>
              {index < STEPS.length - 1 && (
                <View style={styles.stepLine} />
              )}
            </React.Fragment>
          ))}
        </View>
      </View>
    );
  };

  const renderForm = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>{t.sections.agencyInfo}</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.labels.agencyName}</Text>
              <TextInput
                style={styles.input}
                placeholder={t.placeholders.agencyName}
                value={formData.agencyName}
                onChangeText={(text) => setFormData({ ...formData, agencyName: text })}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.labels.contactPerson}</Text>
              <TextInput
                style={styles.input}
                placeholder={t.placeholders.contactPerson}
                value={formData.contactPerson}
                onChangeText={(text) => setFormData({ ...formData, contactPerson: text })}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.labels.alternateContact}</Text>
              <TextInput
                style={styles.input}
                placeholder={t.placeholders.alternateContact}
                value={formData.alternateContactNumber}
                onChangeText={(text) => {
                  const numbersOnly = text.replace(/[^0-9]/g, '');
                  if (numbersOnly.length <= 10) {
                    setFormData({ ...formData, alternateContactNumber: numbersOnly });
                  }
                }}
                keyboardType="numeric"
                maxLength={10}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.labels.gst}</Text>
              <TextInput
                style={styles.input}
                placeholder={t.placeholders.gst}
                value={formData.gstNumber}
                onChangeText={(text) => setFormData({ ...formData, gstNumber: text.toUpperCase() })}
                autoCapitalize="characters"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.labels.businessLicense}</Text>
              <TextInput
                style={styles.input}
                placeholder={t.placeholders.businessLicense}
                value={formData.businessLicenseNumber}
                onChangeText={(text) => setFormData({ ...formData, businessLicenseNumber: text })}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.labels.website}</Text>
              <TextInput
                style={styles.input}
                placeholder={t.placeholders.website}
                value={formData.website}
                onChangeText={(text) => setFormData({ ...formData, website: text })}
                keyboardType="url"
                placeholderTextColor="#999"
              />
            </View>

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleImagePick}
              disabled={isUploading}
            >
              <Ionicons name="cloud-upload-outline" size={24} color="#FFFFFF" />
              <Text style={styles.uploadButtonText}>
                {formData.logoUrl ? t.buttons.changeLogo : t.buttons.uploadLogo}
              </Text>
            </TouchableOpacity>
            {isUploading && <ActivityIndicator style={styles.loader} color="#6C63FF" />}
            {formData.logoUrl && (
              <Image source={{ uri: formData.logoUrl }} style={styles.logoPreview} />
            )}

          </View>
        );

      case 2:
        return (
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>{t.sections.address}</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.labels.pincode}</Text>
              <TextInput
                style={styles.input}
                placeholder={t.placeholders.pincode}
                value={formData.pincode}
                onChangeText={(text) => {
                  const numbersOnly = text.replace(/[^0-9]/g, '');
                  if (numbersOnly.length <= 6) {
                    setFormData({ ...formData, pincode: numbersOnly });
                    if (numbersOnly.length === 6) {
                      fetchAddressFromPincode(numbersOnly);
                    } else {
                      // Clear city and state if pincode is incomplete
                      setFormData(prev => ({
                        ...prev,
                        pincode: numbersOnly,
                        city: '',
                        state: ''
                      }));
                    }
                  }
                }}
                keyboardType="numeric"
                maxLength={6}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.labels.address}</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder={t.placeholders.address}
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                multiline
                numberOfLines={3}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.labels.city}</Text>
              <TextInput
                style={[styles.input, formData.city ? styles.disabledInput : null]}
                placeholder={t.placeholders.city}
                value={formData.city}
                onChangeText={(text) => setFormData({ ...formData, city: text })}
                placeholderTextColor="#999"
                editable={!formData.city}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.labels.state}</Text>
              <TextInput
                style={[styles.input, formData.state ? styles.disabledInput : null]}
                placeholder={t.placeholders.state}
                value={formData.state}
                onChangeText={(text) => setFormData({ ...formData, state: text })}
                placeholderTextColor="#999"
                editable={!formData.state}
              />
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>{t.sections.bankDetails}</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.labels.accountHolder}</Text>
              <TextInput
                style={styles.input}
                placeholder={t.placeholders.accountHolder}
                value={formData.bankDetails.accountHolderName}
                onChangeText={(text) => setFormData({ 
                  ...formData, 
                  bankDetails: { ...formData.bankDetails, accountHolderName: text }
                })}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.labels.accountNumber}</Text>
              <TextInput
                style={styles.input}
                placeholder={t.placeholders.accountNumber}
                value={formData.bankDetails.accountNumber}
                onChangeText={(text) => {
                  const numbersOnly = text.replace(/[^0-9]/g, '');
                  setFormData({
                    ...formData,
                    bankDetails: { ...formData.bankDetails, accountNumber: numbersOnly }
                  });
                }}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.labels.ifsc}</Text>
              <TextInput
                style={styles.input}
                placeholder={t.placeholders.ifsc}
                value={formData.bankDetails.ifscCode}
                onChangeText={(text) => setFormData({
                  ...formData,
                  bankDetails: { ...formData.bankDetails, ifscCode: text.toUpperCase() }
                })}
                autoCapitalize="characters"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.labels.bankName}</Text>
              <TextInput
                style={styles.input}
                placeholder={t.placeholders.bankName}
                value={formData.bankDetails.bankName}
                onChangeText={(text) => setFormData({
                  ...formData,
                  bankDetails: { ...formData.bankDetails, bankName: text }
                })}
                placeholderTextColor="#999"
              />
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>{t.sections.accountInfo}</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.labels.email}</Text>
              <TextInput
                style={styles.input}
                placeholder={t.placeholders.email}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.labels.mobile}</Text>
              <TextInput
                style={styles.input}
                placeholder={t.placeholders.mobile}
                value={formData.mobileno}
                onChangeText={(text) => {
                  const numbersOnly = text.replace(/[^0-9]/g, '');
                  if (numbersOnly.length <= 10) {
                    setFormData({ ...formData, mobileno: numbersOnly });
                  }
                }}
                keyboardType="numeric"
                maxLength={10}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.labels.password}</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder={t.placeholders.password}
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#999"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={24}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.labels.confirmPassword || 'Confirm Password'}</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder={t.placeholders.confirmPassword || 'Confirm your password'}
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#999"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={24}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.header}</Text>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {renderStepIndicator()}
        {renderForm()}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              (isUploading || loading) && styles.buttonDisabled
            ]}
            onPress={currentStep === STEPS.length ? handleSubmit : handleNext}
            disabled={isUploading || loading}
          >
            {(loading || isUploading) ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>
                {currentStep === STEPS.length ? t.buttons.register : t.buttons.next}
              </Text>
            )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  stepsContainer: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  stepsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepItem: {
    alignItems: 'center',
    width: 70,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  activeStep: {
    backgroundColor: '#6C63FF',
  },
  completedStep: {
    backgroundColor: '#6C63FF',
  },
  stepNumber: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  activeStepText: {
    color: '#FFFFFF',
  },
  stepTitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  activeStepTitle: {
    color: '#333',
    fontWeight: '500',
  },
  stepLine: {
    width: 40,
    height: 1,
    backgroundColor: '#E8E8E8',
    marginHorizontal: -5,
    marginTop: -20,
  },
  formContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#FFFFFF',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  buttonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  button: {
    backgroundColor: '#6C63FF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: '#A5A5A5',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  imageUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  imageUploadText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#6C63FF',
  },
  imagePreviewContainer: {
    marginTop: 16,
    alignItems: 'center',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  imagePreview: {
    width: 200,
    height: 200,
  },
  disabledInput: {
    backgroundColor: '#F5F5F5',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  passwordInput: {
    flex: 1,
    borderWidth: 0,
    paddingRight: 40,
    backgroundColor: 'transparent',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  logoSection: {
    marginTop: 16,
    alignItems: 'center',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6C63FF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 10,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  loader: {
    alignSelf: 'center',
    marginTop: 10,
  },
  nextButton: {
    backgroundColor: '#6C63FF',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default AgencyRegistration; 