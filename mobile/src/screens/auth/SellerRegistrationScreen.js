import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import * as Location from 'expo-location';
import { RadioButton } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';

// Translations object
const translations = {
  en: {
    steps: {
      1: 'Identity Verification',
      2: 'Business Type',
      3: 'Business Verification',
      4: 'Address Details',
      5: 'Payment Details',
      6: 'Product Details',
      7: 'Agreement',
    },
    fields: {
      fullName: 'Full Name',
      mobile: 'Mobile Number',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      email: 'Email Address',
      businessName: 'Business Name',
      businessType: 'Business Type',
      gstNumber: 'GST Number',
      panNumber: 'PAN Number',
      address: 'Address',
      city: 'City',
      state: 'State',
      pincode: 'Pincode',
      bankName: 'Bank Name',
      accountNumber: 'Account Number',
      ifscCode: 'IFSC Code',
      accountHolderName: 'Account Holder Name',
      uploadGST: 'Upload GST Certificate',
      uploadPAN: 'Upload PAN Card',
      uploadAadhaar: 'Upload Aadhaar Card',
      uploadShopLicense: 'Upload Shop License'
    },
    errors: {
      required: 'This field is required',
      invalidEmail: 'Please enter a valid email',
      invalidMobile: 'Please enter a valid mobile number',
      passwordMismatch: 'Passwords do not match',
      invalidGST: 'Please enter a valid GST number',
      invalidPAN: 'Please enter a valid PAN number',
      invalidPincode: 'Please enter a valid pincode'
    },
    buttons: {
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      getCurrentLocation: 'Get Current Location'
    },
    progress: 'Step %s of %s'
  },
  hi: {
    steps: {
      1: 'पहचान सत्यापन',
      2: 'व्यवसाय का प्रकार',
      3: 'व्यवसाय सत्यापन',
      4: 'पता विवरण',
      5: 'भुगतान विवरण',
      6: 'उत्पाद विवरण',
      7: 'समझौता',
    },
    fields: {
      fullName: 'पूरा नाम',
      mobile: 'मोबाइल नंबर',
      password: 'पासवर्ड',
      confirmPassword: 'पासवर्ड को पुनः प्रविष्ट करें',
      email: 'ईमेल पता',
      businessName: 'व्यवसाय का नाम',
      businessType: 'व्यवसाय का प्रकार',
      gstNumber: 'जीएसटी नंबर',
      panNumber: 'पैन नंबर',
      address: 'पता',
      city: 'शहर',
      state: 'राज्य',
      pincode: 'पिन कोड',
      bankName: 'बैंक का नाम',
      accountNumber: 'खाता संख्या',
      ifscCode: 'IFSC कोड',
      accountHolderName: 'खाताधारक का नाम',
      uploadGST: 'जीएसटी प्रमाणपत्र अपलोड करें',
      uploadPAN: 'पैन कार्ड अपलोड करें',
      uploadAadhaar: 'आधार कार्ड अपलोड करें',
      uploadShopLicense: 'दुकान लाइसेंस अपलोड करें'
    },
    errors: {
      required: 'यह फ़ील्ड आवश्यक है',
      invalidEmail: 'कृपया वैध ईमेल दर्ज करें',
      invalidMobile: 'कृपया वैध मोबाइल नंबर दर्ज करें',
      passwordMismatch: 'पासवर्ड मेल नहीं खाते',
      invalidGST: 'कृपया वैध जीएसटी नंबर दर्ज करें',
      invalidPAN: 'कृपया वैध पैन नंबर दर्ज करें',
      invalidPincode: 'कृपया वैध पिन कोड दर्ज करें'
    },
    buttons: {
      next: 'अगला',
      previous: 'पिछला',
      submit: 'जमा करें',
      getCurrentLocation: 'वर्तमान स्थान प्राप्त करें'
    },
    progress: 'चरण %s में से %s'
  },
  mr: {
    steps: {
      1: "मूलभूत माहिती",
      2: "संपर्क तपशील",
      3: "व्यवसाय माहिती",
      4: "स्थान तपशील",
      5: "बँक तपशील",
      6: "कागदपत्रे अपलोड",
      7: "पुनरावलोकन आणि सबमिट"
    },
    fields: {
      fullName: "पूर्ण नाव",
      mobile: "मोबाईल नंबर",
      email: "ईमेल पत्ता",
      password: "पासवर्ड",
      confirmPassword: "पासवर्डची पुष्टी करा",
      businessName: "व्यवसायाचे नाव",
      businessType: "व्यवसायाचा प्रकार",
      gstNumber: "जीएसटी क्रमांक",
      panNumber: "पॅन क्रमांक",
      address: "पत्ता",
      city: "शहर",
      state: "राज्य",
      pincode: "पिन कोड",
      bankName: "बँकेचे नाव",
      accountNumber: "खाते क्रमांक",
      ifscCode: "IFSC कोड",
      accountHolderName: "खातेदाराचे नाव",
      uploadGST: "जीएसटी प्रमाणपत्र अपलोड करा",
      uploadPAN: "पॅन कार्ड अपलोड करा",
      uploadAadhaar: "आधार कार्ड अपलोड करा",
      uploadShopLicense: "दुकान परवाना अपलोड करा"
    },
    errors: {
      required: "हे क्षेत्र आवश्यक आहे",
      invalidEmail: "कृपया वैध ईमेल प्रविष्ट करा",
      invalidMobile: "कृपया वैध मोबाईल नंबर प्रविष्ट करा",
      passwordMismatch: "पासवर्ड जुळत नाहीत",
      invalidGST: "कृपया वैध जीएसटी क्रमांक प्रविष्ट करा",
      invalidPAN: "कृपया वैध पॅन क्रमांक प्रविष्ट करा",
      invalidPincode: "कृपया वैध पिन कोड प्रविष्ट करा"
    },
    buttons: {
      next: "पुढे",
      previous: "मागे",
      submit: "सबमिट करा",
      getCurrentLocation: "वर्तमान स्थान मिळवा"
    },
    progress: 'चरण %s पैकी %s'
  },
  gu: {
    steps: {
      1: "મૂળભૂત માહિતી",
      2: "સંપર્ક વિગતો",
      3: "વ્યવસાય માહિતી",
      4: "સ્થાન વિગતો",
      5: "બેંક વિગતો",
      6: "દસ્તાવેજો અપલોડ",
      7: "સમીક્ષા અને સબમિટ"
    },
    fields: {
      fullName: "પૂરું નામ",
      mobile: "મોબાઇલ નંબર",
      email: "ઇમેઇલ એડ્રેસ",
      password: "પાસવર્ડ",
      confirmPassword: "પાસવર્ડની પુષ્ટિ કરો",
      businessName: "વ્યવસાયનું નામ",
      businessType: "વ્યવસાયનો પ્રકાર",
      gstNumber: "જીએસટી નંબર",
      panNumber: "પેન નંબર",
      address: "સરનામું",
      city: "શહેર",
      state: "રાજ્ય",
      pincode: "પિન કોડ",
      bankName: "બેંકનું નામ",
      accountNumber: "ખાતા નંબર",
      ifscCode: "IFSC કોડ",
      accountHolderName: "ખાતાધારકનું નામ",
      uploadGST: "જીએસટી સર્ટિફિકેટ અપલોડ કરો",
      uploadPAN: "પેન કાર્ડ અપલોડ કરો",
      uploadAadhaar: "આધાર કાર્ડ અપલોડ કરો",
      uploadShopLicense: "દુકાન લાઇસન્સ અપલોડ કરો"
    },
    errors: {
      required: "આ ફીલ્ડ જરૂરી છે",
      invalidEmail: "કૃપા કરી માન્ય ઇમેઇલ દાખલ કરો",
      invalidMobile: "કૃપા કરી માન્ય મોબાઇલ નંબર દાખલ કરો",
      passwordMismatch: "પાસવર્ડ મેળ ખાતા નથી",
      invalidGST: "કૃપા કરી માન્ય જીએસટી નંબર દાખલ કરો",
      invalidPAN: "કૃપા કરી માન્ય પેન નંબર દાખલ કરો",
      invalidPincode: "કૃપા કરી માન્ય પિન કોડ દાખલ કરો"
    },
    buttons: {
      next: "આગળ",
      previous: "પાછળ",
      submit: "સબમિટ કરો",
      getCurrentLocation: "વર્તમાન સ્થાન મેળવો"
    },
    progress: 'સ્ટેપ %s માંથી %s'
  }
};

const businessTypes = [
  {
    id: 'farmer',
    icon: '🌾',
    title: {
      en: 'Farmer',
      hi: 'किसान',
      mr: 'शेतकरी',
      gu: 'ખેડૂત',
    },
    subtitle: {
      en: 'Vegetables, Fruits, Grains etc.',
      hi: 'सब्जियां, फल, अनाज आदि',
      mr: 'भाज्या, फळे, धान्य इ.',
      gu: 'શાકભાજી, ફળો, અનાજ વગેરે',
    },
    categories: ['vegetables', 'fruits', 'grains', 'dairy'],
  },
  {
    id: 'homeBusiness',
    icon: '👩‍🍳',
    title: {
      en: 'Home Business',
      hi: 'घरेलू व्यवसाय',
      mr: 'गृह व्यवसाय',
      gu: 'ઘર વ્યવસાય',
    },
    subtitle: {
      en: 'Tiffin, Pickles, Handmade Items',
      hi: 'टिफिन, अचार, हस्तनिर्मित वस्तुएं',
      mr: 'डबा, लोणची, हस्तकला वस्तू',
      gu: 'ટિફિન, અથાણા, હસ્તકલા વસ્તુઓ',
    },
    categories: ['tiffin', 'pickles', 'handmade', 'snacks'],
  },
  {
    id: 'contentCreator',
    icon: '🎨',
    title: {
      en: 'Content Creator',
      hi: 'कंटेंट क्रिएटर',
      mr: 'कंटेंट क्रिएटर',
      gu: 'કન્ટેન્ટ ક્રિએટર',
    },
    subtitle: {
      en: 'Digital Products, Art, Courses',
      hi: 'डिजिटल प्रोडक्ट्स, कला, कोर्स',
      mr: 'डिजिटल प्रॉडक्ट्स, कला, कोर्स',
      gu: 'ડિજિટલ પ્રોડક્ટ્સ, કલા, કોર્સ',
    },
    categories: ['digital', 'courses', 'art', 'music'],
  },
  // Add more business types
];

const SellerRegistrationScreen = () => {
  const router = useRouter();
  const { language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState(null);

  // Form data state
  const [formData, setFormData] = useState({
    // Step 1: Identity
    fullName: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    
    // Step 2: Business Type
    businessType: '',
    
    // Step 3: Business Verification
    aadharNumber: '',
    shopName: '',
    
    // Step 4: Address
    address: '',
    city: '',
    pincode: '',
    state: '',
    landmark: '',
    
    // Step 5: Payment
    upiId: '',
    bankAccount: '',
    ifscCode: '',
    acceptsCod: false,
    
    // Step 6: Product
    productDescription: '',
    categories: [],
    productImage: null,
    
    // Step 7: Agreement
    agreesToTerms: false,
  });

  // Get user's location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          setLocation(location);
          // Get address from coordinates
          const address = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
          if (address[0]) {
            setFormData(prev => ({
              ...prev,
              city: address[0].city || '',
              state: address[0].region || '',
              pincode: address[0].postalCode || '',
            }));
          }
        }
      } catch (error) {
        console.error('Location error:', error);
      }
    })();
  }, []);

  // Validation functions for each step
  const validateStep1 = () => {
    const errors = {};
    if (!formData.fullName) errors.fullName = 'Name is required';
    if (!/^[0-9]{10}$/.test(formData.mobile)) errors.mobile = 'Invalid mobile number';
    if (formData.password.length < 8) errors.password = 'Password too short';
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    return errors;
  };

  const validateStep2 = () => {
    const errors = {};
    if (!formData.businessType) errors.businessType = 'Please select a business type';
    return errors;
  };

  // ... Add validation for other steps

  const handleNext = () => {
    let errors = {};
    switch (currentStep) {
      case 1:
        errors = validateStep1();
        break;
      case 2:
        errors = validateStep2();
        break;
      // ... Add validation for other steps
    }

    if (Object.keys(errors).length === 0) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Show errors to user
      Alert.alert('Please fix the following errors', Object.values(errors).join('\n'));
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement API call to register seller
      await new Promise(resolve => setTimeout(resolve, 1500));
      router.replace('/(seller)/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Registration failed', 'Please try again');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{translations[language].steps[1]}</Text>
      <View style={styles.inputGroup}>
        <TextInput
          style={styles.input}
          placeholder={translations[language].fields.fullName}
          value={formData.fullName}
          onChangeText={(text) => setFormData(prev => ({ ...prev, fullName: text }))}
        />
        <TextInput
          style={styles.input}
          placeholder={translations[language].fields.mobile}
          keyboardType="phone-pad"
          value={formData.mobile}
          maxLength={10}
          onChangeText={(text) => {
            const numericValue = text.replace(/[^0-9]/g, '');
            if (numericValue.length <= 10) {
              setFormData(prev => ({ ...prev, mobile: numericValue }));
            }
          }}
        />
        <TextInput
          style={styles.input}
          placeholder={translations[language].fields.password}
          secureTextEntry
          value={formData.password}
          onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
        />
        <TextInput
          style={styles.input}
          placeholder={translations[language].fields.confirmPassword}
          secureTextEntry
          value={formData.confirmPassword}
          onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{translations[language].steps[2]}</Text>
      <ScrollView style={styles.businessTypeContainer}>
        {businessTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.businessTypeCard,
              formData.businessType === type.id && styles.selectedBusinessType
            ]}
            onPress={() => setFormData(prev => ({ 
              ...prev, 
              businessType: type.id,
              categories: type.categories
            }))}
          >
            <Text style={styles.businessTypeIcon}>{type.icon}</Text>
            <View style={styles.businessTypeContent}>
              <Text style={styles.businessTypeTitle}>{type.title[language]}</Text>
              <Text style={styles.businessTypeSubtitle}>{type.subtitle[language]}</Text>
            </View>
            {formData.businessType === type.id && (
              <Ionicons name="checkmark-circle" size={24} color="#6C63FF" />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // ... Add render functions for other steps

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => currentStep > 1 ? setCurrentStep(prev => prev - 1) : router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${(currentStep / 7) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {translations[language].progress.replace('%s', currentStep).replace('%s', '7')}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {/* Add other steps */}
      </ScrollView>

      <View style={styles.footer}>
        {currentStep < 7 ? (
          <TouchableOpacity 
            style={styles.nextButton}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>{translations[language].buttons.next}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>{translations[language].buttons.submit}</Text>
            )}
          </TouchableOpacity>
        )}
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
  progressContainer: {
    marginTop: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6C63FF',
  },
  progressText: {
    marginTop: 8,
    textAlign: 'center',
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 24,
    color: '#1A1A1A',
  },
  inputGroup: {
    gap: 16,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    paddingHorizontal: 16,
    height: 56,
    fontSize: 16,
  },
  businessTypeContainer: {
    flex: 1,
  },
  businessTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    padding: 16,
    marginBottom: 16,
  },
  selectedBusinessType: {
    borderColor: '#6C63FF',
    backgroundColor: '#F8F9FF',
  },
  businessTypeIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  businessTypeContent: {
    flex: 1,
  },
  businessTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  businessTypeSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  nextButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#22C55E',
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SellerRegistrationScreen; 