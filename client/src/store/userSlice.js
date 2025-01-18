// // import { createSlice } from '@reduxjs/toolkit';

// // const userSlice = createSlice({
// //     name: 'user',
// //     initialState: {
// //         isLoggedIn: false,
// //         profilePhoto: null,
// //     },
// //     reducers: {
// //         login(state, action) {
// //             state.isLoggedIn = true;
// //             state.profilePhoto = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";
// //         },
// //         logout(state) {
// //             state.isLoggedIn = false;
// //             state.profilePhoto = null;
// //         },
// //         updateProfilePhoto(state, action) {
// //             state.profilePhoto = action.payload;
// //         },
// //     },
// // });

// // export const { login, logout, updateProfilePhoto } = userSlice.actions;
// // export default userSlice.reducer;

// import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//   userData: null, // Holds user data when logged in
//   isLoggedIn: false, // Tracks login status
//   error: null, // Holds error messages
//   loading: false, // Tracks loading state during async actions
// };

// const userSlice = createSlice({
//   name: "user",
//   initialState,
//   reducers: {
    
//     SignInStart: (state) => {
//       state.userData = null;
//       state.isLoggedIn = false;
//       state.loading = true;
//       state.error = null;
//     },
//     SignInSuccess: (state, action) => {
//       state.loading = false;
//       state.userData = action.payload; // Set user data on successful login
//       state.isLoggedIn = true; // Update login status
//     },
//     SignInFailure: (state, action) => {
//       state.loading = false;
//       state.error = action.payload; // Set error message on failure
//     },
//     SignOut: (state) => {
//       state.userData = null; // Clear user data on logout
//       state.isLoggedIn = false; // Update login status
//     },
//     UpdateUserSuccess: (state, action) => {
//       state.userData = action.payload; // Update user data
//     },
//   },
// });

// // Export actions for use in components
// export const {
//   SignInStart,
//   SignInSuccess,
//   SignInFailure,
//   SignOut,
//   UpdateUserSuccess,
// } = userSlice.actions;

// // Export the reducer to be used in the store
// export default userSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userData: null,
  error: null,
  loading: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    SignInSetUp: (state) => {
      (state.userData = null), (state.error = null), (state.loading = false);
    },
    SignInStart: (state) => {
      (state.error = null), (state.loading = true);
    },
    SignInFailure: (state, action) => {
      (state.error = action.payload), (state.loading = false);
    },
    SignInSuccess: (state, action) => {
      (state.error = null),
        (state.loading = false),
        (state.userData = action.payload);
    },
    UpdateUserStart: (state) => {
      (state.error = null), (state.loading = true);
    },
    UpdateUserSuccess: (state, action) => {
      (state.error = null),
        (state.loading = false),
        (state.userData = action.payload);
    },
    UpdateUserFailure: (state, action) => {
      (state.error = action.payload), (state.loading = false);
    },
    clearUserData: (state) => {
      state.userData = null; // Clear user data
    },
  },
});

export const {
  SignInSetUp,
  SignInStart,
  SignInSuccess,
  SignInFailure,
  UpdateUserStart,
  UpdateUserSuccess,
  UpdateUserFailure,
  clearUserData,
} = userSlice.actions;
export default userSlice.reducer;
