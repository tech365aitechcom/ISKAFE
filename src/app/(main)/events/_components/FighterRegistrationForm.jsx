'use client'
import { API_BASE_URL, apiConstants } from '../../../../constants/index'
import useUserStore from '../../../../stores/userStore'
import axios from 'axios'
import { enqueueSnackbar } from 'notistack'
import React, { useState } from 'react'

export default function FighterRegistrationForm({ setIsOpen, eventId }) {
  const user = useUserStore((state) => state.user)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',

    // Contact
    mobileNumber: '',
    email: '',

    // Address
    street1: '',
    street2: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',

    // Profile Photo
    headshotImage: null,

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
    areYouUnder18: '',

    // Waiver
    legalDisclaimer: false,
    signature: '',

    // Payment
    paymentMethod: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cashCode: '',
  })

  const [errors, setErrors] = useState({})

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
        if (!formData.mobileNumber.trim())
          newErrors.mobileNumber = 'Mobile number is required'
        else if (!/^\d{10}$/.test(formData.mobileNumber.replace(/\D/g, ''))) {
          newErrors.mobileNumber = 'Valid 10-digit number required'
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
        if (!formData.headshotImage)
          newErrors.headshotImage = 'Professional headshot is required'
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
        if (!formData.areYouUnder18)
          newErrors.areYouUnder18 = 'Age confirmation is required'
        break

      case 9: // Waiver
        if (!formData.legalDisclaimer)
          newErrors.legalDisclaimer = 'Legal disclaimer must be accepted'
        if (!formData.signature.trim())
          newErrors.signature = 'Signature is required'

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
        <div>
          <label className='text-white font-medium'>First Name *</label>
          <input
            type='text'
            name='firstName'
            value={formData.firstName}
            onChange={handleChange}
            className='w-full mt-1 p-2 rounded bg-[#2e1b47] text-white'
          />
          {errors.firstName && (
            <p className='text-red-400 text-sm mt-1'>{errors.firstName}</p>
          )}
        </div>

        <div>
          <label className='text-white font-medium'>Last Name *</label>
          <input
            type='text'
            name='lastName'
            value={formData.lastName}
            onChange={handleChange}
            className='w-full mt-1 p-2 rounded bg-[#2e1b47] text-white'
          />
          {errors.lastName && (
            <p className='text-red-400 text-sm mt-1'>{errors.lastName}</p>
          )}
        </div>
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
        </div>
        {errors.gender && (
          <p className='text-red-400 text-sm mt-1'>{errors.gender}</p>
        )}
      </div>

      <div>
        <label className='text-white font-medium'>Date of Birth *</label>
        <input
          type='date'
          name='dateOfBirth'
          value={formData.dateOfBirth}
          onChange={handleChange}
          className='w-full mt-1 p-2 rounded bg-[#2e1b47] text-white'
        />
        {errors.dateOfBirth && (
          <p className='text-red-400 text-sm mt-1'>{errors.dateOfBirth}</p>
        )}
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label className='text-white font-medium'>Mobile Number *</label>
          <input
            type='tel'
            name='mobileNumber'
            value={formData.mobileNumber}
            onChange={handleChange}
            placeholder='10-digit number'
            className='w-full mt-1 p-2 rounded bg-[#2e1b47] text-white'
          />
          {errors.mobileNumber && (
            <p className='text-red-400 text-sm mt-1'>{errors.mobileNumber}</p>
          )}
        </div>

        <div>
          <label className='text-white font-medium'>Email *</label>
          <input
            type='email'
            name='email'
            value={formData.email}
            onChange={handleChange}
            placeholder='user@example.com'
            className='w-full mt-1 p-2 rounded bg-[#2e1b47] text-white'
          />
          {errors.email && (
            <p className='text-red-400 text-sm mt-1'>{errors.email}</p>
          )}
        </div>
      </div>

      <div>
        <label className='text-white font-medium'>Street Address 1 *</label>
        <input
          type='text'
          name='street1'
          value={formData.street1}
          onChange={handleChange}
          className='w-full mt-1 p-2 rounded bg-[#2e1b47] text-white'
        />
        {errors.street1 && (
          <p className='text-red-400 text-sm mt-1'>{errors.street1}</p>
        )}
      </div>

      <div>
        <label className='text-white font-medium'>Street Address 2</label>
        <input
          type='text'
          name='street2'
          value={formData.street2}
          onChange={handleChange}
          placeholder='Apt / Floor etc.'
          className='w-full mt-1 p-2 rounded bg-[#2e1b47] text-white'
        />
      </div>

      <div className='grid grid-cols-3 gap-4'>
        <div>
          <label className='text-white font-medium'>City *</label>
          <input
            type='text'
            name='city'
            value={formData.city}
            onChange={handleChange}
            className='w-full mt-1 p-2 rounded bg-[#2e1b47] text-white'
          />
          {errors.city && (
            <p className='text-red-400 text-sm mt-1'>{errors.city}</p>
          )}
        </div>

        <div>
          <label className='text-white font-medium'>State *</label>
          <select
            name='state'
            value={formData.state}
            onChange={handleChange}
            className='w-full mt-1 p-2 rounded bg-[#2e1b47] text-white'
          >
            <option value=''>Select State</option>
            <option value='AL'>Alabama</option>
            <option value='CA'>California</option>
            <option value='FL'>Florida</option>
            <option value='NY'>New York</option>
            <option value='TX'>Texas</option>
            {/* Add more states as needed */}
          </select>
          {errors.state && (
            <p className='text-red-400 text-sm mt-1'>{errors.state}</p>
          )}
        </div>

        <div>
          <label className='text-white font-medium'>ZIP Code *</label>
          <input
            type='text'
            name='zipCode'
            value={formData.zipCode}
            onChange={handleChange}
            className='w-full mt-1 p-2 rounded bg-[#2e1b47] text-white'
          />
          {errors.zipCode && (
            <p className='text-red-400 text-sm mt-1'>{errors.zipCode}</p>
          )}
        </div>
      </div>

      <div>
        <label className='text-white font-medium'>Country *</label>
        <select
          name='country'
          value={formData.country}
          onChange={handleChange}
          className='w-full mt-1 p-2 rounded bg-[#2e1b47] text-white'
        >
          <option value=''>Select Country</option>
          <option value='USA'>United States</option>
          <option value='Canada'>Canada</option>
          <option value='UK'>United Kingdom</option>
          <option value='Other'>Other</option>
        </select>
        {errors.country && (
          <p className='text-red-400 text-sm mt-1'>{errors.country}</p>
        )}
      </div>

      <div>
        <label className='text-white font-medium'>
          Professional Headshot *
        </label>
        <input
          type='file'
          name='headshotImage'
          onChange={handleChange}
          accept='image/jpeg,image/jpg,image/png'
          className='w-full mt-1 p-2 rounded bg-[#2e1b47] text-white'
        />
        <p className='text-gray-400 text-sm mt-1'>
          Must be 8x8in professional photo (JPG/PNG, ≤8MB)
        </p>
        {errors.headshotImage && (
          <p className='text-red-400 text-sm mt-1'>{errors.headshotImage}</p>
        )}
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className='space-y-4'>
      <h3 className='text-xl font-semibold text-white mb-4'>
        Physical Information
      </h3>

      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label className='text-white font-medium'>Height Unit *</label>
          <select
            name='heightUnit'
            value={formData.heightUnit}
            onChange={handleChange}
            className='w-full mt-1 p-2 rounded bg-[#2e1b47] text-white'
          >
            <option value='inches'>Inches</option>
            <option value='cm'>CM</option>
          </select>
        </div>

        <div>
          <label className='text-white font-medium'>Height *</label>
          <input
            type='number'
            name='height'
            value={formData.height}
            onChange={handleChange}
            placeholder={
              formData.heightUnit === 'inches'
                ? '5ft 11in or 180cm'
                : 'Height in cm'
            }
            className='w-full mt-1 p-2 rounded bg-[#2e1b47] text-white'
          />
          {errors.height && (
            <p className='text-red-400 text-sm mt-1'>{errors.height}</p>
          )}
        </div>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label className='text-white font-medium'>Walk-Around Weight *</label>
          <input
            type='number'
            name='walkAroundWeight'
            value={formData.walkAroundWeight}
            onChange={handleChange}
            placeholder='e.g., 210'
            className='w-full mt-1 p-2 rounded bg-[#2e1b47] text-white'
          />
          {errors.walkAroundWeight && (
            <p className='text-red-400 text-sm mt-1'>
              {errors.walkAroundWeight}
            </p>
          )}
        </div>

        <div>
          <label className='text-white font-medium'>Weight Unit *</label>
          <select
            name='weightUnit'
            value={formData.weightUnit}
            onChange={handleChange}
            className='w-full mt-1 p-2 rounded bg-[#2e1b47] text-white'
          >
            <option value='LBS'>LBS</option>
            <option value='KG'>KG</option>
          </select>
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className='space-y-4'>
      <h3 className='text-xl font-semibold text-white mb-4'>Fight History</h3>

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

      <div>
        <label className='text-white font-medium'>System Record</label>
        <input
          type='text'
          name='systemRecord'
          value={formData.systemRecord}
          className='w-full mt-1 p-2 rounded bg-[#2e1b47] text-white'
          readOnly
        />
        <p className='text-gray-400 text-sm mt-1'>
          Auto-populated from platform
        </p>
      </div>

      <div>
        <label className='text-white font-medium'>Additional Records</label>
        <input
          type='text'
          name='additionalRecords'
          value={formData.additionalRecords}
          onChange={handleChange}
          placeholder='Style + W/L/D'
          className='w-full mt-1 p-2 rounded bg-[#2e1b47] text-white'
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

      <div>
        <label className='text-white font-medium'>Weight Class *</label>
        <select
          name='weightClass'
          value={formData.weightClass}
          onChange={handleChange}
          className='w-full mt-1 p-2 rounded bg-[#2e1b47] text-white'
        >
          <option value=''>Select weight range</option>
          <option value='Flyweight'>Flyweight (125 lbs)</option>
          <option value='Bantamweight'>Bantamweight (135 lbs)</option>
          <option value='Featherweight'>Featherweight (145 lbs)</option>
          <option value='Lightweight'>Lightweight (155 lbs)</option>
          <option value='Welterweight'>Welterweight (170 lbs)</option>
          <option value='Middleweight'>Middleweight (185 lbs)</option>
          <option value='Light Heavyweight'>Light Heavyweight (205 lbs)</option>
          <option value='Heavyweight'>Heavyweight (265 lbs)</option>
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
      <div className='bg-[#2e1b47] p-4 rounded'>
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

      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label className='text-white font-medium'>Trainer Name *</label>
          <input
            type='text'
            name='trainerName'
            value={formData.trainerName}
            onChange={handleChange}
            className='w-full mt-1 p-2 rounded bg-[#2e1b47] text-white'
          />
          {errors.trainerName && (
            <p className='text-red-400 text-sm mt-1'>{errors.trainerName}</p>
          )}
        </div>

        <div>
          <label className='text-white font-medium'>Gym Name *</label>
          <input
            type='text'
            name='gymName'
            value={formData.gymName}
            onChange={handleChange}
            placeholder='Enter or choose gym'
            className='w-full mt-1 p-2 rounded bg-[#2e1b47] text-white'
          />
          {errors.gymName && (
            <p className='text-red-400 text-sm mt-1'>{errors.gymName}</p>
          )}
        </div>
      </div>

      <div>
        <label className='text-white font-medium'>Trainer Phone *</label>
        <input
          type='tel'
          name='trainerPhone'
          value={formData.trainerPhone}
          onChange={handleChange}
          className='w-full mt-1 p-2 rounded bg-[#2e1b47] text-white'
        />
        {errors.trainerPhone && (
          <p className='text-red-400 text-sm mt-1'>{errors.trainerPhone}</p>
        )}
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label className='text-white font-medium'>Trainer Email *</label>
          <input
            type='email'
            name='trainerEmail'
            value={formData.trainerEmail}
            onChange={handleChange}
            className='w-full mt-1 p-2 rounded bg-[#2e1b47] text-white'
          />
          {errors.trainerEmail && (
            <p className='text-red-400 text-sm mt-1'>{errors.trainerEmail}</p>
          )}
        </div>

        <div>
          <label className='text-white font-medium'>
            Confirm Trainer Email *
          </label>
          <input
            type='email'
            name='trainerEmailConfirm'
            value={formData.trainerEmailConfirm}
            onChange={handleChange}
            className='w-full mt-1 p-2 rounded bg-[#2e1b47] text-white'
          />
          {errors.trainerEmailConfirm && (
            <p className='text-red-400 text-sm mt-1'>
              {errors.trainerEmailConfirm}
            </p>
          )}
        </div>
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
              name='areYouUnder18'
              value='Yes'
              onChange={handleChange}
              checked={formData.areYouUnder18 === 'Yes'}
            />
            <span className='ml-2'>Yes</span>
          </label>
          <label className='text-white'>
            <input
              type='radio'
              name='areYouUnder18'
              value='No'
              onChange={handleChange}
              checked={formData.areYouUnder18 === 'No'}
            />
            <span className='ml-2'>No</span>
          </label>
        </div>
        {errors.areYouUnder18 && (
          <p className='text-red-400 text-sm mt-1'>{errors.areYouUnder18}</p>
        )}
      </div>
    </div>
  )

  const renderStep9 = () => (
    <div className='space-y-4'>
      <h3 className='text-xl font-semibold text-white mb-4'>Legal Waiver</h3>

      <div className='bg-[#2e1b47] p-4 rounded max-h-40 overflow-y-auto'>
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
          id='legalDisclaimer'
          name='legalDisclaimer'
          checked={formData.legalDisclaimer}
          onChange={handleChange}
          className='accent-yellow-500'
        />
        <label htmlFor='legalDisclaimer' className='text-white'>
          I agree to the terms and waiver *
        </label>
      </div>
      {errors.legalDisclaimer && (
        <p className='text-red-400 text-sm mt-1'>{errors.legalDisclaimer}</p>
      )}

      <div>
        <label className='text-white font-medium'>Digital Signature *</label>
        <input
          type='text'
          name='signature'
          value={formData.signature}
          onChange={handleChange}
          placeholder='Type name to sign'
          className='w-full mt-1 p-2 rounded bg-[#2e1b47] text-white'
        />
        {errors.signature && (
          <p className='text-red-400 text-sm mt-1'>{errors.signature}</p>
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

  return (
    <div className='bg-[#1b0c2e] p-6 rounded-lg max-h-[94vh] overflow-y-auto custom-scrollbar w-full relative'>
      <div className=' mb-6'>
        <h2 className='text-2xl font-bold text-white'>
          Fighter Registration Form
        </h2>
        <p>Fill the form below to register for the event</p>
      </div>

      {/* Progress Bar */}
      <div className='mb-6'>
        <div className='flex justify-between text-sm text-gray-400 mb-2'>
          <span>Personal Info</span>
          <span>Physical Info</span>
          <span>Fight History</span>
          <span>Rule Style</span>
          <span>Bracket & Skill</span>
          <span>Bracket Preview</span>
          <span>Trainer Info</span>
          <span>Age Check</span>
          <span>Waiver</span>
          <span>Payment</span>
        </div>
        <div className='w-full bg-gray-700 rounded-full h-2'>
          <div
            className='bg-yellow-500 h-2 rounded-full transition-all duration-300'
            style={{ width: `${(currentStep / 10) * 100}%` }}
          ></div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {renderCurrentStep()}

        {/* Navigation Buttons */}
        <div className='flex justify-between mt-8'>
          <button
            type='button'
            onClick={() => setIsOpen(false)}
            className='text-yellow-400 underline hover:text-yellow-300 transition-colors'
          >
            Cancel
          </button>
          <div className='flex space-x-4 '>
            {currentStep > 1 && (
              <button
                type='button'
                onClick={prevStep}
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
          {currentStep === 4 && 'Provide rules and regulations'}
          {currentStep === 5 && 'Choose your weight class and skill level'}
          {currentStep === 6 && 'Add your trainer and gym information'}
          {currentStep === 7 && 'Review terms and complete payment'}
        </p>
      </div>
    </div>
  )
}
