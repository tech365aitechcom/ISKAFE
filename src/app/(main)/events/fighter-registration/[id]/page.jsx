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
import React, { use, useState } from 'react'
import Link from 'next/link'
import { City, Country, State } from 'country-state-city'

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
    zipCode: '',

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
    purchase: '',
    event: id,
    cashCode: '',
  })
  const [errors, setErrors] = useState({})

  const countries = Country.getAllCountries()
  const states = formData.country
    ? State.getStatesOfCountry(formData.country)
    : []
  const cities =
    formData.country && formData.state
      ? City.getCitiesOfState(formData.country, formData.state)
      : []

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target

    if (type === 'file') {
      setFormData((prev) => ({ ...prev, [name]: files[0] }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }))
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateStep = (step) => {
    const newErrors = {}

    switch (step) {
      case 1: // Personal Info
        if (!formData.firstName.trim())
          newErrors.firstName = 'First name is required'
        if (!formData.lastName.trim())
          newErrors.lastName = 'Last name is required'
        if (!formData.gender) newErrors.gender = 'Gender is required'
        if (!formData.dateOfBirth)
          newErrors.dateOfBirth = 'Date of birth is required'
        if (!formData.phoneNumber.trim())
          newErrors.phoneNumber = 'Mobile number is required'
        else if (!/^\d{10}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
          newErrors.phoneNumber = 'Valid 10-digit number required'
        }
        if (!formData.email.trim()) newErrors.email = 'Email is required'
        else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Valid email required'
        }
        if (!formData.street1.trim())
          newErrors.street1 = 'Street address is required'
        if (!formData.city.trim()) newErrors.city = 'City is required'
        if (!formData.state) newErrors.state = 'State is required'
        if (!formData.country) newErrors.country = 'Country is required'
        if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required'
        if (!formData.profilePhoto)
          newErrors.profilePhoto = 'Professional headshot is required'
        break

      case 2: // Physical Info
        if (!formData.height) newErrors.height = 'Height is required'
        if (!formData.walkAroundWeight)
          newErrors.walkAroundWeight = 'Walk-around weight is required'
        break

      case 3: // Fight History
        if (!formData.proFighter)
          newErrors.proFighter = 'Pro fighter status is required'
        if (!formData.paidToFight)
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

      case 7: // Trainer Info
        if (!formData.trainerName.trim())
          newErrors.trainerName = 'Trainer name is required'
        if (!formData.gymName.trim()) newErrors.gymName = 'Gym name is required'
        if (!formData.trainerPhone.trim())
          newErrors.trainerPhone = 'Trainer phone is required'
        if (!formData.trainerEmail.trim())
          newErrors.trainerEmail = 'Trainer email is required'
        if (formData.trainerEmail !== formData.trainerEmailConfirm) {
          newErrors.trainerEmailConfirm = 'Emails must match'
        }

        break

      case 8: // Age Check
        if (!formData.isAdult)
          newErrors.isAdult = 'Age confirmation is required'
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
    // if (validateStep(currentStep)) {
    // }
    if (currentStep < 10) {
      setCurrentStep(currentStep + 1)
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
      const payload = {
        ...formData,
        createdBy: user?.id,
        event: eventId,
      }

      console.log('Form submitted:', payload)
      const response = await axios.post(
        `${API_BASE_URL}/registrations/add`,
        payload
      )

      if (response.status === apiConstants.create) {
        enqueueSnackbar(response.data.message || 'Registration successful!', {
          variant: 'success',
        })
        setIsOpen(false)
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
          { label: 'Date of Birth', name: 'dateOfBirth', type: 'date' },
          { label: 'Phone Number', name: 'phoneNumber', type: 'tel' },
          { label: 'Email Address', name: 'email', type: 'email' },
          { label: 'Street Address1', name: 'street1' },
          {
            label: 'Street Address2',
            name: 'street2',
          },
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
              className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
              required={!field.disabled}
            />
            {errors[field.name] && (
              <p className='text-red-500 text-xs mt-1'>{errors[field.name]}</p>
            )}
          </div>
        ))}
      </div>

      <div className='grid grid-cols-3 gap-4'>
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
          <label className='text-white font-medium'>ZIP Code *</label>
          <input
            type='text'
            name='zipCode'
            value={formData.zipCode}
            onChange={handleChange}
            placeholder='Enter ZIP Code'
            className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
          />
          {errors.zipCode && (
            <p className='text-red-400 text-sm mt-1'>{errors.zipCode}</p>
          )}
        </div>
        <div className='bg-[#00000061] p-2 rounded'>
          <label className='text-white font-medium'>
            City<span className='text-red-500'>*</span>
          </label>
          <select
            name='city'
            value={formData.city}
            onChange={handleChange}
            className='w-full outline-none bg-transparent text-white'
            required
            disabled={!formData.state}
          >
            <option value=''>Select City</option>
            {cities.map((city) => (
              <option key={city.name} value={city.name} className='text-black'>
                {city.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className=''>
        <label className='block font-medium mb-2'>
          Professional Headshot <span className='text-red-400'>*</span>
        </label>

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
            placeholder={
              formData.heightUnit === 'inches' ? 'eg: 5.11' : 'eg: 180'
            }
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
          <label className='text-white font-medium'>Pro Fighter *</label>
          <div className='flex space-x-4 mt-2'>
            <label className='text-white'>
              <input
                type='radio'
                name='proFighter'
                value='Yes'
                onChange={handleChange}
                checked={formData.proFighter === 'Yes'}
              />
              <span className='ml-2'>Yes</span>
            </label>
            <label className='text-white'>
              <input
                type='radio'
                name='proFighter'
                value='No'
                onChange={handleChange}
                checked={formData.proFighter === 'No'}
              />
              <span className='ml-2'>No</span>
            </label>
          </div>
          {errors.proFighter && (
            <p className='text-red-400 text-sm mt-1'>{errors.proFighter}</p>
          )}
        </div>

        <div>
          <label className='text-white font-medium'>Paid to Fight *</label>
          <div className='flex space-x-4 mt-2'>
            <label className='text-white'>
              <input
                type='radio'
                name='paidToFight'
                value='Yes'
                onChange={handleChange}
                checked={formData.paidToFight === 'Yes'}
              />
              <span className='ml-2'>Yes</span>
            </label>
            <label className='text-white'>
              <input
                type='radio'
                name='paidToFight'
                value='No'
                onChange={handleChange}
                checked={formData.paidToFight === 'No'}
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
      <h3 className='text-xl font-semibold text-white mb-4'>Rule Style*</h3>

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
          <option value='Flyweight' className='text-black'>
            Flyweight (125 lbs)
          </option>
          <option value='Bantamweight' className='text-black'>
            Bantamweight (135 lbs)
          </option>
          <option value='Featherweight' className='text-black'>
            Featherweight (145 lbs)
          </option>
          <option value='Lightweight' className='text-black'>
            Lightweight (155 lbs)
          </option>
          <option value='Welterweight' className='text-black'>
            Welterweight (170 lbs)
          </option>
          <option value='Middleweight' className='text-black'>
            Middleweight (185 lbs)
          </option>
          <option value='Light Heavyweight' className='text-black'>
            Light Heavyweight (205 lbs)
          </option>
          <option value='Heavyweight' className='text-black'>
            Heavyweight (265 lbs)
          </option>
        </select>
        {errors.weightClass && (
          <p className='text-red-400 text-sm mt-1'>{errors.weightClass}</p>
        )}
      </div>

      <div>
        <label className='text-white font-medium'>Skill Level *</label>
        <div className='flex flex-wrap gap-4 mt-2'>
          {['Class A', 'Class B', 'Class C', 'Novice'].map((level) => (
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
    <div className='space-y-4'>
      <h3 className='text-xl font-semibold text-white mb-4'>
        Trainer Information
      </h3>

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
        <label className='text-white font-medium'>Are You Under 18? *</label>
        <div className='flex space-x-4 mt-2'>
          <label className='text-white'>
            <input
              type='radio'
              name='isAdult'
              value='Yes'
              onChange={handleChange}
              checked={formData.isAdult === 'Yes'}
            />
            <span className='ml-2'>Yes</span>
          </label>
          <label className='text-white'>
            <input
              type='radio'
              name='isAdult'
              value='No'
              onChange={handleChange}
              checked={formData.isAdult === 'No'}
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
          I agree to the terms and waiver *
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
        <label className='text-white font-medium'>Payment Method *</label>
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
        <div className='space-y-4'>
          <div>
            <label className='text-white font-medium'>Card Number *</label>
            <input
              type='text'
              name='cardNumber'
              value={formData.cardNumber}
              onChange={handleChange}
              placeholder='Card number'
              className='w-full mt-1 p-2 rounded bg-[#2e1b47] text-white'
            />
            {errors.cardNumber && (
              <p className='text-red-400 text-sm mt-1'>{errors.cardNumber}</p>
            )}
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='text-white font-medium'>Expiry Date *</label>
              <input
                type='text'
                name='expiryDate'
                value={formData.expiryDate}
                onChange={handleChange}
                placeholder='MM/YY'
                className='w-full mt-1 p-2 rounded bg-[#2e1b47] text-white'
              />
              {errors.expiryDate && (
                <p className='text-red-400 text-sm mt-1'>{errors.expiryDate}</p>
              )}
            </div>

            <div>
              <label className='text-white font-medium'>CVV *</label>
              <input
                type='text'
                name='cvv'
                value={formData.cvv}
                onChange={handleChange}
                placeholder='CVV'
                className='w-full mt-1 p-2 rounded bg-[#2e1b47] text-white'
              />
              {errors.cvv && (
                <p className='text-red-400 text-sm mt-1'>{errors.cvv}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {formData.paymentMethod === 'cash' && (
        <div>
          <label className='text-white font-medium'>Cash Code *</label>
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
            <Link href={`/events/${id}`}>
              <button
                type='button'
                className='text-yellow-400 underline hover:text-yellow-300 transition-colors'
              >
                Cancel
              </button>
            </Link>
            <div className='flex space-x-4 '>
              {currentStep > 1 && (
                <button
                  type='button'
                  onClick={handleBack}
                  className='flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded font-semibold hover:bg-gray-700 transition-colors'
                >
                  <ChevronLeft className='w-4 h-4' />
                  <span>Back</span>
                </button>
              )}

              {currentStep < 10 ? (
                <button
                  type='button'
                  className='bg-yellow-500 text-black px-6 py-2 rounded font-semibold hover:bg-yellow-400 transition-colors'
                  onClick={handleNext}
                >
                  Next
                </button>
              ) : (
                <div className='flex space-x-4'>
                  {formData.paymentMethod === 'card' && (
                    <button
                      type='submit'
                      className='bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-500 transition-colors'
                    >
                      Pay Now
                    </button>
                  )}
                  {formData.paymentMethod === 'cash' && (
                    <button
                      type='submit'
                      className='bg-green-600 text-white px-6 py-2 rounded font-semibold hover:bg-green-500 transition-colors'
                    >
                      Submit Registration
                    </button>
                  )}
                  {!formData.paymentMethod && (
                    <button
                      type='button'
                      className='bg-gray-600 text-white px-6 py-2 rounded font-semibold cursor-not-allowed'
                      disabled
                    >
                      Select Payment Method
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
