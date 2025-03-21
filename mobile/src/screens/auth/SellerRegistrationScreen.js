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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import * as Location from 'expo-location';
import { RadioButton } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import Voice from '@react-native-voice/voice';
import { sellerApi } from '../../api/sellerApi';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Translations object
const translations = {
  en: {
    steps: {
      1: 'User Identity Verification',
      2: 'Business Type Selection',
      3: 'Business Verification',
      4: 'Address Details',
      5: 'Product Details',
      6: 'Profile Photo',
      7: 'Terms & Conditions'
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
      agreementText: 'Speak or type your agreement response...',
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
      voiceInputError: 'Failed to recognize speech. Please try again.',
      fullName: 'Please enter your full name',
      mobile: 'Please enter a valid 10-digit mobile number',
      password: 'Password must be at least 8 characters',
      passwordMatch: 'Passwords do not match',
      businessType: 'Please select a business type',
      customBusinessType: 'Please specify your business type',
      aadhar: 'Please enter a valid 12-digit Aadhaar number',
      address: 'Please enter your address',
      city: 'Please enter your city/village',
      pincode: 'Please enter a valid 6-digit pincode',
      state: 'Please enter your state',
      productCategory: 'Please select at least one product category',
      productDescription: 'Please describe your product',
      productImage: 'Please upload at least one product image',
      agreement: 'Please accept the terms and conditions'
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
      terms: 'I agree to follow all terms and conditions',
      bankDetails: 'Add Bank Account Details (Optional)',
      locationFetch: 'Getting your location...',
    },
    progress: 'Step %s of %s',
    agreement: {
      title: 'Terms and Conditions',
      content: `1. Seller Responsibilities:
- Provide accurate and truthful information about products
- Maintain quality standards for all products
- Process orders promptly and professionally
- Maintain cleanliness and hygiene standards
- Follow all local regulations and guidelines

2. Product Guidelines:
- List only permitted products
- Provide accurate product descriptions and images
- Maintain fresh inventory for perishable items
- Follow proper storage guidelines
- Display clear pricing

3. Order Fulfillment:
- Accept orders only when you can fulfill them
- Maintain promised delivery times
- Package products safely and hygienically
- Provide proper bills/invoices
- Handle customer complaints professionally

4. Platform Rules:
- Maintain active communication
- Keep your shop information updated
- Follow platform pricing guidelines
- Maintain good customer ratings
- Cooperate with platform support team

5. Quality Assurance:
- Regular quality checks of products
- Proper storage of items
- Clean packaging materials
- Fresh and quality products only
- Handle customer feedback positively`,
      acceptTerms: 'I agree to follow all terms and conditions'
    },
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
    productSection: {
      title: 'Product Photos',
      description: 'Upload photos of your products to attract customers',
      addPhotos: 'Add Product Photos',
      maxPhotos: '(Maximum 5 photos)',
      tip: 'Tip: Clear, well-lit photos help customers better understand your products'
    },
    profileSection: {
      title: 'Profile Photo',
      description: 'Add your profile photo to build trust with customers',
      addPhoto: 'Add Profile Photo',
      optional: '(Optional but recommended)',
      changePhoto: 'Change Photo',
      remove: 'Remove',
      tip: 'Tip: A professional profile photo helps build customer trust'
    }
  },
  hi: {
    steps: {
      1: 'पहचान सत्यापन',
      2: 'व्यवसाय का प्रकार',
      3: 'व्यवसाय सत्यापन',
      4: 'पता विवरण',
      5: 'उत्पाद विवरण',
      6: 'प्रोफाइल फोटो',
      7: 'नियम और शर्तें'
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
      agreementText: 'अपनी सहमति बोलें या टाइप करें...',
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
      voiceInputError: 'आवाज को पहचानने में विफल। कृपया पुनः प्रयास करें।',
      fullName: 'कृपया अपना पूरा नाम दर्ज करें',
      mobile: 'कृपया 10 अंकों का सही मोबाइल नंबर दर्ज करें',
      password: 'पासवर्ड कम से कम 8 अक्षर का होना चाहिए',
      passwordMatch: 'पासवर्ड मेल नहीं खाते',
      businessType: 'कृपया व्यवसाय का प्रकार चुनें',
      customBusinessType: 'कृपया अपना व्यवसाय बताएं',
      aadhar: 'कृपया 12 अंकों का सही आधार नंबर दर्ज करें',
      address: 'कृपया अपना पता दर्ज करें',
      city: 'कृपया अपने शहर/गांव का नाम दर्ज करें',
      pincode: 'कृपया 6 अंकों का सही पिन कोड दर्ज करें',
      state: 'कृपया अपने राज्य का नाम दर्ज करें',
      productCategory: 'कृपया कम से कम एक उत्पाद श्रेणी चुनें',
      productDescription: 'कृपया अपने उत्पाद का विवरण दें',
      productImage: 'कृपया कम से कम एक उत्पाद फોटો अपलोड करें',
      agreement: 'कृपया नियम और शर्तें स्वीकार करें'
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
      terms: 'मैं सभी नियमों और शर्तों का पालन करने के लिए सहमत हूं',
      bankDetails: 'बैंक खाता विवरण जोड़ें (वैकल्पिक)',
      locationFetch: 'आपका स्थान प्राप्त किया जा रहा है...',
    },
    progress: 'चरण %s में से %s',
    agreement: {
      title: 'नियम और शर्तें',
      content: `1. विक्रेता की जिम्मेदारियां:
- उत्पादों के बारे में सटीक और सच्ची जानकारी प्रदान करें
- सभी उत्पादों के लिए गुणवत्ता मानकों को बनाए रखें
- ऑर्डर को तुरंत और पेशेवर तरीके से प्रोसेस करें
- स्वच्छता और साफ-सफाई के मानकों को बनाए रखें
- सभी स्थानीय नियमों और दिशानिर्देशों का पालन करें

2. उत्पाद दिशानिर्देश:
- केवल अनुमत उत्पादों को सूचीबद्ध करें
- सटीक उत्पाद विवरण और छवियां प्रदान करें
- नाशवान वस्तुओं के लिए ताजी इन्व्हेंट्री बनाए रखें
- उचित भंडारण दिशानिर्देशों का पालन करें
- स्पष्ट मूल्य निर्धारण प्रदर्शित करें

3. ऑर्डर पूर्ति:
- ऑर्डर केवल तभी स्वीकार करें जब आप उन्हें पूरा कर सकें
- वादा किए गए डिलीवरी समय को बनाए रखें
- उत्पादों को सुरक्षित और स्वच्छ तरीके से पैक करें
- उचित बिल/चालान प्रदान करें
- ग्राहक शिकायतों को पेशेवर तरीके से संभालें

4. प्लेटफॉर्म नियम:
- सक्रिय संचार बनाए रखें
- अपनी दुकान की जानकारी अपडेट रखें
- प्लेटफॉर्म मूल्य निर्धारण दिशानिर्देशों का पालन करें
- अच्छी ग्राहक रेटिंग बनाए रखें
- प्लेटफॉर्म सपोर्ट टीम के साथ सहयोग करें

5. गुणवत्ता आश्वासन:
- उत्पादों की नियमित गुणवत्ता जांच
- वस्तुओं का उचित भंडारण
- स्वच्छ पैकेजिंग सामग्री
- केवल ताजी और गुणवत्तापूर्ण उत्पाद
- ग्राहक प्रतिक्रिया को सकारात्मक रूप से संभालें`,
      acceptTerms: 'मैं सभी नियमों और शर्तों का पालन करने के लिए सहमत हूं'
    },
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
    productSection: {
      title: 'उत्पाद फोटो',
      description: 'ग्राहकों को आकर्षित करने के लिए अपने उत्पादों की फोटो अपलोड करें',
      addPhotos: 'उत्पाद फोटो जोड़ें',
      maxPhotos: '(अधिकतम 5 फोटो)',
      tip: 'टिप: साफ और अच्छी रोशनी वाली फोटो ग्राहकों को आपके उत्पादों को बेहतर समझने में मदद करती हैं'
    },
    profileSection: {
      title: 'प्रोफाइल फोटो',
      description: 'ग्राहकों का विश्वास बनाने के लिए अपनी प्रोफाइल फोटो जोड़ें',
      addPhoto: 'प्रोफाइल फोटो जोड़ें',
      optional: '(वैकल्पिक लेकिन अनुशंसित)',
      changePhoto: 'फोटो बदलें',
      remove: 'हटाएं',
      tip: 'टिप: एक पेशेवर प्रोफाइल फोटो ग्राहक विश्वास बनाने में मदद करती है'
    }
  },
  mr: {
    steps: {
      1: "मूलभूत माहिती",
      2: "व्यवसाय प्रकार",
      3: "व्यवसाय पडताळणी",
      4: "पत्ता तपशील",
      5: "उत्पादन तपशील",
      6: "प्रोफाइल फोटो",
      7: "नियम आणि अटी"
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
      state: 'राज्याचे नाव',
      pincode: '6 अंकी पिन कोड',
      bankName: "बँकेचे नाव",
      accountNumber: "खाते क्रमांक",
      ifscCode: 'बँक IFSC कोड टाका (ऐच्छिक)',
      accountHolderName: "खातेदाराचे नाव",
      uploadGST: "जीएसटી सर्ટિફિકેટ अपलोड करा",
      uploadPAN: "पેન कार्ड अपलोड करा",
      uploadAadhaar: "आधार कार्ड अपलोड करा",
      uploadShopLicense: "दુકાન લાઇસન્સ अपलोड करा",
      aadharNumber: '12 अंकी आधार कार्ड नंबर टाका',
      shopName: 'दुकानाचे नाव(ऐच्छिक)',
      customBusinessType: 'तुमच्या व्यवसायाचा प्रकार लिहा',
      businessDescription: 'आम्हाला तुमच्या व्यवसायाबद्दल सांगा (तुम्ही काय विकता?)',
      upiId: 'तुमचा UPI आयडી टाका (उदा: मोબાઇલ@upi)',
      bankAccount: 'बएંક એકાઉન્ટ નંબર લખો (વૈકલ્પિક)',
      acceptsCOD: 'मी कॅश ऑन डિલિવરી स्वીકારીશ',
      productDescription: 'तुम्ही काय वેચો છો? (उदा: मी ताज्या भाज्या वેચું છું)',
      selectCategory: 'तुमच्या वस्तूंचा प्रकार निवडा',
      uploadProductImage: 'तुमच्या वस्तूंचा फोटो पोस्ट करा (पर्यायी)',
      acceptAgreement: 'मी सर्व नियमांचे पालन करून चांगली सेवा देईन'
    },
    errors: {
      paymentMethodRequired: 'कૃપા કરી ઓછામાં ઓછી એક પેમેન્ટ પદ્ધતિ પસંદ કરો',
      invalidUPI: 'કૃપા કરી માન્ય UPI ID દાખલ કરો',
      uploadFailed: 'ફોટો અપલોડ કરી શકાયો નથી',
      locationPermission: 'લોકેશન પરમિશન જરૂરી છે',
      locationError: 'લોકેશન મેળવવામાં ભૂલ'
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
      terms: 'मैं सभी नियमों और शर्तों का पालन करने के लिए सहमत हूं',
      bankDetails: 'बैंक खाता विवरण जोड़ें (वैकल्पिक)',
      locationFetch: 'आपका स्थान प्राप्त किया जा रहा है...',
    },
    progress: 'चरण %s में से %s',
    agreement: {
      title: "नियम आणि अटी",
      content: `1. विक्रेत्याच्या जबाबदाऱ्या:
- उत्पादनांबद्दल अचूक आणि खरी माहिती द्या
- सर्व उत्पादनांसाठी गुणवत्ता मानके राखा
- ऑर्डर त्वरित आणि व्यावसायिकपणे प्रक्रिया करा
- स्वच्छता आणि आरोग्याची मानके राखा
- सर्व स्थानिक नियम आणि मार्गदर्शक तत्त्वांचे पालन करा

2. उत्पादन मार्गदर्शक तत्त्वे:
- केवळ परवानगी असलेली उत्पादने सूचीबद्ध करा
- अचूक उत्पादन वर्णन आणि प्रतिमा प्रदान करा
- नाशवंत वस्तूंसाठी ताजी इन्व्हेंटरी ठेवा
- योग्य साठवणूक मार्गदर्शक तत्त्वांचे पालन करा
- स्पष्ट किंमत दर्शवा

3. ऑर्डर पूर्तता:
- केवळ तेव्हाच ऑर्डर स्वीकारा जेव्हा तुम्ही त्या पूर्ण करू शकता
- वचन दिलेली डिलिव्हरी वेळ पाळा
- उत्पादने सुरक्षित आणि स्वच्छतेने पॅकेज करा
- योग्य बिले/चलने प्रदान करा
- ग्राहकांच्या तक्रारी व्यावसायिकपणे हाताळा

4. प्लॅटफॉर्म नियम:
- सक्रिय संवाद ठेवा
- तुमच्या दुकानाची माहिती अद्ययावत ठेवा
- प्लॅटफॉर्म किंमत मार्गदर्शक तत्त्वांचे पालन करा
- चांगली ग्राहक रेटिंग राखा
- प्लॅटफॉर्म सपोर्ट टीमशी सहकार्य करा

5. गुणवत्ता हमी:
- उत्पादनांची नियमित गुणवत्ता तपासणी
- वस्तूंची योग्य साठवण
- स्वच्छ पॅकेजिंग साहित्य
- केवळ ताजी आणि गुणवत्तापूर्ण उत्पादने
- ग्राहक प्रतिसाद सकारात्मकपणे हाताळा`,
      acceptTerms: "मी सर्व नियम आणि अटींचे पालन करण्यास सहमत आहे"
    },
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
    productSection: {
      title: 'ઉત્પાદન ફોટા',
      description: 'ગ્રાહકોને આકર્ષિત કરવા માટે તમારા ઉત્પાદનોના ફોટા અપલોડ કરો',
      addPhotos: 'ઉત્પાદન ફોટા ઉમેરો',
      maxPhotos: '(જાસ્તીત જાસ્ત 5 ફોટો)',
      tip: 'ટીપ: સ્પષ્ટ અને ચાંગલી પ્રકાશતીલ ફોટો ગ્રાહકોને તમારા ઉત્પાદનો વધુ સારી રીતે સમજવામાં મદદ કરે છે'
    },
    profileSection: {
      title: 'પ્રોફાઇલ ફોટો',
      description: 'ગ્રાહકોનો વિશ્વાસ કેળવવા માટે તમારો પ્રોફાઇલ ફોટો ઉમેરો',
      addPhoto: 'પ્રોફાઇલ ફોટો ઉમેરો',
      optional: '(વૈકલ્પિક પરંતુ ભલામણ કરેલ)',
      changePhoto: 'ફોટો બદલો',
      remove: 'દૂર કરો',
      tip: 'ટીપ: વ્યાવસાયિક પ્રોફાઇલ ફોટો ગ્રાહક વિશ્વાસ વધારવામાં મદદ કરે છે'
    }
  },
  gu: {
    steps: {
      1: "મૂળભૂત માહિતી",
      2: "સંપર્ક વિગતો",
      3: "વ્યવસાય માહિતી",
      4: "સ્થાન વિગતો",
      5: "ઉત્પાદ વિગતો",
      6: "કરાર",
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
      voiceInputError: 'બોલી ઓળખવામાં નિષ્ફળ. કૃપા કરી ફરી પ્રયાસ કરો.',
      micPermission: 'વૉઇસ ઇનપુટ માટે માઇક્રોફોન પરવાનગી જરૂરી છે.',
      fullName: 'કૃપા કરી તમારું પૂરું નામ દાખલ કરો',
      mobile: 'કૃપા કરી 10 અંકનો માન્ય મોબાઇલ નંબર દાખલ કરો',
      password: 'પાસવર્ડ ઓછામાં ઓછો 8 અક્ષરનો હોવો જોઈએ',
      passwordMatch: 'પાસવર્ડ મેળ ખાતા નથી',
      businessType: 'કૃપા કરી વ્યવસાયનો પ્રકાર પસંદ કરો',
      customBusinessType: 'કૃપા કરી તમારો વ્યવસાય જણાવો',
      aadhar: 'કૃપા કરી 12 અંકનો માન્ય આધાર નંબર દાખલ કરો',
      address: 'કૃપા કરી તમારું સરનામું દાખલ કરો',
      city: 'કૃપા કરી તમારું શહેર/ગામ દાખલ કરો',
      pincode: 'કૃપા કરી 6 અંકનો માન્ય પિનકોડ દાખલ કરો',
      state: 'કૃપા કરી તમારું રાજ્ય દાખલ કરો',
      productCategory: 'કૃપા કરી ઓછામાં ઓછી એક ઉત્પાદ શ્રેણી પસંદ કરો',
      productDescription: 'કૃપા કરી તમારા ઉત્પાદનું વર્ણન કરો',
      productImage: 'કૃપા કરી ઓછામાં ઓછો એક ઉત્પાદ ફોટો અપલોડ કરો',
      agreement: 'કૃપા કરી નિયમો અને શરતો સ્વીકારો'
    },
    buttons: {
      next: "આગળ",
      previous: "પાછળ",
      submit: "સબમિટ કરો",
      getCurrentLocation: "વર્તમાન સ્થાન મેળવો"
    },
    progress: 'સ્ટેપ %s માંથી %s',
    agreement: {
      title: 'નિયમો અને શરતો',
      content: `1. સેવાની શરતો:\n
• અમારા પ્લેટફોર્મ પર વિક્રેતા તરીકે, તમે પ્રમાણિક અને ગુણવત્તાયુક્ત ઉત્પાદનો/સેવાઓ પ્રદાન કરવા માટે સંમત થાઓ છો.
• તમારે ચોક્કસ ઇન્વેન્ટરી અને કિંમતની માહિતી જાળવീ આવશ્યક છે.
• ગ્રાહકોને સમયસર ડિલિવરી માટે તમે જવાબદાર છો.

2. ચુકવણીની શરતો:\n
• ચુકવણીની પ્રક્રિયા માસિક ધોરણે કરવામાં આવશે અને તેનું વિતરણ કરવામાં આવશે.
• ચુકવણી ચક્ર: મહિનાના 1લીથી છેલ્લા દિવસ સુધીના તમામ વેચાણની પ્રક્રિયા નીચેના મહિનાની 10મી તારીખ સુધીમાં કરવામાં આવશે.
• ચુકવણી સીધી તમારા નોંધાયેલા બેંક ખાતામાં કરવામાં આવશે.
• પ્લેટફોર્મ ફી અને લાગુ કર વર્તમાન દરો મુજબ કાપવામાં આવશે.

3. વિક્રેતાની જવાબદારીઓ:\n
• તમામ ઉત્પादનો માટે ઉચ્ચ ગુણવત્તાના ધોરણો જાળવો
• ગ્રાહકની પૂછપરછનો 24 કલાકની અંદર જવાબ આપો
• તમારી દુકાનની માહિતી અને ઇન્વેન્ટરી અપડેટ રાખો
• તમામ લાગુ સ્થાનિક અને રાષ્ટ્રીય નિયमોનું પાલन કરો

4. પ્લેટફોર્મ માર્ગદર્શિકા:\n
• ન્યૂનતમ 3.5 સ્ટાર રેટિંગ ધરાવો
• પ્લેટફોર્મ પોલિસી મુજબ રિટર્ન અને રિફંડ હેન્ડલ કરો
• ઉત્પાદનને સુરક્ષિત રાખવા માટે યોગ્ય પેકેજિંગનો ઉપયોગ કરો
• ગ્રાહકો સાથે વ્યાવસાયિક સંચાર જાળવો

5. એકાઉન્ટ સસ્પેન્શન:\n
• પ્લેટફોર્મ નીતિના ઉલ્લંઘન માટે એકાઉન્ટ્સને સસ્પેન્ડ કરવાનો અધિકાર અનામત રાખે છે
• બહુવિધ ઉલ્લંઘનોના પરિણામે ખાતું કાયમી સમાપ્ત થઈ શકે છે
• તમામ બાકી ચૂકવણીઓ મુદ્દાઓના નિરાકરણ પછી પ્રક્રિયા કરવામાં આવશે`,

 acceptTerms:'આ શરતો સ્વીકારીને, તમે ઉપર દર્શાવેલ તમામ શરતો સાથે સંમત થાઓ છો અને અમારા પ્લેટફોર્મના ગુણવત્તાના ધોરણો જાળવવા માટે પ્રતિબદ્ધ છો.',
    },
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
    productSection: {
      title: 'ઉત્પાદન ફોટા',
      description: 'ગ્રાહકોને આકર્ષિત કરવા માટે તમારા ઉત્પાદનોના ફોટા અપલોડ કરો',
      addPhotos: 'ઉત્પાદન ફોટા ઉમેરો',
      maxPhotos: '(જાસ્તીત જાસ્ત 5 ફોટો)',
      tip: 'ટીપ: સ્પષ્ટ અને ચાંગલી પ્રકાશતીલ ફોટો ગ્રાહકોને તમારા ઉત્પાદનો વધુ સારી રીતે સમજવામાં મદદ કરે છે'
    },
    profileSection: {
      title: 'પ્રોફાઇલ ફોટો',
      description: 'ગ્રાહકોનો વિશ્વાસ કેળવવા માટે તમારો પ્રોફાઇલ ફોટો ઉમેરો',
      addPhoto: 'પ્રોફાઇલ ફોટો ઉમેરો',
      optional: '(વૈકલ્પિક પરંતુ ભલામણ કરેલ)',
      changePhoto: 'ફોટો બદલો',
      remove: 'દૂર કરો',
      tip: 'ટીપ: વ્યાવસાયિક પ્રોફાઇલ ફોટો ગ્રાહક વિશ્વાસ વધારવામાં મદદ કરે છે'
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingType, setRecordingType] = useState(null); // 'agreement' or 'other'

  // Form data state
  const [formData, setFormData] = useState({
    // Step 1: Identity
    fullName: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    
    // Step 2: Business Type
    businessType: '',
    customBusinessType: '', // Added for other business type
    
    // Step 3: Business Verification
    aadharNumber: '',
    shopName: '',
    
    // Step 4: Address
    address: '',
    city: '',
    pincode: '',
    state: '',
    landmark: '',
    
    // Step 5: Product Details
    productDescription: '',
    selectedCategories: [],
    customCategory: '',
    productImage: null,
    
    // Step 6: Agreement
    agreementAccepted: false,
    productPhotos: [],
    profilePhoto: null,
  });

  // Initialize voice recognition
  useEffect(() => {
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  // Voice handlers
  const onSpeechStart = () => {
    setIsRecording(true);
  };

  const onSpeechEnd = () => {
    setIsRecording(false);
  };

  const onSpeechResults = (e) => {
    const text = e.value[0];
    if (recordingType === 'agreement') {
      setFormData(prev => ({
        ...prev,
        agreementText: text
      }));
    } else if (recordingType === 'other') {
      setFormData(prev => ({
        ...prev,
        customCategory: text
      }));
    }
  };

  const onSpeechError = (e) => {
    console.error('Speech recognition error:', e);
    Alert.alert(
      'Voice Input Error',
      translations[language].errors.voiceInputError
    );
    setIsRecording(false);
  };

  const startVoiceRecording = async (type) => {
    try {
      setRecordingType(type);
      await Voice.start(language === 'en' ? 'en-US' : language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'gu-IN');
    } catch (error) {
      console.error('Error starting voice recording:', error);
      Alert.alert(
        'Error',
        translations[language].errors.micPermission
      );
    }
  };

  const stopVoiceRecording = async () => {
    try {
      await Voice.stop();
      setRecordingType(null);
    } catch (error) {
      console.error('Error stopping voice recording:', error);
    }
  };

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
    if (!formData.fullName || formData.fullName.trim() === '') {
      Alert.alert(
        translations[language].errors.required,
        translations[language].errors.fullName
      );
      return false;
    }
    
    if (!formData.mobile || !/^\d{10}$/.test(formData.mobile)) {
      Alert.alert(
        translations[language].errors.required,
        translations[language].errors.mobile
      );
      return false;
    }
    
    if (!formData.password || formData.password.length < 8) {
      Alert.alert(
        translations[language].errors.required,
        translations[language].errors.password
      );
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      Alert.alert(
        translations[language].errors.required,
        translations[language].errors.passwordMatch
      );
      return false;
    }
    
    return true;
  };

  const validateStep2 = () => {
    if (!formData.businessType) {
      Alert.alert(
        translations[language].errors.required,
        translations[language].errors.businessType
      );
      return false;
    }

    // If "other" business type is selected, custom business type is required
    if (formData.businessType === 'other' && (!formData.customBusinessType || formData.customBusinessType.trim() === '')) {
      Alert.alert(
        translations[language].errors.required,
        translations[language].errors.customBusinessType
      );
      return false;
    }

    return true;
  };

  const validateStep3 = () => {
    if (!formData.aadharNumber || formData.aadharNumber.length !== 12) {
      Alert.alert(
        translations[language].errors.required,
        translations[language].errors.aadhar
      );
      return false;
    }
    return true;
  };

  const validateStep4 = () => {
    if (!formData.address || formData.address.trim() === '') {
      Alert.alert(
        translations[language].errors.required,
        translations[language].errors.address
      );
      return false;
    }
    
    if (!formData.city || formData.city.trim() === '') {
      Alert.alert(
        translations[language].errors.required,
        translations[language].errors.city
      );
      return false;
    }
    
    if (!formData.pincode || formData.pincode.length !== 6) {
      Alert.alert(
        translations[language].errors.required,
        translations[language].errors.pincode
      );
      return false;
    }
    
    if (!formData.state || formData.state.trim() === '') {
      Alert.alert(
        translations[language].errors.required,
        translations[language].errors.state
      );
      return false;
    }
    
    return true;
  };

  const validateStep5 = () => {
    // Product photos are optional, so always return true
    return true;
  };

  const validateStep6 = () => {
    // Profile photo is optional, so always return true
    return true;
  };

  const validateStep7 = () => {
    if (!formData.termsAccepted) {
      Alert.alert(
        'Error',
        translations[language].errors.termsRequired
      );
      return false;
    }
    return true;
  };

  const handleNext = () => {
    let isValid = false;
    
    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      case 4:
        isValid = validateStep4();
        break;
      case 5:
        isValid = validateStep5();
        break;
      case 6:
        isValid = validateStep6();
        break;
      case 7:
        isValid = validateStep7();
        break;
      default:
        isValid = true;
    }
    
    if (isValid) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSubmit = async () => {
    try {
        if (!validateStep7()) {
            return;
        }

        setIsLoading(true);

        // Split full name into firstname and lastname
        const nameParts = formData.fullName.split(' ');
        const firstname = nameParts[0];
        const lastname = nameParts.slice(1).join(' ') || nameParts[0];

        const registrationData = {
            firstname,
            lastname,
            mobileno: formData.mobile,
            password: formData.password,
            address: formData.address,
            country: 'India',
            state: formData.state,
            city: formData.city,
            pincode: formData.pincode,
            userType: 'seller',
            platformType: ['b2c'],
            shopName: formData.shopName,
            businessType: formData.businessType,
            customBusinessType: formData.customBusinessType || '',
            businessDescription: formData.businessDescription || '',
            aadharNumber: formData.aadharNumber,
            termsAccepted: formData.termsAccepted ? "true" : "false"
        };

        const response = await sellerApi.register(registrationData);
        
        if (response.success) {
            // Language specific success messages
            const successMessages = {
                en: {
                    title: 'Success',
                    message: 'Registration successful! Please login to continue.'
                },
                hi: {
                    title: 'सफल',
                    message: 'पंजीकरण सफल! जारी रखने के लिए कृपया लॉगिन करें।'
                },
                gu: {
                    title: 'સફળ',
                    message: 'નોંધણી સફળ! કૃપા કરી ચાલુ રાખવા માટે લૉગિન કરો.'
                },
                mr: {
                    title: 'यशस्वी',
                    message: 'नोंदणी यशस्वी! कृपया सुरू ठेवण्यासाठी लॉगिन करा.'
                }
            };

            const currentLang = successMessages[language] || successMessages.en;

            Alert.alert(
                currentLang.title,
                currentLang.message,
                [
                    { 
                        text: language === 'en' ? 'OK' : 
                              language === 'hi' ? 'ठीक है' :
                              language === 'gu' ? 'બરાબર' :
                              language === 'mr' ? 'ठीक आहे' : 'OK',
                        onPress: () => {
                            router.replace({
                                pathname: '/(auth)/seller/login',
                                params: { language: language }
                            });
                        }
                    }
                ]
            );
        }

    } catch (error) {
        console.error('Registration error:', error);
        
        // Language specific error messages
        const errorMessages = {
            en: {
                title: 'Error',
                message: 'Registration failed. Please try again.'
            },
            hi: {
                title: 'त्रुटि',
                message: 'पंजीकरण विफल। कृपया पुनः प्रयास करें।'
            },
            gu: {
                title: 'ભૂલ',
                message: 'નોંધણી નિષ્ફળ. કૃपા કરી ફરી પ્રયાસ કરો.'
            },
            mr: {
                title: 'त्रुटी',
                message: 'नोंदणी अयशस्वी. कृपया पुन्हा प्रयत्न करा.'
            }
        };

        const currentLang = errorMessages[language] || errorMessages.en;

        Alert.alert(
            currentLang.title,
            error.message || currentLang.message
        );
    } finally {
        setIsLoading(false);
    }
};

  const handleDocumentUpload = async (type) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'profile' ? [1, 1] : [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        if (type === 'product') {
          // Check if we already have 5 photos
          if (formData.productPhotos.length >= 5) {
            Alert.alert(
              'Maximum Limit Reached',
              'You can only upload up to 5 product photos'
            );
            return;
          }
          
          // Add new photo to the array
          setFormData(prev => ({
            ...prev,
            productPhotos: [...prev.productPhotos, result.assets[0].uri]
          }));
        } else if (type === 'profile') {
          setFormData(prev => ({
            ...prev,
            profilePhoto: result.assets[0].uri
          }));
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert(
        'Error',
        'Failed to upload image. Please try again.'
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
          autoCapitalize="words"
        />
        <TextInput
          style={styles.input}
          placeholder={translations[language].fields.mobile}
          value={formData.mobile}
          onChangeText={(text) => setFormData(prev => ({ ...prev, mobile: text }))}
          keyboardType="number-pad"
          maxLength={10}
        />
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder={translations[language].fields.password}
            value={formData.password}
            onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={24}
              color="#666"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder={translations[language].fields.confirmPassword}
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Ionicons
              name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
              size={24}
              color="#666"
            />
          </TouchableOpacity>
        </View>
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
              customBusinessType: type.id === 'other' ? prev.customBusinessType : ''
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
          style={[styles.input, styles.textArea]}
          placeholder={translations[language].fields.address}
          value={formData.address}
          onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
          multiline
          numberOfLines={3}
        />
        <TextInput
          style={styles.input}
          placeholder={translations[language].fields.landmark}
          value={formData.landmark}
          onChangeText={(text) => setFormData(prev => ({ ...prev, landmark: text }))}
        />
        <TextInput
          style={styles.input}
          placeholder={translations[language].fields.pincode}
          value={formData.pincode}
          onChangeText={(text) => {
            const numericValue = text.replace(/[^0-9]/g, '');
            if (numericValue.length <= 6) {
              setFormData(prev => ({ ...prev, pincode: numericValue }));
              if (numericValue.length === 6) {
                getStateFromPincode(numericValue);
              }
            }
          }}
          keyboardType="numeric"
          maxLength={6}
        />
        <TextInput
          style={styles.input}
          placeholder={translations[language].fields.city}
          value={formData.city}
          onChangeText={(text) => setFormData(prev => ({ ...prev, city: text }))}
        />
        <TextInput
          style={styles.input}
          placeholder={translations[language].fields.state}
          value={formData.state}
          editable={false}
        />
      </View>
    </View>
  );

  const getStateFromPincode = async (pincode) => {
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();
      
      if (data[0].Status === 'Success') {
        const stateInfo = data[0].PostOffice[0].State;
        const cityInfo = data[0].PostOffice[0].District;
        setFormData(prev => ({
          ...prev,
          state: stateInfo,
          city: cityInfo
        }));
      }
    } catch (error) {
      console.error('Error fetching state from pincode:', error);
    }
  };

  const renderStep5 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{translations[language].steps[5]}</Text>
      <Text style={styles.stepDescription}>
        {translations[language].productSection.description}
      </Text>
      
      <View style={styles.photoSection}>
        <TouchableOpacity 
          style={styles.uploadPhotoButton}
          onPress={() => handleDocumentUpload('product')}
        >
          <Icon name="image-plus" size={32} color="#6C63FF" />
          <Text style={styles.uploadPhotoText}>
            {translations[language].productSection.addPhotos}
          </Text>
          <Text style={styles.uploadSubText}>
            {translations[language].productSection.maxPhotos}
          </Text>
        </TouchableOpacity>

        {formData.productPhotos && formData.productPhotos.length > 0 && (
          <View style={styles.photoGrid}>
            {formData.productPhotos.map((photo, index) => (
              <View key={index} style={styles.photoContainer}>
                <Image 
                  source={{ uri: photo }}
                  style={styles.photoPreview}
                />
                <TouchableOpacity 
                  style={styles.removePhotoButton}
                  onPress={() => {
                    const updatedPhotos = formData.productPhotos.filter((_, i) => i !== index);
                    setFormData(prev => ({
                      ...prev,
                      productPhotos: updatedPhotos
                    }));
                  }}
                >
                  <Icon name="close-circle" size={24} color="#FF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      <Text style={styles.photoTip}>
        {translations[language].productSection.tip}
      </Text>
    </View>
  );

  const renderStep6 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{translations[language].steps[6]}</Text>
      <Text style={styles.stepDescription}>
        {translations[language].profileSection.description}
      </Text>

      <View style={styles.profilePhotoSection}>
        {formData.profilePhoto ? (
          <View style={styles.profilePhotoContainer}>
            <Image 
              source={{ uri: formData.profilePhoto }}
              style={styles.profilePhotoPreview}
            />
            <View style={styles.profilePhotoActions}>
              <TouchableOpacity 
                style={styles.photoActionButton}
                onPress={() => handleDocumentUpload('profile')}
              >
                <Icon name="camera" size={24} color="#6C63FF" />
                <Text style={styles.photoActionText}>
                  {translations[language].profileSection.changePhoto}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.photoActionButton, styles.removeButton]}
                onPress={() => setFormData(prev => ({ ...prev, profilePhoto: null }))}
              >
                <Icon name="delete" size={24} color="#FF4444" />
                <Text style={[styles.photoActionText, styles.removeText]}>
                  {translations[language].profileSection.remove}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.uploadProfileButton}
            onPress={() => handleDocumentUpload('profile')}
          >
            <Icon name="account-circle" size={64} color="#6C63FF" />
            <Text style={styles.uploadProfileText}>
              {translations[language].profileSection.addPhoto}
            </Text>
            <Text style={styles.uploadSubText}>
              {translations[language].profileSection.optional}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.photoTip}>
        {translations[language].profileSection.tip}
      </Text>
    </View>
  );

  const renderStep7 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{translations[language].steps[7]}</Text>
      
      <View style={styles.termsContent}>
        <Text style={styles.termsTitle}>
          {translations[language].agreement.title}
        </Text>
        <Text style={styles.termsText}>
          {translations[language].agreement.content}
        </Text>
      </View>

      <TouchableOpacity 
        style={[styles.checkboxContainer, { backgroundColor: '#F0EEFF', padding: 12, borderRadius: 8, marginTop: 16 }]}
        onPress={() => setFormData(prev => ({
          ...prev,
          termsAccepted: !prev.termsAccepted
        }))}
      >
        <Icon 
          name={formData.termsAccepted ? "checkbox-marked" : "checkbox-blank-outline"}
          size={24}
          color={formData.termsAccepted ? "#4CAF50" : "#666"}
        />
        <Text style={[styles.checkboxText, { fontSize: 15 }]}>
          {translations[language].agreement.acceptTerms}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Update product categories array by removing meat
  const productCategories = [
    { value: 'groceries', icon: '🛒' },
    { value: 'vegetables', icon: '🥬' },
    { value: 'fruits', icon: '🍎' },
    { value: 'dairy', icon: '  ' },
    { value: 'bakery', icon: '🥖' },
    { value: 'snacks', icon: '🍿' },
    { value: 'beverages', icon: '🥤' },
    { value: 'household', icon: '🧹' },
    { value: 'other', icon: '📦' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
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

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
        >
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
          {currentStep === 6 && renderStep6()}
          {currentStep === 7 && renderStep7()}
          {/* Add padding at bottom to prevent content from being hidden behind footer */}
          <View style={styles.bottomPadding} />
        </ScrollView>

        <View style={styles.footerContainer}>
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
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 120, // Increased padding to account for footer height
  },
  bottomPadding: {
    height: 100, // Increased height to ensure content is not hidden
  },
  footerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    position: 'relative', // Changed from absolute to relative
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    width: '100%',
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
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedBusinessType: {
    borderColor: '#6C63FF',
    backgroundColor: '#F5F5FF',
  },
  businessTypeIcon: {
    fontSize: 24,
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
    color: '#666666',
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
    backgroundColor: '#F8F9FA',
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
  agreementTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: '#1A1A1A',
  },
  agreementText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 16,
  },
  customBusinessContainer: {
    marginTop: 16,
  },
  customBusinessInput: {
    marginBottom: 12,
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
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 1,
  },
  voiceInputContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  voiceInput: {
    paddingRight: 50,
  },
  voiceButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    backgroundColor: '#F0EEFF',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingButton: {
    backgroundColor: '#FFEEEE',
  },
  categoriesSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1A1A1A',
  },
  optionalText: {
    color: '#666',
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 10
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10
  },
  uploadButtonText: {
    marginLeft: 10,
    color: '#666'
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10
  },
  imagePreview: {
    width: 100,
    height: 100,
    margin: 5,
    borderRadius: 8
  },
  profilePreview: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignSelf: 'center',
    marginTop: 20
  },
  termsContainer: {
    height: 400,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    flexGrow: 0
  },
  termsContent: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  termsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333'
  },
  termsText: {
    color: '#333',
    lineHeight: 24,
    fontSize: 14,
    marginBottom: 15
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 10
  },
  checkboxText: {
    marginLeft: 10,
    color: '#333',
    flex: 1
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center'
  },
  photoSection: {
    marginVertical: 15,
  },
  uploadPhotoButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0EEFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#6C63FF',
    borderStyle: 'dashed'
  },
  uploadPhotoText: {
    fontSize: 16,
    color: '#6C63FF',
    fontWeight: '600',
    marginTop: 10
  },
  uploadSubText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 15,
    gap: 10
  },
  photoContainer: {
    position: 'relative',
    width: '31%',
    aspectRatio: 1,
    marginBottom: 10
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8
  },
  removePhotoButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4
  },
  photoTip: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 15,
    paddingHorizontal: 20
  },
  profilePhotoSection: {
    alignItems: 'center',
    marginVertical: 20
  },
  profilePhotoContainer: {
    alignItems: 'center'
  },
  profilePhotoPreview: {
    width: 180,
    height: 180,
    borderRadius: 90,
    marginBottom: 20
  },
  profilePhotoActions: {
    flexDirection: 'row',
    gap: 15
  },
  photoActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0EEFF',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20
  },
  removeButton: {
    backgroundColor: '#FFEEEE'
  },
  photoActionText: {
    marginLeft: 5,
    color: '#6C63FF',
    fontWeight: '500'
  },
  removeText: {
    color: '#FF4444'
  },
  uploadProfileButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0EEFF',
    borderRadius: 12,
    padding: 30,
    width: '80%',
    borderWidth: 2,
    borderColor: '#6C63FF',
    borderStyle: 'dashed'
  },
  uploadProfileText: {
    fontSize: 18,
    color: '#6C63FF',
    fontWeight: '600',
    marginTop: 15
  }
});

export default SellerRegistrationScreen; 