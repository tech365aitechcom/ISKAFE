'use client'
import React, { use, useState, useEffect, useRef } from 'react'
import axios from 'axios'
import Script from 'next/script'
import { submitPayment } from '../../../../actions/actions'
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
import { useRouter } from 'next/navigation'
import { enqueueSnackbar } from 'notistack'
import useStore from '../../../../../stores/useStore'
import { fetchTournamentSettings } from '../../../../../utils/eventUtils'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

const TrainerRegistrationPage = ({ params }) => {
  const { id } = use(params)
  const user = useStore((state) => state.user)
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [tournamentSettings, setTournamentSettings] = useState(null)
  const [loading, setLoading] = useState(true)
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

    // Payment
    paymentMethod: 'card',
    cashCode: '',
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Square payment integration
  const cardRef = useRef(null)
  const cardInstance = useRef(null)
  const [squareLoaded, setSquareLoaded] = useState(false)
  
  const appId = process.env.NEXT_PUBLIC_SQUARE_APP_ID
  const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID
  const squareConfigValid = appId && locationId

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

  // Fetch tournament settings
  useEffect(() => {
    const loadTournamentSettings = async () => {
      try {
        setLoading(true)
        const settings = await fetchTournamentSettings(id)
        setTournamentSettings(settings)
      } catch (error) {
        console.error('Error loading tournament settings:', error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadTournamentSettings()
    }
  }, [id])

  // Square payment initialization
  useEffect(() => {
    if (!squareLoaded || formData.paymentMethod !== 'card' || currentStep !== 4) return

    if (!squareConfigValid) {
      console.warn('⚠️ Square configuration invalid - card payments disabled')
      setErrors(prev => ({ 
        ...prev, 
        square: 'Payment system not configured. Please contact support.' 
      }))
      return
    }

    const initCard = async () => {
      try {
        console.log('Initializing Square payments for trainer registration')
        
        if (!window.Square) {
          throw new Error('Square SDK not loaded')
        }

        const payments = window.Square.payments(appId, locationId)

        if (cardInstance.current) {
          await cardInstance.current.destroy()
          cardInstance.current = null
        }

        const card = await payments.card({
          style: {
            input: {
              backgroundColor: '#0A1330',
              color: '#ffffff',
              fontSize: '16px'
            },
            '.input-container': {
              borderRadius: '8px',
              borderColor: '#374151',
              borderWidth: '1px'
            },
            '.input-container.is-focus': {
              borderColor: '#8B5CF6'
            },
            '.input-container.is-error': {
              borderColor: '#EF4444'
            }
          }
        })
        
        const container = document.getElementById('trainer-square-card-container')
        if (!container) {
          console.error('❌ Trainer Square card container not found in DOM')
          return
        }

        await card.attach('#trainer-square-card-container')
        cardInstance.current = card
        console.log('✅ Trainer Square card initialized')
        
        // Clear any previous errors if successful
        setErrors(prev => ({ ...prev, square: null }))
      } catch (error) {
        console.error('❌ Trainer Square card initialization error:', error)
        setErrors(prev => ({ 
          ...prev, 
          square: `Failed to initialize payment form: ${error.message}` 
        }))
      }
    }

    initCard()

    return () => {
      if (cardInstance.current) {
        cardInstance.current.destroy()
        cardInstance.current = null
      }
      const container = document.getElementById('trainer-square-card-container')
      if (container) container.innerHTML = ''
    }
  }, [squareLoaded, formData.paymentMethod, currentStep, squareConfigValid, appId, locationId])

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

  const processSquarePayment = async () => {
    if (!cardInstance.current) {
      throw new Error('Payment form not ready. Please wait and try again.')
    }

    console.log('Processing Square payment for trainer registration...')
    const result = await cardInstance.current.tokenize()

    if (result.status !== 'OK') {
      console.error('❌ Square tokenization failed:', result)
      throw new Error(result.errors?.[0]?.detail || 'Card payment failed. Please check your card details.')
    }

    console.log('✅ Square tokenization successful')
    
    // Calculate amount in cents for Square (Trainer registration fee)
    const trainerFee = tournamentSettings?.simpleFees?.trainerFee || 75
    const amountInCents = trainerFee * 100  // Convert to cents
    
    // Submit payment to Square
    const paymentData = {
      note: `Trainer registration - Event ID: ${id}`
    }
    
    console.log('Submitting payment to Square...', { amountInCents, paymentData })
    const squareResult = await submitPayment(result.token, amountInCents, paymentData)
    
    if (!squareResult.success) {
      console.error('❌ Square payment failed:', squareResult)
      throw new Error(squareResult.error || 'Payment processing failed')
    }

    console.log('✅ Square payment successful:', squareResult)
    return squareResult.transactionId
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
        paymentMethod: formData.paymentMethod,
        paymentStatus: 'Paid', // Set as paid since we're processing payment
      }

      // Handle payment processing
      if (formData.paymentMethod === 'cash') {
        if (!formData.cashCode || !formData.cashCode.trim()) {
          throw new Error('Cash code is required')
        }
        payload.cashCode = formData.cashCode.trim()
      } else {
        // For card payments, process Square payment first
        console.log('Processing Square card payment for trainer registration...')
        const transactionId = await processSquarePayment()
        payload.transactionId = transactionId
        console.log('Square payment completed, transaction ID:', transactionId)
      }

      console.log('Trainer registration payload:', JSON.stringify(payload, null, 2))

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

      enqueueSnackbar('Registration successful!', { variant: 'success' })
      
      // Redirect to event details page after successful registration
      setTimeout(() => {
        router.push(`/events/${id}`)
      }, 1500) // Small delay to let user see the success message
    } catch (error) {
      console.error('Trainer registration error:', error)
      
      // Handle different error types
      let errorMessage = 'Registration failed'
      
      if (error.response) {
        // Server responded with error status
        const { data, status } = error.response
        if (data.message) {
          errorMessage = data.message
        } else if (data.error) {
          errorMessage = data.error
        } else if (status === 400) {
          errorMessage = 'Invalid registration data. Please check your information and try again.'
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later.'
        }
      } else if (error.request) {
        // Network error
        errorMessage = 'Network error. Please check your connection and try again.'
      } else {
        // Other error (including Square payment errors)
        errorMessage = error.message
      }
      
      enqueueSnackbar(errorMessage, { variant: 'error' })
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
    <div className='space-y-6'>
      <div className="text-center mb-8">
        <h3 className='text-2xl font-bold mb-2'>Payment</h3>
        <p className="text-gray-400">Trainer Registration Fee: <span className="text-green-400 font-bold text-xl">
          {tournamentSettings?.simpleFees?.currency || '$'}{(tournamentSettings?.simpleFees?.trainerFee || 75).toFixed(2)}
        </span></p>
      </div>

      {/* Payment Method Selection */}
      <div>
        <h4 className="text-lg font-bold mb-4">Payment Method</h4>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'card' }))}
            className={`p-4 rounded-lg border-2 transition-colors ${
              formData.paymentMethod === 'card'
                ? 'border-purple-500 bg-purple-500/20'
                : 'border-gray-600 hover:border-gray-500'
            }`}
          >
            <CreditCard className="mx-auto mb-2" size={24} />
            <div className="text-sm font-medium">Credit/Debit Card</div>
          </button>
          
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'cash' }))}
            className={`p-4 rounded-lg border-2 transition-colors ${
              formData.paymentMethod === 'cash'
                ? 'border-purple-500 bg-purple-500/20'
                : 'border-gray-600 hover:border-gray-500'
            }`}
          >
            <DollarSign className="mx-auto mb-2" size={24} />
            <div className="text-sm font-medium">Cash Code</div>
          </button>
        </div>
      </div>

      {/* Payment Details */}
      {formData.paymentMethod === 'card' && (
        <div>
          <h4 className="text-lg font-bold mb-4">Card Details</h4>
          
          {!squareConfigValid && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
              <p className="text-red-400 mb-2">Card payments are currently unavailable</p>
              <p className="text-gray-400 text-sm">Please use cash payment or contact support</p>
            </div>
          )}
          
          {squareConfigValid && !squareLoaded && (
            <div className="bg-[#0A1330] rounded-lg p-6 text-center">
              <p className="text-gray-400">Loading payment form...</p>
            </div>
          )}
          
          {squareConfigValid && squareLoaded && (
            <div className="bg-[#0A1330] rounded-lg p-6">
              <div id="trainer-square-card-container" ref={cardRef} className="mb-4" />
              {errors.square && (
                <p className="text-red-500 text-sm mt-2">{errors.square}</p>
              )}
              <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500 rounded-lg">
                <p className="text-blue-400 text-sm font-medium mb-1">Test Card Information:</p>
                <p className="text-blue-300 text-xs">For testing: Use card number 4111 1111 1111 1111, any future expiry date, and CVV 111</p>
              </div>
            </div>
          )}
        </div>
      )}

      {formData.paymentMethod === 'cash' && (
        <div>
          <label className='block text-sm font-medium mb-2'>Cash Payment Code</label>
          <input
            type='text'
            name='cashCode'
            value={formData.cashCode}
            onChange={(e) => {
              const newValue = e.target.value.toUpperCase()
              setFormData(prev => ({ ...prev, cashCode: newValue }))
              if (errors.cashCode) {
                setErrors(prev => ({ ...prev, cashCode: '' }))
              }
            }}
            className={`w-full bg-[#0A1330] border ${
              errors.cashCode ? 'border-red-500' : 'border-gray-600'
            } rounded px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500`}
            placeholder='Enter your cash code'
          />
          {errors.cashCode && <p className='text-red-500 text-sm mt-1'>{errors.cashCode}</p>}
          <p className='text-gray-400 text-sm mt-2'>
            Enter the cash payment code provided to you
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
    <>
      {/* Square SDK Script */}
      <Script
        src='https://sandbox.web.squarecdn.com/v1/square.js'
        strategy='afterInteractive'
        onLoad={() => {
          console.log('✅ Square script loaded for trainer registration')
          setSquareLoaded(true)
        }}
        onError={(error) => {
          console.error('❌ Square script failed to load for trainer registration:', error)
          setErrors(prev => ({ ...prev, square: 'Payment system failed to load' }))
        }}
      />
    
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
                  disabled={isSubmitting || (formData.paymentMethod === 'card' && (!squareLoaded || !cardInstance.current))}
                  className='flex items-center space-x-2 bg-yellow-500 text-black px-4 py-2 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-600 transition-colors'
                >
                  {isSubmitting ? 'Processing...' : formData.paymentMethod === 'card' ? 
                    `Pay ${tournamentSettings?.simpleFees?.currency || '$'}${(tournamentSettings?.simpleFees?.trainerFee || 75).toFixed(2)}` : 
                    'Complete Registration'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default TrainerRegistrationPage
