import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaCamera, FaEdit, FaUser, FaCalendar, FaPhone, FaEnvelope, FaMapMarkerAlt, FaSignOutAlt, FaCog, FaHistory, FaHeart, FaChevronRight } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { updateUserProfile, updateProfileImage, logout } from '../store/userSlice';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    profileImage: null
  });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (userData) {
      setProfileData({
        firstName: userData.firstname || '',
        lastName: userData.lastname || '',
        email: userData.email || '',
        phone: userData.mobileno || '',
        address: userData.address || '',
        profileImage: userData.profileImage || null
      });
    }
  }, [userData]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const base64 = await convertToBase64(file);

      const response = await axios.post(
        'http://localhost:5000/api/users/upload-profile-image',
        {
          image: base64,
          userId: userData._id
        },
        {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (response.data.success) {
        dispatch(updateProfileImage(response.data.user.profileImage));
        toast.success('Profile image updated successfully');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.put(
        'http://localhost:5000/api/users/profile',
        {
          firstname: profileData.firstName,
          lastname: profileData.lastName,
          email: profileData.email,
          address: profileData.address,
        },
        {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (response.data.success) {
        dispatch(updateUserProfile({
          ...userData,
          firstname: profileData.firstName,
          lastname: profileData.lastName,
          email: profileData.email,
          address: profileData.address,
        }));
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/users/logout',
        {},
        { withCredentials: true }
      );
      
      if (response.data.success) {
        dispatch(logout());
        navigate('/login');
        toast.success('Logged out successfully');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl sm:rounded-2xl shadow-sm overflow-hidden mb-4 sm:mb-6"
        >
          {/* Cover photo with reduced height for mobile */}
          <div className="h-24 sm:h-32 bg-gradient-to-r from-blue-600 to-purple-600 relative">
            <div className="absolute -bottom-4 sm:-bottom-10 left-4 sm:left-8 flex items-center">
              {/* Profile Image */}
              <div className="relative group">
                <div className="w-16 h-16 sm:w-28 sm:h-28 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
                  {isUploading ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    <>
                      {userData?.profileImage ? (
                        <img
                          src={userData.profileImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-blue-50 flex items-center justify-center">
                          <FaUser className="text-xl sm:text-3xl text-blue-300" />
                        </div>
                      )}
                      <label className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center cursor-pointer rounded-full">
                        <FaCamera className="text-white opacity-0 group-hover:opacity-100 text-base sm:text-xl" />
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={isUploading}
                        />
                      </label>
                    </>
                  )}
                </div>
              </div>
              {/* Name Display */}
              <div className="ml-3 sm:ml-6 sm:mb-2">
                <h1 className="text-lg sm:text-2xl font-bold text-white tracking-wide">
                  {userData?.firstname} {userData?.lastname}
                </h1>
              </div>
            </div>
          </div>

          {/* Content section with adjusted padding for mobile */}
          <div className="mt-8 sm:mt-14 px-4 sm:px-8 pb-6 sm:pb-8">
            <div className="grid grid-cols-1 gap-6 sm:gap-8">
              {/* Personal Information */}
              <div className="space-y-4 sm:space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">Personal Information</h2>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium flex items-center gap-1"
                    >
                      <FaEdit className="text-sm sm:text-base" />
                      Edit
                    </button>
                  )}
                </div>
                <div className="space-y-3 sm:space-y-4">
                  {/* Form Fields */}
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Contact Information</h2>
                <div className="space-y-3 sm:space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-gray-700">Phone Number</label>
                    <div className="flex items-center px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                      <FaPhone className="text-gray-400 w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      <span className="text-xs sm:text-sm text-gray-500">{profileData.phone}</span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Phone number cannot be changed</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-gray-700">Address</label>
                    <textarea
                      value={profileData.address}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                      disabled={!isEditing}
                      rows="3"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex justify-end space-x-3 sm:space-x-4 mt-6">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Settings & Actions Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl sm:rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Settings & Actions</h2>
            <div className="space-y-2">
              <button 
                onClick={() => navigate('/orders')}
                className="w-full flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <FaHistory className="text-blue-600 text-sm sm:text-base" />
                  </div>
                  <span className="text-sm sm:text-base font-medium text-gray-900">Order History</span>
                </div>
                <FaChevronRight className="text-gray-400 w-4 h-4" />
              </button>

              <button 
                onClick={() => navigate('/wishlist')}
                className="w-full flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-pink-50 flex items-center justify-center">
                    <FaHeart className="text-pink-600 text-sm sm:text-base" />
                  </div>
                  <span className="text-sm sm:text-base font-medium text-gray-900">Wishlist</span>
                </div>
                <FaChevronRight className="text-gray-400 w-4 h-4" />
              </button>

              <button 
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-red-50 transition-colors"
              >
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-50 flex items-center justify-center">
                    <FaSignOutAlt className="text-red-600 text-sm sm:text-base" />
                  </div>
                  <span className="text-sm sm:text-base font-medium text-red-600">Sign Out</span>
                </div>
                <FaChevronRight className="text-red-400 w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl p-4 sm:p-6 max-w-sm w-full mx-auto"
            >
              <div className="text-center mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <FaSignOutAlt className="text-xl sm:text-2xl text-red-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Sign Out</h3>
                <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Are you sure you want to sign out?</p>
              </div>
              <div className="flex space-x-3 sm:space-x-4">
                <button
                  className="flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                  onClick={() => setShowLogoutConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                  onClick={() => {
                    handleLogout();
                    setShowLogoutConfirm(false);
                  }}
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 