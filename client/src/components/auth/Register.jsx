import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { FaEye, FaEyeSlash, FaLocationArrow } from 'react-icons/fa';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '', 
    mobile: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [showAddressTextarea, setShowAddressTextarea] = useState(false);

  // Validation function
  const validateField = (name, value) => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        return !value.trim() ? `${name.charAt(0).toUpperCase() + name.slice(1)} is required` : '';
      case 'mobile':
        return !value.trim() 
          ? 'Mobile number is required' 
          : !/^\d{10}$/.test(value) 
          ? 'Invalid mobile number' 
          : '';
      case 'password':
        return !value 
          ? 'Password is required' 
          : value.length < 6 
          ? 'Password must be at least 6 characters' 
          : '';
      case 'confirmPassword':
        return !value 
          ? 'Please confirm password' 
          : value !== formData.password 
          ? 'Passwords do not match' 
          : '';
      default:
        return !value.trim() ? `${name.charAt(0).toUpperCase() + name.slice(1)} is required` : '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for mobile number
    if (name === 'mobile') {
      // Only allow numbers
      const numbersOnly = value.replace(/[^0-9]/g, '');
      // Limit to 10 digits
      const limitedValue = numbersOnly.slice(0, 10);
      
      setFormData({
        ...formData,
        [name]: limitedValue
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });

      // Check if address length exceeds threshold
      if (name === 'address' && value.length > 50) {
        setShowAddressTextarea(true);
      }
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Function to handle textarea auto-grow
  const handleTextareaChange = (e) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
    handleChange(e);
  };

  const validateStep = (stepNumber) => {
    const newErrors = {};
    let fieldsToValidate = [];

    if (stepNumber === 1) {
      fieldsToValidate = ['firstName', 'lastName', 'mobile', 'password', 'confirmPassword'];
    } else if (stepNumber === 2) {
      fieldsToValidate = ['address', 'country', 'state', 'city', 'pincode'];
    }

    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkPhoneExists = async (phone) => {
    try {
      const response = await axios.post('/api/users/check-mobile', { 
        mobileno: phone // Changed from phone to mobileno to match server expectation
      });
      return response.data.exists;
    } catch (error) {
      console.error('Error checking phone:', error);
      toast.error('Error checking phone number');
      throw error;
    }
  };

  const handleNextStep = async () => {
    // First validate all fields
    const emptyFields = [];
    
    if (!formData.firstName.trim()) {
      emptyFields.push('First Name');
    }
    if (!formData.lastName.trim()) {
      emptyFields.push('Last Name');
    }
    if (!formData.mobile.trim()) {
      emptyFields.push('Mobile Number');
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      toast.error('Please enter a valid 10-digit mobile number', {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
        duration: 3000,
        position: 'top-center',
      });
      return;
    }
    if (!formData.password) {
      emptyFields.push('Password');
    } else if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters', {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
        duration: 3000,
        position: 'top-center',
      });
      return;
    }
    if (!formData.confirmPassword) {
      emptyFields.push('Confirm Password');
    } else if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match', {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
        duration: 3000,
        position: 'top-center',
      });
      return;
    }

    // If there are empty fields, show a single toast message
    if (emptyFields.length > 0) {
      toast.error(`Please fill in the following fields: ${emptyFields.join(', ')}`, {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
        duration: 3000,
        position: 'top-center',
      });
      return;
    }

    try {
      // Check if phone number already exists
      const phoneExists = await checkPhoneExists(formData.mobile);
      
      if (phoneExists) {
        toast.error('This mobile number is already registered', {
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
          duration: 3000,
          position: 'top-center',
        });
        return;
      }

      // If everything is valid and phone is not registered, proceed to next step
      setStep(2);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong. Please try again.', {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
        duration: 3000,
        position: 'top-center',
      });
    }
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate step 2 fields
    const stepErrors = {};
    
    if (!formData.address?.trim()) {
      stepErrors.address = 'Address is required';
    }
    if (!formData.city?.trim()) {
      stepErrors.city = 'City is required';
    }
    if (!formData.state?.trim()) {
      stepErrors.state = 'State is required';
    }
    if (!formData.country?.trim()) {
      stepErrors.country = 'Country is required';
    }
    if (!formData.pincode?.trim()) {
      stepErrors.pincode = 'Pincode is required';
    }

    setErrors(stepErrors);

    if (Object.keys(stepErrors).length > 0) {
      toast('Please fill in all address details', {
        icon: '📍',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('/api/users/signup', {
        firstname: formData.firstName,
        lastname: formData.lastName,
        mobileno: formData.mobile,
        password: formData.password,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        pincode: formData.pincode,
        userType: "buyer",
        platformType: ["b2c"]
      });

      if (response.data.success) {
        toast.success('Welcome to Bazario! 🎉', {
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
        navigate('/login');
      }
    } catch (error) {
      setServerError(error.response?.data?.message || 'Registration failed');
      toast.error(error.response?.data?.message || 'Registration failed', {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    setIsLocationLoading(true);
    try {
      if ("geolocation" in navigator) {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          });
        });

        const { latitude, longitude } = position.coords;
        console.log('📍 Location coordinates:', { latitude, longitude });

        try {
          // Using OpenStreetMap's Nominatim API (free, no API key needed)
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=18`,
            {
              headers: {
                'Accept-Language': 'en-US,en;q=0.9',
                'User-Agent': 'Bazario-App'
              }
            }
          );

          console.log('📫 Location data:', response.data);
          const address = response.data.address;
          
          // Fixed city detection logic for Indian cities
          let cityName = '';
          if (address.city) {
            cityName = address.city;
          } else if (address.town) {
            cityName = address.town;
          } else if (address.state_district) {
            cityName = address.state_district;
          }

          // Create street address including suburb/area name
          const streetAddress = [
            address.suburb,
            address.road,
            address.house_number,
            address.neighbourhood
          ].filter(Boolean).join(', ');
          
          const locationData = {
            address: streetAddress || '',
            city: cityName || '',
            state: address.state || '',
            country: address.country || '',
            pincode: address.postcode || ''
          };

          console.log('📝 Setting form data:', locationData);
          
          setFormData(prev => ({
            ...prev,
            ...locationData
          }));
        } catch (error) {
          console.error('❌ Error fetching address:', error);
          toast.error('Could not fetch address details. Please enter manually.', {
            style: {
              borderRadius: '10px',
              background: '#333',
              color: '#fff',
            },
          });
        }
      } else {
        toast.error('Your browser does not support location services', {
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
      }
    } catch (error) {
      console.error('❌ Location Error:', error);
      let errorMessage = 'Failed to get location. Please enter manually.';
      
      if (error.code === 1) {
        errorMessage = 'Location access denied. Please allow location access or enter details manually.';
      } else if (error.code === 2) {
        errorMessage = 'Location unavailable. Please check your GPS settings or enter manually.';
      } else if (error.code === 3) {
        errorMessage = 'Location request timed out. Please try again or enter manually.';
      }
      
      toast.error(errorMessage, {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    } finally {
      setIsLocationLoading(false);
    }
  };

  const ErrorMessage = ({ error }) => (
    error ? <p className="text-red-500 text-xs mt-1">{error}</p> : null
  );

  // Update the input field styling to remove red border on error
  const inputClassName = "mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2";

  return (
    <div className="min-h-screen flex items-center justify-center py-4 sm:py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md space-y-6 bg-white p-6 sm:p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-2 text-center text-2xl sm:text-3xl font-bold text-gray-900">
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Step {step} of 2
          </p>
        </div>

        {serverError && (
          <div className="bg-red-50 text-red-500 p-3 sm:p-4 rounded-md text-sm">
            {serverError}
          </div>
        )}

        <form className="mt-6 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          {/* Step 1 Form Fields */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  name="mobile"
                  id="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  maxLength="10"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? <FaEye className="text-gray-500" /> : <FaEyeSlash className="text-gray-500" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? <FaEye className="text-gray-500" /> : <FaEyeSlash className="text-gray-500" />}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNextStep}
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed mt-6"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                    Loading...
                  </div>
                ) : (
                  'Next'
                )}
              </button>
            </div>
          )}

          {/* Step 2 Form Fields */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={isLocationLoading}
                  className="group relative w-full flex items-center justify-center px-4 py-3 text-sm font-medium bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 text-indigo-600 rounded-xl transition-all duration-300 hover:shadow-md border border-indigo-100"
                >
                  {isLocationLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-t-2 border-indigo-600 rounded-full animate-spin"></div>
                      <span>Fetching your location...</span>
                    </div>
                  ) : (
                    <div className="relative flex items-center gap-2">
                      <div className="absolute -inset-0.5 bg-blue-50 rounded-full opacity-50 group-hover:animate-ping"></div>
                      <FaLocationArrow className="relative text-lg text-indigo-600 animate-bounce" />
                      <span className="relative">Quick Address Fill</span>
                    </div>
                  )}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                {showAddressTextarea ? (
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleTextareaChange}
                    onFocus={() => setShowAddressTextarea(true)}
                    rows="3"
                    style={{ minHeight: '80px', resize: 'none' }}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                ) : (
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    onFocus={() => {
                      if (formData.address?.length > 50) {
                        setShowAddressTextarea(true);
                      }
                    }}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 mt-6">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="w-full sm:w-auto flex justify-center py-2.5 px-6 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto flex justify-center py-2.5 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Register
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;