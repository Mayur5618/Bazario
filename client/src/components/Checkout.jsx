import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { selectCartItems, selectCartTotal, clearCart } from '../store/cartSlice';
import axios from 'axios';
import { FaArrowLeft, FaShoppingBag, FaTruck, FaMapMarkerAlt, FaUser } from 'react-icons/fa';
import { getStates, getCities } from '../services/locationService';

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [citySearchTerm, setCitySearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const [formData, setFormData] = useState({
    shippingAddress: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    paymentMethod: 'COD'
  });

  // Add new state for location loading
  const [isLocationLoading, setIsLocationLoading] = useState(false);

  // Add new state for profile loading
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  useEffect(() => {
    // Initialize component
    const initializeCheckout = async () => {
      try {
        setIsInitializing(true);
        // Load states
        setStates(getStates());
      } catch (error) {
        console.error('Error initializing checkout:', error);
        toast.error('Failed to initialize checkout');
      } finally {
        setIsInitializing(false);
      }
    };

    initializeCheckout();
  }, [cart, navigate, loading]);

  useEffect(() => {
    if (formData.shippingAddress.state) {
      const stateCities = getCities(formData.shippingAddress.state);
      setCities(stateCities);
      setFilteredCities(stateCities);
    } else {
      setCities([]);
      setFilteredCities([]);
    }
  }, [formData.shippingAddress.state]);

  // Filter cities based on search term
  useEffect(() => {
    if (citySearchTerm) {
      const filtered = cities.filter(city => 
        city.toLowerCase().includes(citySearchTerm.toLowerCase())
      );
      setFilteredCities(filtered);
    } else {
      setFilteredCities(cities);
    }
  }, [citySearchTerm, cities]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'city') {
      setCitySearchTerm(value);
      setFormData(prev => ({
        ...prev,
        shippingAddress: {
          ...prev.shippingAddress,
          city: '' // Clear selected city when typing
        }
      }));
      setSelectedIndex(-1); // Reset selected index when typing
    } else if (name === 'state') {
      // Reset city when state changes
      setFormData(prev => ({
        ...prev,
        shippingAddress: {
          ...prev.shippingAddress,
          state: value,
          city: '' // Reset city when state changes
        }
      }));
      setCitySearchTerm(''); // Reset city search term
      setSelectedIndex(-1); // Reset selected index
    } else {
      // Handle other form fields normally
      setFormData(prev => ({
        ...prev,
        shippingAddress: {
          ...prev.shippingAddress,
          [name]: value
        }
      }));
    }
  };

  // Update city filtering logic
  useEffect(() => {
    if (formData.shippingAddress.state && citySearchTerm) {
      const stateCities = getCities(formData.shippingAddress.state);
      const filtered = stateCities.filter(city => 
        city.toLowerCase().includes(citySearchTerm.toLowerCase())
      );
      setFilteredCities(filtered);
    } else if (formData.shippingAddress.state) {
      // Show all cities for the selected state if no search term
      setFilteredCities(getCities(formData.shippingAddress.state));
    } else {
      setFilteredCities([]);
    }
  }, [citySearchTerm, formData.shippingAddress.state]);

  const handleKeyDown = (e) => {
    if (!filteredCities.length) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredCities.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          const selectedCity = filteredCities[selectedIndex];
          setFormData(prev => ({
            ...prev,
            shippingAddress: {
              ...prev.shippingAddress,
              city: selectedCity
            }
          }));
          setCitySearchTerm(selectedCity);
          setSelectedIndex(-1);
        }
        break;
      case 'Escape':
        setSelectedIndex(-1);
        break;
    }
  };

  const handleCitySelect = (city) => {
    setFormData(prev => ({
      ...prev,
      shippingAddress: {
        ...prev.shippingAddress,
        city
      }
    }));
    setCitySearchTerm(city);
    setSelectedIndex(-1); // Reset selected index
  };

  const validateShippingDetails = () => {
    const { shippingAddress } = formData;
    const required = ['firstName', 'lastName', 'email', 'phone', 'street', 'city', 'state', 'pincode'];
    
    for (let field of required) {
      if (!shippingAddress[field]) {
        toast.error(`Please enter your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    if (!/\S+@\S+\.\S+/.test(shippingAddress.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    if (!/^\d{10}$/.test(shippingAddress.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }

    if (!/^\d{6}$/.test(shippingAddress.pincode)) {
      toast.error('Please enter a valid 6-digit pincode');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateShippingDetails()) {
      return;
    }

    setLoading(true);

    try {
      // Calculate subtotal from cart items
      const subtotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);

      const response = await axios.post('/api/orders/create', {
        shippingAddress: formData.shippingAddress,
        paymentMethod: formData.paymentMethod,
        items: cart.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price,
          subtotal: item.product.price * item.quantity
        })),
        subtotal: subtotal,
        total: subtotal // You can add shipping cost here if needed
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success && response.data.orders && response.data.orders.length > 0) {
        const orderId = response.data.orders[0]._id;
        
        // Clear cart first
        await dispatch(clearCart());
        
        // Navigate to success page with replace:true to prevent back navigation
        navigate(`/order-success/${orderId}`, { replace: true });
        
        // Show success message after navigation
        toast.success('Order placed successfully!');
        return;
      }
      
      throw new Error(response.data.message || 'Failed to place order');
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  // Function to get location from browser
  const getBrowserLocation = async () => {
    setIsLocationLoading(true);
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser');
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      const response = await axios.get(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      
      if (response.data.city) {
        setFormData(prev => ({
          ...prev,
          shippingAddress: {
            ...prev.shippingAddress,
            city: response.data.city,
            state: response.data.principalSubdivision || prev.shippingAddress.state
          }
        }));
        setCitySearchTerm(response.data.city);
      } else {
        throw new Error('Could not determine your city');
      }
    } catch (error) {
      console.error('Location error:', error);
      toast.error(error.message || 'Failed to get your location');
    } finally {
      setIsLocationLoading(false);
    }
  };

  // Function to fetch location from IP
  const fetchLocationFromIP = async () => {
    setIsLocationLoading(true);
    try {
      const response = await axios.get('https://ipapi.co/json/');
      if (response.data.city && response.data.region) {
        setFormData(prev => ({
          ...prev,
          shippingAddress: {
            ...prev.shippingAddress,
            city: response.data.city,
            state: response.data.region
          }
        }));
        setCitySearchTerm(response.data.city);
      } else {
        throw new Error('Could not determine your location');
      }
    } catch (error) {
      console.error('IP location error:', error);
      toast.error('Failed to get your location from IP');
    } finally {
      setIsLocationLoading(false);
    }
  };

  // Function to fetch user profile
  const fetchUserProfile = async () => {
    setIsProfileLoading(true);
    let retries = 3; // Number of retries
    
    while (retries > 0) {
      try {
        const response = await axios.get('/api/users/profile', {
          withCredentials: true
        });
        
        if (response.data.success && response.data.user) {
          const { user } = response.data;
          setFormData(prev => ({
            ...prev,
            shippingAddress: {
              ...prev.shippingAddress,
              firstName: user.firstname || '',
              lastName: user.lastname || '',
              email: user.email || '',
              phone: user.phone || user.mobileno || '', 
              street: user.address || '',
              city: user.city || '',
              state: user.state || '',
              pincode: user.pincode || ''
            }
          }));
          
          if (user.city) {
            setCitySearchTerm(user.city);
          }
          
          // If successful, break the retry loop
          break;
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Profile fetch error:', error);
        retries--;
        
        if (retries === 0) {
          toast.error('Failed to load your profile. Please fill details manually.');
        } else {
          // Wait for 1 second before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    setIsProfileLoading(false);
  };

  // Update AutoLocateButton to include profile loading state
  const AutoLocateButton = () => (
    <div className="flex gap-4 mb-6">
      <button
        type="button"
        onClick={fetchLocationFromIP}
        disabled={isLocationLoading}
        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
      >
        <FaMapMarkerAlt className={isLocationLoading ? 'animate-pulse' : ''} />
        {isLocationLoading ? 'Detecting location...' : 'Auto-detect my location'}
      </button>

      <button
        type="button"
        onClick={fetchUserProfile}
        disabled={isProfileLoading}
        className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
      >
        <FaUser className={isProfileLoading ? 'animate-pulse' : ''} />
        {isProfileLoading ? 'Loading profile...' : 'Auto-fill my details'}
      </button>
    </div>
  );

  // Show loading state while initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center mb-8 text-gray-500 text-sm">
          <button onClick={() => navigate('/cart')} className="flex items-center hover:text-gray-700">
            <FaArrowLeft className="mr-2" /> Back to Cart
          </button>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <FaTruck className="mr-3 text-blue-600" /> Shipping Details
              </h2>
              
              {/* Add Auto-locate button here */}
              <AutoLocateButton />
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.shippingAddress.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter first name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.shippingAddress.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter last name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.shippingAddress.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter email address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.shippingAddress.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter 10-digit phone number"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address *
                    </label>
                    <textarea
                      name="street"
                      value={formData.shippingAddress.street}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your street address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <select
                      name="state"
                      value={formData.shippingAddress.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select State</option>
                      {states.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="city"
                        value={citySearchTerm}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Type to search city"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autoComplete="off"
                      />
                      
                      {citySearchTerm && filteredCities.length > 0 && !formData.shippingAddress.city && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {filteredCities.map((city, index) => (
                            <div
                              key={city}
                              className={`px-4 py-2 cursor-pointer ${
                                index === selectedIndex ? 'bg-blue-50' : 'hover:bg-gray-100'
                              }`}
                              onClick={() => handleCitySelect(city)}
                            >
                              {city}
                            </div>
                          ))}
                        </div>
                      )}

                      {formData.shippingAddress.city && (
                        <div className="mt-1 text-sm text-gray-500">
                          Selected: {formData.shippingAddress.city}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.shippingAddress.pincode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter 6-digit pincode"
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Payment Method</h3>
                  <div className="space-y-4">
                    <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="COD"
                        checked={formData.paymentMethod === 'COD'}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          paymentMethod: e.target.value
                        }))}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span>Cash on Delivery</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <FaShoppingBag className="mr-3 text-blue-600" /> Order Summary
              </h2>
              <div className="space-y-2">
                {cart.map(item => (
                  <div key={item.product._id} className="flex justify-between">
                    <span>{item.product.name} x {item.quantity}</span>
                    <span>₹{(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 font-semibold">
                  <div className="flex justify-between">
                    <span>Total</span>
                    <span>₹{cartTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;