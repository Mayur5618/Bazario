import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { SignInSuccess, SignInFailure, SignInStart } from '../../store/userSlice';
import { toast } from 'react-hot-toast';

// Error message component
const ErrorMessage = ({ error }) => {
  if (!error) return null;
  return <p className="mt-2 text-sm text-red-600">{error}</p>;
};

// Saved credentials popup component
const SavedCredentialsPopup = ({ isVisible, onUse, onSkip, savedCredentials }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleSkip = () => {
    setIsExiting(true);
    setTimeout(() => {
      onSkip();
    }, 300);
  };

  const handleUse = () => {
    setIsExiting(false);
    onUse();
  };

  if (!isVisible) return null;
  
  return (
    <div className={`
      fixed sm:top-4 sm:right-4 sm:left-auto sm:bottom-auto
      top-auto bottom-0 left-0 right-0
      bg-white sm:rounded-xl rounded-t-xl shadow-md
      transform transition-all duration-300 ease-in-out
      ${isVisible ? 'translate-y-0 sm:translate-y-0 sm:translate-x-0 opacity-100' : 
        'translate-y-full sm:translate-y-0 sm:translate-x-full opacity-0'}
      ${isExiting ? 'translate-y-full sm:translate-y-0 sm:translate-x-full opacity-0' : ''}
      sm:w-[320px] w-full border border-gray-100
      sm:m-0 mx-auto
      z-50
    `}>
      <div className="p-4 sm:p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-medium text-gray-900 mb-1">Saved Login Details Found</h3>
            <p className="text-sm text-gray-600 mb-2">Would you like to use your saved login details?</p>
            {savedCredentials?.mobileno && (
              <p className="text-sm">
                <span className="text-gray-600">Mobile: </span>
                <span className="text-gray-900 font-medium">{savedCredentials.mobileno}</span>
              </p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 mt-4 sm:flex-row flex-col w-full">
          <button 
            onClick={handleUse}
            className="w-full sm:flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm rounded-lg font-medium
              hover:bg-blue-700 transition-colors duration-200"
          >
            Use Saved Details
          </button>
          <button 
            onClick={handleSkip}
            className="w-full sm:w-auto px-4 py-2.5 text-gray-600 text-sm hover:text-gray-800 font-medium
              transition-colors duration-200"
          >
            Skip
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full bg-gray-50">
        <div className="h-full bg-blue-600 animate-progress-slow"></div>
      </div>
    </div>
  );
};

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // State management
  const [formData, setFormData] = useState({
    mobileno: '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSavedCredentials, setShowSavedCredentials] = useState(false);
  const [savedCredentials, setSavedCredentials] = useState(null);
  const [isUsingSavedCredentials, setIsUsingSavedCredentials] = useState(false);

  // Check for authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/');
    }
  }, [navigate]);

  // Check for saved credentials on mount
  useEffect(() => {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
      try {
        const savedCreds = JSON.parse(rememberedUser);
        setSavedCredentials(savedCreds);
        setShowSavedCredentials(true);

        // Auto hide after 8 seconds (matching the progress bar animation)
        const timer = setTimeout(() => {
          setShowSavedCredentials(false);
        }, 8000);

        return () => clearTimeout(timer);
      } catch (error) {
        console.error('Error parsing saved credentials:', error);
        localStorage.removeItem('rememberedUser');
      }
    }
  }, []);

  // Form input handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'mobileno') {
      // Only allow numbers and max 10 digits
      if (/^\d*$/.test(value) && value.length <= 10) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear errors when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setServerError('');
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    // Mobile validation
    if (!formData.mobileno) {
      newErrors.mobileno = 'Mobile number is required';
    } else if (formData.mobileno.length !== 10) {
      newErrors.mobileno = 'Mobile number must be 10 digits';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    dispatch(SignInStart());

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
        }

        dispatch(SignInSuccess(userData));
        toast.success('Successfully logged in!');

        // Reset the using saved credentials flag
        setIsUsingSavedCredentials(false);

        // Navigate based on user type
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

  // Handle remember me toggle
  const handleRememberMe = (e) => {
    setRememberMe(e.target.checked);
    
    // Only clear saved credentials if we're not currently using them
    // This prevents immediate deletion when unchecking during login
    if (!e.target.checked && !isUsingSavedCredentials) {
      localStorage.removeItem('rememberedUser');
      setSavedCredentials(null);
    }
  };

  // Handle using saved credentials
  const useSavedCredentials = () => {
    if (savedCredentials) {
      setFormData(savedCredentials);
      setIsUsingSavedCredentials(true);
      setShowSavedCredentials(false);
    }
  };

  // Handle skipping saved credentials
  const skipSavedCredentials = () => {
    setShowSavedCredentials(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-4 sm:py-0 px-3 sm:px-6 lg:px-8">
      {/* Logo Component */}
      <div className="mb-6 sm:mb-8 sm:mt-[-45px]">
        <Link to="/" className="block text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="relative w-12 h-12 transform hover:scale-110 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-2xl transform rotate-6 transition-transform hover:rotate-12 animate-gradient"></div>
              <div className="absolute inset-0 bg-white rounded-2xl transform -rotate-3 transition-transform hover:rotate-0 flex items-center justify-center shadow-lg">
                <span className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">B</span>
              </div>
            </div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent hover:scale-105 transition-transform">
              Bazario
            </h1>
          </div>
        </Link>
      </div>

      {/* Saved Credentials Popup */}
      <SavedCredentialsPopup 
        isVisible={showSavedCredentials}
        onUse={useSavedCredentials}
        onSkip={skipSavedCredentials}
        savedCredentials={savedCredentials}
      />

      {/* Main Form */}
      <div className="w-[98%] sm:w-full max-w-[400px] bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white rounded-2xl z-0"></div>
        <div className="relative z-10">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-center text-xl sm:text-2xl font-bold text-gray-900">
              Sign In
            </h2>
          </div>

          <form className="mt-2 sm:mt-4 space-y-3 sm:space-y-4" onSubmit={handleSubmit}>
            {/* Mobile Number Input */}
            <div>
              <label htmlFor="mobileno" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Mobile Number
              </label>
              <input
                id="mobileno"
                type="tel"
                name="mobileno"
                value={formData.mobileno}
                onChange={handleChange}
                maxLength="10"
                pattern="[0-9]{10}"
                className="block w-full rounded-xl border border-gray-300 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                placeholder="Enter 10 digit mobile number"
              />
              <ErrorMessage error={errors.mobileno} />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full rounded-xl border border-gray-300 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:border-indigo-500 focus:ring-indigo-500 pr-12 transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  )}
                </button>
              </div>
              <ErrorMessage error={errors.password} />
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={handleRememberMe}
                  className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs sm:text-sm text-gray-700 cursor-pointer">
                  Remember me
                </label>
              </div>

              <div className="flex justify-start sm:justify-end">
                <Link to="/forgot-password" className="text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
                  Forgot your password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2.5 sm:py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm sm:text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors mt-4 sm:mt-6"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
            
            {/* Error Message */}
            {serverError && (
              <div className="bg-red-50 text-xs sm:text-sm mt-4 flex items-center gap-2 text-red-500 p-3 sm:p-4 rounded-xl text-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 sm:h-5 sm:w-5 text-red-500">
                  <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 15V17H13V15H11ZM11 7V13H13V7H11Z"></path>
                </svg>
                {serverError}
              </div>
            )}
          </form>

          {/* Register Link */}
          <div className="text-center mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
            <p className="text-xs sm:text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                Register now
              </Link>
            </p>
          </div>
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
  @keyframes progress-slow {
    0% { width: 100%; }
    100% { width: 0%; }
  }
  .animate-progress-slow {
    animation: progress-slow 8s linear forwards;
  }
`;
document.head.appendChild(style);

export default Login;