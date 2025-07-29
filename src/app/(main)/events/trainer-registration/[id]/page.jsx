'use client'
import React, { use, useState, useEffect } from 'react'
import axios from 'axios'
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  DollarSign,
  FileText,
  User,
  MapPin,
  Users,
  PenTool,
  CheckCircle,
} from 'lucide-react'
import { City, Country, State } from 'country-state-city'
import Link from 'next/link'
import useStore from '../../../../../stores/useStore'

const TrainerRegistrationPage = ({ params }) => {
  const { id } = use(params)
  const user = useStore((state) => state.user)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    phoneNumber: '',
    email: '',

    // Address
    street1: '',
    street2: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',

    // Fighter Association
    fightersRepresented: '',

    // Waiver & Signature
    agreementChecked: false,
    waiverSignature: '',

    // Payment (kept but non-functional)
    paymentMethod: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cashCode: '',
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Pre-fill form with user data from Zustand store
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        gender: user.gender || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        phoneNumber: user.phoneNumber || '',
        email: user.email || '',
        city: user.city || '',
        state: user.state || '',
        country: user.country || '',
        waiverSignature: `${user.firstName || ''} ${
          user.lastName || ''
        }`.trim(),
      }))
    }
  }, [user])

  const countries = Country.getAllCountries()
  const states = formData.country
    ? State.getStatesOfCountry(formData.country)
    : []
  const cities =
    formData.country && formData.state
      ? City.getCitiesOfState(formData.country, formData.state)
      : []

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateStep = (step) => {
    const newErrors = {}
    let isValid = true

    if (step === 1) {
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required'
        isValid = false
      } else if (!/^[a-zA-Z ]+$/.test(formData.firstName)) {
        newErrors.firstName = 'First name should contain only letters'
        isValid = false
      }

      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required'
        isValid = false
      } else if (!/^[a-zA-Z ]+$/.test(formData.lastName)) {
        newErrors.lastName = 'Last name should contain only letters'
        isValid = false
      }

      if (!formData.gender) {
        newErrors.gender = 'Gender is required'
        isValid = false
      }

      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = 'Date of birth is required'
        isValid = false
      } else {
        const dob = new Date(formData.dateOfBirth)
        const today = new Date()
        if (dob >= today) {
          newErrors.dateOfBirth = 'Date of birth must be in the past'
          isValid = false
        }
      }

      if (!formData.phoneNumber.trim()) {
        newErrors.phoneNumber = 'Phone number is required'
        isValid = false
      } else if (!/^[0-9+\- ]+$/.test(formData.phoneNumber)) {
        newErrors.phoneNumber = 'Invalid phone number format'
        isValid = false
      }

      if (!formData.email.trim()) {
        newErrors.email = 'Email is required'
        isValid = false
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Invalid email format'
        isValid = false
      }

      if (!formData.street1.trim()) {
        newErrors.street1 = 'Street address is required'
        isValid = false
      }

      if (!formData.city) {
        newErrors.city = 'City is required'
        isValid = false
      }

      if (!formData.state) {
        newErrors.state = 'State is required'
        isValid = false
      }

      if (!formData.country) {
        newErrors.country = 'Country is required'
        isValid = false
      }

      if (!formData.postalCode.trim()) {
        newErrors.postalCode = 'Postal code is required'
        isValid = false
      }
    }

    if (step === 2) {
      if (!formData.fightersRepresented.trim()) {
        newErrors.fightersRepresented = 'Please list at least one fighter'
        isValid = false
      }
    }

    if (step === 3) {
      if (!formData.agreementChecked) {
        newErrors.agreementChecked = 'You must agree to the waiver'
        isValid = false
      }

      if (!formData.waiverSignature.trim()) {
        newErrors.waiverSignature = 'Signature is required'
        isValid = false
      } else if (formData.waiverSignature.trim().split(' ').length < 2) {
        newErrors.waiverSignature = 'Please enter your full name'
        isValid = false
      }
    }

    // No validation for payment step (step 4)

    setErrors(newErrors)
    return isValid
  }

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Validate required fields first
      const requiredFields = [
        'firstName',
        'lastName',
        'email',
        'phoneNumber',
        'dateOfBirth',
        'street1',
        'postalCode',
      ]

      const missingFields = requiredFields.filter((field) => !formData[field])

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
      }

      const payload = {
        // Required root-level fields
        registrationType: 'trainer',
        event: id, // Make sure this matches your event ID
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        dateOfBirth: new Date(formData.dateOfBirth).toISOString(),

        // Address fields (also required)
        street1: formData.street1.trim(),
        postalCode: formData.postalCode.trim(),
        city: formData.city || undefined,
        state: formData.state || undefined,
        country: formData.country || undefined,
        street2: formData.street2?.trim() || undefined,

        // Other fields
        fightersRepresented: formData.fightersRepresented
          .split('\n')
          .filter((f) => f.trim())
          .join('\n'),
        waiverSignature: formData.waiverSignature.trim(),
        agreementChecked: formData.agreementChecked,
        paymentMethod: formData.paymentMethod || 'pending',
      }

      console.log('Final payload:', JSON.stringify(payload, null, 2))

      const response = await axios.post(
        `${API_BASE_URL}/registrations`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      alert('Registration successful!')
      // window.location.href = `/events/${id}/registration-success`;
    } catch (error) {
      console.error('Submission error:', error)
      alert(
        error.response?.data?.message ||
          error.message ||
          'Registration failed. Please check all required fields.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }
  const renderPersonalInfoStep = () => (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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
              <p className='text-red-500 text-xs mt-1'>{errors[field.name]}</p>
            )}
          </div>
        ))}
      </div>

      <div>
        <label className='text-white font-medium'>Gender *</label>
        <div className='flex space-x-4 mt-2'>
          <label className='text-white flex items-center'>
            <input
              type='radio'
              name='gender'
              value='Male'
              onChange={() =>
                setFormData((prev) => ({ ...prev, gender: 'Male' }))
              }
              checked={formData.gender === 'Male'}
              className='mr-2'
            />
            Male
          </label>
          <label className='text-white flex items-center'>
            <input
              type='radio'
              name='gender'
              value='Female'
              onChange={() =>
                setFormData((prev) => ({ ...prev, gender: 'Female' }))
              }
              checked={formData.gender === 'Female'}
              className='mr-2'
            />
            Female
          </label>
        </div>
        {errors.gender && (
          <p className='text-red-500 text-xs mt-1'>{errors.gender}</p>
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
            label: 'Phone Number',
            name: 'phoneNumber',
            type: 'tel',
            required: true,
          },
          {
            label: 'Email Address',
            name: 'email',
            type: 'email',
            required: true,
            disabled: !!user?.email,
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
              <span className='text-red-500'>{field.required ? '*' : ''}</span>
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
              <p className='text-red-500 text-xs mt-1'>{errors[field.name]}</p>
            )}
          </div>
        ))}
        <div className='bg-[#00000061] p-2 rounded'>
          <label className='block font-medium mb-1'>
            Country <span className='text-red-500'>*</span>
          </label>
          <select
            name='country'
            value={formData.country}
            onChange={handleChange}
            className='w-full outline-none bg-transparent text-white'
            required
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
            <p className='text-red-500 text-xs mt-1'>{errors.country}</p>
          )}
        </div>
        <div className='bg-[#00000061] p-2 rounded'>
          <label className='block font-medium mb-1'>
            State <span className='text-red-500'>*</span>
          </label>
          <select
            name='state'
            value={formData.state}
            onChange={handleChange}
            className='w-full outline-none bg-transparent text-white'
            required
            disabled={!formData.country}
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
            <p className='text-red-500 text-xs mt-1'>{errors.state}</p>
          )}
        </div>

        <div className='bg-[#00000061] p-2 rounded'>
          <label className='block font-medium mb-1'>
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
            <option value='' className='text-black'>
              Select City
            </option>
            {cities.map((city) => (
              <option key={city.name} value={city.name} className='text-black'>
                {city.name}
              </option>
            ))}
          </select>
          {errors.city && (
            <p className='text-red-500 text-xs mt-1'>{errors.city}</p>
          )}
        </div>
        <div className='bg-[#00000061] p-2 rounded'>
          <label className='text-white font-medium'>ZIP Code *</label>
          <input
            type='text'
            name='postalCode'
            value={formData.postalCode}
            onChange={handleChange}
            placeholder='Enter ZIP Code'
            className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
          />
          {errors.postalCode && (
            <p className='text-red-500 text-xs mt-1'>{errors.postalCode}</p>
          )}
        </div>
      </div>
    </div>
  )

  const renderFighterAssociationStep = () => (
    <div className='space-y-4'>
      <div className='bg-[#00000061] p-4 rounded'>
        <label className='text-white font-medium'>
          Fighters You Represent *
        </label>
        <textarea
          name='fightersRepresented'
          value={formData.fightersRepresented}
          onChange={handleChange}
          placeholder='Enter fighter names (one per line)'
          className='w-full outline-none bg-transparent text-white'
          required
          rows={5}
        />
        {errors.fightersRepresented && (
          <p className='text-red-500 text-xs mt-1'>
            {errors.fightersRepresented}
          </p>
        )}
        <p className='text-gray-400 text-sm mt-1'>
          List each fighter you represent on a separate line
        </p>
      </div>
    </div>
  )

  const renderWaiverStep = () => (
    <div className='space-y-4'>
      <div>
        <label className='text-white font-medium'>Waiver Text</label>
        <div className='bg-[#00000061] p-4 rounded text-white h-64 overflow-y-auto'>
          <p className='text-sm leading-relaxed'>
            <strong>FIGHTER TRAINING AND COMPETITION WAIVER & RELEASE</strong>
            <br />
            <br />
            I understand that participation in martial arts training and
            competition activities involves inherent risks of injury, including
            but not limited to cuts, bruises, sprains, fractures, concussions,
            and other serious injuries that could result in permanent disability
            or death.
            <br />
            <br />
            I voluntarily assume all risks associated with participation in
            these activities and acknowledge that I am participating at my own
            risk. I hereby release, waive, discharge, and covenant not to sue
            the event organizers, venue owners, officials, trainers, and all
            affiliated parties from any and all liability, claims, demands,
            actions, and causes of action whatsoever arising out of or related
            to any loss, damage, or injury that may be sustained while
            participating in these activities.
            <br />
            <br />I acknowledge that I have read this waiver and fully
            understand its terms and conditions. I understand that I am giving
            up substantial rights by signing this document and have signed it
            freely and voluntarily.
          </p>
        </div>
      </div>

      <div className='flex items-start space-x-2'>
        <input
          type='checkbox'
          id='agreement'
          name='agreementChecked'
          checked={formData.agreementChecked}
          onChange={handleChange}
          className='mt-1'
          required
        />
        <label htmlFor='agreement' className='text-white text-sm'>
          I agree to waiver. Must be checked to proceed. *
        </label>
      </div>
      {errors.agreementChecked && (
        <p className='text-red-500 text-xs mt-1'>{errors.agreementChecked}</p>
      )}

      <div>
        <label className='text-white font-medium'>Digital Signature *</label>
        <input
          type='text'
          name='waiverSignature'
          value={formData.waiverSignature}
          onChange={handleChange}
          placeholder='Type your full name as signature'
          className='w-full mt-1 p-2 rounded bg-[#00000061] text-white placeholder-gray-400'
          required
        />
        {errors.waiverSignature && (
          <p className='text-red-500 text-xs mt-1'>{errors.waiverSignature}</p>
        )}
        <p className='text-gray-400 text-sm mt-1'>
          This serves as your legal digital signature
        </p>
      </div>
    </div>
  )

  const renderPaymentStep = () => (
    <div className='space-y-4'>
      <div className='bg-yellow-500/20 p-4 rounded-lg mb-4'>
        <p className='text-yellow-400 font-medium'>
          Note: Payment processing will be implemented soon. Your registration
          will be confirmed, and payment details will be collected later.
        </p>
      </div>

      <div>
        <label className='text-white font-medium'>Payment Method</label>
        <div className='flex space-x-4 mt-2'>
          <label className='text-white flex items-center'>
            <input
              type='radio'
              name='paymentMethod'
              value='card'
              onChange={handleChange}
              checked={formData.paymentMethod === 'card'}
              className='mr-2'
            />
            Credit Card
          </label>
          <label className='text-white flex items-center'>
            <input
              type='radio'
              name='paymentMethod'
              value='cash'
              onChange={handleChange}
              checked={formData.paymentMethod === 'cash'}
              className='mr-2'
            />
            Cash
          </label>
        </div>
      </div>

      {formData.paymentMethod === 'card' && (
        <div className='space-y-4 mt-4'>
          <div className='grid grid-cols-3 gap-4'>
            <div>
              <label className='text-white font-medium'>Card Number</label>
              <input
                type='text'
                name='cardNumber'
                value={formData.cardNumber}
                onChange={handleChange}
                placeholder='1234 5678 9012 3456'
                className='w-full mt-1 p-2 rounded bg-[#00000061] text-white placeholder-gray-400'
                disabled
              />
            </div>
            <div>
              <label className='text-white font-medium'>Expiry Date</label>
              <input
                type='text'
                name='expiryDate'
                value={formData.expiryDate}
                onChange={handleChange}
                placeholder='MM/YY'
                className='w-full mt-1 p-2 rounded bg-[#00000061] text-white placeholder-gray-400'
                disabled
              />
            </div>
            <div>
              <label className='text-white font-medium'>CVV</label>
              <input
                type='text'
                name='cvv'
                value={formData.cvv}
                onChange={handleChange}
                placeholder='123'
                className='w-full mt-1 p-2 rounded bg-[#00000061] text-white placeholder-gray-400'
                disabled
              />
            </div>
          </div>
        </div>
      )}

      {formData.paymentMethod === 'cash' && (
        <div className='mt-4'>
          <label className='text-white font-medium'>Cash Code</label>
          <input
            type='text'
            name='cashCode'
            value={formData.cashCode}
            onChange={handleChange}
            placeholder='Enter event code'
            className='w-full mt-1 p-2 rounded bg-[#00000061] text-white placeholder-gray-400'
            disabled
          />
          <p className='text-gray-400 text-sm mt-1'>
            Code must match issued code from event staff
          </p>
        </div>
      )}
    </div>
  )

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
      default:
        return <div className='w-5 h-5' />
    }
  }

  const getStepTitle = (step) => {
    switch (step) {
      case 1:
        return 'Personal Info & Address'
      case 2:
        return 'Fighter Association'
      case 3:
        return 'Waiver & Signature'
      case 4:
        return 'Payment'
      default:
        return ''
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderPersonalInfoStep()
      case 2:
        return renderFighterAssociationStep()
      case 3:
        return renderWaiverStep()
      case 4:
        return renderPaymentStep()
      default:
        return null
    }
  }

  return (
    <div className='min-h-screen text-white bg-[#0B1739] py-6 px-4'>
      <div className='w-full container mx-auto'>
        <div className='mb-6'>
          <h2 className='text-2xl font-bold text-white'>
            Trainer Registration Form
          </h2>
          <p>Fill the form below to register for the event</p>
        </div>
        {/* Progress Steps */}
        <div className='flex items-center justify-between mb-8'>
          {[1, 2, 3, 4].map((step) => (
            <React.Fragment key={step}>
              <div className='flex flex-col items-center'>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= step
                      ? 'bg-yellow-500 text-black'
                      : 'bg-[#2e1b47] text-white'
                  }`}
                >
                  {currentStep > step ? (
                    <CheckCircle className='w-5 h-5' />
                  ) : (
                    getStepIcon(step)
                  )}
                </div>
                <span
                  className={`text-xs mt-2 text-center ${
                    currentStep >= step ? 'text-yellow-500' : 'text-gray-400'
                  }`}
                >
                  {getStepTitle(step)}
                </span>
              </div>
              {step < 4 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    currentStep > step ? 'bg-yellow-500' : 'bg-[#2e1b47]'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
        <div>
          {renderStepContent()}

          <div className='flex justify-between mt-8'>
            <Link href={`/events/${id}`}>
              <button
                type='button'
                className='text-yellow-400 underline hover:text-yellow-300 transition-colors'
              >
                Go back to event details
              </button>
            </Link>

            <div className='flex space-x-4'>
              {currentStep > 1 && (
                <button
                  type='button'
                  onClick={prevStep}
                  className='flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded font-semibold hover:bg-gray-700 transition-colors'
                >
                  <ChevronLeft className='w-4 h-4' />
                  <span>Previous</span>
                </button>
              )}

              {currentStep < 4 ? (
                <button
                  type='button'
                  onClick={nextStep}
                  className='flex items-center space-x-2 bg-yellow-500 text-black px-4 py-2 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-600 transition-colors'
                >
                  <span>Next</span>
                  <ChevronRight className='w-4 h-4' />
                </button>
              ) : (
                <button
                  type='button'
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className='flex items-center space-x-2 bg-yellow-500 text-black px-4 py-2 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-600 transition-colors'
                >
                  {isSubmitting ? 'Submitting...' : 'Complete Registration'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrainerRegistrationPage
