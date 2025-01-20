import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaCamera, FaEdit, FaUser, FaCalendar, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { updateUserProfile, updateProfileImage } from '../store/userSlice';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const Profile = () => {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    profileImage: null
  });
  const [isUploading, setIsUploading] = useState(false);

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };
  
  // Fill form with Redux data when component mounts or userData changes
  useEffect(() => {
    if (userData) {
      setProfileData({
        firstName: userData.firstname || '',
        lastName: userData.lastname || '',
        email: userData.email || '',
        phone: userData.mobileno || '',  // Changed from phone to mobileno to match your data
        address: userData.address || '',
        profileImage: userData.profileImage || null
      });
    }
  }, [userData]);

  // const handleImageUpload = async (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     try {
  //       console.log('File selected:', file.name, 'Size:', file.size);
        
  //       // Show loading toast
  //       toast.loading('Uploading image...');
        
  //       // Convert file to base64
  //       const reader = new FileReader();
  //       reader.onloadend = async () => {
  //         const base64String = reader.result;
  //         console.log('Image converted to base64');
          
  //         try {
  //           const response = await fetch('http://localhost:5000/api/users/upload-profile-image', {
  //             method: 'POST',
  //             credentials: 'include',
  //             headers: {
  //               'Content-Type': 'application/json',
  //             },
  //             body: JSON.stringify({ 
  //               image: base64String,
  //               userId: userData._id
  //             }),
  //           });
            
  //           console.log('Response status:', response.status);
  //           const data = await response.json();
  //           console.log('Response data:', data);
            
  //           if (data.success) {
  //             // Dismiss loading toast
  //             toast.dismiss();
              
  //             // Update Redux store with new profile image
  //             dispatch(updateProfileImage(data.imagePath));
              
  //             // Update local state
  //             setProfileData(prev => ({
  //               ...prev,
  //               profileImage: data.imagePath
  //             }));
              
  //             toast.success('Profile photo updated successfully!');
  //           } else {
  //             toast.dismiss();
  //             toast.error(data.message || 'Failed to upload image');
  //           }
  //         } catch (fetchError) {
  //           console.error('Fetch error:', fetchError);
  //           toast.dismiss();
  //           toast.error('Network error while uploading');
  //         }
  //       };
        
  //       reader.onerror = (error) => {
  //         console.error('FileReader error:', error);
  //         toast.error('Error reading file');
  //       };
        
  //       reader.readAsDataURL(file);
  //     } catch (error) {
  //       console.error('Upload error:', error);
  //       toast.error('Failed to process image');
  //     }
  //   }
  // };

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
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (response.data.success) {
        // Update Redux store with new profile image
        dispatch(updateProfileImage(response.data.user.profileImage));
        toast.success('Profile image updated successfully');
      } else {
        throw new Error(response.data.message);
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
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          firstname: profileData.firstName,
          lastname: profileData.lastName,
          email: profileData.email,
          address: profileData.address,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Update Redux store with new profile data
        dispatch(updateUserProfile({
          ...userData,
          firstname: profileData.firstName,
          lastname: profileData.lastName,
          email: profileData.email,
          mobileno: userData.mobileno,  // Keep the original mobile number
          address: profileData.address,
        }));
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      } else {
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    }
  };

  // Format the date to display
  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid Date';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        {/* Profile Header */}
        <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
          <div className="absolute -bottom-16 left-8 flex items-end space-x-6">
            <div className="relative">
              {/* <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white">
                {profileData.profileImage ? (
                  <img 
                    src={profileData.profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <FaUser className="text-4xl text-gray-400" />
                  </div>
                )}
              </div> */}
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 relative">
  {isUploading ? (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  ) : (
    <>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
        id="profile-image-upload"
      />
      <label
        htmlFor="profile-image-upload"
        className="cursor-pointer block w-full h-full relative"
      >
        {userData?.profileImage ? (
          <img
            src={userData.profileImage}
            alt="Profile"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '';
              e.target.className = 'hidden';
              const fallback = e.target.parentNode.querySelector('.fallback-icon');
              if (fallback) fallback.classList.remove('hidden');
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center fallback-icon">
            <FaCamera className="text-gray-400 text-3xl" />
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <FaCamera className="text-white opacity-0 hover:opacity-100 text-2xl" />
        </div>
      </label>
    </>
  )}
</div>
              <label className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
                <FaCamera className="text-white" />
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-white">
                {profileData.firstName} {profileData.lastName}
              </h1>
              <p className="text-blue-100">Buyer Account</p>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="pt-20 px-8 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h2>
              
              <div className="space-y-2">
                <label className="text-sm text-gray-600 flex items-center gap-2">
                  <FaUser className="text-blue-500" /> First Name
                </label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                  disabled={!isEditing}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-600 flex items-center gap-2">
                  <FaUser className="text-blue-500" /> Last Name
                </label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                  disabled={!isEditing}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-600 flex items-center gap-2">
                  <FaEnvelope className="text-blue-500" /> Email
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  disabled={!isEditing}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h2>
              
              <div className="space-y-2">
                <label className="text-sm text-gray-600 flex items-center gap-2">
                  <FaPhone className="text-blue-500" /> Phone
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  readOnly  // Added readOnly attribute
                  className="w-full p-2 border rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"  // Updated classes for read-only style
                />
                {/* Optional: Add a helper text to inform users */}
                <p className="text-sm text-gray-500 mt-1">
                  Mobile number cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-600 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-blue-500" /> Address
                </label>
                <textarea
                  value={profileData.address}
                  onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                  disabled={!isEditing}
                  rows="3"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="mt-8 p-6 bg-gray-50 rounded-xl">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <FaUser className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Account Type</p>
                  <p className="font-medium">{userData?.userType || 'Buyer'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaCalendar className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="font-medium">{formatDate(userData?.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-end space-x-4">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
              >
                <FaEdit /> Edit Profile
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile; 