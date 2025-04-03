export const translations = {
  en: {
    title: 'Add New Product',
    steps: {
      1: 'Step 1: Basic Information',
      2: 'Step 2: Media Upload',
      3: 'Step 3: Price & Stock',
      4: 'Step 4: Availability & Review'
    },
    fields: {
      productName: {
        label: 'Product Name *',
        placeholder: 'Example: Organic Honey'
      },
      category: {
        label: 'Select Category *',
        placeholder: 'Select Category'
      },
      subcategory: {
        label: 'Subcategory *',
        placeholder: 'Enter or select subcategory'
      },
      description: {
        label: 'Description (Optional)',
        placeholder: 'Write product description'
      },
      mediaUpload: {
        title: 'Upload Photos',
        description: 'You can upload up to 5 photos',
        addMore: 'Add More Photos',
        tap: 'Tap here to upload photos',
        photoNumber: 'Photo',
        removeConfirm: 'Remove Photo',
        removeMessage: 'Do you want to remove this photo?',
        yes: 'Yes',
        no: 'No'
      },
      youtube: {
        label: 'YouTube Video Link (Optional)',
        placeholder: 'https://youtube.com/...'
      },
      imageSource: {
        title: 'How would you like to take photo?',
        camera: 'Take Photo with Camera',
        gallery: 'Choose from Gallery',
        cancel: 'Cancel'
      },
      unitType: {
        label: 'Unit Type *',
        types: {
          kg: 'Kilogram',
          g: 'Gram',
          piece: 'Piece',
          thali: 'Thali',
          pack: 'Pack',
          jar: 'Jar',
          bottle: 'Bottle',
          pkt: 'Packet',
          set: 'Set',
          box: 'Box'
        }
      },
      price: {
        label: 'Main Price (₹) *',
        placeholder: 'Price per',
        subUnits: {
          title: 'Price for other quantities:',
          gram250: '250g:',
          gram500: '500g:'
        }
      },
      stock: {
        label: 'Stock *',
        placeholder: 'How many units available'
      },
      availability: {
        label: 'Where will the product be available? *',
        sublabel: 'Enter city or area name and press enter',
        placeholder: 'Example: Surat, Bardoli, Vapi...'
      }
    },
    review: {
      title: 'Review Product Information',
      product: 'Product:',
      price: 'Price:',
      category: 'Category:',
      stock: 'Stock:',
      back: 'Go Back',
      confirm: 'Yes, Add Product',
      loading: 'Adding product...'
    },
    buttons: {
      next: 'Next',
      review: 'Review',
      back: 'Back'
    }
  },
  hi: {
    title: 'नया प्रोडक्ट जोड़ें',
    steps: {
      1: 'चरण 1: बेसिक जानकारी',
      2: 'चरण 2: मीडिया अपलोड',
      3: 'चरण 3: कीमत और स्टॉक',
      4: 'चरण 4: उपलब्धता और समीक्षा'
    },
    fields: {
      productName: {
        label: 'प्रोडक्ट का नाम *',
        placeholder: 'उदाहरण: ऑर्गेनिक हनी'
      },
      category: {
        label: 'श्रेणी चुनें *',
        placeholder: 'श्रेणी चुनें'
      },
      subcategory: {
        label: 'उपश्रेणी *',
        placeholder: 'उपश्रेणी दर्ज करें या चुनें'
      },
      description: {
        label: 'विवरण (वैकल्पिक)',
        placeholder: 'प्रोडक्ट का विवरण लिखें'
      },
      mediaUpload: {
        title: 'फोटो अपलोड करें',
        description: 'आप अधिकतम 5 फोटो अपलोड कर सकते हैं',
        addMore: 'और फोटो जोड़ें',
        tap: 'फोटो अपलोड करने के लिए यहाँ टैप करें',
        photoNumber: 'फोटो',
        removeConfirm: 'फोटो हटाएं',
        removeMessage: 'क्या आप इस फोटो को हटाना चाहते हैं?',
        yes: 'हाँ',
        no: 'नहीं'
      },
      youtube: {
        label: 'यूट्यूब वीडियो लिंक (वैकल्पिक)',
        placeholder: 'https://youtube.com/...'
      },
      imageSource: {
        title: 'फोटो कैसे लेना चाहेंगे?',
        camera: 'कैमरा से फोटो लें',
        gallery: 'गैलरी से फोटो चुनें',
        cancel: 'रद्द करें'
      },
      unitType: {
        label: 'इकाई का प्रकार *',
        types: {
          kg: 'किलोग्राम',
          g: 'ग्राम',
          piece: 'नग',
          thali: 'थाली',
          pack: 'पैक',
          jar: 'जार',
          bottle: 'बोतल',
          pkt: 'पैकेट',
          set: 'सेट',
          box: 'डिब्बा'
        }
      },
      price: {
        label: 'मुख्य कीमत (₹) *',
        placeholder: 'प्रति की कीमत',
        subUnits: {
          title: 'अन्य मात्रा की कीमत:',
          gram250: '250 ग्राम:',
          gram500: '500 ग्राम:'
        }
      },
      stock: {
        label: 'स्टॉक *',
        placeholder: 'कितने यूनिट उपलब्ध हैं'
      },
      availability: {
        label: 'प्रोडक्ट कहाँ-कहाँ उपलब्ध होगा? *',
        sublabel: 'शहर या क्षेत्र का नाम लिखें और एंटर दबाएं',
        placeholder: 'उदाहरण: सुरत, बारडोली, वापी...'
      }
    },
    review: {
      title: 'प्रोडक्ट की जानकारी जाँच लें',
      product: 'प्रोडक्ट:',
      price: 'कीमत:',
      category: 'श्रेणी:',
      stock: 'स्टॉक:',
      back: 'वापस जाएं',
      confirm: 'हाँ, जोड़ें',
      loading: 'प्रोडक्ट जोड़ा जा रहा है...'
    },
    buttons: {
      next: 'अगला',
      review: 'समीक्षा करें',
      back: 'वापस'
    }
  },
  mr: {
    title: 'नवीन प्रॉडक्ट जोडा',
    steps: {
      1: 'चरण 1: मूलभूत माहिती',
      2: 'चरण 2: मीडिया अपलोड',
      3: 'चरण 3: किंमत आणि स्टॉक',
      4: 'चरण 4: उपलब्धता आणि पुनरावलोकन'
    },
    fields: {
      productName: {
        label: 'प्रॉडक्टचे नाव *',
        placeholder: 'उदाहरण: ऑर्गेनिक मध'
      },
      category: {
        label: 'श्रेणी निवडा *',
        placeholder: 'श्रेणी निवडा'
      },
      subcategory: {
        label: 'उपश्रेणी *',
        placeholder: 'उपश्रेणी प्रविष्ट करा किंवा निवडा'
      },
      description: {
        label: 'वर्णन (पर्यायी)',
        placeholder: 'प्रॉडक्टचे वर्णन लिहा'
      },
      mediaUpload: {
        title: 'फोटो अपलोड करा',
        description: 'तुम्ही जास्तीत जास्त 5 फोटो अपलोड करू शकता',
        addMore: 'आणखी फोटो जोडा',
        tap: 'फोटो अपलोड करण्यासाठी येथे टॅप करा',
        photoNumber: 'फोटो',
        removeConfirm: 'फोटो काढून टाका',
        removeMessage: 'तुम्हाला हा फोटो काढून टाकायचा आहे का?',
        yes: 'होय',
        no: 'नाही'
      },
      youtube: {
        label: 'यूट्यूब व्हिडिओ लिंक (पर्यायी)',
        placeholder: 'https://youtube.com/...'
      },
      imageSource: {
        title: 'फोटो कसा घ्यायचा आहे?',
        camera: 'कॅमेराने फोटो घ्या',
        gallery: 'गॅलरीमधून फोटो निवडा',
        cancel: 'रद्द करा'
      },
      unitType: {
        label: 'युनिट प्रकार *',
        types: {
          kg: 'किलोग्राम',
          g: 'ग्राम',
          piece: 'नग',
          thali: 'थाळी',
          pack: 'पॅक',
          jar: 'जार',
          bottle: 'बाटली',
          pkt: 'पॅकेट',
          set: 'सेट',
          box: 'डबा'
        }
      },
      price: {
        label: 'मुख्य किंमत (₹) *',
        placeholder: 'प्रति किंमत',
        subUnits: {
          title: 'इतर प्रमाणांची किंमत:',
          gram250: '250 ग्राम:',
          gram500: '500 ग्राम:'
        }
      },
      stock: {
        label: 'साठा *',
        placeholder: 'किती युनिट् उपलब्ध आहेत?'
      },
      availability: {
        label: 'उत्पादन कुठे मिळेल? *',
        sublabel: 'शहर किंवा विस्तार टाइप करा आणि एंटर दाबा.',
        placeholder: 'उदाहरण: सुरत, बारडोली, वापी...'
      }
    },
    review: {
      title: 'प्रॉडक्टची माहिती तपासा',
      product: 'प्रॉडक्ट:',
      price: 'किंमत:',
      category: 'श्रेणी:',
      stock: 'स्टॉक:',
      back: 'मागे जा',
      confirm: 'होय, जोडा',
      loading: 'प्रॉडक्ट जोडत आहे...'
    },
    buttons: {
      next: 'पुढे',
      review: 'पुनरावलोकन',
      back: 'मागे'
    }
  },
  gu: {
    title: 'નવું પ્રોડક્ટ ઉમેરો',
    steps: {
      1: 'પગલું 1: મૂળભૂત માહિતી',
      2: 'પગલું 2: મીડિયા અપલોડ',
      3: 'પગલું 3: કિંમત અને સ્ટોક',
      4: 'પગલું 4: ઉપલબ્ધતા અને સમીક્ષા'
    },
    fields: {
      productName: {
        label: 'પ્રોડક્ટનું નામ *',
        placeholder: 'ઉદાહરણ: ઓર્ગેનિક મધ'
      },
      category: {
        label: 'શ્રેણી પસંદ કરો *',
        placeholder: 'શ્રેણી પસંદ કરો'
      },
      subcategory: {
        label: 'ઉપશ્રેણી *',
        placeholder: 'ઉપશ્રેણી દાખલ કરો અથવા પસંદ કરો'
      },
      description: {
        label: 'વર્ણન (વૈકલ્પિક)',
        placeholder: 'પ્રોડક્ટનું વર્ણન લખો'
      },
      mediaUpload: {
        title: 'ફોટા અપલોડ કરો',
        description: 'તમે વધુમાં વધુ 5 ફોટા અપલોડ કરી શકો છો',
        addMore: 'વધુ ફોટા ઉમેરો',
        tap: 'ફોટા અપલોડ કરવા માટે અહીં ટેપ કરો',
        photoNumber: 'ફોટો',
        removeConfirm: 'ફોટો દૂર કરો',
        removeMessage: 'શું તમે આ ફોટો દૂર કરવા માંગો છો?',
        yes: 'હા',
        no: 'ના'
      },
      youtube: {
        label: 'યુટ્યુબ વિડિઓ લિંક (વૈકલ્પિક)',
        placeholder: 'https://youtube.com/...'
      },
      imageSource: {
        title: 'ફોટો કેવી રીતે લેવો છે?',
        camera: 'કેમેરાથી ફોટો લો',
        gallery: 'ગેલેરીમાંથી ફોટો પસંદ કરો',
        cancel: 'રદ કરો'
      },
      unitType: {
        label: 'એકમનો પ્રકાર *',
        types: {
          kg: 'કિલોગ્રામ',
          g: 'ગ્રામ',
          piece: 'નંગ',
          thali: 'થાળી',
          pack: 'પેક',
          jar: 'જાર',
          bottle: 'બોટલ',
          pkt: 'પેકેટ',
          set: 'સેટ',
          box: 'બોક્સ'
        }
      },
      price: {
        label: 'મુખ્ય કિંમત (₹) *',
        placeholder: 'પ્રતિ કિંમત',
        subUnits: {
          title: 'અન્ય જથ્થાની કિંમત:',
          gram250: '250 ગ્રામ:',
          gram500: '500 ગ્રામ:'
        }
      },
      stock: {
        label: 'સ્ટોક *',
        placeholder: 'કેટલા યુનિટ્સ ઉપલબ્ધ છે'
      },
      availability: {
        label: 'પ્રોડક્ટ ક્યાં-ક્યાં ઉપલબ્ધ હશે? *',
        sublabel: 'શહેર અથવા વિસ્તારનું નામ લખો અને એન્ટર દબાવો',
        placeholder: 'ઉદાહરણ: સુરત, બારડોલી, વાપી...'
      }
    },
    review: {
      title: 'પ્રોડક્ટની માહિતી તપાસો',
      product: 'પ્રોડક્ટ:',
      price: 'કિંમત:',
      category: 'શ્રેણી:',
      stock: 'સ્ટોક:',
      back: 'પાછા જાઓ',
      confirm: 'હા, ઉમેરો',
      loading: 'પ્રોડક્ટ ઉમેરાઈ રહ્યું છે...'
    },
    buttons: {
      next: 'આગળ',
      review: 'સમીક્ષા',
      back: 'પાછળ'
    }
  }
}; 