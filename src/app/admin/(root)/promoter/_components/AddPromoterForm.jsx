"use client";
import useStore from "../../../../../stores/useStore";
import { enqueueSnackbar } from "notistack";
import { uploadToS3 } from "../../../../../utils/uploadToS3";
import { Eye, EyeOff, Trash } from "lucide-react";
import React, { useState } from "react";
import {
  API_BASE_URL,
  apiConstants,
  APP_BASE_URL,
} from "../../../../../constants";
import axios from "axios";
import { Country, State } from "country-state-city";
import Loader from "../../../../_components/Loader";
import { useRouter } from "next/navigation";

export const AddPromoterForm = ({
  setShowAddPromoterForm,
  redirectOrigin = "",
}) => {
  const user = useStore((state) => state.user);
  const [formData, setFormData] = useState({
    // Profile Info
    profilePhoto: null,
    name: "",
    abbreviation: "",
    websiteURL: "",
    aboutUs: "",

    // Contact Info
    contactPersonName: "",
    phoneNumber: "",
    email: "",
    alternatePhoneNumber: "",

    // Compliance
    sanctioningBody: "",

    // Documents
    licenseCertificate: null,

    // Address Info
    street1: "",
    street2: "",
    country: "United States",
    state: "",
    city: "",
    postalCode: "",

    // Access
    accountStatus: "",
    userName: "",
    password: "",
    confirmPassword: "",
    assignRole: "Promoter",
    adminNotes: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const countries = Country.getAllCountries();
  const states = formData.country
    ? State.getStatesOfCountry(formData.country)
    : [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prevState) => ({
        ...prevState,
        [fieldName]: file,
      }));
    }
  };

  console.log("Form Data:", formData);

  const validateName = (name) => /^[A-Za-z\s'-]+$/.test(name);
  const validateTextInput = (text) => /^[A-Za-z0-9\s\-.,'()]+$/.test(text); // Allows letters, numbers, spaces, hyphens, commas, apostrophes, and parentheses
  const validateUsername = (username) => /^[A-Za-z0-9_]+$/.test(username); // Allows only alphanumeric + underscore
  const validatePhoneNumber = (number) => /^\+?[0-9]{10,15}$/.test(number);
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validPostalCode = (postalCode) => /^\d{5,10}$/.test(postalCode) // 5-10 digits only
  const validPassword = (password) =>
    /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(password);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateName(formData.name)) {
      enqueueSnackbar(
        "Name can only contain letters, spaces, apostrophes, or hyphens.",
        { variant: "warning" }
      );
      setIsSubmitting(false);
      return;
    }
    if (!validateTextInput(formData.abbreviation)) {
      enqueueSnackbar(
        "Abbreviation can only contain letters, numbers, and basic punctuation.",
        { variant: "warning" }
      );
      return;
    }

    if (!validateTextInput(formData.city)) {
      enqueueSnackbar(
        "City name can only contain letters, numbers, and basic punctuation.",
        { variant: "warning" }
      );
      return;
    }

    if (!validateTextInput(formData.street1)) {
      enqueueSnackbar(
        "Street 1 can only contain letters, numbers, and basic punctuation.",
        { variant: "warning" }
      );
      return;
    }

    if (formData.street2 && !validateTextInput(formData.street2)) {
      enqueueSnackbar(
        "Street 2 can only contain letters, numbers, and basic punctuation.",
        { variant: "warning" }
      );
      return;
    }

    if (!formData.password) {
  enqueueSnackbar('Password is required.', { variant: 'warning' })
  return
}

if (!validPassword(formData.password)) {
  enqueueSnackbar('Password must be at least 8 characters and contain at least 1 number.', { variant: 'warning' })
  return
}

if (!formData.confirmPassword) {
  enqueueSnackbar('Confirm Password is required.', { variant: 'warning' })
  return
}

if (formData.password !== formData.confirmPassword) {
  enqueueSnackbar('Passwords do not match. Please try again.', { variant: 'warning' })
  return
}

    if (!validateUsername(formData.userName)) {
      enqueueSnackbar(
        "Username can only contain letters, numbers, and underscores.",
        { variant: "warning" }
      );
      return;
    }
    if (!validateName(formData.contactPersonName)) {
      enqueueSnackbar(
        "Contact Person Name can only contain letters, spaces, apostrophes, or hyphens.",
        { variant: "warning" }
      );
      setIsSubmitting(false);
      return;
    }
    if (!validateEmail(formData.email)) {
      enqueueSnackbar("Please enter a valid email address.", {
        variant: "warning",
      });
      setIsSubmitting(false);
      return;
    }
    if (!validatePhoneNumber(formData.phoneNumber)) {
      enqueueSnackbar("Please enter a valid phone number.", {
        variant: "warning",
      });
      setIsSubmitting(false);
      return;
    }
    if (
      formData.alternatePhoneNumber &&
      !validatePhoneNumber(formData.alternatePhoneNumber)
    ) {
      enqueueSnackbar("Please enter a valid alternate phone number.", {
        variant: "warning",
      });
      setIsSubmitting(false);
      return;
    }
    if (!validPostalCode(formData.postalCode)) {
      enqueueSnackbar("Please enter a valid postal code.", {
        variant: "warning",
      });
      setIsSubmitting(false);
      return;
    }
    if (!validPassword(formData.password)) {
      enqueueSnackbar(
        "Password must be at least 8 characters and contain at least 1 number.",
        {
          variant: "warning",
        }
      );
      setIsSubmitting(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      enqueueSnackbar("Passwords do not match. Please try again.", {
        variant: "warning",
      });
      setIsSubmitting(false);
      return;
    }
    try {
      if (
        formData.profilePhoto !== null &&
        typeof formData.profilePhoto !== "string"
      ) {
        formData.profilePhoto = await uploadToS3(formData.profilePhoto);
      }
      if (
        formData.licenseCertificate !== null &&
        typeof formData.licenseCertificate !== "string"
      ) {
        formData.licenseCertificate = await uploadToS3(
          formData.licenseCertificate
        );
      }
      const response = await axios.post(
        `${API_BASE_URL}/promoter`,
        {
          ...formData,
          redirectUrl: `${APP_BASE_URL}/verify-email`,
        },
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      if (response.status === apiConstants.create) {
        enqueueSnackbar(response.data.message, { variant: "success" });
        handleCancel();
      }
    } catch (error) {
      console.log(error);

      enqueueSnackbar(
        error?.response?.data?.message || "Something went wrong",
        {
          variant: "error",
        }
      );
    }
  };

  const handleCancel = () => {
    if (redirectOrigin == "addEvent") {
      router.push("/admin/events?redirectOrigin=addPromoter");
    } else {
      setShowAddPromoterForm(false);
    }
    setFormData({
      // Profile Info
      profilePhoto: null,
      name: "",
      abbreviation: "",
      websiteURL: "",
      aboutUs: "",

      // Contact Info
      contactPersonName: "",
      phoneNumber: "",
      email: "",
      alternatePhoneNumber: "",

      // Compliance
      sanctioningBody: "",

      // Documents
      licenseCertificate: null,

      // Address Info
      street1: "",
      street2: "",
      country: "United States",
      state: "",
      city: "",
      postalCode: "",

      // Access
      accountStatus: "",
      userName: "",
      password: "",
      confirmPassword: "",
      assignRole: "Promoter",
      adminNotes: "",
    });
  };

  return (
    <div className="min-h-screen text-white bg-dark-blue-900">
      <div className="w-full">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-6">
          <button className="text-white" onClick={handleCancel}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <h1 className="text-xl font-medium">Add New Promoter</h1>
        </div>

        <form onSubmit={handleSubmit}>
          {/* PROFILE INFO Section */}
          <div className="mb-8">
            <h2 className="text-sm font-bold mb-4">PROFILE INFO</h2>

            {/* Image Upload */}
            <div className="mb-6">
              <label className="block text-xs font-medium mb-1">
                Upload Image (jpg/png)
                <span className="text-gray-400"> - Optional</span>
              </label>
              {formData.profilePhoto ? (
                <div className="relative w-72 h-52 rounded-lg overflow-hidden border border-[#D9E2F930]">
                  <img
                    src={
                      typeof formData.profilePhoto == "string"
                        ? formData.profilePhoto
                        : URL.createObjectURL(formData.profilePhoto)
                    }
                    alt="Selected image"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, profilePhoto: null }))
                    }
                    className="absolute top-2 right-2 bg-[#14255D] p-1 rounded text-[#AEB9E1] shadow-md z-20"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="profile-pic-upload"
                  className="cursor-pointer border-2 border-dashed border-gray-500 rounded-lg flex flex-col items-center justify-center w-72 h-52 relative overflow-hidden"
                >
                  <input
                    id="profile-pic-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "profilePhoto")}
                    className="absolute inset-0 opacity-0 cursor-pointer z-50"
                  />

                  <div className="bg-yellow-500 opacity-50 rounded-full p-2 mb-2 z-10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-center text-[#AEB9E1] z-10">
                    <span className="text-[#FEF200] mr-1">Click to upload</span>
                    or drag and drop profile pic
                    <br />
                    <span className="text-xs">Max 5 MB, image only</span>
                  </p>
                </label>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Logo or profile image for promoter
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Promoter Name Field */}
              <div className="bg-[#00000061] p-2 h-16 rounded">
                <label className="block text-xs font-medium mb-1">
                  Promoter Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter Promoter Name"
                  className="w-full bg-transparent outline-none"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Abbreviations Field */}
              <div className="bg-[#00000061] p-2 h-16 rounded">
                <label className="block text-xs font-medium mb-1">
                  Abbreviations<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="abbreviation"
                  value={formData.abbreviation}
                  onChange={handleChange}
                  placeholder="e.g. IKF"
                  className="w-full bg-transparent outline-none"
                  maxLength={10}
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Website URL Field */}
              <div className="bg-[#00000061] p-2 h-16 rounded">
                <label className="block text-xs font-medium mb-1">
                  Website URL<span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  name="websiteURL"
                  value={formData.websiteURL}
                  onChange={handleChange}
                  placeholder="https://www.example.com"
                  className="w-full bg-transparent outline-none"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* About Us Field */}
            <div className="bg-[#00000061] p-2 rounded mb-2">
              <label className="block text-xs font-medium mb-1">
                About Us<span className="text-gray-400"> - Optional</span>
              </label>
              <textarea
                name="aboutUs"
                value={formData.aboutUs}
                onChange={handleChange}
                placeholder="Describe the promoter..."
                rows="3"
                className="w-full bg-transparent outline-none resize-none"
                maxLength={500}
                disabled={isSubmitting}
              />
            </div>

            {/* URL Note */}
            <div className="mb-4">
              <p className="text-xs text-gray-400">
                Note: You MUST enter the full URL including the http or https
                prefix. E.g. 'https://example.com', not just 'example.com'
              </p>
            </div>
          </div>

          {/* CONTACT INFO Section */}
          <div className="mb-8">
            <h2 className="text-sm font-bold mb-4">CONTACT INFO</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Contact Person Name Field */}
              <div className="bg-[#00000061] p-2 h-16 rounded">
                <label className="block text-xs font-medium mb-1">
                  Contact Person Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="contactPersonName"
                  value={formData.contactPersonName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full bg-transparent outline-none"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Mobile Number Field */}
              <div className="bg-[#00000061] p-2 h-16 rounded">
                <label className="block text-xs font-medium mb-1">
                  Mobile Number<span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="+1-555-123456"
                  className="w-full bg-transparent outline-none"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Alternate Mobile Number Field */}
              <div className="bg-[#00000061] p-2 h-16 rounded">
                <label className="block text-xs font-medium mb-1">
                  Alternate Mobile Number
                  <span className="text-gray-400"> - Optional</span>
                </label>
                <input
                  type="tel"
                  name="alternatePhoneNumber"
                  value={formData.alternatePhoneNumber}
                  onChange={handleChange}
                  placeholder="+1-555-000000"
                  className="w-full bg-transparent outline-none"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Email Address Field */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-[#00000061] p-2 h-16 rounded">
                <label className="block text-xs font-medium mb-1">
                  Email Address<span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="promoter@event.com"
                  className="w-full bg-transparent outline-none"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>
          </div>

          {/* COMPLIANCE Section */}
          <div className="mb-8">
            <h2 className="text-sm font-bold mb-4">COMPLIANCE</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Sanctioning Body Field */}
              <div className="bg-[#00000061] p-2 h-16 rounded">
                <label className="block text-xs font-medium mb-1">
                  Sanctioning Body<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="sanctioningBody"
                    value={formData.sanctioningBody}
                    onChange={handleChange}
                    className="w-full bg-transparent outline-none appearance-none"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="" disabled className="text-black">
                      Select sanctioning body
                    </option>
                    <option value="IKF" className="text-black">
                      IKF
                    </option>
                    <option value="WBC" className="text-black">
                      WBC
                    </option>
                    <option value="USA Boxing" className="text-black">
                      USA Boxing
                    </option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DOCUMENTS Section */}
          <div className="mb-8">
            <h2 className="text-sm font-bold mb-4">DOCUMENTS</h2>

            <div className="mb-6">
              <label className="block text-xs font-medium mb-1">
                Upload License/Certificate (.pdf/.jpg/.png)
                <span className="text-red-500">*</span>
              </label>
              {formData.licenseCertificate ? (
                <div className="relative w-72 h-24 rounded-lg overflow-hidden border border-[#D9E2F930] flex items-center justify-center">
                  <div className="text-center">
                    <p>Document uploaded</p>
                    <p className="text-xs text-gray-400">Click to change</p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData((prev) => ({
                        ...prev,
                        licenseCertificate: null,
                      }));
                    }}
                    className="absolute top-2 right-2 bg-[#14255D] p-1 rounded text-[#AEB9E1] shadow-md z-50" // <- z-50 makes it higher than input
                  >
                    <Trash className="w-4 h-4" />
                  </button>

                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, "licenseCertificate")}
                    className="absolute inset-0 opacity-0 cursor-pointer z-40"
                    disabled={isSubmitting}
                  />
                </div>
              ) : (
                <label
                  htmlFor="license-cert-upload"
                  className="cursor-pointer border-2 border-dashed border-gray-500 rounded-lg flex flex-col items-center justify-center w-72 h-24 relative overflow-hidden"
                >
                  <input
                    id="license-cert-upload"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, "licenseCertificate")}
                    className="absolute inset-0 opacity-0 cursor-pointer z-50"
                    required
                  />

                  <div className="bg-yellow-500 opacity-50 rounded-full p-2 mb-2 z-10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-center text-[#AEB9E1] z-10">
                    <span className="text-[#FEF200] mr-1">
                      Upload certification
                    </span>
                    <br />
                    <span className="text-xs">
                      Max 10 MB, document or image
                    </span>
                  </p>
                </label>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Proof of licensing or eligibility
              </p>
            </div>
          </div>

          {/* ADDRESS INFO Section */}
          <div className="mb-8">
            <h2 className="text-sm font-bold mb-4">ADDRESS INFO</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Street 1 Field */}
              <div className="bg-[#00000061] p-2 h-16 rounded">
                <label className="block text-xs font-medium mb-1">
                  Street 1<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="street1"
                  value={formData.street1}
                  onChange={handleChange}
                  placeholder="123 Combat Arena Road"
                  className="w-full bg-transparent outline-none"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Street 2 Field */}
              <div className="bg-[#00000061] p-2 h-16 rounded">
                <label className="block text-xs font-medium mb-1">
                  Street 2<span className="text-gray-400"> - Optional</span>
                </label>
                <input
                  type="text"
                  name="street2"
                  value={formData.street2}
                  onChange={handleChange}
                  placeholder="Suite 400"
                  className="w-full bg-transparent outline-none"
                  disabled={isSubmitting}
                />
              </div>

              {/* Country Field */}
              <div className="bg-[#00000061] p-2 h-16 rounded">
                <label className="block text-xs font-medium mb-1">
                  Country<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full bg-transparent outline-none appearance-none"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="" className="text-black">
                      Select Country
                    </option>
                    {countries.map((country) => (
                      <option
                        key={country.isoCode}
                        value={country.isoCode}
                        className="text-black"
                      >
                        {country.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* State Field */}
              <div className="bg-[#00000061] p-2 h-16 rounded">
                <label className="block text-xs font-medium mb-1">
                  State<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full bg-transparent outline-none appearance-none"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="" className="text-black">
                      Select State
                    </option>
                    {states.map((state) => (
                      <option
                        key={state.isoCode}
                        value={state.isoCode}
                        className="text-black"
                      >
                        {state.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* City Field */}
              <div className="bg-[#00000061] p-2 h-16 rounded">
                <label className="block text-xs font-medium mb-1">
                  City<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                  className="w-full bg-transparent outline-none"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* ZIP/Postal Code Field */}
              <div className="bg-[#00000061] p-2 h-16 rounded">
                <label className="block text-xs font-medium mb-1">
                  ZIP/Postal Code<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="90001"
                  maxLength={10} // Prevent more than 10 digits
                  className="w-full bg-transparent outline-none"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* ADMIN ACCESS Section */}
          <div className="mb-8">
            <h2 className="text-sm font-bold mb-4">ADMIN ACCESS</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Account Status Field */}
              <div className="bg-[#00000061] p-2 h-16 rounded">
                <label className="block text-xs font-medium mb-1">
                  Account Status<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="accountStatus"
                    value={formData.accountStatus}
                    onChange={handleChange}
                    className="w-full bg-transparent outline-none appearance-none"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="" disabled className="text-black">
                      Select account status
                    </option>
                    <option value="Active" className="text-black">
                      Active
                    </option>
                    <option value="Suspended" className="text-black">
                      Suspended
                    </option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Username Field */}
              <div className="bg-[#00000061] p-2 h-16 rounded">
                <label className="block text-xs font-medium mb-1">
                  Username<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                  placeholder="promoter_admin"
                  className="w-full bg-transparent outline-none"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Assign Role Field */}
              <div className="bg-[#00000061] p-2 h-16 rounded">
                <label className="block text-xs font-medium mb-1">
                  Assign Role<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="assignRole"
                    value={formData.assignRole}
                    onChange={handleChange}
                    className="w-full bg-transparent outline-none appearance-none"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="Promoter" className="text-black">
                      Promoter
                    </option>
                    <option value="Viewer" className="text-black">
                      Viewer
                    </option>
                    <option value="Admin" className="text-black">
                      Admin
                    </option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Password Field */}
              <div className="bg-[#00000061] p-2 h-16 rounded relative">
                <label className="block text-xs font-medium mb-1">
                  Password <span className='text-red-500'>*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="********"
                    className="w-full bg-transparent outline-none pr-10"
                    minLength={8}
                    disabled={isSubmitting}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white cursor-pointer"
                  >
                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                  </span>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="bg-[#00000061] p-2 h-16 rounded">
                <label className="block text-xs font-medium mb-1">
                  Confirm Password <span className='text-red-500'>*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="********"
                    className="w-full bg-transparent outline-none"
                    minLength={8}
                    disabled={isSubmitting}
                  />
                  <span
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <Eye size={20} />
                    ) : (
                      <EyeOff size={20} />
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Internal Notes Field */}
            <div className="bg-[#00000061] p-2 rounded mb-4">
              <label className="block text-xs font-medium mb-1">
                Internal Notes<span className="text-gray-400"> - Optional</span>
              </label>
              <textarea
                name="adminNotes"
                value={formData.adminNotes}
                onChange={handleChange}
                placeholder="Admin-only remarks"
                rows="3"
                className="w-full bg-transparent outline-none resize-none"
                maxLength={300}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Form Controls */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-white font-medium py-2 px-6 rounded transition duration-200"
              style={{
                background:
                  "linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)",
              }}
            >
              {isSubmitting ? <Loader /> : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
