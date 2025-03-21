import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { SignInSuccess, SignInFailure, SignInStart } from '../../store/userSlice';
import { toast } from 'react-hot-toast';

const ErrorMessage = ({ error }) => {
  if (!error) return null;
  return (
    <p className="mt-2 text-sm text-red-600">
      {error}
    </p>
  );
};

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState({
    mobileno: '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSavedCredentials, setShowSavedCredentials] = useState(false);
  const [savedCredentials, setSavedCredentials] = useState(null);
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
      setSavedCredentials(JSON.parse(rememberedUser));
      
      // Delay showing the popup
      setTimeout(() => {
        setShowSavedCredentials(true);
        // Add small delay for animation
        setTimeout(() => {
          setIsPopupVisible(true);
        }, 100);
      }, 400); // Delay before popup appears

      // Auto hide after 1.5 seconds
      const hideTimer = setTimeout(() => {
        setIsPopupVisible(false);
        // Wait for fade out animation before removing
        setTimeout(() => {
          setShowSavedCredentials(false);
        }, 300);
      }, 5000); // Changed from 10000 to 1500 milliseconds

      return () => {
        clearTimeout(hideTimer);
      };
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For mobile number, only allow 10 digits
    if (name === 'mobileno') {
      // Only update if value is numeric and length is <= 10
      if (/^\d*$/.test(value) && value.length <= 10) {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    // Remove the immediate validation
    setServerError('');
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'mobileno':
        return value.trim() === ''
          ? 'Mobile number is required'
          : value.length !== 10
          ? 'Mobile number must be 10 digits'
          : '';
      case 'password':
        return value.trim() === ''
          ? 'Password is required'
          : value.length < 8
          ? 'Password must be at least 8 characters'
          : '';
      default:
        return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(SignInStart());
    setErrors({});
    
    // Validate form before submission
    const newErrors = {};
    
    // Validate mobile number
    if (!formData.mobileno.trim()) {
      newErrors.mobileno = 'Mobile number is required';
    } else if (formData.mobileno.length !== 10) {
      newErrors.mobileno = 'Mobile number must be 10 digits';
    }
    
    // Validate password
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }
    
    // If there are errors, show them and stop submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      dispatch(SignInFailure('Please fix the errors'));
      return;
    }

    try {
      const response = await axios.post('/api/users/signin', formData, {
        withCredentials: true,
      });
      
      if (response.data.success) {
        const userData = response.data.data;
        
        // Handle remember me
        if (rememberMe) {
          localStorage.setItem('rememberedUser', JSON.stringify({
            mobileno: formData.mobileno,
            password: formData.password
          }));
        } else {
          localStorage.removeItem('rememberedUser');
        }

        if(userData){
          dispatch(SignInSuccess(userData));
          toast.success('Login successful!');
          navigate('/');
        }
        else{
          const errorMessage = error.response?.data?.message || 'Login failed';
          dispatch(SignInFailure(errorMessage));
          toast.error(errorMessage);
        }
        
        switch(userData.userType) {
          case 'buyer':
            navigate('/');
            break;
          case 'seller':
            navigate('/seller/dashboard');
            break;
          case 'agency':
            navigate('/agency/dashboard');
            break;
          default:
            navigate('/');
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      setServerError(errorMessage);
      toast.error(errorMessage);
      dispatch(SignInFailure(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleRememberMe = (e) => {
    setRememberMe(e.target.checked);
  };

  const useSavedCredentials = () => {
    if (savedCredentials) {
      setFormData(savedCredentials);
      setRememberMe(true);
    }
    setIsPopupVisible(false);
    // Wait for fade out animation before removing
    setTimeout(() => {
      setShowSavedCredentials(false);
    }, 300);
  };

  const skipSavedCredentials = () => {
    setIsPopupVisible(false);
    // Wait for fade out animation before removing
    setTimeout(() => {
      setShowSavedCredentials(false);
    }, 300);
  };

  if (isAuthenticated) {
    return (
      <div className="flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome Back!
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            You are successfully logged in.
          </p>
          <Link to="/" className="text-indigo-600 hover:text-indigo-500">
            Go back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-[-20px] flex flex-col items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Bazario Logo - Moved outside the form */}
      <div className="mb-12">
        <Link to="/" className="block text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="relative w-16 h-16 transform hover:scale-110 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-2xl transform rotate-6 transition-transform hover:rotate-12 animate-gradient"></div>
              <div className="absolute inset-0 bg-white rounded-2xl transform -rotate-3 transition-transform hover:rotate-0 flex items-center justify-center shadow-lg">
                <span className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">B</span>
              </div>
            </div>
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent hover:scale-105 transition-transform">
              Bazario
            </h1>
          </div>
        </Link>
      </div>

      {/* Saved Login Details Popup */}
      {showSavedCredentials && (
        <div 
          className={`fixed top-4 right-4 z-50 transition-all duration-300 ease-in-out transform ${
            isPopupVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 -translate-y-4'
          }`}
        >
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">
                  Saved Login Details Found
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    Would you like to use your saved login details?
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    Mobile: {savedCredentials?.mobileno}
                  </p>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={useSavedCredentials}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Use Saved Details
                  </button>
                  <button
                    onClick={skipSavedCredentials}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Skip
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="border-[1px] border-gray-300 max-w-md w-full space-y-6 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="text-center text-2xl font-bold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Mobile Number Input */}
            <div>
              <label htmlFor="mobileno" className="block text-sm font-medium text-gray-700">
                Mobile Number 
              </label>
              <input
                type="tel"
                name="mobileno"
                value={formData.mobileno}
                onChange={handleChange}
                maxLength="10"
                pattern="[0-9]{10}"
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.mobileno ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
              />
              <ErrorMessage error={errors.mobileno} />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password 
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 pr-10`}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-gray-500"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-gray-500"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  )}
                </button>
              </div>
              <ErrorMessage error={errors.password} />
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={handleRememberMe}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 cursor-pointer">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Forgot your password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isLoading
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  'Login'
                )}
              </button>
              
              {serverError && (
                <div className="bg-red-50 text-sm mt-3 flex items-center gap-2 text-red-500 p-4 rounded-md text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-red-500">
                    <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 15V17H13V15H11ZM11 7V13H13V7H11Z"></path>
                  </svg>
                  {serverError}
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Register Link - Moved up and styled better */}
        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Register now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// Add this CSS at the top of the file after imports
const style = document.createElement('style');
style.textContent = `
  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  .animate-gradient {
    background-size: 200% 200%;
    animation: gradient 8s ease infinite;
  }
`;
document.head.appendChild(style);

export default Login;