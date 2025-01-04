// components/auth/Register.jsx
// import React, { useState, useEffect } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import axios from "axios";

// const Register = () => {
//   const navigate = useNavigate();
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [step, setStep] = useState(1);
//   const [formData, setFormData] = useState({
//     firstname: "",
//     lastname: "",
//     mobileno: "",
//     password: "",
//     userType: "buyer", // Default user type set to 'buyer'
//   });

//   useEffect(() => {
//        const token = localStorage.getItem('token'); // Check for token in local storage
//        if (token) {
//          setIsAuthenticated(true); // Set authenticated state if token exists
//        }
//       }, []);

//   const [errors, setErrors] = useState({});
//   const [serverError, setServerError] = useState("");

  // Validation rules
  // const validateField = (name, value) => {
  //   switch (name) {
  //     case "firstname":
  //     case "lastname":
  //       return value.trim() === ""
  //         ? "This field is required"
  //         : value.length < 2
  //         ? "Must be at least 2 characters"
  //         : value.length > 50
  //         ? "Must be less than 50 characters"
  //         : !/^[a-zA-Z\s]*$/.test(value)
  //         ? "Only letters and spaces allowed"
  //         : "";

  //     case "mobileno":
  //       return value.trim() === ""
  //         ? "Mobile number is required"
  //         : !/^[0-9]{10}$/.test(value)
  //         ? "Must be 10 digits"
  //         : "";

  //     case "password":
  //       return value.trim() === ""
  //         ? "Password is required"
  //         : value.length < 8
  //         ? "Must be at least 8 characters"
  //         : !/(?=.*[a-z])/.test(value)
  //         ? "Must include lowercase letter"
  //         : !/(?=.*[A-Z])/.test(value)
  //         ? "Must include uppercase letter"
  //         : !/(?=.*\d)/.test(value)
  //         ? "Must include number"
  //         : !/(?=.*[@$!%*?&])/.test(value)
  //         ? "Must include special character"
  //         : "";

  //     case "pincode":
  //       return value.trim() === ""
  //         ? "Pincode is required"
  //         : !/^[0-9]{6}$/.test(value)
  //         ? "Must be 6 digits"
  //         : "";

  //     case "address":
  //     case "country":
  //     case "state":
  //     case "city":
  //       return value.trim() === ""
  //         ? `${name.charAt(0).toUpperCase() + name.slice(1)} is required`
  //         : "";

  //     default:
  //       return "";
  //   }
  // };

  // Handle input changes with validation
  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({
  //     ...prev,
  //     [name]: value,
  //   }));

    // Validate field
//     const error = validateField(name, value);
//     setErrors((prev) => ({
//       ...prev,
//       [name]: error,
//     }));
//   };

//   // Validate step before proceeding
//   const validateStep = (stepNumber) => {
//     const stepFields = {
//       1: ["firstname", "lastname", "mobileno", "password"],
//       2: ["address", "country", "state", "city", "pincode"],
//     };

//     const newErrors = {};
//     stepFields[stepNumber].forEach((field) => {
//       const error = validateField(field, formData[field]);
//       if (error) newErrors[field] = error;
//     });

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleNextStep = () => {
//     if (validateStep(step)) {
//       setStep((prev) => prev + 1);
//     }
//   };

//   const handlePrevStep = () => {
//     setStep((prev) => prev - 1);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!validateStep(2)) {
//       return;
//     }

//     try {
//       const response = await axios.post("/api/users/signup", formData);
//       if (response.data.success) {
//         navigate("/login");
//       }
//     } catch (error) {
//       setServerError(error.response?.data?.message || "Registration failed");
//     }
//   };

//   // Error message component
//   const ErrorMessage = ({ error }) =>
//     error ? <p className="text-red-500 text-xs mt-1">{error}</p> : null;

//   return (
//     <div className="flex items-center justify-center py-3 px-4 sm:px-6 lg:px-8">
//        <>
//        {isAuthenticated ? ( // Conditional rendering based on authentication
//         <div> {/* Display a success message or redirect */}
//            <h2>Welcome back!</h2>
//            <Link to="/">Go back to Home</Link>
//          </div>
//        ) :
//        (
//       <div className="border-[1px] border-gray-300 max-w-md w-full p-6 rounded-xl shadow-lg">
//         <div>
//           <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//             Create Account
//           </h2>
//           <p className="mt-2 text-center text-sm text-gray-600">
//             Step {step} of 2
//           </p>
//         </div>

//         {serverError && (
//           <div className="bg-red-50 text-red-500 p-4 rounded-md">
//             {serverError}
//           </div>
//         )}

//         <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//           {/* Step 1: Personal Information */}
//           {step === 1 && (
//             <div className="space-y-6">
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">
//                     First Name
//                   </label>
//                   <input
//                     type="text"
//                     name="firstname"
//                     value={formData.firstname}
//                     onChange={handleChange}
//                     className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                   />
//                   {errors.firstname && (
//                     <p className="text-xs mt-1 flex items-center gap-1 text-red-500">
//                       <svg
//                         xmlns="http://www.w3.org/2000/svg"
//                         viewBox="0 0 24 24"
//                         fill="currentColor"
//                         className="h-5 w-5 text-red-500"
//                       >
//                         <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 15V17H13V15H11ZM11 7V13H13V7H11Z"></path>
//                       </svg>
//                       {errors.firstname}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">
//                     Last Name
//                   </label>
//                   <input
//                     type="text"
//                     name="lastname"
//                     value={formData.lastname}
//                     onChange={handleChange}
//                     className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                   />
//                   {errors.lastname && (
//                     <p className="text-xs mt-1 flex items-center gap-1 text-red-500">
//                       <svg
//                         xmlns="http://www.w3.org/2000/svg"
//                         viewBox="0 0 24 24"
//                         fill="currentColor"
//                         className="h-5 w-5 text-red-500"
//                       >
//                         <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 15V17H13V15H11ZM11 7V13H13V7H11Z"></path>
//                       </svg>
//                       {errors.lastname}
//                     </p>
//                   )}
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Mobile Number
//                 </label>
//                 <input
//                   type="text"
//                   name="mobileno"
//                   value={formData.mobileno}
//                   onChange={handleChange}
//                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                 />
//                 {errors.mobileno && (
//                   <p className="text-xs mt-1 flex items-center gap-1 text-red-500">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       viewBox="0 0 24 24"
//                       fill="currentColor"
//                       className="h-5 w-5 text-red-500"
//                     >
//                       <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 15V17H13V15H11ZM11 7V13H13V7H11Z"></path>
//                     </svg>
//                     {errors.mobileno}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Password
//                 </label>
//                 <input
//                   type="password"
//                   name="password"
//                   value={formData.password}
//                   onChange={handleChange}
//                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                 />
//                 {errors.password && (
//                   <p className="text-xs mt-1 flex items-center gap-1 text-red-500">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       viewBox="0 0 24 24"
//                       fill="currentColor"
//                       className="h-5 w-5 text-red-500"
//                     >
//                       <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 15V17H13V15H11ZM11 7V13H13V7H11Z"></path>
//                     </svg>
//                     {errors.password}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Confirm Password
//                 </label>
//                 <input
//                   type="password"
//                   name="confirmPassword"
//                   value={formData.confirmPassword}
//                   onChange={handleChange}
//                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                 />
//                 {formData.password &&
//                   formData.confirmPassword &&
//                   formData.password !== formData.confirmPassword && (
//                     <p className="text-xs mt-1 flex items-center gap-1 text-red-500">
//                       <svg
//                         xmlns="http://www.w3.org/2000/svg"
//                         viewBox="0 0 24 24"
//                         fill="currentColor"
//                         className="h-5 w-5 text-red-500"
//                       >
//                         <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 15V17H13V15H11ZM11 7V13H13V7H11Z"></path>
//                       </svg>
//                       {/* <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 15V17H13V15H11ZM11 7V13H13V7H11Z"></path></svg> */}
//                       Passwords do not match
//                     </p>
//                   )}
//               </div>

//               <div className="flex justify-between">
//                 <button
//                   type="button"
//                   onClick={handleNextStep}
//                   className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Step 2: Address Information */}
//           {step === 2 && (
//             <div className="space-y-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Address *
//                 </label>
//                 <input
//                   type="text"
//                   name="address"
//                   value={formData.address}
//                   onChange={handleChange}
//                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                 />
//                 <ErrorMessage error={errors.address} />
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">
//                     Country
//                   </label>
//                   <input
//                     type="text"
//                     name="country"
//                     value={formData.country}
//                     onChange={handleChange}
//                     className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                   />
//                   <ErrorMessage error={errors.country} />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">
//                     State
//                   </label>
//                   <input
//                     type="text"
//                     name="state"
//                     value={formData.state}
//                     onChange={handleChange}
//                     className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                   />
//                   <ErrorMessage error={errors.state} />
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">
//                     City
//                   </label>
//                   <input
//                     type="text"
//                     name="city"
//                     value={formData.city}
//                     onChange={handleChange}
//                     className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                   />
//                   <ErrorMessage error={errors.city} />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">
//                     Pincode
//                   </label>
//                   <input
//                     type="text"
//                     name="pincode"
//                     value={formData.pincode}
//                     onChange={handleChange}
//                     className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                   />
//                   <ErrorMessage error={errors.pincode} />
//                 </div>
//               </div>

//               <div className="flex justify-between">
//                 <button
//                   type="button"
//                   onClick={handlePrevStep}
//                   className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//                 >
//                   Back
//                 </button>
//                 <button
//                   type="submit"
//                   className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//                 >
//                   Register
//                 </button>
//               </div>
//             </div>
//           )}
//         </form>

//         <div className="text-center mt-2">
//         <p className="text-sm text-gray-600">
//         Don't have an account?{' '}
//           <Link
//             to="/login"
//             className="text-sm text-indigo-600 hover:text-indigo-500"
//           >
//              Login
//           </Link>
//           </p>
//         </div>
//       </div>
//       )}
//     </>
//     </div>
//   );
// };

// export default Register;

// components/auth/Register.jsx
// import React, { useState, useEffect } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import axios from "axios";

// const Register = () => {
//   const navigate = useNavigate();
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [step, setStep] = useState(1);
//   const [showPassword, setShowPassword] = useState(false); // State for password visibility
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State for confirm password visibility

//   const [formData, setFormData] = useState({
//     firstname: "",
//     lastname: "",
//     mobileno: "",
//     password: "",
//     userType: "buyer", // Default user type set to 'buyer'
//   });

//   useEffect(() => {
//     const token = localStorage.getItem("token"); // Check for token in local storage
//     if (token) {
//       setIsAuthenticated(true); // Set authenticated state if token exists
//     }
//   }, []);

//   const [errors, setErrors] = useState({});
//   const [serverError, setServerError] = useState("");

//   // Validation rules
//   const validateField = (name, value) => {
//     switch (name) {
//       case "firstname":
//       case "lastname":
//         return value.trim() === ""
//           ? "This field is required"
//           : value.length < 2
//           ? "Must be at least 2 characters"
//           : value.length > 50
//           ? "Must be less than 50 characters"
//           : !/^[a-zA-Z\s]*$/.test(value)
//           ? "Only letters and spaces allowed"
//           : "";

//       case "mobileno":
//         return value.trim() === ""
//           ? "Mobile number is required"
//           : !/^[0-9]{10}$/.test(value)
//           ? "Must be 10 digits"
//           : "";

//       case "password":
//         return value.trim() === ""
//           ? "Password is required"
//           : value.length < 8
//           ? "Must be at least 8 characters"
//           : !/(?=.*[a-z])/.test(value)
//           ? "Must include lowercase letter"
//           : !/(?=.*[A-Z])/.test(value)
//           ? "Must include uppercase letter"
//           : !/(?=.*\d)/.test(value)
//           ? "Must include number"
//           : !/(?=.*[@$!%*?&])/.test(value)
//           ? "Must include special character"
//           : "";

//       case "confirmPassword":
//         return value.trim() === ""
//           ? "Confirm Password is required"
//           : value !== formData.password
//           ? "Passwords do not match"
//           : "";

//       case "pincode":
//         return value.trim() === ""
//           ? "Pincode is required"
//           : !/^[0-9]{6}$/.test(value)
//           ? "Must be 6 digits"
//           : "";

//       case "address":
//       case "country":
//       case "state":
//       case "city":
//         return value.trim() === ""
//           ? `${name.charAt(0).toUpperCase() + name.slice(1)} is required`
//           : "";

//       default:
//         return "";
//     }
//   };

//   // Handle input changes with validation
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));

//     // Validate field
//     const error = validateField(name, value);
//     setErrors((prev) => ({
//       ...prev,
//       [name]: error,
//     }));
//   };

//   // Validate step before proceeding
//   const validateStep = (stepNumber) => {
//     const stepFields = {
//       1: ["firstname", "lastname", "mobileno", "password", "confirmPassword"],
//       2: ["address", "country", "state", "city", "pincode"],
//     };

//     const newErrors = {};
//     stepFields[stepNumber].forEach((field) => {
//       const error = validateField(field, formData[field]);
//       if (error) newErrors[field] = error;
//     });

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleNextStep = () => {
//     if (validateStep(step)) {
//       // Only proceed if there are no errors
//       setStep((prev) => prev + 1);
//     }
//   };

//   const handlePrevStep = () => {
//     setStep((prev) => prev - 1);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!validateStep(2)) {
//       return;
//     }

//     try {
//       const response = await axios.post("/api/users/signup", formData);
//       if (response.data.success) {
//         navigate("/login");
//       }
//     } catch (error) {
//       setServerError(error.response?.data?.message || "Registration failed");
//     }
//   };

//   // Error message component
//   const ErrorMessage = ({ error }) =>
//     error ? <p className="text-red-500 text-xs mt-1">{error}</p> : null;

//   return (
//     <div className="flex items-center justify-center py-3 px-4 sm:px-6 lg:px-8">
//       <>
//         {isAuthenticated ? (
//           <div>
//             <h2>Welcome back!</h2>
//             <Link to="/">Go back to Home</Link>
//           </div>
//         ) : (
//           <div className="border-[1px] border-gray-300 max-w-md w-full p-6 rounded-xl shadow-lg">
//             <div>
//               <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//                 Create Account
//               </h2>
//               <p className="mt-2 text-center text-sm text-gray-600">
//                 Step {step} of 2
//               </p>
//             </div>

//             {serverError && (
//               <div className="bg-red-50 text-red-500 p-4 rounded-md">
//                 {serverError}
//               </div>
//             )}

//             <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//               {/* Step 1: Personal Information */}
//               {step === 1 && (
//                 <div className="space-y-6">
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">
//                         First Name
//                       </label>
//                       <input
//                         type="text"
//                         name="firstname"
//                         value={formData.firstname}
//                         onChange={handleChange}
//                         className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                       />
//                       {errors.firstname && (
//                         <p className="text-xs mt-1 flex items-center gap-1 text-red-500">
//                           <svg
//                             xmlns="http://www.w3.org/2000/svg"
//                             viewBox="0 0 24 24"
//                             fill="currentColor"
//                             className="h-5 w-5 text-red-500"
//                           >
//                             <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 15V17H13V15H11ZM11 7V13H13V7H11Z"></path>
//                           </svg>
//                           {errors.firstname}
//                         </p>
//                       )}
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">
//                         Last Name
//                       </label>
//                       <input
//                         type="text"
//                         name="lastname"
//                         value={formData.lastname}
//                         onChange={handleChange}
//                         className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                       />
//                       {errors.lastname && (
//                         <p className="text-xs mt-1 flex items-center gap-1 text-red-500">
//                           <svg
//                             xmlns="http://www.w3.org/2000/svg"
//                             viewBox="0 0 24 24"
//                             fill="currentColor"
//                             className="h-5 w-5 text-red-500"
//                           >
//                             <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 15V17H13V15H11ZM11 7V13H13V7H11Z"></path>
//                           </svg>
//                           {errors.lastname}
//                         </p>
//                       )}
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700">
//                       Mobile Number
//                     </label>
//                     <input
//                       type="text"
//                       name="mobileno"
//                       value={formData.mobileno}
//                       onChange={handleChange}
//                       className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                     />
//                     {errors.mobileno && (
//                       <p className="text-xs mt-1 flex items-center gap-1 text-red-500">
//                         <svg
//                           xmlns="http://www.w3.org/2000/svg"
//                           viewBox="0 0 24 24"
//                           fill="currentColor"
//                           className="h-5 w-5 text-red-500"
//                         >
//                           <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 15V17H13V15H11ZM11 7V13H13V7H11Z"></path>
//                         </svg>
//                         {errors.mobileno}
//                       </p>
//                     )}
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700">
//                       Password
//                     </label>
//                     <div className="relative">
//                       <input
//                         type={showPassword ? "text" : "password"}
//                         name="password"
//                         value={formData.password}
//                         onChange={handleChange}
//                         className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                       />
//                       <button
//                         type="button"
//                         onClick={() => setShowPassword((prev) => !prev)}
//                         className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
//                       >
//                         {showPassword ? (
//                           <svg
//                           class="w-6 h-6 text-gray-800 dark:text-black"
//                           aria-hidden="true"
//                           xmlns="http://www.w3.org/2000/svg"
//                           width="24"
//                           height="24"
//                           fill="currentColor"
//                           viewBox="0 0 24 24"
//                         >
//                           <path d="m4 15.6 3.055-3.056A4.913 4.913 0 0 1 7 12.012a5.006 5.006 0 0 1 5-5c.178.009.356.027.532.054l1.744-1.744A8.973 8.973 0 0 0 12 5.012c-5.388 0-10 5.336-10 7A6.49 6.49 0 0 0 4 15.6Z" />
//                           <path d="m14.7 10.726 4.995-5.007A.998.998 0 0 0 18.99 4a1 1 0 0 0-.71.305l-4.995 5.007a2.98 2.98 0 0 0-.588-.21l-.035-.01a2.981 2.981 0 0 0-3.584 3.583c0 .012.008.022.01.033.05.204.12.402.211.59l-4.995 4.983a1 1 0 1 0 1.414 1.414l4.995-4.983c.189.091.386.162.59.211.011 0 .021.007.033.01a2.982 2.982 0 0 0 3.584-3.584c0-.012-.008-.023-.011-.035a3.05 3.05 0 0 0-.21-.588Z" />
//                           <path d="m19.821 8.605-2.857 2.857a4.952 4.952 0 0 1-5.514 5.514l-1.785 1.785c.767.166 1.55.25 2.335.251 6.453 0 10-5.258 10-7 0-1.166-1.637-2.874-2.179-3.407Z" />
//                         </svg>
                         
//                         ) : (
//                           <svg
//                           class="w-6 h-6 text-gray-800 dark:text-black"
//                           aria-hidden="true"
//                           xmlns="http://www.w3.org/2000/svg"
//                           width="24"
//                           height="24"
//                           fill="none"
//                           viewBox="0 0 24 24"
//                         >
//                           <path
//                             stroke="currentColor"
//                             stroke-width="2"
//                             d="M21 12c0 1.2-4.03 6-9 6s-9-4.8-9-6c0-1.2 4.03-6 9-6s9 4.8 9 6Z"
//                           />
//                           <path
//                             stroke="currentColor"
//                             stroke-width="2"
//                             d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
//                           />
//                         </svg>
//                         )}
//                       </button>
//                     </div>
//                   </div>
//                   <div>
//   <label className="block text-sm font-medium text-gray-700">
//     Confirm Password
//   </label>
//   <div className="relative">
//     <input
//       type={showConfirmPassword ? "text" : "password"} // Toggle confirm password visibility
//       name="confirmPassword"
//       value={formData.confirmPassword}
//       onChange={handleChange}
//       className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 pr-10" // Added pr-10 for padding
//     />
//     <button
//       type="button"
//       onClick={() => setShowConfirmPassword(!showConfirmPassword)} // Toggle visibility
//       className="absolute inset-y-0 right-0 flex items-center pr-3"
//     >
//       {showConfirmPassword ? (
//          <svg
//          class="w-6 h-6 text-gray-800 dark:text-black"
//          aria-hidden="true"
//          xmlns="http://www.w3.org/2000/svg"
//          width="24"
//          height="24"
//          fill="currentColor"
//          viewBox="0 0 24 24"
//        >
//          <path d="m4 15.6 3.055-3.056A4.913 4.913 0 0 1 7 12.012a5.006 5.006 0 0 1 5-5c.178.009.356.027.532.054l1.744-1.744A8.973 8.973 0 0 0 12 5.012c-5.388 0-10 5.336-10 7A6.49 6.49 0 0 0 4 15.6Z" />
//          <path d="m14.7 10.726 4.995-5.007A.998.998 0 0 0 18.99 4a1 1 0 0 0-.71.305l-4.995 5.007a2.98 2.98 0 0 0-.588-.21l-.035-.01a2.981 2.981 0 0 0-3.584 3.583c0 .012.008.022.01.033.05.204.12.402.211.59l-4.995 4.983a1 1 0 1 0 1.414 1.414l4.995-4.983c.189.091.386.162.59.211.011 0 .021.007.033.01a2.982 2.982 0 0 0 3.584-3.584c0-.012-.008-.023-.011-.035a3.05 3.05 0 0 0-.21-.588Z" />
//          <path d="m19.821 8.605-2.857 2.857a4.952 4.952 0 0 1-5.514 5.514l-1.785 1.785c.767.166 1.55.25 2.335.251 6.453 0 10-5.258 10-7 0-1.166-1.637-2.874-2.179-3.407Z" />
//        </svg>
      // 
//       ) : (
//         <svg
//        class="w-6 h-6 text-gray-800 dark:text-black"
//        aria-hidden="true"
//        xmlns="http://www.w3.org/2000/svg"
//        width="24"
//        height="24"
//        fill="none"
//        viewBox="0 0 24 24"
//      >
//        <path
//          stroke="currentColor"
//          stroke-width="2"
//          d="M21 12c0 1.2-4.03 6-9 6s-9-4.8-9-6c0-1.2 4.03-6 9-6s9 4.8 9 6Z"
//        />
//        <path
//          stroke="currentColor"
//          stroke-width="2"
//          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
//        />
//      </svg>
//       )}
//     </button>
//   </div>
//   {errors.confirmPassword && (
//     <p className="text-xs mt-1 flex items-center gap-1 text-red-500">
//       <svg
//         xmlns="http://www.w3.org/2000/svg"
//         viewBox="0 0 24 24"
//         fill="currentColor"
//         className="h-5 w-5 text-red-500"
//       >
//         <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 15V17H13V15H11ZM11 7V13H13V7H11Z"></path>
//       </svg>
//       {errors.confirmPassword}
//     </p>
//   )}
// </div>

//                   <div className="flex justify-between">
//                     <button
//                       type="button"
//                       onClick={handleSubmit}
//                       className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//                     >
//                       Next
//                     </button>
//                   </div>
//                 </div>
//               )}

//               {/* Step 2: Address Information */}
//               {step === 2 && (
//                 <div className="space-y-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700">
//                       Address
//                     </label>
//                     <input
//                       type="text"
//                       name="address"
//                       value={formData.address}
//                       onChange={handleChange}
//                       className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                     />
//                     <ErrorMessage error={errors.address} />
//                   </div>

//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">
//                         Country
//                       </label>
//                       <input
//                         type="text"
//                         name="country"
//                         value={formData.country}
//                         onChange={handleChange}
//                         className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                       />
//                       <ErrorMessage error={errors.country} />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">
//                         State
//                       </label>
//                       <input
//                         type="text"
//                         name="state"
//                         value={formData.state}
//                         onChange={handleChange}
//                         className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                       />
//                       <ErrorMessage error={errors.state} />
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">
//                         City
//                       </label>
//                       <input
//                         type="text"
//                         name="city"
//                         value={formData.city}
//                         onChange={handleChange}
//                         className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                       />
//                       <ErrorMessage error={errors.city} />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">
//                         Pincode
//                       </label>
//                       <input
//                         type="text"
//                         name="pincode"
//                         value={formData.pincode}
//                         onChange={handleChange}
//                         className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                       />
//                       <ErrorMessage error={errors.pincode} />
//                     </div>
//                   </div>

//                   <div className="flex justify-between">
//                     <button
//                       type="button"
//                       onClick={handlePrevStep}
//                       className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//                     >
//                       Back
//                     </button>
//                     <button
//                       type="submit"
//                       className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//                     >
//                       Register
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </form>

//             <div className="text-center mt-2">
//               <p className="text-sm text-gray-600">
//                 Don't have an account?{" "}
//                 <Link
//                   to="/login"
//                   className="text-sm text-indigo-600 hover:text-indigo-500"
//                 >
//                   Login
//                 </Link>
//               </p>
//             </div>
//           </div>
//         )}
//       </>
//     </div>
//   );
// };

// export default Register;


// components/auth/Register.jsx
// components/auth/Register.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    mobileno: "",
    password: "",
    confirmPassword: "", // Added confirm password field
    address: "",
    country: "",
    state: "",
    city: "",
    pincode: "",
    userType: "buyer", // Default user type set to 'buyer'
  });

  useEffect(() => {
    const token = localStorage.getItem("token"); // Check for token in local storage
    if (token) {
      setIsAuthenticated(true); // Set authenticated state if token exists
    }
  }, []);

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  // Validation rules
  const validateField = (name, value) => {
    switch (name) {
      case "firstname":
      case "lastname":
        return value.trim() === ""
          ? "This field is required"
          : value.length < 2
          ? "Must be at least 2 characters"
          : value.length > 50
          ? "Must be less than 50 characters"
          : !/^[a-zA-Z\s]*$/.test(value)
          ? "Only letters and spaces allowed"
          : "";

      case "mobileno":
        return value.trim() === ""
          ? "Mobile number is required"
          : !/^[0-9]{10}$/.test(value)
          ? "Must be 10 digits"
          : "";

      case "password":
        return value.trim() === ""
          ? "Password is required"
          : value.length < 8
          ? "Must be at least 8 characters"
          : !/(?=.*[a-z])/.test(value)
          ? "Must include lowercase letter"
          : !/(?=.*[A-Z])/.test(value)
          ? "Must include uppercase letter"
          : !/(?=.*\d)/.test(value)
          ? "Must include number"
          : !/(?=.*[@$!%*?&])/.test(value)
          ? "Must include special character"
          : "";

      case "confirmPassword":
        return value.trim() === ""
          ? "Confirm Password is required"
          : value !== formData.password
          ? "Passwords do not match"
          : "";

      case "address":
      case "country":
      case "state":
      case "city":
        return value.trim() === ""
          ? `${name.charAt(0).toUpperCase() + name.slice(1)} is required`
          : "";

      case "pincode":
        return value.trim() === ""
          ? "Pincode is required"
          : !/^[0-9]{6}$/.test(value)
          ? "Must be 6 digits"
          : "";

      default:
        return "";
    }
  };

  // Handle input changes with validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate field
    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  // Validate step before proceeding
  const validateStep = (stepNumber) => {
    const stepFields = {
      1: ["firstname", "lastname", "mobileno", "password", "confirmPassword"], // Fields for step 1
      2: ["address", "country", "state", "city", "pincode"], // Fields for step 2
    };

    const newErrors = {};
    stepFields[stepNumber].forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(2)) {
      return;
    }

    try {
      const response = await axios.post("/api/users/signup", formData);
      if (response.data.success) {
        navigate("/login");
      }
    } catch (error) {
      setServerError(error.response?.data?.message || "Registration failed");
    }
  };

  // Error message component
  const ErrorMessage = ({ error }) =>
    error ? <p className="text-red-500 text-xs mt-1">{error}</p> : null;

  return (
    <div className="flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
      <>
        {isAuthenticated ? (
          <div>
            <h2>Welcome back!</h2>
            <Link to="/">Go back to Home</Link>
          </div>
        ) : (
          <div className="border-[1px] border-gray-300 max-w-md w-full p-6 rounded-xl shadow-lg">
            
            <div>
              <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900">
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

            <form className="mt-7  space-y-6" onSubmit={handleSubmit}>
              {/* Step 1: Personal Information */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstname"
                        value={formData.firstname}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      {errors.firstname && (
                        <p className="text-xs mt-1 flex items-center gap-1 text-red-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="h-5 w-5 text-red-500"
                          >
                            <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 15V17H13V15H11ZM11 7V13H13V7H11Z"></path>
                          </svg>
                          {errors.firstname}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastname"
                        value={formData.lastname}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      {errors.lastname && (
                        <p className="text-xs mt-1 flex items-center gap-1 text-red-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="h-5 w-5 text-red-500"
                          >
                            <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 15V17H13V15H11ZM11 7V13H13V7H11Z"></path>
                          </svg>
                          {errors.lastname}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Mobile Number
                    </label>
                    <input
                      type="text"
                      name="mobileno"
                      value={formData.mobileno}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.mobileno && (
                      <p className="text-xs mt-1 flex items-center gap-1 text-red-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-5 w-5 text-red-500"
                        >
                          <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 15V17H13V15H11ZM11 7V13H13V7H11Z"></path>
                        </svg>
                        {errors.mobileno}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.password && (
                      <p className="text-xs mt-1 flex items-center gap-1 text-red-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-5 w-5 text-red-500"
                        >
                          <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 15V17H13V15H11ZM11 7V13H13V7H11Z"></path>
                        </svg>
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.confirmPassword && (
                      <p className="text-xs mt-1 flex items-center gap-1 text-red-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-5 w-5 text-red-500"
                        >
                          <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 15V17H13V15H11ZM11 7V13H13V7H11Z"></path>
                        </svg>
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Address Information */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.address && <ErrorMessage error={errors.address} />}
                  </div>

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
                    {errors.country && <ErrorMessage error={errors.country} />}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                      {errors.state && <ErrorMessage error={errors.state} />}
                    </div>
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
                      {errors.city && <ErrorMessage error={errors.city} />}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Pincode
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      {errors.pincode && <ErrorMessage error={errors.pincode} />}
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

            <div className="text-center mt-2">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/login"
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Login
                </Link>
              </p>
            </div>
          </div>
        )}
      </>
    </div>
  );
};

export default Register;
// components/auth/Register.jsx