// components/auth/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    mobileno: "",
    address: "",
  });

  const [otp, setOtp] = useState({
    sent: false,
    value: "",
    verified: false,
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  // Add new state for OTP digits
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  
  // Add ref for OTP inputs
  const otpRefs = Array(6).fill(0).map(() => React.createRef());

  // Validate mobile number
  const validateMobile = (number) => {
    return /^[0-9]{10}$/.test(number);
  };

  // Handle mobile number input
  const handleMobileSubmit = async () => {
    if (!validateMobile(formData.mobileno)) {
      setErrors({ mobileno: "Please enter a valid 10-digit mobile number" });
      return;
    }

    try {
      // First check if mobile exists
      const checkResponse = await axios.post('/api/otp/check-mobile', { 
        mobileno: formData.mobileno 
      });
      
      if (checkResponse.data.exists) {
        setErrors({ mobileno: "Mobile number already registered" });
        return;
      }

      // If mobile doesn't exist, send OTP
      const response = await axios.post('/api/otp/send-otp', {
        mobileno: formData.mobileno
      });
      
      if (response.data.success) {
        setOtp(prev => ({ 
          ...prev, 
          sent: true,
          // In development, store the OTP from response
          value: response.data.otp 
        }));
        toast.success("OTP sent successfully!");
      }
    } catch (error) {
      console.error('API Error:', error);
      setServerError(error.response?.data?.message || "Failed to send OTP");
      toast.error(error.response?.data?.message || "Failed to send OTP");
    }
  };

  // Handle OTP digit input
  const handleOtpDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = value;
    setOtpDigits(newOtpDigits);

    // Combine OTP digits and update main OTP state
    setOtp(prev => ({
      ...prev,
      value: newOtpDigits.join('')
    }));

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs[index + 1].current.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  // Handle OTP verification
  const handleOtpVerify = async () => {
    try {
      const response = await axios.post('/api/otp/verify-otp', {
        mobileno: formData.mobileno,
        otp: otp.value
      });

      if (response.data.success) {
        setOtp(prev => ({ ...prev, verified: true }));
        setStep(2);
        toast.success("Mobile number verified successfully!");
      }
    } catch (error) {
      setErrors({ otp: "Invalid OTP" });
      toast.error("Invalid OTP");
    }
  };

  // Handle final registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp.verified || !formData.address) {
      setServerError("Please complete all steps");
      return;
    }

    try {
      
       const response = await axios.post("/api/users/signup", {
        ...formData,
        userType: "buyer"
      });

      if (response.data.success) {
        toast.success("Registration successful!");
        navigate("/login");
      }
    } catch (error) {
      setServerError(error.response?.data?.message || "Registration failed");
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Step {step} of 2
          </p>
        </div>

        {serverError && (
          <div className="bg-red-50 text-red-500 p-4 rounded-md">
            {serverError}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="space-y-4">
              {!otp.sent ? (
                // Mobile Number Input
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Mobile Number
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="tel"
                      value={formData.mobileno}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        mobileno: e.target.value
                      }))}
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter 10-digit mobile number"
                    />
                    <button
                      type="button"
                      onClick={handleMobileSubmit}
                      className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Send OTP
                    </button>
                  </div>
                  {errors.mobileno && (
                    <p className="mt-2 text-sm text-red-600">{errors.mobileno}</p>
                  )}
                </div>
              ) : (
                // OTP Input
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Verify Your Account
                  </label>
                  <p className="text-sm text-gray-500 mb-4">
                    We are sending a OTP to validate your mobile number, Hang on!
                  </p>
                  <div className="flex justify-center gap-2 mb-4">
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        ref={otpRefs[index]}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-12 h-12 text-center border rounded-md text-lg font-semibold focus:border-blue-500 focus:ring-blue-500"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 text-center mb-4">
                    A SMS has been sent to {formData.mobileno}
                  </p>
                  <button
                    type="button"
                    onClick={handleOtpVerify}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Submit
                  </button>
                  {errors.otp && (
                    <p className="mt-2 text-sm text-red-600 text-center">{errors.otp}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Delivery Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    address: e.target.value
                  }))}
                  rows={4}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your complete delivery address"
                />
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Complete Registration
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Register;