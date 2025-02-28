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
      1: 'User Identity Verification',
      2: 'Business Type Selection',
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
      aadharNumber: 'Aadhaar Card Number',
      shopName: 'Shop Name (Optional)',
      address: 'Full Address (Home/Shop)',
      landmark: 'Landmark (Optional)',
      city: 'City/Village',
      state: 'State',
      pincode: 'Pincode',
      upiId: 'Enter your UPI ID (e.g., your mobile number@upi)',
      bankAccount: 'Enter bank account number (Optional)',
      ifscCode: 'Enter bank IFSC code (Optional)',
      acceptsCOD: 'I want to accept Cash on Delivery',
      productDescription: 'What do you sell? (e.g., "I sell vegetables")',
      selectCategory: 'Choose what type of products you sell',
      uploadProductImage: 'Upload a photo of your products (Required)',
      customBusinessType: 'Enter your business type',
      businessDescription: 'Describe your business (what you sell/service you provide)',
      acceptAgreement: 'I agree to follow all rules and provide good service',
      customCategory: 'Enter your product category',
      voiceRecordingPlaceholder: 'Voice recording captured. Tap to edit.',
    },
    errors: {
      required: 'This field is required',
      invalidEmail: 'Please enter a valid email',
      invalidMobile: 'Please enter a valid mobile number',
      passwordMismatch: 'Passwords do not match',
      invalidGST: 'Please enter a valid GST number',
      invalidPAN: 'Please enter a valid PAN number',
      invalidPincode: 'Please enter a valid pincode',
      invalidAadhar: 'Please enter a valid 12-digit Aadhaar number',
      paymentMethodRequired: 'Please select a payment method',
      invalidUPI: 'Please enter a valid UPI ID',
      uploadFailed: 'Upload failed',
      locationPermission: 'Location permission is required',
      locationError: 'Error getting location',
      payment: 'Please select a payment method',
      agreementRequired: 'You must accept the agreement',
      productImageRequired: 'Product photo is required',
      customCategoryRequired: 'Please enter your product category',
      micPermission: 'Microphone permission is required for voice input',
      recordingError: 'Error recording voice input',
    },
    buttons: {
      next: 'Next',
      previous: 'Back',
      submit: 'Submit',
      getCurrentLocation: 'Use My Location',
      uploadImage: 'Upload Image'
    },
    labels: {
      cod: 'Accept Cash on Delivery (COD)',
      terms: 'I agree to the Terms and Conditions',
      bankDetails: 'Add Bank Account Details (Optional)',
      locationFetch: 'Getting your location...',
    },
    progress: 'Step %s of %s',
    agreement: 'By accepting this agreement, you confirm that:\n\n1. All information provided is correct\n2. You will provide quality products/services\n3. You will maintain fair prices\n4. You will follow all local business rules',
    categories: {
      groceries: 'groceries',
      vegetables: 'vegetables',
      fruits: 'fruits',
      dairy: 'dairy',
      meat: 'meat',
      bakery: 'bakery',
      snacks: 'snacks',
      beverages: 'beverages',
      household: 'household',
      other: 'other'
    },
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
      fullName: 'अपना पूरा नाम लिखें',
      mobile: 'अपना 10 अंक का मोबाइल नंबर डालें',
      password: 'कम से कम 8 अक्षर का पासवर्ड चुनें',
      confirmPassword: 'पासवर्ड दोबारा लिखें',
      aadharNumber: '12 अंक का आधार कार्ड नंबर डालें',
      shopName: 'दुकान का नाम लिखें (जरूरी नहीं)',
      address: 'पूरा पता लिखें (मकान नंबर, गली, मोहल्ला)',
      landmark: 'नजदीकी पहचान की जगह (जैसे: मंदिर, स्कूल)',
      city: 'शहर या गाँव का नाम',
      state: 'राज्य का नाम',
      pincode: '6 अंक का पिन कोड',
      upiId: 'अपना UPI आईडी डालें (जैसे: मोबाइल@upi)',
      bankAccount: 'बैंक खाता नंबर डालें (जरूरी नहीं)',
      ifscCode: 'बैंक IFSC कोड डालें (जरूरी नहीं)',
      acceptsCOD: 'मैं कैश ऑन डिलीवरी स्वीकार करूंगा/करूंगी',
      productDescription: 'आप क्या बेचते हैं? (जैसे: मी ताजी सब्जियां बेचता/बेचती हूं)',
      selectCategory: 'अपने सामान का प्रकार चुनें',
      uploadProductImage: 'अपने सामान की फोटो डालें (जरूरी नहीं)',
      customBusinessType: 'अपने व्यवसाय का प्रकार लिखें',
      businessDescription: 'अपने व्यवसाय के बारे में बताएं (क्या बेचते हैं?)',
      acceptAgreement: 'मैं सभी नियमों का पालन करूंगा/करूंगी और अच्छी सेवा दूंगा/दूंगी',
      customCategory: 'अपने उत्पाद की श्रेणी दर्ज करें',
      voiceRecordingPlaceholder: 'आवाज रिकॉर्डिंग की गई है। संपादित करने के लिए टैप करें।',
    },
    errors: {
      required: 'यह फ़ील्ड आवश्यक है',
      invalidEmail: 'कृपया वैध ईमेल दर्ज करें',
      invalidMobile: 'कृपया वैध मोबाइल नंबर दर्ज करें',
      passwordMismatch: 'पासवर्ड मेल नहीं खाते',
      invalidGST: 'कृपया वैध जीएसटी नंबर दर्ज करें',
      invalidPAN: 'कृपया वैध पैन नंबर दर्ज करें',
      invalidPincode: 'कृपया वैध पिन कोड दर्ज करें',
      invalidAadhar: 'कृपया वैध 12-अंक आधार कार्ड नंबर दर्ज करें',
      paymentMethodRequired: 'कृपया कम से कम एक भुगतान विधि चुनें',
      invalidUPI: 'कृपया सही UPI ID दर्ज करें',
      uploadFailed: 'फ़ोटो अपलोड नहीं हो सका',
      locationPermission: 'लोकेशन की अनुमति आवश्यक है',
      locationError: 'लोकेशन प्राप्त करने में त्रुटि',
      payment: 'कृपया कम से कम एक भुगतान विधि चुनें',
      agreementRequired: 'आपको इस समझौते को स्वीकार करने की आवश्यकता है',
      productImageRequired: 'उत्पाद की फोटो जरूरी है',
      customCategoryRequired: 'कृपया अपने उत्पाद की श्रेणी दर्ज करें',
      micPermission: 'वॉइस इनपुट के लिए माइक्रोफ़ोन की अनुमति आवश्यक है',
      recordingError: 'वॉइस इनपुट रिकॉर्ड करने में त्रुटि',
    },
    buttons: {
      next: 'अगला',
      previous: 'पिछला',
      submit: 'जमा करें',
      getCurrentLocation: 'वर्तमान स्थान प्राप्त करें',
      uploadImage: 'फोटो अपलोड करें'
    },
    labels: {
      cod: 'कैश ऑन डिलीवरी स्वीकार करें',
      terms: 'मैं नियम और शर्तों से सहमत हूं',
      bankDetails: 'बैंक खाता विवरण जोड़ें (वैकल्पिक)',
      locationFetch: 'आपका स्थान प्राप्त किया जा रहा है...',
    },
    progress: 'चरण %s में से %s',
    agreement: 'इस समझौते को स्वीकार करके, आप पुष्टि करते हैं कि:\n\n1. दी गई सभी जानकारी सही है\n2. आप अच्छी क्वालिटी के प्रोडक्ट/सेवाएं देंगे\n3. आप उचित कीमत रखेंगे\n4. आप सभी स्थानीय व्यापार नियमों का पालन करेंगे',
    categories: {
      groceries: 'किराना सामान',
      vegetables: 'सब्जियां',
      fruits: 'फल',
      dairy: 'डेयरी उत्पाद',
      meat: 'मांस',
      bakery: 'बेकरी',
      snacks: 'नाश्ता',
      beverages: 'पेय पदार्थ',
      household: 'घरेलू सामान',
      other: 'अन्य'
    },
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
      fullName: 'तुमचे संपूर्ण नाव लिहा',
      mobile: 'तुमचा 10 अंकी मोबाईल नंबर टाका',
      email: "ईमेल पत्ता",
      password: 'किमान 8 अक्षरांचा पासवर्ड निवडा',
      confirmPassword: 'पासवर्ड पुन्हा लिहा',
      businessName: "व्यवसायाचे नाव",
      businessType: "व्यवसायाचा प्रकार",
      gstNumber: "जीएसटी क्रमांक",
      panNumber: "पૅन क्रमांक",
      address: 'पूर्ण पत्ता लिहा (घर क्रमांक, रस्ता, भाग)',
      landmark: 'जवळच्या ओळखीचे ठिकाण (उदा: मंदिर, शाळा)',
      city: 'शहर किंवा गावाचा नाव',
      state: 'राज્યનું नाव',
      pincode: '6 अंकी पिन कोड',
      bankName: "बँकेचे नाव",
      accountNumber: "खाते क्रमांक",
      ifscCode: 'बँक IFSC कोड टाका (ऐच्छिक)',
      accountHolderName: "खातेदाराचे नाव",
      uploadGST: "जीएसटી सर્ટिफिकેટ अपलोड करा",
      uploadPAN: "पેન कार्ड अपलोड करा",
      uploadAadhaar: "आधार कार्ड अपलोड करा",
      uploadShopLicense: "दુકાન લાઇસન્સ अपलोड करा",
      aadharNumber: '12 अंकी आधार कार्ड नंबर टाका',
      customBusinessType: 'तुमच्या व्यवसायाचा प्रकार लिहा',
      businessDescription: 'तुमच्या व्यवसाय वિશે જણાવો (શું વેચો છો?)',
      upiId: 'तुमचा UPI आयडી टाका (उदा: मोબાઇલ@upi)',
      bankAccount: 'बેંક एકાઉન્ટ નંબર લખો (વૈકલ્પિક)',
      acceptsCOD: 'मी कॅश ऑन डિલિવરી स्वીકારીશ',
      productDescription: 'तुम्ही काय वેચો છો? (उदा: मी ताजી भाजी वેચું છું)',
      selectCategory: 'तुमच्या वस्तूंचा प्रकार निवडा',
      uploadProductImage: 'तुमच्या वस्तुंचा फोटो मૂકો (ऐच्छिक)',
      acceptAgreement: 'मी सर्व नियमોનું पालन करेन आणि चांगली सेवा देईन'
    },
    errors: {
      required: "हे क्षेत्र आवश्यक आहे",
      invalidEmail: "कृपया वैध ईमेल प्रविष्ट करा",
      invalidMobile: "कृपया वैध मोબाईल नंबर प्रविष्ट करा",
      passwordMismatch: "पासवर्ड जुळत नाहीत",
      invalidGST: "कृपया वैध जीएसटी क्रमांक प्रविष्ट करा",
      invalidPAN: "कृपया वैध पૅन क्रमांक प्रविष्ट करा",
      invalidPincode: "कृपया वैध पिन कोड प्रविष्ट करा",
      invalidAadhar: "कृपया वैध 12-अंक आधार कार्ड नंबर दर्ज करें",
      productImageRequired: 'उत्पादनाचा फोटो आवश्यक आहे',
      customCategoryRequired: 'कृपया तुमच्या उत्पादनाची श्रेणी टाका',
    },
    buttons: {
      next: "पुढे",
      previous: "मागे",
      submit: "सबमिट करा",
      getCurrentLocation: "वर्तमान स्थान मिळवा"
    },
    progress: 'चरण %s पैकी %s',
    agreement: 'हा करार स्वीकारून, तुम्ही पुष्टी करता की:\n\n1. दिलेली सर्व माहिती सत्य आहे\n2. तुम्ही चांगल्या दर्जाचे प्रॉडक्ट/सेवा द्याल\n3. तुम्ही यોग्य किंमत ठेवाल\n4. तुम्ही सर्व स्थानिक व्यवसाय नियमांचे पालन कराल',
    categories: {
      groceries: 'किराणा सामान',
      vegetables: 'भाज्या',
      fruits: 'फळे',
      dairy: 'दूध उत्पादनો',
      meat: 'मांस',
      bakery: 'बेकरी',
      snacks: 'नाश्ता',
      beverages: 'पेय',
      household: 'घरगुती सामान',
      other: 'इतर'
    },
    errors: {
      paymentMethodRequired: 'कृपया किमान एक पेमेंट पद्धत निवडा',
      invalidUPI: 'कृपया वैध UPI ID टाका',
      uploadFailed: 'फोटो अपलोड करता आला नाही',
      locationPermission: 'लोकेशन परवानगी आवश्यक आहे',
      locationError: 'लोकेशन मिळवण्यात त्रुटी'
    }
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
      fullName: 'તમારું પૂરું નામ લખો',
      mobile: 'તમારો 10 અંકનો મોબાઇલ નંબર લખો',
      email: "ઇમેઇલ એડ્રેસ",
      password: 'ઓછામાં ઓછા 8 અક્ષરનો પાસવર્ડ પસંદ કરો',
      confirmPassword: 'પાસવર્ડ ફરીથી લખો',
      businessName: "વ્યવસાયનું નામ",
      businessType: "વ્યવસાયનો પ્રકાર",
      gstNumber: "જીએસટી નંબર",
      panNumber: "પેન નંબર",
      address: 'પૂરું સરનામું લખો (ઘર નંબર, શેરી, વિસ્તાર)',
      landmark: 'નજીકની ઓળખનું સ્થળ (દા.ત.: મંદિર, શાળા)',
      city: 'શહેર અથવા ગાવનું નામ',
      state: 'રાજ્યનું નામ',
      pincode: '6 અંકનો પિન કોડ',
      bankName: "બેંકનું નામ",
      accountNumber: "ખાતા નંબર",
      ifscCode: "IFSC કોડ",
      accountHolderName: "ખાતાધારકનું નામ",
      uploadGST: "જીએસટી સર્ટિફિકેટ અપલોડ કરો",
      uploadPAN: "પેન કાર્ડ અપલોડ કરો",
      uploadAadhaar: "આધાર કાર્ડ અપલોડ કરો",
      uploadShopLicense: "દુકાન લાઇસન્સ અપલોડ કરો",
      aadharNumber: '12 અંકનો આધાર કાર્ડ નંબર લખો',
      shopName: 'દુકાનનું નામ(વૈકલ્પિક)',
      customBusinessType: 'તમારા વ્યવસાયનો પ્રકાર લખો',
      businessDescription: 'તમારા વ્યવસાય વિશે જણાવો (શું વેચો છો?)',
      upiId: 'તમારો UPI આઈડી લખો (દા.ત.: મોબાઇલ@upi)',
      bankAccount: 'બેંક એકાઉન્ટ નંબર લખો (વૈકલ્પિક)',
      acceptsCOD: 'હું કેશ ઓન ડિલિવરી સ્વીકારીશ',
      productDescription: 'તમે શું વેચો છો? (દા.ત.: હું તાજી શાકભાજી વેચું છું)',
      selectCategory: 'તમારી વસ્તુઓનો પ્રકાર પસંદ કરો',
      uploadProductImage: 'તમારી વસ્તુઓનો ફોટો મૂકો (વૈકલ્પિક)',
      acceptAgreement: 'હું બધા નિયમોનું પાલન કરીશ અને સારી સેવા આપીશ'
    },
    errors: {
      required: "આ ફીલ્ડ જરૂરી છે",
      invalidEmail: "કૃપા કરી માન્ય ઇમેઇલ દાખલ કરો",
      invalidMobile: "કૃપા કરી માન્ય મોબાઇલ નંબર દાખલ કરો",
      passwordMismatch: "પાસવર્ડ મેળ ખાતા નથી",
      invalidGST: "કૃપા કરી માન્ય જીએસટી નંબર દાખલ કરો",
      invalidPAN: "કૃપા કરી માન્ય પેન નંબર દાખલ કરો",
      invalidPincode: "કૃપા કરી માન્ય પિન કોડ દાખલ કરો",
      invalidAadhar: "કૃપા કરી માન્ય 12-અંક આધાર કાર્ડ નંબર દાખલ કરો",
      productImageRequired: 'ઉત્પાદનનો ફોટો જરૂરી છે',
      customCategoryRequired: 'કૃપા કરી તમારા ઉત્પાદનની શ્રેણી દાખલ કરો',
    },
    buttons: {
      next: "આગળ",
      previous: "પાછળ",
      submit: "સબમિટ કરો",
      getCurrentLocation: "વર્તમાન સ્થાન મેળવો"
    },
    progress: 'સ્ટેપ %s માંથી %s',
    agreement: 'આ કરાર સ્વીકારીને, તમે પુષ્ટિ કરો છો કે:\n\n1. આપેલી બધી માહિતી સાચી છે\n2. તમે સારી ગુણવત્તાની પ્રોડક્ટ/સેવાઓ આપશો\n3. તમે યોગ્ય ભાવ રાખશો\n4. તમે બધા સ્થાનિક વ્યાપાર નિયમોનું પાલન કરશો',
    categories: {
      groceries: 'કિરાણા સામાન',
      vegetables: 'શાકભાજી',
      fruits: 'ફળો',
      dairy: 'ડેરી ઉત્પાદનો',
      meat: 'માંસ',
      bakery: 'બેકરી',
      snacks: 'નાસ્તો',
      beverages: 'પીણાં',
      household: 'ઘરવપરાશની વસ્તુઓ',
      other: 'અન્ય'
    },
    errors: {
      paymentMethodRequired: 'કૃપા કરી ઓછામાં ઓછી એક પેમેન્ટ પદ્ધતિ પસંદ કરો',
      invalidUPI: 'કૃપા કરી માન્ય UPI ID દાખલ કરો',
      uploadFailed: 'ફોટો અપલોડ કરી શકાયો નથી',
      locationPermission: 'લોકેશન પરમિશન જરૂરી છે',
      locationError: 'લોકેશન મેળવવામાં ભૂલ'
    }
  },
};

const businessTypes = [
  {
    id: 'farmer',
    icon: '🌾',
    title: {
      en: 'Farmer/Vendor',
      hi: 'किसान/विक्रेता',
      mr: 'शेतकरी/विक्रेता',
      gu: 'ખેડૂત/વિક્રેતા',
    },
    subtitle: {
      en: 'Vegetables, Fruits, Grains, etc.',
      hi: 'सब्जियां, फल, अनाज, आदि',
      mr: 'भाज्या, फळे, धान्य, इ.',
      gu: 'શાકભાજી, ફળો, અનાજ, વગેરે',
    },
    categories: ['vegetables', 'fruits', 'grains', 'dairy']
  },
  {
    id: 'grocery',
    icon: '🏪',
    title: {
      en: 'Grocery Store',
      hi: 'किराना स्टोर',
      mr: 'किराणा दुकान',
      gu: 'કિરાણા સ્ટોર',
    },
    subtitle: {
      en: 'Daily needs, Household items',
      hi: 'दैनिक जरूरतें, घरेलू सामान',
      mr: 'दैनंदिन गरजा, घरगुती वस्तू',
      gu: 'રોજિંદી જરૂરિયાતો, ઘરવપરાશની વસ્તુઓ',
    },
    categories: ['grocery', 'household', 'personalcare']
  },
  {
    id: 'food',
    icon: '🍱',
    title: {
      en: 'Food Business',
      hi: 'खाद्य व्यवसाय',
      mr: 'खाद्य व्यवसाय',
      gu: 'ફૂડ બિઝનેસ',
    },
    subtitle: {
      en: 'Restaurant, Tiffin, Catering',
      hi: 'रेस्टोरेंट, टिफिन, केटरिंग',
      mr: 'रेस्टॉरंट, डबा, केटरिंग',
      gu: 'રેસ્ટોરન્ટ, ટિફિન, કેટરિંગ',
    },
    categories: ['restaurant', 'tiffin', 'catering', 'snacks']
  },
  {
    id: 'homemade',
    icon: '🏠',
    title: {
      en: 'Home Business',
      hi: 'घरेलू व्यवसाय',
      mr: 'गृह व्यवसाय',
      gu: 'ઘર વ્યવસાય',
    },
    subtitle: {
      en: 'Homemade Products, Handicrafts',
      hi: 'घर का बना सामान, हस्तशिल्प',
      mr: 'घरगुती उत्पादने, हस्तकला',
      gu: 'ઘરેલું ઉત્પાદનો, હસ્તકલા',
    },
    categories: ['homemade', 'handicrafts', 'art']
  },
  {
    id: 'other',
    icon: '📦',
    title: {
      en: 'Other Business',
      hi: 'अन्य व्यवसाय',
      mr: 'इतर व्यवसाय',
      gu: 'અન્ય વ્યવસાય',
    },
    subtitle: {
      en: 'Specify your business type',
      hi: 'अपना व्यवसाय बताएं',
      mr: 'तुमचा व्यवसाय नमूद करा',
      gu: 'તમારો વ્યવસાય જણાવો',
    },
    categories: ['other']
  }
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
    gstDocument: null,
    panDocument: null,
    shopLicenseDocument: null,
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

  const validateStep3 = () => {
    const errors = {};
    if (!formData.aadharNumber || formData.aadharNumber.length !== 12) {
      errors.aadharNumber = translations[language].errors.invalidAadhar;
    }
    return errors;
  };

  const validateStep4 = () => {
    const errors = {};
    if (!formData.address) {
      errors.address = translations[language].errors.required;
    }
    if (!formData.city) {
      errors.city = translations[language].errors.required;
    }
    if (!formData.pincode || !/^[0-9]{6}$/.test(formData.pincode)) {
      errors.pincode = translations[language].errors.invalidPincode;
    }
    return errors;
  };

  const validateStep5 = () => {
    const errors = {};
    if (!formData.upiId && !formData.acceptsCod) {
      errors.payment = translations[language].errors.paymentMethodRequired;
    }
    if (formData.upiId && !/^[\w.-]+@[\w.-]+$/.test(formData.upiId)) {
      errors.upiId = translations[language].errors.invalidUPI;
    }
    return errors;
  };

  const validateStep6 = () => {
    const errors = {};
    if (!formData.productDescription) {
      errors.productDescription = translations[language].errors.required;
    }
    if (!formData.productImage) {
      errors.productImage = translations[language].errors.productImageRequired;
    }
    if (formData.selectedCategories?.includes('other') && !formData.customCategory) {
      errors.customCategory = translations[language].errors.customCategoryRequired;
    }
    return errors;
  };

  const validateStep7 = () => {
    const errors = {};
    if (!formData.agreementAccepted) {
      errors.agreement = translations[language].errors.agreementRequired;
    }
    return errors;
  };

  const handleNext = () => {
    let errors = {};
    switch (currentStep) {
      case 1:
        errors = validateStep1();
        break;
      case 2:
        errors = validateStep2();
        break;
      case 3:
        errors = validateStep3();
        break;
      case 4:
        errors = validateStep4();
        break;
      case 5:
        errors = validateStep5();
        break;
      case 6:
        errors = validateStep6();
        break;
      case 7:
        errors = validateStep7();
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

  const handleDocumentUpload = async (type) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const documentUri = result.assets[0].uri;
        setFormData(prev => ({
          ...prev,
          [`${type}Document`]: documentUri
        }));
      }
    } catch (error) {
      console.error('Document upload error:', error);
      Alert.alert(
        'Upload Failed',
        translations[language].errors.uploadFailed
      );
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(translations[language].errors.locationPermission);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const response = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });

      if (response[0]) {
        const address = response[0];
        setFormData(prev => ({
          ...prev,
          address: `${address.street || ''} ${address.name || ''}`.trim(),
          landmark: address.district || '',
          city: address.city || '',
          pincode: address.postalCode || ''
        }));
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(translations[language].errors.locationError);
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
      
      {formData.businessType === 'other' && (
        <View style={styles.customBusinessContainer}>
          <TextInput
            style={[styles.input, styles.customBusinessInput]}
            placeholder={translations[language].fields.customBusinessType}
            value={formData.customBusinessType}
            onChangeText={(text) => setFormData(prev => ({ ...prev, customBusinessType: text }))}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={translations[language].fields.businessDescription}
            value={formData.businessDescription}
            onChangeText={(text) => setFormData(prev => ({ ...prev, businessDescription: text }))}
            multiline
            numberOfLines={3}
          />
        </View>
      )}
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{translations[language].steps[3]}</Text>
      <View style={styles.inputGroup}>
        <TextInput
          style={styles.input}
          placeholder={translations[language].fields.aadharNumber}
          value={formData.aadharNumber}
          onChangeText={(text) => {
            const numericValue = text.replace(/[^0-9]/g, '');
            if (numericValue.length <= 12) {
              setFormData(prev => ({ ...prev, aadharNumber: numericValue }));
            }
          }}
          keyboardType="numeric"
          maxLength={12}
        />
        <TextInput
          style={styles.input}
          placeholder={translations[language].fields.shopName}
          value={formData.shopName}
          onChangeText={(text) => setFormData(prev => ({ ...prev, shopName: text }))}
        />
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{translations[language].steps[4]}</Text>
      <TouchableOpacity 
        style={styles.locationButton}
        onPress={getCurrentLocation}
      >
        <Text style={styles.locationButtonText}>
          {translations[language].buttons.getCurrentLocation}
        </Text>
      </TouchableOpacity>
      <View style={styles.inputGroup}>
        <TextInput
          style={styles.input}
          placeholder={translations[language].fields.address}
          value={formData.address}
          onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
          multiline
        />
        <TextInput
          style={styles.input}
          placeholder={translations[language].fields.landmark}
          value={formData.landmark}
          onChangeText={(text) => setFormData(prev => ({ ...prev, landmark: text }))}
        />
        <TextInput
          style={styles.input}
          placeholder={translations[language].fields.city}
          value={formData.city}
          onChangeText={(text) => setFormData(prev => ({ ...prev, city: text }))}
        />
        <TextInput
          style={styles.input}
          placeholder={translations[language].fields.pincode}
          value={formData.pincode}
          onChangeText={(text) => {
            const numericValue = text.replace(/[^0-9]/g, '');
            if (numericValue.length <= 6) {
              setFormData(prev => ({ ...prev, pincode: numericValue }));
            }
          }}
          keyboardType="numeric"
          maxLength={6}
        />
      </View>
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{translations[language].steps[5]}</Text>
      <View style={styles.paymentContainer}>
        <View style={styles.paymentOption}>
          <View style={styles.paymentHeader}>
            <Ionicons name="phone-portrait-outline" size={24} color="#4CAF50" />
            <Text style={styles.paymentTitle}>UPI Payment</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder={translations[language].fields.upiId}
            value={formData.upiId}
            onChangeText={(text) => setFormData(prev => ({ ...prev, upiId: text }))}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.paymentOption}>
          <View style={styles.paymentHeader}>
            <Ionicons name="cash-outline" size={24} color="#4CAF50" />
            <Text style={styles.paymentTitle}>Cash on Delivery</Text>
          </View>
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={[styles.checkbox, formData.acceptsCod && styles.checkboxChecked]}
              onPress={() => setFormData(prev => ({ ...prev, acceptsCod: !prev.acceptsCod }))}
            >
              {formData.acceptsCod && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>{translations[language].fields.acceptsCOD}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.bankDetailsButton}
          onPress={() => setFormData(prev => ({ ...prev, showBankDetails: !prev.showBankDetails }))}
        >
          <Ionicons name="business-outline" size={24} color="#6C63FF" />
          <Text style={styles.bankDetailsButtonText}>{translations[language].fields.bankAccount}</Text>
          <Ionicons 
            name={formData.showBankDetails ? "chevron-up" : "chevron-down"} 
            size={24} 
            color="#6C63FF" 
          />
        </TouchableOpacity>

        {formData.showBankDetails && (
          <View style={styles.bankDetailsContainer}>
            <TextInput
              style={styles.input}
              placeholder={translations[language].fields.bankAccount}
              value={formData.bankAccount}
              onChangeText={(text) => setFormData(prev => ({ ...prev, bankAccount: text }))}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder={translations[language].fields.ifscCode}
              value={formData.ifscCode}
              onChangeText={(text) => setFormData(prev => ({ ...prev, ifscCode: text.toUpperCase() }))}
              autoCapitalize="characters"
            />
          </View>
        )}
      </View>
    </View>
  );

  const renderStep6 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{translations[language].steps[6]}</Text>
      <View style={styles.inputGroup}>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={translations[language].fields.productDescription}
          value={formData.productDescription}
          onChangeText={(text) => setFormData(prev => ({ ...prev, productDescription: text }))}
          multiline
          numberOfLines={3}
        />

        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>{translations[language].fields.selectCategory}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
            {productCategories.map((category) => (
              <TouchableOpacity
                key={category.value}
                style={[
                  styles.categoryChip,
                  formData.selectedCategories?.includes(category.value) && styles.selectedCategoryChip
                ]}
                onPress={() => {
                  const selected = formData.selectedCategories || [];
                  const newSelected = selected.includes(category.value)
                    ? selected.filter(c => c !== category.value)
                    : [category.value];
                  setFormData(prev => ({ ...prev, selectedCategories: newSelected }));
                }}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={styles.categoryText}>
                  {translations[language].categories[category.value]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {formData.selectedCategories?.includes('other') && (
          <TextInput
            style={styles.input}
            placeholder={translations[language].fields.customCategory}
            value={formData.customCategory}
            onChangeText={(text) => setFormData(prev => ({ ...prev, customCategory: text }))}
          />
        )}

        <TouchableOpacity 
          style={styles.uploadButton}
          onPress={() => handleDocumentUpload('product')}
        >
          <Ionicons name="camera-outline" size={24} color="#666" />
          <Text style={styles.uploadButtonText}>
            {translations[language].fields.uploadProductImage}*
          </Text>
        </TouchableOpacity>

        {formData.productImage && (
          <View style={styles.imagePreviewContainer}>
            <Image 
              source={{ uri: formData.productImage }} 
              style={styles.previewImage}
            />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => setFormData(prev => ({ ...prev, productImage: null }))}
            >
              <Ionicons name="close-circle" size={24} color="#FF4444" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  const renderStep7 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{translations[language].steps[7]}</Text>
      <View style={styles.agreementContainer}>
        <Text style={styles.agreementText}>
          {translations[language].agreement}
        </Text>
        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={[styles.checkbox, formData.agreementAccepted && styles.checkboxChecked]}
            onPress={() => setFormData(prev => ({ ...prev, agreementAccepted: !prev.agreementAccepted }))}
          >
            {formData.agreementAccepted && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
          <Text style={styles.checkboxLabel}>{translations[language].fields.acceptAgreement}</Text>
        </View>
      </View>
    </View>
  );

  // Update product categories array by removing meat
  const productCategories = [
    { value: 'groceries', icon: '🛒' },
    { value: 'vegetables', icon: '🥬' },
    { value: 'fruits', icon: '🍎' },
    { value: 'dairy', icon: '��' },
    { value: 'bakery', icon: '🥖' },
    { value: 'snacks', icon: '🍿' },
    { value: 'beverages', icon: '🥤' },
    { value: 'household', icon: '🧹' },
    { value: 'other', icon: '📦' },
  ];

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
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}
        {currentStep === 6 && renderStep6()}
        {currentStep === 7 && renderStep7()}
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
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderStyle: 'dashed',
    padding: 16,
    marginTop: 8,
    justifyContent: 'center',
    gap: 8,
  },
  uploadButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  locationButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  locationButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#666',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginTop: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#6C63FF',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  picker: {
    height: 50,
  },
  agreementContainer: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  agreementText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 16,
  },
  customBusinessContainer: {
    marginTop: 16,
    gap: 16,
  },
  customBusinessInput: {
    backgroundColor: '#F8F9FA',
  },
  paymentContainer: {
    gap: 20,
  },
  paymentOption: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  bankDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0EEFF',
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  bankDetailsButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#6C63FF',
    fontWeight: '600',
  },
  bankDetailsContainer: {
    gap: 16,
    paddingTop: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  selectedCategoryChip: {
    backgroundColor: '#F0EEFF',
    borderColor: '#6C63FF',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
  },
  pickerLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  imagePreviewContainer: {
    position: 'relative',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
});

export default SellerRegistrationScreen; 