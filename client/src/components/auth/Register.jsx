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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors(prev => ({
        ...prev,
        [e.target.name]: ''
      }));
    }
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
    const stepErrors = {};
    
    if (!formData.firstName.trim()) {
      stepErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      stepErrors.lastName = 'Last name is required';
    }
    if (!formData.mobile.trim()) {
      stepErrors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      stepErrors.mobile = 'Invalid mobile number format';
    }
    if (!formData.password) {
      stepErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      stepErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.confirmPassword) {
      stepErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      stepErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(stepErrors);

    // If there are any validation errors, don't proceed
    if (Object.keys(stepErrors).length > 0) {
      toast.error('Please fix the errors before proceeding');
      return;
    }

    try {
      // Check if phone number already exists
      const phoneExists = await checkPhoneExists(formData.mobile);
      
      if (phoneExists) {
        setErrors(prev => ({
          ...prev,
          mobile: 'This phone number is already registered'
        }));
        toast.error('This phone number is already registered');
        return;
      }

      // If everything is valid and phone is not registered, proceed to next step
      setStep(2);
      toast.success('Step 1 completed successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong. Please try again.');
    }
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(2)) return;

    setIsLoading(true);
    try {
      const response = await axios.post('/api/users/register', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        mobile: formData.mobile,
        password: formData.password
      });

      if (response.data.success) {
        toast.success('Registration successful!');
        navigate('/login');
      }
    } catch (error) {
      setServerError(error.response?.data?.message || 'Registration failed');
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    setIsLocationLoading(true);
    try {
      if ("geolocation" in navigator) {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const { latitude, longitude } = position.coords;

        // Get address from coordinates using reverse geocoding
        const response = await axios.get(
          `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_OPENCAGE_API_KEY`
        );

        if (response.data.results.length > 0) {
          const location = response.data.results[0].components;
          
          setFormData(prev => ({
            ...prev,
            address: location.road || location.neighbourhood || '',
            city: location.city || location.town || '',
            state: location.state || '',
            country: location.country || '',
            pincode: location.postcode || ''
          }));

          toast.success('Location fetched successfully!');
        } else {
          toast.error('Could not fetch address details');
        }
      } else {
        toast.error('Geolocation is not supported by your browser');
      }
    } catch (error) {
      console.error('Error getting location:', error);
      toast.error('Failed to get location. Please enter manually.');
    } finally {
      setIsLocationLoading(false);
    }
  };

  const ErrorMessage = ({ error }) => (
    error ? <p className="text-red-500 text-xs mt-1">{error}</p> : null
  );

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Step {step} of 2
          </p>
        </div>

        {serverError && (
          <div className="bg-red-50 text-red-500 p-4 rounded-md">
            {serverError}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Step 1 Form Fields */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2`}
                    required
                  />
                  {errors.firstName && (
                    <p className="mt-2 text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300'
                    } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2`}
                    required
                  />
                  {errors.lastName && (
                    <p className="mt-2 text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  name="mobile"
                  id="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.mobile ? 'border-red-500' : 'border-gray-300'
                  } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2`}
                  required
                />
                {errors.mobile && (
                  <p className="mt-2 text-sm text-red-600">{errors.mobile}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={isLoading}
                  className={`inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                    ${isLoading ? 'bg-indigo-600 cursor-not-allowed hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500' : 'bg-indigo-600 cursor-pointer hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
                >
                  {isLoading ? 'Loading...' : 'Next'}
                </button>
              </div>
            </div>
          )}

          {/* Step 2 Form Fields */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={isLocationLoading}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {isLocationLoading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-t-2 border-indigo-600 rounded-full animate-spin mr-2"></div>
                      Loading...
                    </div>
                  ) : (
                    <>
                      <FaLocationArrow className="mr-2" />
                      Use Current Location
                    </>
                  )}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2`}
                />
                {errors.address && <ErrorMessage error={errors.address} />}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Pincode
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border ${
                      errors.pincode ? 'border-red-500' : 'border-gray-300'
                    } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2`}
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Register
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="mt-6 text-center">
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