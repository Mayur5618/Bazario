// // // // import React, { createContext, useContext, useState, useEffect } from 'react';
// // // // import { useCart } from '../CartContext';

// // // // const AuthContext = createContext();

// // // // export const AuthProvider = ({ children }) => {
// // // //   const [user, setUser] = useState(null);
// // // //   const [loading, setLoading] = useState(true);
// // // //   const { clearCart } = useCart();

// // // //   useEffect(() => {
// // // //     // Check if user is logged in
// // // //     const token = localStorage.getItem('token');
// // // //     const userData = localStorage.getItem('user');
    
// // // //     if (token && userData) {
// // // //       setUser(JSON.parse(userData));
// // // //     }
// // // //     setLoading(false);
// // // //   }, []);

// // // //   const login = (userData, token) => {
// // // //     localStorage.setItem('token', token);
// // // //     localStorage.setItem('user', JSON.stringify(userData));
// // // //     setUser(userData);
// // // //   };

// // // //   const logout = () => {
// // // //     localStorage.removeItem('token');
// // // //     localStorage.removeItem('user');
// // // //     setUser(null);
// // // //     clearCart();
// // // //   };

// // // //   return (
// // // //     <AuthContext.Provider value={{ user, login, logout, loading }}>
// // // //       {children}
// // // //     </AuthContext.Provider>
// // // //   );
// // // // };

// // // // export const useAuth = () => {
// // // //   const context = useContext(AuthContext);
// // // //   if (!context) {
// // // //     throw new Error('useAuth must be used within an AuthProvider');
// // // //   }
// // // //   return context;
// // // // };

// // // // import React, { createContext, useContext, useState, useEffect } from 'react';
// // // // import { useNavigate } from 'react-router-dom';

// // // // const AuthContext = createContext();

// // // // export const useAuth = () => {
// // // //   const context = useContext(AuthContext);
// // // //   if (!context) {
// // // //     throw new Error('useAuth must be used within an AuthProvider');
// // // //   }
// // // //   return context;
// // // // };

// // // // export const AuthProvider = ({ children }) => {
// // // //   const [user, setUser] = useState(null);
// // // //   const [loading, setLoading] = useState(true);
// // // //   const navigate = useNavigate();

// // // //   useEffect(() => {
// // // //     // Check if user is logged in
// // // //     const token = localStorage.getItem('token');
// // // //     const userData = localStorage.getItem('user');
    
// // // //     if (token && userData) {
// // // //       setUser(JSON.parse(userData));
// // // //     }
// // // //     setLoading(false);
// // // //   }, []);

// // // //   const login = (userData, token) => {
// // // //     localStorage.setItem('token', token);
// // // //     localStorage.setItem('user', JSON.stringify(userData));
// // // //     setUser(userData);
// // // //   };

// // // //   const logout = () => {
// // // //     localStorage.removeItem('token');
// // // //     localStorage.removeItem('user');
// // // //     setUser(null);
// // // //   };

// // // //   const value = {
// // // //     user,
// // // //     login,
// // // //     logout,
// // // //     loading
// // // //   };

// // // //   return (
// // // //     <AuthContext.Provider value={value}>
// // // //       {children}
// // // //     </AuthContext.Provider>
// // // //   );
// // // // };

// // // import React, { createContext, useContext, useState, useEffect } from 'react';
// // // import { useNavigate } from 'react-router-dom';
// // // import { toast } from 'react-hot-toast';

// // // const AuthContext = createContext();

// // // export const useAuth = () => {
// // //   const context = useContext(AuthContext);
// // //   if (!context) {
// // //     throw new Error('useAuth must be used within an AuthProvider');
// // //   }
// // //   return context;
// // // };

// // // export const AuthProvider = ({ children }) => {
// // //   const [user, setUser] = useState(null);
// // //   const [loading, setLoading] = useState(true);
// // //   const navigate = useNavigate();

// // //   // Check authentication status on mount
// // //   useEffect(() => {
// // //     checkAuth();
// // //   }, []);

// // //   const checkAuth = () => {
// // //     try {
// // //       const token = localStorage.getItem('token');
// // //       const storedUser = localStorage.getItem('user');

// // //       if (token && storedUser) {
// // //         const userData = JSON.parse(storedUser);
// // //         setUser(userData);
// // //       } else {
// // //         setUser(null);
// // //       }
// // //     } catch (error) {
// // //       console.error('Auth check error:', error);
// // //       setUser(null);
// // //       localStorage.removeItem('token');
// // //       localStorage.removeItem('user');
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   const login = async (userData, token) => {
// // //     try {
// // //       // Store user data and token
// // //       localStorage.setItem('token', token);
// // //       localStorage.setItem('user', JSON.stringify(userData));
// // //       setUser(userData);
// // //       toast.success('Login successful!');
// // //       navigate('/');
// // //     } catch (error) {
// // //       console.error('Login error:', error);
// // //       toast.error('Login failed');
// // //     }
// // //   };

// // //   const logout = () => {
// // //     try {
// // //       // Clear storage and state
// // //       localStorage.removeItem('token');
// // //       localStorage.removeItem('user');
// // //       setUser(null);
// // //       toast.success('Logged out successfully');
// // //       navigate('/login');
// // //     } catch (error) {
// // //       console.error('Logout error:', error);
// // //       toast.error('Logout failed');
// // //     }
// // //   };

// // //   const updateUser = (updatedData) => {
// // //     try {
// // //       const currentUser = { ...user, ...updatedData };
// // //       localStorage.setItem('user', JSON.stringify(currentUser));
// // //       setUser(currentUser);
// // //     } catch (error) {
// // //       console.error('Update user error:', error);
// // //       toast.error('Failed to update user data');
// // //     }
// // //   };

// // //   const value = {
// // //     user,
// // //     login,
// // //     logout,
// // //     loading,
// // //     updateUser,
// // //     isAuthenticated: !!user
// // //   };

// // //   if (loading) {
// // //     return <div>Loading...</div>; // Or your loading component
// // //   }

// // //   return (
// // //     <AuthContext.Provider value={value}>
// // //       {children}
// // //     </AuthContext.Provider>
// // //   );
// // // };


// // //second method
// // // import React, { createContext, useContext, useState, useEffect } from 'react';
// // // import { useNavigate } from 'react-router-dom';
// // // import { toast } from 'react-hot-toast';
// // // import axios from 'axios';


// // // const AuthContext = createContext();

// // // export const useAuth = () => {
// // //   const context = useContext(AuthContext);
// // //   if (!context) {
// // //     throw new Error('useAuth must be used within an AuthProvider');
// // //   }
// // //   return context;
// // // };

// // // export const AuthProvider = ({ children }) => {
// // //   const [user, setUser] = useState(null);
// // //   const [loading, setLoading] = useState(true);
// // //   const navigate = useNavigate();

// // //   // Check authentication status on mount and token change
// // //   useEffect(() => {
// // //     checkAuth();
// // //   }, []);

// // //   // const checkAuth = async () => {
// // //   //   try {
// // //   //     const token = localStorage.getItem('token');
// // //   //     const storedUser = localStorage.getItem('user');

// // //   //     if (!token || !storedUser) {
// // //   //       setUser(null);
// // //   //       setLoading(false);
// // //   //       return;
// // //   //     }

// // //   //     try {
// // //   //       const userData = JSON.parse(storedUser);
// // //   //       setUser(userData);

// // //   //       // Optionally verify token with backend
// // //   //       // const response = await axios.get('/api/auth/verify', {
// // //   //       //   headers: { Authorization: `Bearer ${token}` }
// // //   //       // });
// // //   //       // if (!response.data.valid) {
// // //   //       //   throw new Error('Invalid token');
// // //   //       // }
// // //   //     } catch (parseError) {
// // //   //       console.error('Failed to parse stored user data');
// // //   //       localStorage.removeItem('token');
// // //   //       localStorage.removeItem('user');
// // //   //       setUser(null);
// // //   //     }
// // //   //   } catch (error) {
// // //   //     console.error('Auth check error:', error);
// // //   //     localStorage.removeItem('token');
// // //   //     localStorage.removeItem('user');
// // //   //     setUser(null);
// // //   //   } finally {
// // //   //     setLoading(false);
// // //   //   }
// // //   // };

// // //   // const login = async (userData, token) => {
// // //   //   try {
// // //   //     // Store user data and token
// // //   //     const userToStore = {
// // //   //       id: userData._id,
// // //   //       email: userData.email,
// // //   //       firstname: userData.firstname,
// // //   //       lastname: userData.lastname,
// // //   //       role: userData.role,
// // //   //       profilePhoto: userData.profilePhoto
// // //   //     };

// // //   //     localStorage.setItem('token', token);
// // //   //     localStorage.setItem('user', JSON.stringify(userToStore));
      
// // //   //     setUser(userToStore);
// // //   //     toast.success('Login successful!');
// // //   //     navigate('/');
// // //   //   } catch (error) {
// // //   //     console.error('Login error:', error);
// // //   //     toast.error('Login failed');
// // //   //     throw error;
// // //   //   }
// // //   // };

// // //   // const logout = () => {
// // //   //   try {
// // //   //     localStorage.removeItem('token');
// // //   //     localStorage.removeItem('user');
// // //   //     setUser(null);
// // //   //     toast.success('Logged out successfully');
// // //   //     navigate('/login');
// // //   //   } catch (error) {
// // //   //     console.error('Logout error:', error);
// // //   //     toast.error('Logout failed');
// // //   //   }
// // //   // };

// // //   const checkAuth = async () => {
// // //     try {
// // //       // Instead of checking localStorage, make an API call to verify the cookie
// // //       const response = await axios.get('/api/users/verify', {
// // //         withCredentials: true
// // //       });

// // //       if (response.data.success) {
// // //         setUser(response.data.data);
// // //       } else {
// // //         setUser(null);
// // //       }
// // //     } catch (error) {
// // //       console.error('Auth check error:', error);
// // //       setUser(null);
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   const login = async (userData) => {
// // //     try {
// // //       setUser(userData);
// // //       toast.success('Login successful!');
// // //     } catch (error) {
// // //       console.error('Login error:', error);
// // //       toast.error('Login failed');
// // //       throw error;
// // //     }
// // //   };

// // //   const logout = async () => {
// // //     try {
// // //       // Make API call to clear the cookie
// // //       await axios.post('/api/users/logout', {}, {
// // //         withCredentials: true
// // //       });
      
// // //       setUser(null);
// // //       toast.success('Logged out successfully');
// // //       navigate('/login');
// // //     } catch (error) {
// // //       console.error('Logout error:', error);
// // //       toast.error('Logout failed');
// // //     }
// // //   };
// // //   const updateUser = (updatedData) => {
// // //     try {
// // //       const currentUser = { ...user, ...updatedData };
// // //       localStorage.setItem('user', JSON.stringify(currentUser));
// // //       setUser(currentUser);
// // //       toast.success('Profile updated successfully');
// // //     } catch (error) {
// // //       console.error('Update user error:', error);
// // //       toast.error('Failed to update profile');
// // //     }
// // //   };

// // //   const value = {
// // //     user,
// // //     login,
// // //     logout,
// // //     loading,
// // //     updateUser,
// // //     isAuthenticated: !!user
// // //   };

// // //   if (loading) {
// // //     return (
// // //       <div className="flex items-center justify-center min-h-screen">
// // //         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
// // //       </div>
// // //     );
// // //   }

// // //   return (
// // //     <AuthContext.Provider value={value}>
// // //       {children}
// // //     </AuthContext.Provider>
// // //   );
// // // };

// // import React, { createContext, useContext, useState } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import axios from 'axios';
// // import { toast } from 'react-hot-toast';

// // const AuthContext = createContext();

// // export const useAuth = () => {
// //   const context = useContext(AuthContext);
// //   if (!context) {
// //     throw new Error('useAuth must be used within an AuthProvider');
// //   }
// //   return context;
// // };

// // export const AuthProvider = ({ children }) => {
// //   const [user, setUser] = useState(null);
// //   const navigate = useNavigate();

// //   const login = async (userData) => {
// //     try {
// //       setUser(userData);
// //       toast.success('Login successful!');
// //       navigate('/');
// //     } catch (error) {
// //       console.error('Login error:', error);
// //       toast.error('Login failed');
// //     }
// //   };

// //   const logout = () => {
// //     try {
// //       setUser(null);
// //       navigate('/login');
// //       toast.success('Logged out successfully');
// //     } catch (error) {
// //       console.error('Logout error:', error);
// //       toast.error('Logout failed');
// //     }
// //   };

// //   return (
// //     <AuthContext.Provider value={{ user, login, logout }}>
// //       {children}
// //     </AuthContext.Provider>
// //   );
// // };

// // export default AuthProvider;

// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { toast } from 'react-hot-toast';

// const AuthContext = createContext();

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// 