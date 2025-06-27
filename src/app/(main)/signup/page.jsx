'use client'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { API_BASE_URL, apiConstants, roles } from '../../../constants/index'
import { enqueueSnackbar } from 'notistack'
import useStore from '../../../stores/useStore'
import { Country } from 'country-state-city'

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    dobDay: '',
    dobMonth: '',
    dobYear: '',
    countryName: '',
    countryCode: '',
    phoneNumber: '',
    termsAgreed: false,
    role: '',
  })
  const { roles } = useStore()

  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [errors, setErrors] = useState({})

  // Generate days, months, years for DOB
  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ]

  // Generate years from current year - 100 to current year - 18
  const currentYear = new Date().getFullYear()
  const years = Array.from(
    { length: currentYear - (currentYear - 100) + 1 },
    (_, i) => currentYear - i
  ).filter((year) => year <= currentYear - 18)

  const countries = Country.getAllCountries()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value

    setFormData({
      ...formData,
      [name]: newValue,
    })

    // Clear error when user starts typing/changing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      })
    }

    // Real-time validation for specific fields
    if (name === 'phoneNumber') {
      validatePhoneNumberField(newValue)
    }
    if (name === 'email') {
      validateEmailField(newValue)
    }
    if (name === 'password') {
      validatePasswordField(newValue)
    }
    if (name === 'confirmPassword') {
      validateConfirmPasswordField(newValue, formData.password)
    }
    if (name === 'firstName' || name === 'lastName') {
      validateNameField(name, newValue)
    }
  }

  const selectCountry = (countryObj) => {
    setFormData({
      ...formData,
      countryName: countryObj.name,
      countryCode: countryObj.isoCode,
    })
    setShowSuggestions(false)

    // Clear country error
    if (errors.countryName) {
      setErrors({
        ...errors,
        countryName: '',
      })
    }
  }

  const validateLettersOnly = (text) => {
    return /^[A-Za-z\s]+$/.test(text)
  }

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const validatePassword = (password) => {
    return password.length >= 8 && /\d/.test(password)
  }

  const validateDOB = () => {
    if (!formData.dobDay || !formData.dobMonth || !formData.dobYear)
      return false

    const dob = new Date(
      `${formData.dobYear}-${formData.dobMonth}-${formData.dobDay}`
    )
    const today = new Date()
    const eighteenYearsAgo = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate()
    )

    return dob <= eighteenYearsAgo && dob.toString() !== 'Invalid Date'
  }

  const validateMobileNumber = (number) => {
    // Check if number contains only digits and has reasonable length (6-15 digits)
    return /^\+?[0-9]{10,15}$/.test(number)
  }

  // Individual field validation functions
 const validateNameField = (fieldName, value) => {
  if (value && !validateLettersOnly(value)) {
    const fieldDisplayName = fieldName === 'firstName' ? 'First Name' : 'Last Name';
    setErrors((prev) => ({
      ...prev,
      [fieldName]: `${fieldDisplayName} should contain only letters and spaces`,
    }))
  } else {
    setErrors((prev) => ({
      ...prev,
      [fieldName]: '',
    }))
  }
}

  const validateEmailField = (email) => {
    if (email && !validateEmail(email)) {
      setErrors((prev) => ({
        ...prev,
        email: 'Please enter a valid email address',
      }))
    } else {
      setErrors((prev) => ({
        ...prev,
        email: '',
      }))
    }
  }

  const validatePasswordField = (password) => {
    if (password && !validatePassword(password)) {
      setErrors((prev) => ({
        ...prev,
        password:
          'Password must be at least 8 characters and contain at least 1 number',
      }))
    } else {
      setErrors((prev) => ({
        ...prev,
        password: '',
      }))
    }
  }

  const validateConfirmPasswordField = (confirmPassword, password) => {
    if (confirmPassword && confirmPassword !== password) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: 'Passwords do not match',
      }))
    } else {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: '',
      }))
    }
  }

  const validatePhoneNumberField = (phoneNumber) => {
    if (phoneNumber && !validateMobileNumber(phoneNumber)) {
      setErrors((prev) => ({
        ...prev,
        phoneNumber: 'Phone number should contain 10-15 digits only',
      }))
    } else {
      setErrors((prev) => ({
        ...prev,
        phoneNumber: '',
      }))
    }
  }

  const validateDOBField = () => {
    if (
      formData.dobDay &&
      formData.dobMonth &&
      formData.dobYear &&
      !validateDOB()
    ) {
      setErrors((prev) => ({
        ...prev,
        dob: 'You must be at least 18 years old to register',
      }))
    } else {
      setErrors((prev) => ({
        ...prev,
        dob: '',
      }))
    }
  }

  // Check if all mandatory fields are filled and valid
  const isFormValid = () => {
    const mandatoryFields = [
      'firstName',
      'lastName',
      'email',
      'password',
      'confirmPassword',
      'dobDay',
      'dobMonth',
      'dobYear',
      'countryName',
      'phoneNumber',
      'role',
    ]

    // Check if all mandatory fields have values
    const allFieldsFilled = mandatoryFields.every(
      (field) => formData[field] && formData[field].toString().trim() !== ''
    )

    // Check if terms are agreed
    const termsAgreed = formData.termsAgreed

    // Check if there are any validation errors
    const hasErrors = Object.values(errors).some((error) => error !== '')

    // Additional validations
    const isEmailValid = validateEmail(formData.email)
    const isPasswordValid = validatePassword(formData.password)
    const passwordsMatch = formData.password === formData.confirmPassword
    const isDOBValid = validateDOB()
    const isPhoneValid = validateMobileNumber(formData.phoneNumber)
    const isFirstNameValid = validateLettersOnly(formData.firstName)
    const isLastNameValid = validateLettersOnly(formData.lastName)

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
    )
  }

  // Validate DOB when any DOB field changes
  useEffect(() => {
    if (formData.dobDay && formData.dobMonth && formData.dobYear) {
      validateDOBField()
    }
  }, [formData.dobDay, formData.dobMonth, formData.dobYear])

  console.log('Form data:', formData)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate first and last name
      if (
        !validateLettersOnly(formData.firstName) ||
        !validateLettersOnly(formData.lastName)
      ) {
        enqueueSnackbar('Names should contain only letters', {
          variant: 'warning',
        })
        setIsLoading(false)
        return
      }

      // Validate email
      if (!validateEmail(formData.email)) {
        enqueueSnackbar('Please enter a valid email address', {
          variant: 'warning',
        })
        setIsLoading(false)
        return
      }

      // Validate password
      if (!validatePassword(formData.password)) {
        enqueueSnackbar(
          'Password must be at least 8 characters and contain at least 1 number',
          { variant: 'warning' }
        )
        setIsLoading(false)
        return
      }

      // Validate password match
      if (formData.password !== formData.confirmPassword) {
        enqueueSnackbar('Passwords do not match', { variant: 'warning' })
        setIsLoading(false)
        return
      }

      // Validate date of birth
      if (!validateDOB()) {
        enqueueSnackbar('You must be at least 18 years old to register', {
          variant: 'warning',
        })
        setIsLoading(false)
        return
      }

      // Validate mobile number
      if (!validateMobileNumber(formData.phoneNumber)) {
        enqueueSnackbar('Phone number should contain 6-15 digits only', {
          variant: 'warning',
        })
        setIsLoading(false)
        return
      }

      const payload = {
        ...formData,
        redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/verify-email`,
        country: formData.countryCode,
      }
      delete payload.countryCode
      delete payload.countryName

      console.log('Registration data ready to be sent:', payload)
      const res = await axios.post(`${API_BASE_URL}/auth/signup`, payload)
      console.log('Registration response:', res)
      if (res.status === apiConstants.create) {
        enqueueSnackbar(res.data.message, { variant: 'success' })
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: '',
          dobDay: '',
          dobMonth: '',
          dobYear: '',
          countryName: '',
          countryCode: '',
          phoneNumber: '',
          termsAgreed: false,
          role: '',
        })
        setErrors({})
      }
    } catch (err) {
      console.log('Registration error:', err)
      enqueueSnackbar(
        err?.response?.data?.message || 'An error occurred during registration',
        { variant: 'error' }
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex h-screen w-full bg-transparent px-12 md:px-28 py-20 md:py-6'>
      <div className='flex w-full'>
        <div className='hidden md:flex md:w-1/2 bg-gradient-to-b from-purple-900 to-black items-center justify-center'>
          <div className='p-12'>
            <img
              src='/gloves.png'
              alt='Red boxing glove'
              className='max-w-full h-auto transform -rotate-12'
            />
          </div>
        </div>
        <div className='w-full md:w-1/2 flex md:items-center justify-center p-0 md:p-8'>
          <div className='w-full max-w-md'>
            <div className='flex justify-between items-center mb-6'>
              <h1 className='text-3xl font-bold text-white'>Sign Up</h1>
              <span className='text-xs text-red-500'>
                *Indicates Mandatory Fields
              </span>
            </div>
            <form className='space-y-4' onSubmit={handleSubmit}>
              {/* First Name */}
              <div>
                <input
                  type='text'
                  name='firstName'
                  placeholder='FIRST NAME*'
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded border ${
                    errors.firstName ? 'border-red-500' : 'border-gray-700'
                  } bg-transparent text-white`}
                  required
                  disabled={isLoading}
                />
                {errors.firstName && (
                  <p className='text-red-500 text-xs mt-1'>
                    {errors.firstName}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <input
                  type='text'
                  name='lastName'
                  placeholder='LAST NAME*'
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded border ${
                    errors.lastName ? 'border-red-500' : 'border-gray-700'
                  } bg-transparent text-white`}
                  required
                  disabled={isLoading}
                />
                {errors.lastName && (
                  <p className='text-red-500 text-xs mt-1'>{errors.lastName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <input
                  type='email'
                  name='email'
                  placeholder='EMAIL*'
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded border ${
                    errors.email ? 'border-red-500' : 'border-gray-700'
                  } bg-transparent text-white`}
                  required
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className='text-red-500 text-xs mt-1'>{errors.email}</p>
                )}
              </div>

              <div>
                <select
                  name='role'
                  value={formData.role}
                  onChange={handleChange}
                  className='w-full px-2 py-3 rounded border border-gray-700 bg-transparent text-white'
                  required
                  disabled={isLoading}
                >
                  <option value='' className='text-black'>
                    Select Role*
                  </option>
                  {roles.map((role) => (
                    <option
                      key={role?._id}
                      value={role.value}
                      className='text-black'
                    >
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Password */}
              <div className='relative'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name='password'
                  placeholder='PASSWORD*'
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pr-10 rounded border ${
                    errors.password ? 'border-red-500' : 'border-gray-700'
                  } bg-transparent text-white`}
                  required
                  disabled={isLoading}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-white cursor-pointer'
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </span>
                {errors.password && (
                  <p className='text-red-500 text-xs mt-1'>{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className='relative'>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name='confirmPassword'
                  placeholder='RE-ENTER PASSWORD*'
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pr-10 rounded border ${
                    errors.confirmPassword
                      ? 'border-red-500'
                      : 'border-gray-700'
                  } bg-transparent text-white`}
                  required
                  disabled={isLoading}
                />
                <span
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-white cursor-pointer'
                >
                  {showConfirmPassword ? (
                    <Eye size={20} />
                  ) : (
                    <EyeOff size={20} />
                  )}
                </span>
                {errors.confirmPassword && (
                  <p className='text-red-500 text-xs mt-1'>
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className='block text-white text-sm mb-1'>
                  Date of Birth*
                </label>
                <div className='flex space-x-2'>
                  <select
                    name='dobDay'
                    value={formData.dobDay}
                    onChange={handleChange}
                    className='w-1/4 px-2 py-3 rounded border border-gray-700 bg-transparent text-white'
                    required
                    disabled={isLoading}
                  >
                    <option value='' className='text-black'>
                      DD
                    </option>
                    {days.map((day) => (
                      <option
                        key={day}
                        value={day < 10 ? `0${day}` : day}
                        className='text-black'
                      >
                        {day}
                      </option>
                    ))}
                  </select>
                  <select
                    name='dobMonth'
                    value={formData.dobMonth}
                    onChange={handleChange}
                    className='w-2/5 px-2 py-3 rounded border border-gray-700 bg-transparent text-white'
                    required
                    disabled={isLoading}
                  >
                    <option value='' className='text-black'>
                      MM
                    </option>
                    {months.map((month) => (
                      <option
                        key={month.value}
                        value={month.value}
                        className='text-black'
                      >
                        {month.label}
                      </option>
                    ))}
                  </select>
                  <select
                    name='dobYear'
                    value={formData.dobYear}
                    onChange={handleChange}
                    className='w-1/3 px-2 py-3 rounded border border-gray-700 bg-transparent text-white'
                    required
                    disabled={isLoading}
                  >
                    <option value='' className='text-black'>
                      YYYY
                    </option>
                    {years.map((year) => (
                      <option key={year} value={year} className='text-black'>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.dob && (
                  <p className='text-red-500 text-xs mt-1'>{errors.dob}</p>
                )}
              </div>

              {/* Country with auto-suggest */}
              <div className='relative'>
                <input
                  type='text'
                  name='countryName'
                  placeholder='Enter Country*'
                  value={formData.countryName}
                  onChange={(e) => {
                    const value = e.target.value
                    setFormData({
                      ...formData,
                      countryName: value,
                      countryCode: '',
                    })

                    if (value.trim() !== '') {
                      setSuggestions(
                        countries
                          .filter((c) =>
                            c.name.toLowerCase().includes(value.toLowerCase())
                          )
                          .slice(0, 5)
                      )
                      setShowSuggestions(true)
                    } else {
                      setShowSuggestions(false)
                    }
                  }}
                  onFocus={() => {
                    if (formData.countryName.trim() !== '') {
                      setSuggestions(
                        countries
                          .filter((c) =>
                            c.name
                              .toLowerCase()
                              .includes(formData.countryName.toLowerCase())
                          )
                          .slice(0, 5)
                      )
                      setShowSuggestions(true)
                    }
                  }}
                  className={`w-full px-4 py-3 rounded border ${
                    errors.countryName ? 'border-red-500' : 'border-gray-700'
                  } bg-transparent text-white`}
                  required
                  disabled={isLoading}
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className='absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded max-h-60 overflow-auto'>
                    {suggestions.map((country, index) => (
                      <div
                        key={index}
                        className='px-4 py-2 text-white hover:bg-gray-700 cursor-pointer'
                        onClick={() => selectCountry(country)}
                      >
                        {country.name}
                      </div>
                    ))}
                  </div>
                )}
                {errors.countryName && (
                  <p className='text-red-500 text-xs mt-1'>
                    {errors.countryName}
                  </p>
                )}
              </div>

              {/* Mobile Number */}
              <div>
                <div className='flex'>
                  <div className='w-1/4 px-4 py-3 rounded-l border border-gray-700 bg-gray-800 text-white flex items-center justify-center'>
                    +
                    {countries.find((c) => c.isoCode === formData.countryCode)
                      ?.phonecode || '0'}
                  </div>
                  <input
                    type='tel'
                    name='phoneNumber'
                    placeholder='Enter Mobile Number*'
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className={`w-3/4 px-4 py-3 rounded-r border ${
                      errors.phoneNumber ? 'border-red-500' : 'border-gray-700'
                    } bg-transparent text-white`}
                    required
                    disabled={isLoading}
                  />
                </div>
                {errors.phoneNumber && (
                  <p className='text-red-500 text-xs mt-1'>
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

              {/* Terms Agreement */}
              <div className='flex items-center'>
                <input
                  type='checkbox'
                  id='termsAgreed'
                  name='termsAgreed'
                  checked={formData.termsAgreed}
                  onChange={handleChange}
                  className='w-4 h-4 mr-2 accent-yellow-500'
                  required
                  disabled={isLoading}
                />
                <label htmlFor='termsAgreed' className='text-white text-sm'>
                  I agree to terms and privacy policy*
                </label>
              </div>

              {/* Submit Button */}
              <button
                type='submit'
                className={`w-full py-3 rounded font-medium transition duration-300 flex items-center justify-center mt-4 ${
                  isFormValid() && !isLoading
                    ? 'bg-red-500 text-white hover:bg-red-600 cursor-pointer'
                    : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                }`}
                disabled={!isFormValid() || isLoading}
              >
                {isLoading ? 'Signing Up...' : 'Create Account'}
              </button>

              <div className='flex justify-between items-center my-6'>
                {/* Login Link */}
                <div className='text-center text-white'>
                  Already have an account?{' '}
                  <Link
                    href='/login'
                    className='text-yellow-500 hover:underline'
                  >
                    Log In
                  </Link>
                </div>
                <Link
                  href={'/forgot-password'}
                  className='text-blue-400 hover:underline'
                >
                  Forgot Password?
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUpPage
