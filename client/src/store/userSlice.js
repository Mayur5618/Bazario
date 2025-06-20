import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userData: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    SignInStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    SignInSuccess: (state, action) => {
      state.userData = {
        ...action.payload,
        city: action.payload.city || action.payload.address?.city || ''
      };
      state.loading = false;
      state.error = null;
    },
    SignInFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    SignInSetUp: (state) => {
      state.userData = null;
      state.loading = false;
      state.error = null;
    },
    updateUserProfile: (state, action) => {
      state.userData = { ...state.userData, ...action.payload };
    },
    updateProfileImage: (state, action) => {
      state.userData = { 
        ...state.userData, 
        profileImage: action.payload 
      };
    },
    logout: (state) => {
      state.userData = null;
      state.loading = false;
      state.error = null;
    }
  },
});

export const {
  SignInStart,
  SignInSuccess,
  SignInFailure,
  SignInSetUp,
  updateUserProfile,
  updateProfileImage,
  logout
} = userSlice.actions;

export default userSlice.reducer;
