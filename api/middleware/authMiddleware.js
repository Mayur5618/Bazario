import jwt from 'jsonwebtoken';
import Seller from '../models/seller.model.js';
import Buyer from '../models/buyer.model.js';
import Agency from '../models/agency.model.js';
import { promisify } from 'util';

// Protect routes
// export const protect = async (req, res, next) => {
//     try {
//         // Get token
//         const token = req.headers.authorization?.split(' ')[1];
        
//         if (!token) {
//             return res.status(401).json({
//                 success: false,
//                 message: 'Please login to access this resource'
//             });
//         }

//         // Verify token
//         const decoded = jwt.verify(token, 'your-temporary-secret-key');

//         // Find user - check all user types
//         let user = null;
        
//         try {
//             switch (decoded.userType) {
//                 case 'seller':
//                     user = await Seller.findById(decoded.id).select('+platformType');
//                     break;
//                 case 'buyer':
//                     user = await Buyer.findById(decoded.id);
//                     break;
//                 case 'agency':
//                     user = await Agency.findById(decoded.id).select('+platformType');
//                     break;
//                 default:
//                     throw new Error('Invalid user type');
//             }

//             // Debug log
//             console.log('Found user:', {
//                 id: user?._id,
//                 userType: user?.userType,
//                 platformType: user?.platformType
//             });

//         } catch (error) {
//             console.error('User find error:', error);
//             throw error;
//         }

//         if (!user) {
//             return res.status(401).json({
//                 success: false,
//                 message: 'User not found or session expired. Please login again.'
//             });
//         }

//         // Ensure platformType is always an array for sellers and agencies
//         if (['seller', 'agency'].includes(user.userType)) {
//             user.platformType = Array.isArray(user.platformType) ? user.platformType : [user.platformType];
//         }

//         // Request-specific authorization checks
//         if (req.baseUrl === '/api/requests') {
//             // For request routes
//             if (req.path === '/send' && user.userType !== 'agency') {
//                 return res.status(403).json({
//                     success: false,
//                     message: 'Only agencies can send requests'
//                 });
//             }

//             if ((req.path.includes('/accept/') || req.path.includes('/reject/')) && user.userType !== 'seller') {
//                 return res.status(403).json({
//                     success: false,
//                     message: 'Only sellers can accept or reject requests'
//                 });
//             }
//         }

//         // Add user to request
//         req.user = user;
//         next();

//     } catch (error) {
//         console.error('Auth middleware error:', error);

//         if (error.name === 'JsonWebTokenError') {
//             return res.status(401).json({
//                 success: false,
//                 message: 'Invalid token. Please login again.'
//             });
//         }
        
//         if (error.name === 'TokenExpiredError') {
//             return res.status(401).json({
//                 success: false,
//                 message: 'Your session has expired. Please login again.'
//             });
//         }

//         res.status(401).json({
//             success: false,
//             message: 'Authentication failed'
//         });
//     }
// };

export const protect = async (req, res, next) => {
    try {
        // Get token from cookies
        const token = req.cookies.access_token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Please log in to access this resource'
            });
        }

        // Verify token
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

        // Find complete user based on type
        let user = null;
        switch (decoded.userType) {
            case 'seller':
                user = await Seller.findById(decoded.id).select('+platformType');
                break;
            case 'agency':
                user = await Agency.findById(decoded.id).select('+platformType');
                break;
            default:
                user = await Buyer.findById(decoded.id);
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found or session expired'
            });
        }

        // Add complete user object to request
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

// Check if user is seller with platform type access
export const seller = (req, res, next) => {
    if (req.user.userType !== 'seller') {
        return res.status(403).json({
            success: false, 
            message: 'Access denied. Sellers only.'
        });
    }

    // Check if seller has platformType
    if (!req.user.platformType || !Array.isArray(req.user.platformType) || req.user.platformType.length === 0) {
        return res.status(403).json({
            success: false,
            message: 'Seller platform type not configured. Please update your profile.'
        });
    }

    next();
};

// Check if user is agency with platform type access
export const agency = (req, res, next) => {
    console.log('Agency middleware - User:', {
        userType: req.user?.userType,
        platformType: req.user?.platformType,
        id: req.user?._id
    });

    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'User not authenticated'
        });
    }

    if (req.user.userType !== 'agency') {
        console.log('Access denied - Not an agency. User type:', req.user.userType);
        return res.status(403).json({
            success: false,
            message: 'Access denied. Agencies only.'
        });
    }

    // Check if agency has platformType
    if (!req.user.platformType || !Array.isArray(req.user.platformType) || req.user.platformType.length === 0) {
        console.log('Access denied - No platform type configured');
        return res.status(403).json({
            success: false,
            message: 'Agency platform type not configured. Please update your profile.'
        });
    }

    console.log('Agency access granted');
    next();
};

// Check if user is seller or agency with platform type access
export const sellerOrAgency = (req, res, next) => {
    if (!['seller', 'agency'].includes(req.user.userType)) {
        return res.status(403).json({
            success: false, 
            message: 'Access denied. Sellers or Agencies only.'
        });
    }

    // Check if user has platformType
    if (!req.user.platformType || !Array.isArray(req.user.platformType) || req.user.platformType.length === 0) {
        return res.status(403).json({
            success: false,
            message: 'Platform type not configured. Please update your profile.'
        });
    }

    next();
};

// fourth method

// export const verifyToken = (req, res, next) => {
//   const token = req.cookies.access_token;
  
//   if (!token) {
//     return res.status(401).json({
//       success: false,
//       message: 'Access denied'
//     });
//   }

//   try {
//     const decoded = jwt.verify(token, 'your-temporary-secret-key');
//     req.user = decoded;
//     next();
//   } catch (error) {
//     res.status(401).json({
//       success: false,
//       message: 'Invalid token'
//     });
//   }
// };


// export const verifyToken=async (req,res,next)=>{
//     const token = req.cookies.access_token;
//     if(!token)
//     {
//         return next(errorHandler(401,"Unauthorized"));
//     }
//     jwt.verify(token,'your-temporary-secret-key',(err,user)=>{
//         if(err)
//         {
//             return next(errorHandler(401,"Unauthorized"));
//         }
//         req.user=user;
//         next();
//     })
// }


// export const verifyToken = (req, res, next) => {
//   try {
//     // Check for token in cookies or Authorization header
//     const token = req.cookies.access_token;
//     console.log(token);
//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: 'Please login to continue.'
//       });
//     }

//     const decoded = jwt.verify(token, 'your-temporary-secret-key');
//     req.user = decoded;
//     next();
//   } catch (error) {
//     res.status(401).json({
//       success: false,
//       message: 'Invalid token'
//     });
//   }
// };

// export const verifyToken = async (req, res, next) => {
//     try {
//       const token = req.cookies.access_token;
  
//       if (!token) {
//         return res.status(401).json({
//           success: false,
//           message: 'Please login to continue'
//         });
//       }
  
//       const decoded = jwt.verify(token, 'your-temporary-secret-key');
  
//       // Find user based on decoded token
//       let user = null;
//       switch (decoded.userType) {
//         case 'seller':
//           user = await Seller.findById(decoded.id);
//           break;
//         case 'buyer':
//           user = await Buyer.findById(decoded.id);
//           break;
//         case 'agency':
//           user = await Agency.findById(decoded.id);
//           break;
//       }
  
//       if (!user) {
//         return res.status(401).json({
//           success: false,
//           message: 'User not found'
//         });
//       }
  
//       req.user = user;
//       next();
//     } catch (error) {
//       console.error('Auth middleware error:', error);
//       res.status(401).json({
//         success: false,
//         message: 'Invalid token'
//       });
//     }
//   };

export const verifyToken = async (req, res, next) => {
    try {
        // Get token from cookie
        const token = req.cookies.access_token;
        
        console.log('Token:', token); // Debug log
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Please login.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded); // Debug log

        // Find user based on token data with platformType field
        let user;
        switch (decoded.userType) {
            case 'buyer':
                user = await Buyer.findById(decoded.id);
                break;
            case 'seller':
                user = await Seller.findById(decoded.id).select('+platformType');
                break;
            case 'agency':
                user = await Agency.findById(decoded.id).select('+platformType');
                break;
            default:
                throw new Error('Invalid user type');
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        // Ensure platformType is always an array for sellers and agencies
        if (['seller', 'agency'].includes(decoded.userType) && user.platformType) {
            user.platformType = Array.isArray(user.platformType) ? user.platformType : [user.platformType];
        }

        // Explicitly set userType from decoded token
        user.userType = decoded.userType;

        console.log('User object:', {
            id: user._id,
            userType: user.userType,
            platformType: user.platformType
        }); // Debug log

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};
  
export const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!allowedRoles.includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};