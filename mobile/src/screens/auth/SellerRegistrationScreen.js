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

// Translations object
const translations = {
  en: {
    steps: {
      1: 'User Identity Verification',
      2: 'Business Type Selection',
      3: 'Business Verification',
      4: 'Address Details',
      5: 'Product Details',
      6: 'Agreement',
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
      terms: 'I agree to the Terms and Conditions',
      bankDetails: 'Add Bank Account Details (Optional)',
      locationFetch: 'Getting your location...',
    },
    progress: 'Step %s of %s',
    agreement: {
      title: 'Terms and Conditions',
      content: `1. Terms of Service:\n
• As a seller on our platform, you agree to provide authentic and quality products/services.
• You must maintain accurate inventory and pricing information.
• You are responsible for timely delivery of products to customers.

2. Payment Terms:\n
• Payments will be processed and disbursed on a monthly basis.
• Payment cycle: All sales from 1st to last day of month will be processed by 10th of next month.
• Payment will be made directly to your registered bank account.
• Platform fee and applicable taxes will be deducted as per current rates.

3. Seller Responsibilities:\n
• Maintain high quality standards for all products
• Respond to customer queries within 24 hours
• Keep your store information and inventory updated
• Follow all applicable local and national regulations

4. Platform Guidelines:\n
• Maintain a minimum rating of 3.5 stars
• Handle returns and refunds as per platform policy
• Use appropriate packaging for product safety
• Maintain professional communication with customers

5. Account Suspension:\n
• The platform reserves the right to suspend accounts for policy violations
• Multiple violations may result in permanent account termination
• All pending payments will be processed after resolution of issues

By accepting these terms, you agree to all conditions mentioned above and commit to maintaining the quality standards of our platform.`
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
  },
  hi: {
    steps: {
      1: 'पहचान सत्यापन',
      2: 'व्यवसाय का प्रकार',
      3: 'व्यवसाय सत्यापन',
      4: 'पता विवरण',
      5: 'उत्पाद विवरण',
      6: 'समझौता',
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
      productImage: 'कृपया कम से कम एक उत्पाद फोटो अपलोड करें',
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
      terms: 'मैं नियम और शर्तों से सहमत हूं',
      bankDetails: 'बैंक खाता विवरण जोड़ें (वैकल्पिक)',
      locationFetch: 'आपका स्थान प्राप्त किया जा रहा है...',
    },
    progress: 'चरण %s में से %s',
    agreement: {
      title: 'नियम और शर्तें',
      content: `1. सेवा की शर्तें:\n
• हमारे प्लेटफॉर्म पर विक्रेता के रूप में, आप प्रामाणिक अनે गુણવત્તાયુક્ત उत्पादने/सેવा देણ्यास सहमत आहात.
• आपको सटीक इन्व्हेंटरी आणि किंमत माहिती राखली पाहिजे.
• ग्राहकांना समयसर डिलिवरी माटે आप जवाबदार छો.

2. चુकवणીની शर्तો:\n
• चુकवणીની प્रक્रિયા मાસિક धોરણે करवામાં आવશે अनે तેનું वितरण करवામાં आવશે.
• चુकवणી चक्र: महीनાના 1લીથી छેલ્લા दिवस सुधીના तमામ वेचाणની प્रक્रિયા नીचેના महीनાની 10મી तारીખ सुधીमાં करवામાં आવશે.
• चુकवणી सीधી आपके नोंधायેલા बેंक खातામાं करवામાં आવશે.
• प्लेटफોर્म फी अनે लागु कर वर्तमान दरों के अनुसार कापवામાં आવશે.

3. विक्रेता की जिम्मेदारियां:\n
• सभी उत्पादों के लिए उच्च गુणवत्ता मानकों को बनाए रखें
• 24 घंटों के भीतर ग्राहक प्रश्नों का जवाब दें
• अपनी दुकान की जानकारी और इन्व्हेंटरी को अपडेट रखें
• सभी लागू स्थानीय और राष्ट्रीय नियमांचे पालन करें

4. प्लेटफॉर्म दिशानिर्देश:\n
• न्यूनतम 3.5 स्टार रेटिंग बनाए रखें
• प्लेटफॉर्म नीति के अनुसार रिटर्न और रिफंड को संभालें
• उत्पाद सुरक्षा के लिए उचित पैकेजिंग का उपयोग करें
• ग्राहकांशी व्यावसायिक संवाद कायम ठेवा

5. एकाउन્ट सस્पેન્શન:\n
• प्लेटफोर્म नीतिના उल्लंघन माटે एकाउन્ट્सને सस્पેન્ड करवानો अधिकार अनामत राखे छે
• बहुविध उल्लंघनों के परिणामस्वरूप खातુं कायमी समाप्त थी शकે छે
• आपके बाकी चૂकवणીओ मुद્दाओं के निराकरण पछि प्रक્रिया करवामां आवशે

इन शर्तों को स्वीकार करके, आप ऊपर दर्शाई गई सभी शर्तों से सहमत हैं और हमारे प्लेटफॉर्म के गुणवत्ता मानकों को बनाए रखने के लिए प्रतिबद्ध छો.`
    },
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
      5: "उत्पाद तपशील",
      6: "करार",
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
      businessDescription: 'तुमच्या व्यवसाय वિશે જણાવો (શું વેચો છો?)',
      upiId: 'तुमचा UPI आयडી टाका (उदा: मोબાઇલ@upi)',
      bankAccount: 'बएંક એકાઉન્ટ નંબર લખો (વૈકલ્પિક)',
      acceptsCOD: 'मी कॅश ऑन डિલિવરી स्वીકારીશ',
      productDescription: 'तुम्ही काय विकता? (उदा: मी ताज्या भाज्या विकतो)',
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
• તમામ ઉત્પાદનો માટે ઉચ્ચ ગુણવત્તાના ધોરણો જાળવો
• ગ્રાહકની પૂછપરછનો 24 કલાકની અંદર જવાબ આપો
• તમારી દુકાનની માહિતી અને ઇન્વેન્ટરી અપડેટ રાખો
• તમામ લાગુ સ્થાનિક અને રાષ્ટ્રીય નિયમોનું પાલન કરો

4. પ્લેટફોર્મ માર્ગદર્શિકા:\n
• ન્યૂનતમ 3.5 સ્ટાર રેટિંગ ધરાવો
• પ્લેટફોર્મ પોલિસી મુજબ રિટર્ન અને રિફંડ હેન્ડલ કરો
• ઉત્પાદનને સુરક્ષિત રાખવા માટે યોગ્ય પેકેજિંગનો ઉપયોગ કરો
• ગ્રાહકો સાથે વ્યાવસાયિક સંચાર જાળવો

5. એકાઉન્ટ સસ્પેન્શન:\n
• પ્લેટફોર્મ નીતિના ઉલ્લંઘન માટે એકાઉન્ટ્સને સસ્પેન્ડ કરવાનો અધિકાર અનામત રાખે છે
• બહુવિધ ઉલ્લંઘનોના પરિણામે ખાતું કાયમી સમાપ્ત થઈ શકે છે
• તમામ બાકી ચૂકવણીઓ મુદ્દાઓના નિરાકરણ પછી પ્રક્રિયા કરવામાં આવશે

આ શરતો સ્વીકારીને, તમે ઉપર દર્શાવેલ તમામ શરતો સાથે સંમત થાઓ છો અને અમારા પ્લેટફોર્મના ગુણવત્તાના ધોરણો જાળવવા માટે પ્રતિબદ્ધ છો.`
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
    if (!formData.selectedCategories || formData.selectedCategories.length === 0) {
      Alert.alert(
        translations[language].errors.required,
        translations[language].errors.productCategory
      );
      return false;
    }
    
    if (!formData.productDescription || formData.productDescription.trim() === '') {
      Alert.alert(
        translations[language].errors.required,
        translations[language].errors.productDescription
      );
      return false;
    }
    
    if (!formData.productImage) {
      Alert.alert(
        translations[language].errors.required,
        translations[language].errors.productImage
      );
      return false;
    }
    
    return true;
  };

  const validateStep6 = () => {
    if (!formData.agreementAccepted) {
      Alert.alert(
        translations[language].errors.required,
        translations[language].errors.agreement
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
      default:
        isValid = true;
    }
    
    if (isValid) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSubmit = async () => {
    try {
        if (!validateStep6()) {
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
            termsAccepted: formData.agreementAccepted ? "true" : "false"
        };

        console.log('Sending registration data:', registrationData);

        const response = await sellerApi.register(registrationData);
        
        if (response.success) {
            Alert.alert(
                'Success',
                'Registration successful! Please login to continue.',
                [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
            );
        }

    } catch (error) {
        console.error('Registration error:', error);
        Alert.alert(
            'Error',
            error.message || 'Registration failed. Please try again.'
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
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const documentUri = result.assets[0].uri;
        if (type === 'product') {
          setFormData(prev => ({
            ...prev,
            productImage: documentUri
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            [`${type}Document`]: documentUri
          }));
        }
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
      <View style={styles.inputGroup}>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={translations[language].fields.productDescription}
          value={formData.productDescription}
          onChangeText={(text) => setFormData(prev => ({ ...prev, productDescription: text }))}
          multiline
          numberOfLines={3}
        />

        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>{translations[language].fields.selectCategory}</Text>
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
                    : [...selected, category.value];
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
          <View style={styles.voiceInputContainer}>
            <TextInput
              style={[styles.input, styles.voiceInput]}
              placeholder={translations[language].fields.customCategory}
              value={formData.customCategory}
              onChangeText={(text) => setFormData(prev => ({ ...prev, customCategory: text }))}
            />
            <TouchableOpacity
              style={[styles.voiceButton, isRecording && recordingType === 'other' && styles.recordingButton]}
              onPress={() => isRecording ? stopVoiceRecording() : startVoiceRecording('other')}
            >
              <Ionicons
                name={isRecording && recordingType === 'other' ? "mic" : "mic-outline"}
                size={24}
                color={isRecording && recordingType === 'other' ? "#FF4444" : "#6C63FF"}
              />
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity 
          style={styles.uploadButton}
          onPress={() => handleDocumentUpload('product')}
        >
          <Ionicons name="camera-outline" size={24} color="#666" />
          <Text style={styles.uploadButtonText}>
            {translations[language].fields.uploadProductImage}
          </Text>
        </TouchableOpacity>

        {formData.productImage && (
          <View style={styles.imagePreviewContainer}>
            <Image 
              source={{ uri: formData.productImage }} 
              style={styles.previewImage}
              resizeMode="cover"
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

  const renderStep6 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{translations[language].steps[6]}</Text>
      <ScrollView style={styles.agreementContainer}>
        <Text style={styles.agreementTitle}>{translations[language].agreement.title}</Text>
        <Text style={styles.agreementText}>
          {translations[language].agreement.content}
        </Text>
      </ScrollView>
      <View style={styles.inputGroup}>
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
                  { width: `${(currentStep / 6) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {translations[language].progress.replace('%s', currentStep).replace('%s', '6')}
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
          {/* Add padding at bottom to prevent content from being hidden behind footer */}
          <View style={styles.bottomPadding} />
        </ScrollView>

        <View style={styles.footerContainer}>
          <View style={styles.footer}>
            {currentStep < 6 ? (
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
});

export default SellerRegistrationScreen; 