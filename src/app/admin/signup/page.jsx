"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { API_BASE_URL, apiConstants } from "../../../constants/index";
import { enqueueSnackbar } from "notistack";
import { Country } from "country-state-city";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    dobDay: "",
    dobMonth: "",
    dobYear: "",
    countryName: "",
    countryCode: "",
    phoneNumber: "",
    termsAgreed: false,
    role: "superAdmin",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [errors, setErrors] = useState({});

  // Generate days, months, years for DOB
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  // Generate years from current year - 100 to current year - 18
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - (currentYear - 100) + 1 },
    (_, i) => currentYear - i
  ).filter((year) => year <= currentYear - 18);

  const countries = Country.getAllCountries();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData({
      ...formData,
      [name]: newValue,
    });

    // Clear error when user starts typing/changing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }

    // Real-time validation for specific fields
    if (name === "phoneNumber") {
      validatePhoneNumberField(newValue);
    }
    if (name === "email") {
      validateEmailField(newValue);
    }
    if (name === "password") {
      validatePasswordField(newValue);
    }
    if (name === "confirmPassword") {
      validateConfirmPasswordField(newValue, formData.password);
    }
    if (name === "firstName" || name === "lastName") {
      validateNameField(name, newValue);
    }
  };

  const selectCountry = (countryObj) => {
    if (!countryObj || !countryObj.name || !countryObj.isoCode) {
      setErrors((prev) => ({
        ...prev,
        countryName: "Please select a valid country",
      }));
      return;
    }
    setFormData({
      ...formData,
      countryName: countryObj.name,
      countryCode: countryObj.isoCode,
    });
    setShowSuggestions(false);

    // Clear country error
    if (errors.countryName) {
      setErrors({
        ...errors,
        countryName: "",
      });
    }
  };

  const validateLettersOnly = (text) => {
    const trimmed = text.trim();
    // Reject if empty or only whitespace
    if (!trimmed) return false;
    // Reject if there are consecutive spaces
    if (/\s{2,}/.test(trimmed)) return false;
    // Allow letters, apostrophes, hyphens, and single spaces
    return /^[A-Za-zÀ-ÖØ-öø-ÿ'-]+(?: [A-Za-zÀ-ÖØ-öø-ÿ'-]+)*$/.test(trimmed);
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8 && /\d/.test(password);
  };

  const validateDOB = () => {
    if (!formData.dobDay || !formData.dobMonth || !formData.dobYear)
      return false;

    const dob = new Date(
      `${formData.dobYear}-${formData.dobMonth}-${formData.dobDay}`
    );
    const today = new Date();
    const eighteenYearsAgo = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate()
    );

    return dob <= eighteenYearsAgo && dob.toString() !== "Invalid Date";
  };

  const validateMobileNumber = (number) => {
    // Check if number contains only digits and has reasonable length (6-15 digits)
    return /^\+?[0-9]{10,15}$/.test(number);
  };

  // Individual field validation functions
  const validateNameField = (fieldName, value) => {
    if (!value.trim()) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: "This field is required",
      }));
    } else if (!validateLettersOnly(value)) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: "Should contain only letters and common name characters",
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    }
  };

  const validateEmailField = (email) => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrors((prev) => ({
        ...prev,
        email: "Email is required",
      }));
    } else if (!validateEmail(trimmedEmail)) {
      setErrors((prev) => ({
        ...prev,
        email: "Please enter a valid email address",
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        email: "",
      }));
    }
  };

  const validatePasswordField = (password) => {
    if (!password.trim()) {
      setErrors((prev) => ({
        ...prev,
        password: "Password is required",
      }));
    } else if (!validatePassword(password)) {
      setErrors((prev) => ({
        ...prev,
        password:
          "Password must be at least 8 characters and contain at least 1 number",
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        password: "",
      }));
    }
  };

  const validateConfirmPasswordField = (confirmPassword, password) => {
    if (confirmPassword && confirmPassword !== password) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match",
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "",
      }));
    }
  };

  const validatePhoneNumberField = (phoneNumber) => {
    const trimmedPhone = phoneNumber.trim();
    if (!trimmedPhone) {
      setErrors((prev) => ({
        ...prev,
        phoneNumber: "Phone number is required",
      }));
    } else if (!validateMobileNumber(trimmedPhone)) {
      setErrors((prev) => ({
        ...prev,
        phoneNumber: "Phone number should contain 10-15 digits only",
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        phoneNumber: "",
      }));
    }
  };

  const validateDOBField = () => {
    if (
      formData.dobDay &&
      formData.dobMonth &&
      formData.dobYear &&
      !validateDOB()
    ) {
      setErrors((prev) => ({
        ...prev,
        dob: "You must be at least 18 years old to register",
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        dob: "",
      }));
    }
  };

  // Check if all mandatory fields are filled and valid
  const isFormValid = () => {
    const mandatoryFields = [
      "firstName",
      "lastName",
      "email",
      "password",
      "confirmPassword",
      "dobDay",
      "dobMonth",
      "dobYear",
      "countryName",
      "phoneNumber",
      "role",
    ];

    // Check if all mandatory fields have values
    const allFieldsFilled = mandatoryFields.every(
      (field) => formData[field] && formData[field].toString().trim() !== ""
    );

    // Check if terms are agreed
    const termsAgreed = formData.termsAgreed;

    // Check if there are any validation errors
    const hasErrors = Object.values(errors).some((error) => error !== "");

    // Additional validations
    const isEmailValid = validateEmail(formData.email);
    const isPasswordValid = validatePassword(formData.password);
    const passwordsMatch = formData.password === formData.confirmPassword;
    const isDOBValid = validateDOB();
    const isPhoneValid = validateMobileNumber(formData.phoneNumber);
    const isFirstNameValid = validateLettersOnly(formData.firstName);
    const isLastNameValid = validateLettersOnly(formData.lastName);

    return (
      allFieldsFilled &&
      termsAgreed &&
      !hasErrors &&
      isEmailValid &&
      isPasswordValid &&
      passwordsMatch &&
      isDOBValid &&
      isPhoneValid &&
      isFirstNameValid &&
      isLastNameValid
    );
  };

  // Validate DOB when any DOB field changes
  useEffect(() => {
    if (formData.dobDay && formData.dobMonth && formData.dobYear) {
      validateDOBField();
    }
  }, [formData.dobDay, formData.dobMonth, formData.dobYear]);

  console.log("Form data:", formData);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const trimmedFormData = {
      ...formData,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      phoneNumber: formData.phoneNumber.trim(),
    };

    if (!validateLettersOnly(trimmedFormData.firstName)) {
      enqueueSnackbar(
        "First name is invalid. Avoid leading/trailing or multiple spaces.",
        {
          variant: "warning",
        }
      );
      setIsLoading(false);
      return;
    }

    if (!validateLettersOnly(trimmedFormData.lastName)) {
      enqueueSnackbar(
        "Last name is invalid. Avoid leading/trailing or multiple spaces.",
        {
          variant: "warning",
        }
      );
      setIsLoading(false);
      return;
    }

    try {
      // Validate first and last name
      if (
        !validateLettersOnly(formData.firstName) ||
        !validateLettersOnly(formData.lastName)
      ) {
        enqueueSnackbar(
          "Names should contain only letters and single spaces between words",
          {
            variant: "warning",
          }
        );
        setIsLoading(false);
        return;
      }

      // Validate email
      if (!validateEmail(formData.email)) {
        enqueueSnackbar("Please enter a valid email address", {
          variant: "warning",
        });
        setIsLoading(false);
        return;
      }

      // Validate password
      if (!validatePassword(formData.password)) {
        enqueueSnackbar(
          "Password must be at least 8 characters and contain at least 1 number",
          { variant: "warning" }
        );
        setIsLoading(false);
        return;
      }

      // Validate password match
      if (formData.password !== formData.confirmPassword) {
        enqueueSnackbar("Passwords do not match", { variant: "warning" });
        setIsLoading(false);
        return;
      }

      // Validate date of birth
      if (!validateDOB()) {
        enqueueSnackbar("You must be at least 18 years old to register", {
          variant: "warning",
        });
        setIsLoading(false);
        return;
      }

      // Validate mobile number
      if (!validateMobileNumber(formData.phoneNumber)) {
        enqueueSnackbar("Phone number should contain 6-15 digits only", {
          variant: "warning",
        });
        setIsLoading(false);
        return;
      }

      const payload = {
        ...formData,
        redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/verify-email`,
        country: formData.countryCode,
      };
      delete payload.countryCode;
      delete payload.countryName;

      console.log("Registration data ready to be sent:", payload);
      const res = await axios.post(`${API_BASE_URL}/auth/signup`, payload);
      console.log("Registration response:", res);
      if (res.status === apiConstants.create) {
        enqueueSnackbar(res.data.message, { variant: "success" });
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
          dobDay: "",
          dobMonth: "",
          dobYear: "",
          countryName: "",
          countryCode: "",
          phoneNumber: "",
          termsAgreed: false,
          role: "superAdmin",
        });
        setErrors({});
      }
    } catch (error) {
      if (error.response?.status === 403) {
        enqueueSnackbar(error.response.data.message || "Account suspended.", {
          variant: "error",
        });
      } else if (error.response?.status === 409) {
        enqueueSnackbar(
          error.response.data.message || "Email already exists.",
          { variant: "error" }
        );
      } else {
        enqueueSnackbar("Signup failed. Please try again later.", {
          variant: "error",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-transparent  md:px-28 py-20 md:py-6">
      <div className="flex w-full">
        <div className="w-full flex md:items-center justify-center p-0 md:p-8">
          <div className="w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-white">Sign Up</h1>
              <span className="text-xs text-red-500">
                *Indicates Mandatory Fields
              </span>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* First Name */}
              <div>
                <input
                  type="text"
                  name="firstName"
                  placeholder="FIRST NAME*"
                  value={formData.firstName}
                  onBlur={(e) =>
                    setFormData({
                      ...formData,
                      firstName: e.target.value.trim(),
                    })
                  }
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded border ${
                    errors.firstName ? "border-red-500" : "border-gray-700"
                  } bg-transparent text-white`}
                  required
                  disabled={isLoading}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.firstName}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <input
                  type="text"
                  name="lastName"
                  onBlur={(e) =>
                    setFormData({
                      ...formData,
                      lastName: e.target.value.trim(),
                    })
                  }
                  placeholder="LAST NAME*"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded border ${
                    errors.lastName ? "border-red-500" : "border-gray-700"
                  } bg-transparent text-white`}
                  required
                  disabled={isLoading}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="EMAIL*"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded border ${
                    errors.email ? "border-red-500" : "border-gray-700"
                  } bg-transparent text-white`}
                  required
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="PASSWORD*"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pr-10 rounded border ${
                    errors.password ? "border-red-500" : "border-gray-700"
                  } bg-transparent text-white`}
                  required
                  disabled={isLoading}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white cursor-pointer"
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </span>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="RE-ENTER PASSWORD*"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pr-10 rounded border ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-700"
                  } bg-transparent text-white`}
                  required
                  disabled={isLoading}
                />
                <span
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </span>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-white text-sm mb-1">
                  Date of Birth*
                </label>
                <div className="flex space-x-2">
                  <select
                    name="dobDay"
                    value={formData.dobDay}
                    onChange={handleChange}
                    className="w-1/4 px-2 py-3 rounded border border-gray-700 bg-transparent text-white"
                    required
                    disabled={isLoading}
                  >
                    <option value="" className="text-black">
                      DD
                    </option>
                    {days.map((day) => (
                      <option
                        key={day}
                        value={day < 10 ? `0${day}` : day}
                        className="text-black"
                      >
                        {day}
                      </option>
                    ))}
                  </select>
                  <select
                    name="dobMonth"
                    value={formData.dobMonth}
                    onChange={handleChange}
                    className="w-2/5 px-2 py-3 rounded border border-gray-700 bg-transparent text-white"
                    required
                    disabled={isLoading}
                  >
                    <option value="" className="text-black">
                      MM
                    </option>
                    {months.map((month) => (
                      <option
                        key={month.value}
                        value={month.value}
                        className="text-black"
                      >
                        {month.label}
                      </option>
                    ))}
                  </select>
                  <select
                    name="dobYear"
                    value={formData.dobYear}
                    onChange={handleChange}
                    className="w-1/3 px-2 py-3 rounded border border-gray-700 bg-transparent text-white"
                    required
                    disabled={isLoading}
                  >
                    <option value="" className="text-black">
                      YYYY
                    </option>
                    {years.map((year) => (
                      <option key={year} value={year} className="text-black">
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.dob && (
                  <p className="text-red-500 text-xs mt-1">{errors.dob}</p>
                )}
              </div>

              {/* Country with auto-suggest */}
              <div className="relative">
                <input
                  type="text"
                  name="countryName"
                  placeholder="Enter Country*"
                  value={formData.countryName}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({
                      ...formData,
                      countryName: value,
                      countryCode: "",
                    });

                    if (value.trim() !== "") {
                      setSuggestions(
                        countries
                          .filter((c) =>
                            c.name.toLowerCase().includes(value.toLowerCase())
                          )
                          .slice(0, 5)
                      );
                      setShowSuggestions(true);
                    } else {
                      setShowSuggestions(false);
                    }
                  }}
                  onFocus={() => {
                    if (formData.countryName.trim() !== "") {
                      setSuggestions(
                        countries
                          .filter((c) =>
                            c.name
                              .toLowerCase()
                              .includes(formData.countryName.toLowerCase())
                          )
                          .slice(0, 5)
                      );
                      setShowSuggestions(true);
                    }
                  }}
                  className={`w-full px-4 py-3 rounded border ${
                    errors.countryName ? "border-red-500" : "border-gray-700"
                  } bg-transparent text-white`}
                  required
                  disabled={isLoading}
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded max-h-60 overflow-auto">
                    {suggestions.map((country, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 text-white hover:bg-gray-700 cursor-pointer"
                        onClick={() => selectCountry(country)}
                      >
                        {country.name}
                      </div>
                    ))}
                  </div>
                )}
                {errors.countryName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.countryName}
                  </p>
                )}
              </div>

              {/* Mobile Number */}
              <div>
                <div className="flex">
                  <div className="w-1/4 px-4 py-3 rounded-l border border-gray-700 bg-gray-800 text-white flex items-center justify-center">
                    +
                    {countries.find((c) => c.isoCode === formData.countryCode)
                      ?.phonecode || "0"}
                  </div>
                  <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="Enter Mobile Number*"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className={`w-3/4 px-4 py-3 rounded-r border ${
                      errors.phoneNumber ? "border-red-500" : "border-gray-700"
                    } bg-transparent text-white`}
                    required
                    disabled={isLoading}
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

              {/* Terms Agreement */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="termsAgreed"
                  name="termsAgreed"
                  checked={formData.termsAgreed}
                  onChange={handleChange}
                  className="w-4 h-4 mr-2 accent-yellow-500"
                  required
                  disabled={isLoading}
                />
                <label htmlFor="termsAgreed" className="text-white text-sm">
                  I agree to terms and privacy policy*
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={`w-full py-3 rounded font-medium transition duration-300 flex items-center justify-center mt-4 ${
                  isFormValid() && !isLoading
                    ? "bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                    : "bg-gray-500 text-gray-300 cursor-not-allowed"
                }`}
                disabled={!isFormValid() || isLoading}
              >
                {isLoading ? "Signing Up..." : "Create Account"}
              </button>

              <div className="flex justify-between items-center my-6">
                {/* Login Link */}
                <div className="text-center text-white">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-yellow-500 hover:underline"
                  >
                    Log In
                  </Link>
                </div>
                <Link
                  href={"/forgot-password"}
                  className="text-blue-400 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
