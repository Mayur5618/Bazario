// // components/auth/Login.jsx
// import React, { useState, useEffect } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import axios from 'axios';
// import { useDispatch } from 'react-redux';
// import { SignInSuccess, SignInFailure } from '../../store/userSlice';
// import { useSelector } from 'react-redux';
// import { toast } from 'react-hot-toast';


// const Login = () => {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     mobileno: '',
//     password: ''
//   });
//   const dispatch = useDispatch();
//   const { login } = useAuth();

//   const [errors, setErrors] = useState({});
//   const [serverError, setServerError] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [isAuthenticated, setIsAuthenticated] = useState(false); // New state for authentication

//   // Check for token in local storage on component mount
//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       setIsAuthenticated(true); // Set authenticated state if token exists
//     }
//   }, []);

//   // Validation rules
//   const validateField = (name, value) => {
//     switch (name) {
//       case 'mobileno':
//         return value.trim() === ''
//           ? 'Mobile number is required'
//           : !/^[0-9]{10}$/.test(value)
//           ? 'Must be 10 digits'
//           : '';

//       case 'password':
//         return value.trim() === ''
//           ? 'Password is required'
//           : value.length < 8
//           ? 'Password must be at least 8 characters'
//           : '';

//       default:
//         return '';
//     }
//   };

//   // Handle input changes with validation
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));

//     // Clear server error when user starts typing
//     if (serverError) {
//       setServerError('');
//     }

//     // Validate field
//     const error = validateField(name, value);
//     setErrors(prev => ({
//       ...prev,
//       [name]: error
//     }));
//   };

//   // Validate all fields
//   const validateForm = () => {
//     const newErrors = {};
//     Object.keys(formData).forEach(key => {
//       const error = validateField(key, formData[key]);
//       if (error) newErrors[key] = error;
//     });

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   // const handleSubmit = async (e) => {
//   //   e.preventDefault();
    
//   //   if (!validateForm()) {
//   //     return;
//   //   }

//   //   setIsLoading(true);
//   //   setServerError('');

//   //   try {
//   //     const response = await axios.post('/api/users/signin', formData);
      
//   //     if (response.data.success) {
//   //       // Store token in localStorage
//   //       localStorage.setItem('token', response.data.token);
//   //       setIsAuthenticated(true); // Set authenticated state

//   //       // Redirect based on user type
//   //       switch(response.data.data.userType) {
//   //         case 'buyer':
//   //           navigate('/');
//   //           break;
//   //         case 'seller':
//   //           navigate('/seller/dashboard');
//   //           break;
//   //         case 'agency':
//   //           navigate('/agency/dashboard');
//   //           break;
//   //         default:
//   //           navigate('/');
//   //       }
//   //     }
//   //   } catch (error) {
//   //     setServerError(
//   //       error.response?.data?.message || 
//   //       'Login failed. Please check your credentials.'
//   //     );
//   //   } finally {
//   //     setIsLoading(false);
//   //   }
//   // };

//   // Error message component
  
// //   const handleSubmit = async (e) => {
// //     e.preventDefault(); // Prevent default form submission

// //     try {
// //         const response = await fetch('/api/users/signin', {
// //             method: 'POST',
// //             headers: {
// //                 'Content-Type': 'application/json',
// //             },
// //             body: JSON.stringify(formData),
// //         });

// //         const data = await response.json();
// //         console.log('Sign-in response:', data); // Log the response data

// //         if (data.success) {
// //             // Dispatch the action with user data including the token
// //             dispatch(SignInSuccess(data.data)); // Ensure this includes the token
// //             localStorage.setItem('token', data.data.token); // Store token in local storage
// //             navigate('/');
// //         } else {
// //             // Dispatch failure action if sign-in fails
// //             dispatch(SignInFailure(data.message)); 
// //             setServerError(data.message);
// //             console.error(data.message); // Log error message
// //         }
// //     } catch (error) {
// //         console.error('Error during sign-in:', error);
// //         dispatch(SignInFailure('An error occurred during sign-in.')); // Handle network or other errors
// //     }
// // };


//   const ErrorMessage = ({ error }) => (
//     error ? <p className="text-red-500 text-xs mt-1">{error}</p> : null
//   );

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//         const response = await axios.post('/api/users/signin', {
//            mobileno: formData.mobileno,
//            password: formData.password
//         });

//         // Store token in localStorage
//         localStorage.setItem('token', response.data.token);
//         localStorage.setItem('user', JSON.stringify(response.data.user));

//         toast.success('Login successful!');
//         navigate('/'); // or wherever you want to redirect
//     } catch (error) {
//         toast.error(error.response?.data?.message || 'Login failed');
//     }
// };

//   // Render welcome message if authenticated
//   if (isAuthenticated) {
//     return (
//       <div className="flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
//           <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//             Welcome Back!
//           </h2>
//           <p className="mt-2 text-center text-sm text-gray-600">
//             You are successfully logged in.
//           </p>
//           <Link to="/" className="text-indigo-600 hover:text-indigo-500">
//             Go back to Home
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className=" mt-[-20px] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className=" border-[1px] border-gray-300  max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
//         {/* Header */}
//         <div>
//           <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//             Sign in
//           </h2>
//         </div>

//         {/* Server Error */}
       

//         {/* Login Form */}
//         <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//           <div className="space-y-6">
//             {/* Mobile Number */}
//             <div>
//               <label 
//                 htmlFor="mobileno" 
//                 className="block text-sm font-medium text-gray-700"
//               >
//                 Mobile Number 
//               </label>
//               <input
//                 id="mobileno"
//                 type="text"
//                 name="mobileno"
//                 value={formData.mobileno}
//                 onChange={handleChange}
//                 className={`mt-1 block w-full px-3 py-2 border ${
//                   errors.mobileno 
//                     ? 'border-red-300' 
//                     : 'border-gray-300'
//                 } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
//               />
//               <ErrorMessage error={errors.mobileno} />
//             </div>

//             {/* Password */}
//             <div>
//               <label 
//                 htmlFor="password" 
//                 className="block text-sm font-medium text-gray-700"
//               >
//                 Password 
//               </label>
//               <input
//                 id="password"
//                 type="password"
//                 name="password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 className={`mt-1 block w-full px-3 py-2 border ${
//                   errors.password 
//                     ? 'border-red-300' 
//                     : 'border-gray-300'
//                 } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
//               />
//               <ErrorMessage error={errors.password} />
//             </div>

//             {/* Remember Me and Forgot Password */}
//             <div className="flex items-center justify-between">
//               <div className="flex items-center">
//                 <input
//                   id="remember-me"
//                   name="remember-me"
//                   type="checkbox"
//                   className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
//                 />
//                 <label 
//                   htmlFor="remember-me" 
//                   className="ml-2 block text-sm text-gray-900"
//                 >
//                   Remember me
//                 </label>
//               </div>

//               <div className="text-sm">
//                 <Link
//                   to="/forgot-password"
//                   className="font-medium text-indigo-600 hover:text-indigo-500"
//                 >
//                   Forgot your password?
//                 </Link>
//               </div>
//             </div>

//             {/* Submit Button */}
//             <div>
//               <button
//                 type="submit"
//                 disabled={isLoading}
//                 className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
//                   isLoading
//                     ? 'bg-indigo-400 cursor-not-allowed'
//                     : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
//                 }`}
//               >
//                 {isLoading ? (
//                   <span className="flex items-center">
//                     <svg 
//                       className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
//                       xmlns="http://www.w3.org/2000/svg" 
//                       fill="none" 
//                       viewBox="0 0 24 24"
//                     >
//                       <circle 
//                         className="opacity-25" 
//                         cx="12" 
//                         cy="12" 
//                         r="10" 
//                         stroke="currentColor" 
//                         strokeWidth="4"
//                       />
//                       <path 
//                         className="opacity-75" 
//                         fill="currentColor" 
//                         d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                       />
//                     </svg>
//                     Logging in...
//                   </span>
//                 ) : (
//                   'Login'
//                 )}
//               </button>
//               {serverError && (
//           <div className="bg-red-50 text-sm mt-3 flex items-center gap-2 text-red-500 p-4 rounded-md text-center">
//             <svg
//                         xmlns="http://www.w3.org/2000/svg"
//                         viewBox="0 0 24 24"
//                         fill="currentColor"
//                         className="h-5 w-5 text-red-500"
//                       >
//                         <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 15V17H13V15H11ZM11 7V13H13V7H11Z"></path>
//                       </svg>
//             {serverError}
//           </div>
//         )}
//             </div>
//           </div>
//         </form>

//         {/* Register Link */}
//         <div className="text-center">
//           <p className="text-sm text-gray-600">
//             Don't have an account?{' '}
//             <Link
//               to="/register"
//               className="font-medium text-indigo-600 hover:text-indigo-500"
//             >
//               Register now
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { SignInSuccess, SignInFailure, SignInStart } from '../../store/userSlice';
// import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    mobileno: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      navigate('/');
    }
  }, [navigate]);

  const validateField = (name, value) => {
    switch (name) {
      case 'mobileno':
        return value.trim() === ''
          ? 'Mobile number is required'
          : !/^[0-9]{10}$/.test(value)
          ? 'Must be 10 digits'
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setServerError('');
    setErrors(prev => ({
      ...prev,
      [name]: validateField(name, value)
    }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(SignInStart());
    
    if (!validateForm()) {
      return;
    }

    // setIsLoading(true);
    // setServerError('');

    try {
      const response = await axios.post('/api/users/signin', formData,{
        withCredentials: true,
      });
      
      if (response.data.success) {
        const userData = response.data.data;
        
        // Store in Redux
        // dispatch(SignInSuccess(userData));
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
        // Update Auth Context
        // await login(user, token);
        // await login(userData);
        

        // Store in localStorage
        // localStorage.setItem('token', token);
        // localStorage.setItem('user', JSON.stringify(user));
        
        
        // Redirect based on user type
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

  const ErrorMessage = ({ error }) => (
    error ? <p className="text-red-500 text-xs mt-1">{error}</p> : null
  );

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
    <div className="mt-[-20px] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="border-[1px] border-gray-300 max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Mobile Number Input */}
            <div>
              <label htmlFor="mobileno" className="block text-sm font-medium text-gray-700">
                Mobile Number 
              </label>
              <input
                id="mobileno"
                type="text"
                name="mobileno"
                value={formData.mobileno}
                onChange={handleChange}
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
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
              />
              <ErrorMessage error={errors.password} />
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
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

        {/* Register Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Register now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;