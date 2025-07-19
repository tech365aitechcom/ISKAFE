'use client'
import {
  Briefcase,
  Calendar,
  CheckCircle,
  ChevronLeft,
  CreditCard,
  DollarSign,
  FileText,
  PenTool,
  Shield,
  User,
  UserCheck,
  Users,
} from 'lucide-react'
import useStore from '../../../../../stores/useStore'
import React, { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { City, Country, State } from 'country-state-city'
import { uploadToS3 } from '../../../../../utils/uploadToS3'
import axios from 'axios'
import {
  API_BASE_URL,
  apiConstants,
  weightClasses,
} from '../../../../../constants'
import { enqueueSnackbar } from 'notistack'
import { useRouter } from 'next/navigation'
import SquareComponent from '../../_components/SquareComponent'

const steps = [
  'Personal Info',
  'Physical Info',
  'Fight History',
  'Rule Style',
  'Bracket & Skill',
  'Bracket Preview',
  'Trainer Info',
  'Age Check',
  'Waiver',
  'Payment',
]

const FighterRegistrationPage = ({ params }) => {
  const { id } = use(params)
  const user = useStore((state) => state.user)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',

    // Contact
    phoneNumber: '',
    email: '',

    // Address
    street1: '',
    street2: '',
    country: '',
    state: '',
    city: '',
    postalCode: '',

    // Profile Photo
    profilePhoto: null,

    // Physical Info
    heightUnit: 'inches',
    height: '',
    walkAroundWeight: '',
    weightUnit: 'LBS',

    // Fight History
    proFighter: '',
    paidToFight: '',
    systemRecord: '0-0-0',
    additionalRecords: '',

    // Rule Style
    ruleStyle: '',

    // Bracket & Skill
    weightClass: '',
    skillLevel: '',

    // Trainer Info
    trainerName: '',
    gymName: '',
    trainerPhone: '',
    trainerEmail: '',
    trainerEmailConfirm: '',

    // Age Check
    isAdult: '',

    // Waiver
    legalDisclaimerAccepted: false,
    waiverSignature: '',

    // Payment
    paymentMethod: 'card',
    purchase: '',
    cashCode: '',
  })
  const [errors, setErrors] = useState({})
  const router = useRouter()
  console.log(user, 'user')

  const countries = Country.getAllCountries()
  const states = formData.country
    ? State.getStatesOfCountry(formData.country)
    : []
  const cities =
    formData.country && formData.state
      ? City.getCitiesOfState(formData.country, formData.state)
      : []

  useEffect(() => {
    if (!user) return

    const formattedDOB = user.dateOfBirth
      ? new Date(user.dateOfBirth).toISOString().split('T')[0]
      : ''

    setFormData({
      ...formData,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      gender: user.gender || '',
      dateOfBirth: formattedDOB,
      phoneNumber: user.phoneNumber || '',
      email: user.email || '',
      country: user.country || '',
      state: user.state || '',
      city: user.city || '',
      profilePhoto: user.profilePhoto || '',
    })
  }, [user])

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target

    if (type === 'file') {
      setFormData((prev) => ({ ...prev, [name]: files[0] }))
    } else {
      let newValue
      if (type === 'checkbox') {
        newValue = checked
      } else if (value === 'true') {
        newValue = true
      } else if (value === 'false') {
        newValue = false
      } else {
        newValue = value
      }

      setFormData((prev) => ({
        ...prev,
        [name]: newValue,
      }))
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validatePhoneNumber = (number) =>
    /^\+?[0-9]{10,15}$/.test(number.replace(/\s+/g, '')) // Allows optional `+` and 10–15 digits

  const validateName = (name) => /^[A-Za-z\s'-]+$/.test(name.trim()) // Allows letters, space, hyphen, apostrophe

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) // Basic but solid email regex

  const validPostalCode = (postalCode) => /^\d+$/.test(postalCode)

  const validateStep = (step) => {
    const newErrors = {}

    switch (step) {
      case 1: // Personal Info
        // First Name
        if (!formData.firstName.trim())
          newErrors.firstName = 'First name is required'
        else if (!validateName(formData.firstName))
          newErrors.firstName =
            'Only letters, spaces, hyphens, and apostrophes allowed'

        // Last Name
        if (!formData.lastName.trim())
          newErrors.lastName = 'Last name is required'
        else if (!validateName(formData.lastName))
          newErrors.lastName =
            'Only letters, spaces, hyphens, and apostrophes allowed'

        // Gender
        if (!formData.gender) newErrors.gender = 'Gender is required'

        // DOB
        if (!formData.dateOfBirth)
          newErrors.dateOfBirth = 'Date of birth is required'

        // Phone Number
        if (!formData.phoneNumber.trim())
          newErrors.phoneNumber = 'Mobile number is required'
        else if (!validatePhoneNumber(formData.phoneNumber))
          newErrors.phoneNumber = 'Valid phone number required (10-15 digits)'

        // Email
        if (!formData.email.trim()) newErrors.email = 'Email is required'
        else if (!validateEmail(formData.email))
          newErrors.email = 'Valid email required'

        // Street
        if (!formData.street1.trim())
          newErrors.street1 = 'Street address is required'

        // City
        if (!formData.city.trim()) newErrors.city = 'City is required'

        // State
        if (!formData.state) newErrors.state = 'State is required'

        // Country
        if (!formData.country) newErrors.country = 'Country is required'

        // ZIP Code
        if (!formData.postalCode.trim())
          newErrors.postalCode = 'ZIP code is required'
        else if (!validPostalCode(formData.postalCode))
          newErrors.postalCode = 'Please enter valid postal code'

        // Profile photo
        if (!formData.profilePhoto)
          newErrors.profilePhoto = 'Professional headshot is required'
        break

      case 2: // Physical Info
        if (!formData.height) {
          newErrors.height = 'Height is required'
        } else {
          const heightInInches = parseFloat(formData.height)
          if (isNaN(heightInInches) || heightInInches < 38) {
            // 3'2" is 38 inches
            newErrors.height = 'Height of at least 3\'2" is required'
          }
        }

        if (!formData.walkAroundWeight) {
          newErrors.walkAroundWeight = 'Walk-around weight is required'
        } else {
          const weight = parseFloat(formData.walkAroundWeight)
          if (isNaN(weight) || weight < 10) {
            newErrors.walkAroundWeight =
              'Is your Walk-Around Weight accurate? Please check before continuing.'
          }
        }
        break

      case 3: // Fight History
        if (formData.proFighter === undefined || formData.proFighter === '')
          newErrors.proFighter = 'Pro fighter status is required'
        if (formData.paidToFight === undefined || formData.paidToFight === '')
          newErrors.paidToFight = 'Paid to fight status is required'
        break

      case 4: // Rule style
        if (!formData.ruleStyle) newErrors.ruleStyle = 'Rule style is required'
        break

      case 5: // Bracket & Skill
        if (!formData.weightClass)
          newErrors.weightClass = 'Weight class is required'
        if (!formData.skillLevel)
          newErrors.skillLevel = 'Skill level is required'
        break

      // Trainer Info
      case 7:
        if (!formData.trainerName.trim())
          newErrors.trainerName = 'Trainer name is required'
        else if (!validateName(formData.trainerName))
          newErrors.trainerName =
            'Only letters, spaces, hyphens, and apostrophes allowed'

        if (!formData.gymName.trim()) newErrors.gymName = 'Gym name is required'

        if (!formData.trainerPhone.trim())
          newErrors.trainerPhone = 'Trainer phone is required'
        else if (!validatePhoneNumber(formData.trainerPhone))
          newErrors.trainerPhone = 'Enter a valid phone number'

        if (!formData.trainerEmail.trim())
          newErrors.trainerEmail = 'Trainer email is required'
        else if (!validateEmail(formData.trainerEmail))
          newErrors.trainerEmail = 'Enter a valid email'

        if (formData.trainerEmail !== formData.trainerEmailConfirm) {
          newErrors.trainerEmailConfirm = 'Emails must match'
        }
        break

      case 8: // Age Check
        if (formData.isAdult === undefined)
          newErrors.isAdult = 'PAge confirmation is required'
        break

      case 9: // Waiver
        if (!formData.legalDisclaimerAccepted)
          newErrors.legalDisclaimerAccepted =
            'Legal disclaimer must be accepted'
        if (!formData.waiverSignature.trim())
          newErrors.waiverSignature = 'Signature is required'

        break

      case 10: // Payment
        if (!formData.paymentMethod)
          newErrors.paymentMethod = 'Payment method is required'

        if (formData.paymentMethod === 'card') {
          if (!formData.cardNumber.trim())
            newErrors.cardNumber = 'Card number is required'
          if (!formData.expiryDate.trim())
            newErrors.expiryDate = 'Expiry date is required'
          if (!formData.cvv.trim()) newErrors.cvv = 'CVV is required'
        } else if (formData.paymentMethod === 'cash') {
          if (!formData.cashCode.trim())
            newErrors.cashCode = 'Cash code is required'
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      console.log(formData, 'form data')

      if (currentStep < 10) {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateStep(10)) {
      return
    }

    try {
      let payload = {
        registrationType: 'fighter',
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        street1: formData.street1,
        street2: formData.street2,
        postalCode: formData.postalCode,
        heightUnit: formData.heightUnit,
        height: formData.height,
        weightUnit: formData.weightUnit,
        walkAroundWeight: formData.walkAroundWeight,
        proFighter: formData.proFighter,
        paidToFight: formData.paidToFight,
        additionalRecords: formData.additionalRecords,
        ruleStyle: formData.ruleStyle,
        weightClass: formData.weightClass,
        skillLevel: formData.skillLevel,
        trainerName: formData.trainerName,
        gymName: formData.gymName,
        trainerPhone: formData.trainerPhone,
        trainerEmail: formData.trainerEmail,
        isAdult: formData.isAdult,
        legalDisclaimerAccepted: formData.legalDisclaimerAccepted,
        waiverSignature: formData.waiverSignature,
        paymentMethod: formData.paymentMethod,
        cashCode: formData.cashCode,
        event: id,
      }

      if (formData.profilePhoto) {
        if (typeof formData.profilePhoto !== 'string') {
          payload.profilePhoto = await uploadToS3(formData.profilePhoto)
        } else {
          payload.profilePhoto = formData.profilePhoto
        }
      }
      console.log('Form submitted:', payload)
      const response = await axios.post(
        `${API_BASE_URL}/registrations`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      )

      if (response.status === apiConstants.create) {
        enqueueSnackbar(response.data.message || 'Registration successful!', {
          variant: 'success',
        })
        handleCancel()
      }
    } catch (error) {
      console.log('Error:', error)
      enqueueSnackbar(
        error?.response?.data?.message || 'Something went wrong',
        {
          variant: 'error',
        }
      )
    }
  }

  const handleCancel = () => {
    setCurrentStep(1)
    router.push(`/events/${id}`)
  }

  const renderStep1 = () => (
    <div className='space-y-4'>
      <h3 className='text-xl font-semibold text-white mb-4'>
        Personal Information
      </h3>

      <div className='grid grid-cols-2 gap-4'>
        {[
          { label: 'First Name', name: 'firstName' },
          { label: 'Last Name', name: 'lastName' },
        ].map((field) => (
          <div key={field.name} className='bg-[#00000061] p-2 rounded'>
            <label className='block font-medium mb-1'>
              {field.label}
              <span className='text-red-500'>*</span>
            </label>
            <input
              type={field.type || 'text'}
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              placeholder={
                field.placeholder || `Enter ${field.label.toLowerCase()}`
              }
              disabled={field.disabled}
              className={`w-full outline-none bg-transparent text-white disabled:text-gray-400`}
              required={!field.disabled}
            />
            {errors[field.name] && (
              <p className='text-red-400 text-sm mt-1'>{errors[field.name]}</p>
            )}
          </div>
        ))}
      </div>

      <div>
        <label className='text-white font-medium'>Gender *</label>
        <div className='flex space-x-4 mt-2'>
          <label className='text-white'>
            <input
              type='radio'
              name='gender'
              value='Male'
              onChange={handleChange}
              checked={formData.gender === 'Male'}
            />
            <span className='ml-2'>Male</span>
          </label>
          <label className='text-white'>
            <input
              type='radio'
              name='gender'
              value='Female'
              onChange={handleChange}
              checked={formData.gender === 'Female'}
            />
            <span className='ml-2'>Female</span>
          </label>
          <label className='text-white'>
            <input
              type='radio'
              name='gender'
              value='Female'
              onChange={handleChange}
              checked={formData.gender === 'Other'}
            />
            <span className='ml-2'>Other</span>
          </label>
        </div>
        {errors.gender && (
          <p className='text-red-400 text-sm mt-1'>{errors.gender}</p>
        )}
      </div>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
        {[
          {
            label: 'Date of Birth',
            name: 'dateOfBirth',
            type: 'date',
            required: true,
          },
          {
            label: 'Mobile Number',
            name: 'phoneNumber',
            type: 'tel',
            required: true,
          },
          {
            label: 'Email Address',
            name: 'email',
            type: 'email',
            required: true,
          },
          { label: 'Street 1', name: 'street1', required: true },
          {
            label: 'Street 2',
            name: 'street2',
            required: false,
          },
        ].map((field) => (
          <div key={field.name} className='bg-[#00000061] p-2 rounded'>
            <label className='block font-medium mb-1'>
              {field.label}
              {field.required && <span className='text-red-500'>*</span>}
            </label>
            <input
              type={field.type || 'text'}
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              placeholder={
                field.placeholder || `Enter ${field.label.toLowerCase()}`
              }
              required={field.required}
              disabled={field.disabled}
              className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
            />
            {errors[field.name] && (
              <p className='text-red-500 text-xs mt-1'>{errors[field.name]}</p>
            )}
          </div>
        ))}
        <div className='bg-[#00000061] p-2 rounded'>
          <label className='block font-medium mb-1'>Country</label>
          <select
            name='country'
            value={formData.country}
            onChange={handleChange}
            className='w-full outline-none bg-transparent text-white'
          >
            <option value='' className='text-black'>
              Select Country
            </option>
            {countries.map((country) => (
              <option
                key={country.isoCode}
                value={country.isoCode}
                className='text-black'
              >
                {country.name}
              </option>
            ))}
          </select>
          {errors.country && (
            <p className='text-red-400 text-sm mt-1'>{errors.country}</p>
          )}
        </div>
        <div className='bg-[#00000061] p-2 rounded'>
          <label className='block font-medium mb-1'>State</label>
          <select
            name='state'
            value={formData.state}
            onChange={handleChange}
            className='w-full outline-none bg-transparent text-white'
          >
            <option value='' className='text-black'>
              Select State
            </option>
            {states.map((state) => (
              <option
                key={state.isoCode}
                value={state.isoCode}
                className='text-black'
              >
                {state.name}
              </option>
            ))}
          </select>
          {errors.state && (
            <p className='text-red-400 text-sm mt-1'>{errors.state}</p>
          )}
        </div>
        <div className='bg-[#00000061] p-2 rounded'>
          <label className='block font-medium mb-1'>
            City
            <span className='text-red-500'>*</span>
          </label>
          <input
            type='text'
            name='city'
            value={formData.city}
            onChange={handleChange}
            placeholder='Enter City'
            required
            className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
          />
          {errors.city && (
            <p className='text-red-500 text-xs mt-1'>{errors.city}</p>
          )}
        </div>
        <div className='bg-[#00000061] p-2 rounded'>
          <label className='text-white font-medium'>
            Postal Code <span className='text-red-500'>*</span>
          </label>
          <input
            type='text'
            name='postalCode'
            value={formData.postalCode}
            onChange={handleChange}
            placeholder='Enter Postal Code'
            className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
          />
          {errors.postalCode && (
            <p className='text-red-400 text-sm mt-1'>{errors.postalCode}</p>
          )}
        </div>
      </div>

      <div className=''>
        <label className='block font-medium mb-2 text-gray-200'>
          Professional Headshot <span className='text-red-400'>*</span>
        </label>

        <div className='my-4 flex items-center'>
          {formData.profilePhoto ? (
            <img
              src={
                typeof formData.profilePhoto === 'string'
                  ? formData.profilePhoto
                  : URL.createObjectURL(formData.profilePhoto)
              }
              alt='Profile Preview'
              className='w-32 h-32 object-cover rounded-full border-4 border-purple-500 shadow-md'
            />
          ) : (
            <div className='w-32 h-32 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border-4 border-purple-500 flex items-center justify-center shadow-md'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={1.5}
                stroke='currentColor'
                className='w-14 h-14 text-gray-300'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 0115 0'
                />
              </svg>
            </div>
          )}
        </div>

        <input
          type='file'
          name='profilePhoto'
          onChange={handleChange}
          accept='image/jpeg,image/jpg,image/png'
          className='w-full outline-none bg-transparent text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700'
        />

        <p className='text-xs text-gray-400 mt-1'>JPG/PNG, Max 2MB</p>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className='space-y-4'>
      <h3 className='text-xl font-semibold text-white mb-4'>
        Physical Information
      </h3>

      <div className='grid grid-cols-2 gap-4'>
        <div className='bg-[#00000061] p-2 rounded'>
          <label className='block font-medium mb-1'>
            Height Unit <span className='text-red-500'>*</span>
          </label>
          <select
            name='heightUnit'
            value={formData.heightUnit}
            onChange={handleChange}
            className='w-full outline-none bg-transparent text-white'
          >
            <option value='inches' className='text-black'>
              Inches
            </option>
            <option value='cm' className='text-black'>
              CM
            </option>
          </select>
        </div>

        <div className='bg-[#00000061] p-2 rounded'>
          <label className='block font-medium mb-1'>
            Height <span className='text-red-500'>*</span>
          </label>
          <input
            type='number'
            name='height'
            value={formData.height}
            onChange={handleChange}
            placeholder='eg: 180'
            className='w-full outline-none bg-transparent text-white'
          />
          {errors.height && (
            <p className='text-red-400 text-sm mt-1'>{errors.height}</p>
          )}
        </div>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div className='bg-[#00000061] p-2 rounded'>
          <label className='text-white font-medium'>
            Weight Unit <span className='text-red-500'>*</span>
          </label>
          <select
            name='weightUnit'
            value={formData.weightUnit}
            onChange={handleChange}
            className='w-full outline-none bg-transparent text-white'
          >
            <option value='LBS' className='text-black'>
              LBS
            </option>
            <option value='KG' className='text-black'>
              KG
            </option>
          </select>
        </div>
        <div className='bg-[#00000061] p-2 rounded'>
          <label className='text-white font-medium'>
            Walk-Around Weight <span className='text-red-500'>*</span>
          </label>
          <input
            type='number'
            name='walkAroundWeight'
            value={formData.walkAroundWeight}
            onChange={handleChange}
            placeholder='e.g., 210'
            className='w-full outline-none bg-transparent text-white'
          />
          {errors.walkAroundWeight && (
            <p className='text-red-400 text-sm mt-1'>
              {errors.walkAroundWeight}
            </p>
          )}
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className='space-y-4'>
      <h3 className='text-xl font-semibold text-white mb-4'>Fight History</h3>

      <div className='flex flex-wrap gap-4'>
        <div>
          <label className='text-white font-medium'>
            Pro Fighter <span className='text-red-500'>*</span>
          </label>
          <div className='flex space-x-4 mt-2'>
            <label className='text-white'>
              <input
                type='radio'
                name='proFighter'
                value='true'
                onChange={handleChange}
                checked={formData.proFighter === true}
              />
              <span className='ml-2'>Yes</span>
            </label>
            <label className='text-white'>
              <input
                type='radio'
                name='proFighter'
                value='false'
                onChange={handleChange}
                checked={formData.proFighter === false}
              />
              <span className='ml-2'>No</span>
            </label>
          </div>
          {errors.proFighter && (
            <p className='text-red-400 text-sm mt-1'>{errors.proFighter}</p>
          )}
        </div>

        <div>
          <label className='text-white font-medium'>
            Paid to Fight <span className='text-red-500'>*</span>
          </label>
          <div className='flex space-x-4 mt-2'>
            <label className='text-white'>
              <input
                type='radio'
                name='paidToFight'
                value='true'
                onChange={handleChange}
                checked={formData.paidToFight === true}
              />
              <span className='ml-2'>Yes</span>
            </label>
            <label className='text-white'>
              <input
                type='radio'
                name='paidToFight'
                value='false'
                onChange={handleChange}
                checked={formData.paidToFight === false}
              />
              <span className='ml-2'>No</span>
            </label>
          </div>
          {errors.paidToFight && (
            <p className='text-red-400 text-sm mt-1'>{errors.paidToFight}</p>
          )}
        </div>
      </div>

      <div className='bg-[#00000061] p-2 rounded'>
        <label className='text-white font-medium'>System Record</label>
        <input
          type='text'
          name='systemRecord'
          value={formData.systemRecord}
          className='w-full outline-none bg-transparent text-white'
          readOnly
        />
        <p className='text-gray-400 text-sm mt-1'>
          Auto-populated from platform
        </p>
      </div>

      <div className='bg-[#00000061] p-2 rounded'>
        <label className='text-white font-medium'>Additional Records</label>
        <input
          type='text'
          name='additionalRecords'
          value={formData.additionalRecords}
          onChange={handleChange}
          placeholder='Style + W/L/D'
          className='w-full outline-none bg-transparent text-white'
        />
      </div>
    </div>
  )
  const renderStep4 = () => (
    <div className='space-y-4'>
      <h3 className='text-xl font-semibold text-white mb-4'>
        Rule Style<span className='text-red-500'>*</span>
      </h3>

      <div>
        <div className='flex flex-wrap gap-4 mt-2'>
          {['MMA', 'Boxing', 'Kickboxing', 'Muay Thai', 'BJJ'].map((style) => (
            <label key={style} className='text-white'>
              <input
                type='radio'
                name='ruleStyle'
                value={style}
                onChange={handleChange}
                checked={formData.ruleStyle === style}
              />
              <span className='ml-2'>{style}</span>
            </label>
          ))}
        </div>
        {errors.ruleStyle && (
          <p className='text-red-400 text-sm mt-1'>{errors.ruleStyle}</p>
        )}
      </div>
    </div>
  )
  const renderStep5 = () => (
    <div className='space-y-4'>
      <h3 className='text-xl font-semibold text-white mb-4'>Bracket & Skill</h3>

      <div className='bg-[#00000030] p-2 rounded'>
        <label className='text-white font-medium'>
          Weight Class <span className='text-red-500'>*</span>
        </label>
        <select
          name='weightClass'
          value={formData.weightClass}
          onChange={handleChange}
          className='w-full outline-none bg-transparent text-white'
          required
        >
          <option value='' className='text-black'>
            Select weight range
          </option>
          {weightClasses.map((weightClass) => (
            <option
              key={weightClass._id}
              value={weightClass.fullName}
              className='text-black'
            >
              {weightClass.fullName}
            </option>
          ))}
        </select>
        {errors.weightClass && (
          <p className='text-red-400 text-sm mt-1'>{errors.weightClass}</p>
        )}
      </div>

      <div>
        <label className='text-white font-medium'>
          Skill Level <span className='text-red-500'>*</span>
        </label>
        <div className='flex flex-wrap gap-4 mt-2'>
          {[
            'Novice: 0-2 Years',
            'Class C: 2-4 Years (Cup Award)',
            'Class B: 4-6 Years (Belt Award)',
            'Class A: 6+ Years (Belt Award)',
          ].map((level) => (
            <label key={level} className='text-white'>
              <input
                type='radio'
                name='skillLevel'
                value={level}
                onChange={handleChange}
                checked={formData.skillLevel === level}
              />
              <span className='ml-2'>{level}</span>
            </label>
          ))}
        </div>
        {errors.skillLevel && (
          <p className='text-red-400 text-sm mt-1'>{errors.skillLevel}</p>
        )}
      </div>
    </div>
  )
  const renderStep6 = () => (
    <div className='space-y-4'>
      <h3 className='text-xl font-semibold text-white mb-4'>Bracket Preview</h3>
      <div className='bg-[#00000030] p-4 rounded'>
        <p className='text-gray-300'>
          Weight Class: {formData.weightClass || 'Not selected'}
          <br />
          Skill Level: {formData.skillLevel || 'Not selected'}
        </p>
      </div>
    </div>
  )
  const renderStep7 = () => (
    <div className='space-y-1'>
      <h3 className='text-xl font-semibold text-white'>Trainer Information</h3>
      <p className='text-gray-300 text-sm mb-4'>
        Your gym / training facility is important to enter below because it will
        reduce the chances of getting matched against somebody from your same
        gym. If you are not affiliated with a gym or trainer, please enter your
        own full name in the Trainer Name and Gym Name fields below.
      </p>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
        {[
          { label: 'Trainer Name', name: 'trainerName' },
          { label: 'Gym Name', name: 'gymName' },
          { label: 'Trainer Phone', name: 'trainerPhone' },
          { label: 'Trainer Email', name: 'trainerEmail' },
          { label: 'Confirm Trainer Email', name: 'trainerEmailConfirm' },
        ].map((field) => (
          <div key={field.name} className='bg-[#00000061] p-2 rounded'>
            <label className='block font-medium mb-1'>
              {field.label}
              <span className='text-red-500'>*</span>
            </label>
            <input
              type={field.type || 'text'}
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              placeholder={
                field.placeholder || `Enter ${field.label.toLowerCase()}`
              }
              disabled={field.disabled}
              className={`${
                field.type !== 'date'
                  ? 'w-full outline-none bg-transparent text-white disabled:text-gray-400'
                  : 'w-full p-3 outline-none bg-white/10 rounded-lg text-white border border-white/20 focus:border-purple-400 transition-colors'
              }`}
              required={!field.disabled}
            />
            {errors[field.name] && (
              <p className='text-red-500 text-xs mt-1'>{errors[field.name]}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  const renderStep8 = () => (
    <div className='space-y-4'>
      <h3 className='text-xl font-semibold text-white mb-4'>Age Check</h3>

      <div>
        <label className='text-white font-medium'>
          Are You Under 18? <span className='text-red-500'>*</span>
        </label>
        <div className='flex space-x-4 mt-2'>
          <label className='text-white'>
            <input
              type='radio'
              name='isAdult'
              value='true'
              onChange={handleChange}
              checked={formData.isAdult === true}
            />
            <span className='ml-2'>Yes</span>
          </label>
          <label className='text-white'>
            <input
              type='radio'
              name='isAdult'
              value='false'
              onChange={handleChange}
              checked={formData.isAdult === false}
            />
            <span className='ml-2'>No</span>
          </label>
        </div>
        {errors.isAdult && (
          <p className='text-red-400 text-sm mt-1'>{errors.isAdult}</p>
        )}
      </div>
    </div>
  )

  const renderStep9 = () => (
    <div className='space-y-4'>
      <h3 className='text-xl font-semibold text-white mb-4'>Legal Waiver</h3>

      <div className='bg-[#00000061] p-4 rounded max-h-40 overflow-y-auto'>
        <h4 className='text-white font-medium mb-2'>Terms and Waiver</h4>
        <p className='text-gray-300 text-sm'>
          By participating in this event, I acknowledge that I understand the
          risks involved in combat sports and agree to hold harmless the event
          organizers, venue, and all associated parties from any injury or
          damages that may occur during my participation. I confirm that I am in
          good physical condition and have no medical conditions that would
          prevent my safe participation.
        </p>
      </div>

      <div className='flex items-center space-x-2'>
        <input
          type='checkbox'
          id='legalDisclaimerAccepted'
          name='legalDisclaimerAccepted'
          checked={formData.legalDisclaimerAccepted}
          onChange={handleChange}
          className='accent-yellow-500'
        />
        <label htmlFor='legalDisclaimerAccepted' className='text-white'>
          I agree to the terms and waiver{' '}
          <span className='text-red-500'>*</span>
        </label>
      </div>
      {errors.legalDisclaimerAccepted && (
        <p className='text-red-400 text-sm mt-1'>
          {errors.legalDisclaimerAccepted}
        </p>
      )}

      <div className='bg-[#00000061] p-2 rounded'>
        <label className='text-white font-medium'>
          Digital Signature
          <span className='text-red-500'>*</span>
        </label>
        <input
          type='text'
          name='waiverSignature'
          value={formData.waiverSignature}
          onChange={handleChange}
          placeholder='Type name to sign'
          className='w-full bg-transparent text-white'
        />
        {errors.waiverSignature && (
          <p className='text-red-400 text-sm mt-1'>{errors.waiverSignature}</p>
        )}
      </div>
    </div>
  )

  const renderStep10 = () => (
    <div className='space-y-4'>
      <h3 className='text-xl font-semibold text-white mb-4'>Payment</h3>

      <div>
        <label className='text-white font-medium'>
          Payment Method <span className='text-red-500'>*</span>
        </label>
        <div className='flex space-x-4 mt-2'>
          <label className='text-white'>
            <input
              type='radio'
              name='paymentMethod'
              value='card'
              onChange={handleChange}
              checked={formData.paymentMethod === 'card'}
            />
            <span className='ml-2'>Credit Card</span>
          </label>
          <label className='text-white'>
            <input
              type='radio'
              name='paymentMethod'
              value='cash'
              onChange={handleChange}
              checked={formData.paymentMethod === 'cash'}
            />
            <span className='ml-2'>Cash</span>
          </label>
        </div>
        {errors.paymentMethod && (
          <p className='text-red-400 text-sm mt-1'>{errors.paymentMethod}</p>
        )}
      </div>

      {formData.paymentMethod === 'card' && (
        <SquareComponent formData={formData} />
      )}

      {formData.paymentMethod === 'cash' && (
        <div>
          <label className='text-white font-medium'>
            Cash Code <span className='text-red-500'>*</span>
          </label>
          <input
            type='text'
            name='cashCode'
            value={formData.cashCode}
            onChange={handleChange}
            placeholder='Enter code'
            className='w-full mt-1 p-2 rounded bg-[#2e1b47] text-white'
          />
          <p className='text-gray-400 text-sm mt-1'>Verified on submission</p>
          {errors.cashCode && (
            <p className='text-red-400 text-sm mt-1'>{errors.cashCode}</p>
          )}
        </div>
      )}
    </div>
  )

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1()
      case 2:
        return renderStep2()
      case 3:
        return renderStep3()
      case 4:
        return renderStep4()
      case 5:
        return renderStep5()
      case 6:
        return renderStep6()
      case 7:
        return renderStep7()
      case 8:
        return renderStep8()
      case 9:
        return renderStep9()
      case 10:
        return renderStep10()
      default:
        return renderStep1()
    }
  }

  const getStepIcon = (step) => {
    switch (step) {
      case 1:
        return <User className='w-5 h-5' />
      case 2:
        return <Users className='w-5 h-5' />
      case 3:
        return <PenTool className='w-5 h-5' />
      case 4:
        return <CreditCard className='w-5 h-5' />
      case 5:
        return <Shield className='w-5 h-5' />
      case 6:
        return <Briefcase className='w-5 h-5' />
      case 7:
        return <UserCheck className='w-5 h-5' />
      case 8:
        return <Calendar className='w-5 h-5' />
      case 9:
        return <FileText className='w-5 h-5' />
      case 10:
        return <CreditCard className='w-5 h-5' />
      default:
        return <div className='w-5 h-5' />
    }
  }

  return (
    <div className='min-h-screen text-white bg-[#0B1739] py-6 px-4'>
      <div className='w-full container mx-auto'>
        <div className='mb-6'>
          <h2 className='text-2xl font-bold text-white'>
            Fighter Registration Form
          </h2>
          <p>Fill the form below to register for the event</p>
        </div>

        {/* Progress Bar */}
        <div className='mb-6'>
          <div className='flex items-center justify-between overflow-x-auto scrollbar-hide'>
            {steps.map((label, index) => {
              const step = index + 1
              const isCompleted = currentStep > step
              const isActive = currentStep === step
              const isVisited = currentStep >= step

              return (
                <React.Fragment key={label}>
                  <div className='flex flex-col items-center min-w-[80px]'>
                    <div
                      className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm md:text-base ${
                        isVisited
                          ? 'bg-yellow-500 text-black'
                          : 'bg-[#2e1b47] text-white'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className='w-5 h-5' />
                      ) : (
                        getStepIcon(step)
                      )}
                    </div>
                    <span
                      className={`text-[10px] md:text-xs mt-1 text-center w-20 break-words ${
                        isVisited ? 'text-yellow-500' : 'text-gray-400'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {step < steps.length && (
                    <div
                      className={`flex-1 h-0.5 mx-1 md:mx-2 ${
                        isCompleted ? 'bg-yellow-500' : 'bg-[#2e1b47]'
                      }`}
                    />
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {renderCurrentStep()}

          {/* Navigation Buttons */}
          <div className='flex justify-between mt-8'>
            <div className='flex space-x-2'>
              {currentStep > 1 && (
                <button
                  type='button'
                  onClick={handleBack}
                  className='text-yellow-400 underline hover:text-yellow-300 transition-colors'
                >
                  Previous
                </button>
              )}
            </div>
            <div className='flex space-x-2 '>
              {currentStep < 10 ? (
                <>
                  <Link href={`/events/${id}`}>
                    <button
                      type='button'
                      className='border border-gray-400 text-gray-200 px-4 py-2 rounded font-semibold hover:bg-gray-700 hover:border-gray-500 transition-colors'
                    >
                      Cancel
                    </button>
                  </Link>
                  <button
                    type='button'
                    className='bg-yellow-500 text-black px-6 py-2 rounded font-semibold hover:bg-yellow-400 transition-colors'
                    onClick={handleNext}
                  >
                    Next
                  </button>
                </>
              ) : (
                <div className='flex space-x-4'>
                  <Link href={`/events/${id}`}>
                    <button
                      type='button'
                      className='border border-gray-400 text-gray-200 px-4 py-2 rounded font-semibold hover:bg-gray-700 hover:border-gray-500 transition-colors'
                    >
                      Cancel
                    </button>
                  </Link>
                  {formData.paymentMethod === 'card' && (
                    <button
                      type='submit'
                      className='bg-yellow-500 text-black px-4 py-2 rounded font-semibold hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      Pay Now
                    </button>
                  )}
                  {formData.paymentMethod === 'cash' && (
                    <button
                      type='submit'
                      className='bg-yellow-500 text-black px-4 py-2 rounded font-semibold hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      Submit Registration
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Step Information */}
        <div className='mt-6 text-center'>
          <p className='text-gray-400 text-sm'>
            {currentStep === 1 &&
              'Complete your personal information and contact details'}
            {currentStep === 2 && 'Provide your physical measurements'}
            {currentStep === 3 && 'Tell us about your fighting experience'}
            {currentStep === 4 && 'Select your preferred fighting style'}
            {currentStep === 5 && 'Select your weight class and skill level'}
            {currentStep === 6 && 'Preview your bracket selection'}
            {currentStep === 7 && 'Provide your trainer information'}
            {currentStep === 8 && 'Confirm your age'}
            {currentStep === 9 && 'Review and accept the waiver'}
            {currentStep === 10 && 'Complete the payment process'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default FighterRegistrationPage
