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
import React, { use, useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { City, Country, State } from 'country-state-city'
import { uploadToS3 } from '../../../../../utils/uploadToS3'
import { fetchTournamentSettings } from '../../../../../utils/eventUtils'
import axios from 'axios'
import {
  API_BASE_URL,
  apiConstants,
  weightClasses,
} from '../../../../../constants'
import { enqueueSnackbar } from 'notistack'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { submitPayment } from '../../../../actions/actions'

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
  const [tournamentSettings, setTournamentSettings] = useState(null)
  const [loading, setLoading] = useState(true)
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
    heightFeet: '',
    heightInches: '',
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
    isAdult: null,

    // Waiver
    legalDisclaimerAccepted: false,
    waiverSignature: '',

    // Payment
    paymentMethod: 'card',
    cashCode: '',
  })
  const [errors, setErrors] = useState({})
  const [processing, setProcessing] = useState(false)
  const [emailCheckLoading, setEmailCheckLoading] = useState(false)
  const router = useRouter()

  // Square payment integration
  const cardRef = useRef(null)
  const cardInstance = useRef(null)
  const [squareLoaded, setSquareLoaded] = useState(false)

  const appId = process.env.NEXT_PUBLIC_SQUARE_APP_ID
  const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID
  const squareConfigValid = appId && locationId

  const countries = Country.getAllCountries()
  const states = formData.country
    ? State.getStatesOfCountry(formData.country)
    : []
  const cities =
    formData.country && formData.state
      ? City.getCitiesOfState(formData.country, formData.state)
      : []

  // Function to check if email is already registered for this event
  const checkEmailRegistration = async (email) => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return { isRegistered: false }
    }

    try {
      setEmailCheckLoading(true)

      // Check both fighter and trainer registrations
      const [fighterResponse, trainerResponse] = await Promise.all([
        axios
          .get(
            `${API_BASE_URL}/registrations/event/${id}?registrationType=fighter&email=${encodeURIComponent(
              email
            )}`,
            {
              headers: {
                Authorization: `Bearer ${user?.token}`,
              },
            }
          )
          .catch(() => ({ data: { success: false, data: { items: [] } } })),
        axios
          .get(
            `${API_BASE_URL}/registrations/event/${id}?registrationType=trainer&email=${encodeURIComponent(
              email
            )}`,
            {
              headers: {
                Authorization: `Bearer ${user?.token}`,
              },
            }
          )
          .catch(() => ({ data: { success: false, data: { items: [] } } })),
      ])

      const fighterRegistrations =
        fighterResponse.data.success && fighterResponse.data.data.items
          ? fighterResponse.data.data.items
          : []
      const trainerRegistrations =
        trainerResponse.data.success && trainerResponse.data.data.items
          ? trainerResponse.data.data.items
          : []

      const existingFighter = fighterRegistrations.find(
        (reg) => reg.email?.toLowerCase() === email.toLowerCase()
      )
      const existingTrainer = trainerRegistrations.find(
        (reg) => reg.email?.toLowerCase() === email.toLowerCase()
      )

      if (existingFighter) {
        return {
          isRegistered: true,
          type: 'fighter',
          registration: existingFighter,
        }
      }
      if (existingTrainer) {
        return {
          isRegistered: true,
          type: 'trainer',
          registration: existingTrainer,
        }
      }

      return { isRegistered: false }
    } catch (error) {
      console.log('Error checking email registration:', error)
      return { isRegistered: false }
    } finally {
      setEmailCheckLoading(false)
    }
  }

  // Function to fetch system record by email
  const fetchSystemRecord = async (email) => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/fighter/system-record/${encodeURIComponent(
          email
        )}`,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.systemRecord) {
          setFormData((prev) => ({
            ...prev,
            systemRecord: data.data.systemRecord,
          }))
        }
      }
    } catch (error) {
      console.log('Error fetching system record:', error)
      // Keep default 0-0-0 if fetch fails
    }
  }

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

    // Fetch system record if user email is available
    if (user.email) {
      fetchSystemRecord(user.email)
    }
  }, [user])

  // Debounced email check effect for manual email input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.email && formData.email !== user?.email) {
        fetchSystemRecord(formData.email)
      }
    }, 1000) // Wait 1 second after user stops typing

    return () => clearTimeout(timer)
  }, [formData.email, user?.email])

  // Fetch tournament settings
  useEffect(() => {
    const loadTournamentSettings = async () => {
      try {
        setLoading(true)
        const settings = await fetchTournamentSettings(id)
        setTournamentSettings(settings)
      } catch (error) {
        console.log('Error loading tournament settings:', error)
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
    if (
      !squareLoaded ||
      formData.paymentMethod !== 'card' ||
      currentStep !== 10
    )
      return

    if (!squareConfigValid) {
      console.warn('⚠️ Square configuration invalid - card payments disabled')
      setErrors((prev) => ({
        ...prev,
        square: 'Payment system not configured. Please contact support.',
      }))
      return
    }

    const initCard = async () => {
      try {
        console.log('Initializing Square payments for fighter registration')

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
              fontSize: '16px',
            },
            '.input-container': {
              borderRadius: '8px',
              borderColor: '#374151',
              borderWidth: '1px',
            },
            '.input-container.is-focus': {
              borderColor: '#8B5CF6',
            },
            '.input-container.is-error': {
              borderColor: '#EF4444',
            },
          },
        })

        const container = document.getElementById(
          'fighter-square-card-container'
        )
        if (!container) {
          console.log('❌ Fighter Square card container not found in DOM')
          return
        }

        await card.attach('#fighter-square-card-container')
        cardInstance.current = card
        console.log('✅ Fighter Square card initialized')

        // Clear any previous errors if successful
        setErrors((prev) => ({ ...prev, square: null }))
      } catch (error) {
        console.log('❌ Fighter Square card initialization error:', error)
        setErrors((prev) => ({
          ...prev,
          square: `Failed to initialize payment form: ${error.message}`,
        }))
      }
    }

    initCard()

    return () => {
      if (cardInstance.current) {
        cardInstance.current.destroy()
        cardInstance.current = null
      }
      const container = document.getElementById('fighter-square-card-container')
      if (container) container.innerHTML = ''
    }
  }, [
    squareLoaded,
    formData.paymentMethod,
    currentStep,
    squareConfigValid,
    appId,
    locationId,
  ])

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

      setFormData((prev) => {
        const updated = { ...prev, [name]: newValue }

        // Clear height fields when height unit changes
        if (name === 'heightUnit') {
          updated.height = ''
          updated.heightFeet = ''
          updated.heightInches = ''
        }

        return updated
      })
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

  const validPostalCode = (postalCode) =>
    /^[0-9A-Za-z\s-]{3,10}$/.test(postalCode)

  const validateStep = async (step) => {
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
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required'
        } else if (!validateEmail(formData.email)) {
          newErrors.email = 'Valid email required'
        } else {
          // Check if email is already registered for this event
          const emailCheck = await checkEmailRegistration(formData.email)
          if (emailCheck.isRegistered) {
            newErrors.email = `This email is already registered as a ${emailCheck.type} for this event. Please use a different email address.`
          }
        }

        // Street
        if (!formData.street1.trim())
          newErrors.street1 = 'Street address is required'

        // City
        if (!formData.city.trim()) newErrors.city = 'City is required'
        else if (!/^[A-Za-z\s'-]+$/.test(formData.city))
          newErrors.city =
            'City must contain only letters, spaces, hyphens, and apostrophes'

        // State
        if (!formData.state) newErrors.state = 'State is required'

        // Country
        if (!formData.country) newErrors.country = 'Country is required'

        // ZIP Code
        if (!formData.postalCode.trim())
          newErrors.postalCode = 'ZIP code is required'
        else if (!validPostalCode(formData.postalCode))
          newErrors.postalCode =
            'Postal code must be 3-10 characters (letters, numbers, spaces, hyphens)'

        // Profile photo
        if (!formData.profilePhoto)
          newErrors.profilePhoto = 'Professional headshot is required'
        break

      case 2: // Physical Info
        if (formData.heightUnit === 'feet') {
          // Validate feet and inches separately
          if (!formData.heightFeet) {
            newErrors.heightFeet = 'Feet is required'
          } else {
            const feetValue = parseFloat(formData.heightFeet)
            if (isNaN(feetValue) || feetValue < 3) {
              newErrors.heightFeet = 'Height must be at least 3 feet'
            } else if (feetValue > 8) {
              newErrors.heightFeet = 'Height cannot exceed 8 feet'
            }
          }

          if (!formData.heightInches) {
            newErrors.heightInches = 'Inches is required'
          } else {
            const inchesValue = parseFloat(formData.heightInches)
            if (isNaN(inchesValue) || inchesValue < 0) {
              newErrors.heightInches = 'Inches must be 0 or greater'
            } else if (inchesValue >= 12) {
              newErrors.heightInches = 'Inches must be less than 12'
            }
          }

          // Overall height validation (feet + inches combined)
          if (formData.heightFeet && formData.heightInches) {
            const totalInches =
              parseFloat(formData.heightFeet) * 12 +
              parseFloat(formData.heightInches)
            if (totalInches < 38) {
              newErrors.heightFeet = 'Total height must be at least 3\'2"'
            }
          }
        } else {
          // Original validation for inches and cm
          if (!formData.height) {
            newErrors.height = 'Height is required'
          } else {
            const heightValue = parseFloat(formData.height)
            if (isNaN(heightValue)) {
              newErrors.height = 'Height must be a valid number'
            } else if (formData.heightUnit === 'inches' && heightValue < 38) {
              newErrors.height = 'Height must be at least 38 inches (3\'2")'
            } else if (formData.heightUnit === 'cm' && heightValue < 97) {
              newErrors.height = 'Height must be at least 97 cm (3\'2")'
            }
          }
        }

        if (!formData.walkAroundWeight) {
          newErrors.walkAroundWeight = 'Walk-around weight is required'
        } else {
          const weight = parseFloat(formData.walkAroundWeight)
          if (isNaN(weight)) {
            newErrors.walkAroundWeight = 'Weight must be a valid number'
          } else if (formData.weightUnit === 'LBS' && weight < 25) {
            newErrors.walkAroundWeight = 'Weight must be at least 25 LBS'
          } else if (formData.weightUnit === 'KG' && weight < 11) {
            newErrors.walkAroundWeight = 'Weight must be at least 11 KG'
          }
        }
        break

      case 3: // Fight History
        if (formData.proFighter === undefined || formData.proFighter === '')
          newErrors.proFighter = 'Pro fighter status is required'
        if (formData.paidToFight === undefined || formData.paidToFight === '')
          newErrors.paidToFight = 'Paid to fight status is required'

        // Additional Records validation
        if (formData.additionalRecords && formData.additionalRecords.trim()) {
          const recordPattern = /^\d+-\d+(-\d+)?$/
          if (!recordPattern.test(formData.additionalRecords.trim())) {
            newErrors.additionalRecords =
              'Format must be W-L or W-L-D (e.g., 5-2 or 5-2-1)'
          }
        }
        break

      case 4: // Rule style
        if (!formData.ruleStyle) newErrors.ruleStyle = 'Rule style is required'
        break

      case 5: // Bracket & Skill
        if (!formData.weightClass)
          newErrors.weightClass = 'Weight class is required'
        if (!formData.skillLevel)
          newErrors.skillLevel = 'Skill level is required'

        // Validate weight against selected weight class
        if (formData.weightClass && formData.walkAroundWeight) {
          const selectedWeightClass = weightClasses.find(
            (wc) => wc.fullName === formData.weightClass
          )
          if (selectedWeightClass) {
            let userWeight = parseFloat(formData.walkAroundWeight)

            // Convert user weight to LBS if needed for comparison
            if (formData.weightUnit === 'KG') {
              userWeight = userWeight * 2.20462 // Convert KG to LBS
            }

            // Extract min and max from fullName (e.g., "Junior Featherweight (122.1–127)")
            const weightRangeMatch = selectedWeightClass.fullName.match(
              /\(([0-9.]+)[-–]([0-9.]+)\)/
            )
            if (weightRangeMatch) {
              const minWeight = parseFloat(weightRangeMatch[1])
              const maxWeight = parseFloat(weightRangeMatch[2])

              if (userWeight < minWeight || userWeight > maxWeight) {
                const convertedWeight =
                  formData.weightUnit === 'KG'
                    ? `${userWeight.toFixed(1)} LBS (${
                        formData.walkAroundWeight
                      } KG)`
                    : `${formData.walkAroundWeight} ${formData.weightUnit}`
                newErrors.weightClass = `Your weight ${convertedWeight} doesn't match the selected weight class range (${minWeight}-${maxWeight} LBS)`
              }
            }
          }
        }
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
        if (
          formData.isAdult === null ||
          formData.isAdult === undefined ||
          formData.isAdult === ''
        )
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

        if (formData.paymentMethod === 'cash') {
          if (!formData.cashCode.trim())
            newErrors.cashCode = 'Cash code is required'
        }
        // Note: Card validation is handled by Square SDK during tokenization
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = async () => {
    const isValid = await validateStep(currentStep)
    if (isValid) {
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

  const processSquarePayment = async () => {
    if (!cardInstance.current) {
      throw new Error('Payment form not ready. Please wait and try again.')
    }

    console.log('Processing Square payment for fighter registration...')
    const result = await cardInstance.current.tokenize()

    if (result.status !== 'OK') {
      console.log('❌ Square tokenization failed:', result)
      throw new Error(
        result.errors?.[0]?.detail ||
          'Card payment failed. Please check your card details.'
      )
    }

    console.log('✅ Square tokenization successful')

    // Calculate amount in cents for Square (Fighter registration fee)
    const fighterFee = tournamentSettings?.simpleFees?.fighterFee || 75

    // Submit payment to Square
    const paymentData = {
      note: `Fighter registration - Event ID: ${id}`,
    }

    console.log('Submitting payment to Square...', {
      fighterFee,
      paymentData,
    })
    const squareResult = await submitPayment(
      result.token,
      fighterFee,
      paymentData
    )

    if (!squareResult.success) {
      console.log('❌ Square payment failed:', squareResult)
      throw new Error(squareResult.error || 'Payment processing failed')
    }

    console.log('✅ Square payment successful:', squareResult)
    return {
      transactionId: squareResult.transactionId,
      orderId: squareResult.orderId,
      receiptNumber: squareResult.receiptNumber,
      last4: squareResult.last4,
      receiptUrl: squareResult.receiptUrl,
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const isValid = await validateStep(10)
    if (!isValid) {
      return
    }

    setProcessing(true)

    try {
      let heightInInches
      if (formData.heightUnit === 'feet') {
        heightInInches =
          parseFloat(formData.heightFeet) * 12 +
          parseFloat(formData.heightInches)
      } else if (formData.heightUnit === 'cm') {
        heightInInches = parseFloat(formData.height) / 2.54
      } else {
        heightInInches = parseFloat(formData.height)
      }

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
        heightUnit: 'inches',
        height: heightInInches.toString(),
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
        amount: tournamentSettings?.simpleFees?.fighterFee,
        paymentMethod: formData.paymentMethod,
        paymentStatus: 'Paid',
        event: id,
        role: 'fighter',
      }

      // Handle profile photo upload
      if (formData.profilePhoto) {
        if (typeof formData.profilePhoto !== 'string') {
          payload.profilePhoto = await uploadToS3(formData.profilePhoto)
        } else {
          payload.profilePhoto = formData.profilePhoto
        }
      }

      // Handle payment processing
      if (formData.paymentMethod === 'cash') {
        if (!formData.cashCode || !formData.cashCode.trim()) {
          throw new Error('Cash code is required')
        }
        payload.cashCode = formData.cashCode.trim()
      } else {
        // For card payments, process Square payment first
        console.log(
          'Processing Square card payment for fighter registration...'
        )
        const { transactionId, orderId, receiptNumber, last4, receiptUrl } =
          await processSquarePayment()
        payload.squareDetails = {
          transactionId,
          orderId,
          receiptNumber,
          last4,
          receiptUrl,
        }
      }

      console.log('Fighter registration payload:', payload)
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
      enqueueSnackbar(error.response.data.message, { variant: 'error' })
    } finally {
      setProcessing(false)
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
        <label className='text-white font-medium'>
          Gender <span className='text-red-500'>*</span>
        </label>
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
              value='Other'
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
            <div className='relative'>
              <input
                type={field.type || 'text'}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                placeholder={
                  field.placeholder || `Enter ${field.label.toLowerCase()}`
                }
                required={field.required}
                disabled={
                  field.disabled ||
                  (field.name === 'email' && emailCheckLoading)
                }
                className={`w-full outline-none bg-transparent text-white disabled:text-gray-400 ${
                  field.name === 'email' && emailCheckLoading ? 'pr-6' : ''
                }`}
              />
              {field.name === 'email' && emailCheckLoading && (
                <div className='absolute right-2 top-1/2 transform -translate-y-1/2'>
                  <div className='animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full'></div>
                </div>
              )}
            </div>
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
          <label className='block font-medium mb-1'>
            State <span className='text-red-500'>*</span>
          </label>
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
          className='max-w-fit outline-none bg-transparent text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700'
        />
        {errors.profilePhoto && (
          <p className='text-red-400 text-sm mt-1'>{errors.profilePhoto}</p>
        )}

        <p className='text-xs text-gray-400 mt-1'>JPG/PNG, Max 2MB</p>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className='space-y-4'>
      <h3 className='text-xl font-semibold text-white mb-4'>
        Physical Information
      </h3>

      <div className='space-y-4'>
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
            <option value='feet' className='text-black'>
              Feet & Inches
            </option>
            <option value='inches' className='text-black'>
              Inches
            </option>
            <option value='cm' className='text-black'>
              CM
            </option>
          </select>
        </div>

        {formData.heightUnit === 'feet' ? (
          <div className='grid grid-cols-2 gap-4'>
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-1'>
                Feet <span className='text-red-500'>*</span>
              </label>
              <input
                type='number'
                name='heightFeet'
                value={formData.heightFeet}
                onChange={handleChange}
                placeholder='e.g., 5'
                min='3'
                max='8'
                className='w-full outline-none bg-transparent text-white'
              />
            </div>
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-1'>
                Inches <span className='text-red-500'>*</span>
              </label>
              <input
                type='number'
                name='heightInches'
                value={formData.heightInches}
                onChange={handleChange}
                placeholder='e.g., 8'
                min='0'
                max='11'
                className='w-full outline-none bg-transparent text-white'
              />
            </div>
            {(errors.heightFeet || errors.heightInches) && (
              <div className='col-span-2'>
                {errors.heightFeet && (
                  <p className='text-red-400 text-sm'>{errors.heightFeet}</p>
                )}
                {errors.heightInches && (
                  <p className='text-red-400 text-sm'>{errors.heightInches}</p>
                )}
              </div>
            )}
          </div>
        ) : (
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
                formData.heightUnit === 'cm' ? 'e.g., 180' : 'e.g., 68'
              }
              className='w-full outline-none bg-transparent text-white'
            />
            {errors.height && (
              <p className='text-red-400 text-sm mt-1'>{errors.height}</p>
            )}
          </div>
        )}
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
        <div className='relative'>
          <input
            type='text'
            name='systemRecord'
            value={formData.systemRecord}
            className='w-full outline-none bg-transparent text-white pr-8'
            readOnly
          />
          {loading && (
            <div className='absolute right-2 top-1/2 transform -translate-y-1/2'>
              <div className='animate-spin h-4 w-4 border-2 border-yellow-500 border-t-transparent rounded-full'></div>
            </div>
          )}
        </div>
        <p className='text-gray-400 text-sm mt-1'>
          Auto-populated from platform data
        </p>
      </div>

      <div className='bg-[#00000061] p-2 rounded'>
        <label className='text-white font-medium'>Additional Records</label>
        <input
          type='text'
          name='additionalRecords'
          value={formData.additionalRecords}
          onChange={handleChange}
          placeholder='Format: W-L-D (e.g., 5-2-1)'
          className='w-full outline-none bg-transparent text-white'
        />
        {errors.additionalRecords && (
          <p className='text-red-400 text-sm mt-1'>
            {errors.additionalRecords}
          </p>
        )}
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
          Are You 18 or Older? <span className='text-red-500'>*</span>
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
    <div className='space-y-6'>
      <div className='text-center mb-8'>
        <h3 className='text-2xl font-bold mb-2'>Payment</h3>
        <p className='text-gray-400'>
          Registration Fee:{' '}
          <span className='text-green-400 font-bold text-xl'>
            {tournamentSettings?.simpleFees?.currency || '$'}
            {(tournamentSettings?.simpleFees?.fighterFee || 75).toFixed(2)}
          </span>
        </p>
      </div>

      {/* Payment Method Selection */}
      <div>
        <h4 className='text-lg font-bold mb-4'>Payment Method</h4>
        <div className='grid grid-cols-2 gap-4'>
          <button
            type='button'
            onClick={() =>
              !processing &&
              setFormData((prev) => ({ ...prev, paymentMethod: 'card' }))
            }
            disabled={processing}
            className={`p-4 rounded-lg border-2 transition-colors ${
              formData.paymentMethod === 'card'
                ? 'border-purple-500 bg-purple-500/20'
                : 'border-gray-600 hover:border-gray-500'
            } ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <CreditCard className='mx-auto mb-2' size={24} />
            <div className='text-sm font-medium'>Credit/Debit Card</div>
          </button>

          <button
            type='button'
            onClick={() =>
              !processing &&
              setFormData((prev) => ({ ...prev, paymentMethod: 'cash' }))
            }
            disabled={processing}
            className={`p-4 rounded-lg border-2 transition-colors ${
              formData.paymentMethod === 'cash'
                ? 'border-purple-500 bg-purple-500/20'
                : 'border-gray-600 hover:border-gray-500'
            } ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <DollarSign className='mx-auto mb-2' size={24} />
            <div className='text-sm font-medium'>Cash Code</div>
          </button>
        </div>
        {errors.paymentMethod && (
          <p className='text-red-400 text-sm mt-2'>{errors.paymentMethod}</p>
        )}
      </div>

      {/* Payment Details */}
      {formData.paymentMethod === 'card' && (
        <div>
          <h4 className='text-lg font-bold mb-4'>Card Details</h4>

          {!squareConfigValid && (
            <div className='bg-red-900/20 border border-red-500 rounded-lg p-6 text-center'>
              <p className='text-red-400 mb-2'>
                Card payments are currently unavailable
              </p>
              <p className='text-gray-400 text-sm'>
                Please use cash payment or contact support
              </p>
            </div>
          )}

          {squareConfigValid && !squareLoaded && (
            <div className='bg-[#0A1330] rounded-lg p-6 text-center'>
              <p className='text-gray-400'>Loading payment form...</p>
            </div>
          )}

          {squareConfigValid && squareLoaded && (
            <div
              className={`bg-[#0A1330] rounded-lg p-6 ${
                processing ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              <div
                id='fighter-square-card-container'
                ref={cardRef}
                className='mb-4'
              />
              {errors.square && (
                <p className='text-red-500 text-sm mt-2'>{errors.square}</p>
              )}
              {processing && (
                <div className='mt-4 p-3 bg-green-900/20 border border-green-500 rounded-lg'>
                  <p className='text-green-400 text-sm font-medium'>
                    ✓ Processing payment...
                  </p>
                </div>
              )}
              {!processing && (
                <div className='mt-4 p-3 bg-blue-900/20 border border-blue-500 rounded-lg'>
                  <p className='text-blue-400 text-sm font-medium mb-1'>
                    Test Card Information:
                  </p>
                  <p className='text-blue-300 text-xs'>
                    For testing: Use card number 4111 1111 1111 1111, any future
                    expiry date, and CVV 111
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {formData.paymentMethod === 'cash' && (
        <div>
          <label className='block text-sm font-medium mb-2'>
            Cash Payment Code
          </label>
          <input
            type='text'
            name='cashCode'
            value={formData.cashCode}
            onChange={(e) => {
              if (!processing) {
                const newValue = e.target.value.toUpperCase()
                setFormData((prev) => ({ ...prev, cashCode: newValue }))
                if (errors.cashCode) {
                  setErrors((prev) => ({ ...prev, cashCode: '' }))
                }
              }
            }}
            disabled={processing}
            className={`w-full bg-[#0A1330] border ${
              errors.cashCode ? 'border-red-500' : 'border-gray-600'
            } rounded px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 ${
              processing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            placeholder='Enter your cash code'
          />
          {errors.cashCode && (
            <p className='text-red-500 text-sm mt-1'>{errors.cashCode}</p>
          )}
          <p className='text-gray-400 text-sm mt-2'>
            Enter the cash payment code provided to you
          </p>
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
    <>
      {/* Square SDK Script */}
      <Script
        src='https://sandbox.web.squarecdn.com/v1/square.js'
        strategy='afterInteractive'
        onLoad={() => {
          console.log('✅ Square script loaded for fighter registration')
          setSquareLoaded(true)
        }}
        onError={(error) => {
          console.log(
            '❌ Square script failed to load for fighter registration:',
            error
          )
          setErrors((prev) => ({
            ...prev,
            square: 'Payment system failed to load',
          }))
        }}
      />

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
                    disabled={processing}
                    className={`text-yellow-400 underline hover:text-yellow-300 transition-colors ${
                      processing ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
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
                        disabled={processing}
                        className={`border border-gray-400 text-gray-200 px-4 py-2 rounded font-semibold hover:bg-gray-700 hover:border-gray-500 transition-colors ${
                          processing ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        Cancel
                      </button>
                    </Link>
                    <button
                      type='button'
                      className={`bg-yellow-500 text-black px-6 py-2 rounded font-semibold hover:bg-yellow-400 transition-colors ${
                        processing ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      onClick={handleNext}
                      disabled={processing}
                    >
                      Next
                    </button>
                  </>
                ) : (
                  <div className='flex space-x-4'>
                    <Link href={`/events/${id}`}>
                      <button
                        type='button'
                        disabled={processing}
                        className={`border border-gray-400 text-gray-200 px-4 py-2 rounded font-semibold hover:bg-gray-700 hover:border-gray-500 transition-colors ${
                          processing ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        Cancel
                      </button>
                    </Link>
                    <button
                      type='submit'
                      disabled={
                        processing ||
                        (formData.paymentMethod === 'card' &&
                          (!squareLoaded || !cardInstance.current))
                      }
                      className='bg-yellow-500 text-black px-4 py-2 rounded font-semibold hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      {processing
                        ? 'Processing...'
                        : formData.paymentMethod === 'card'
                        ? `Pay ${
                            tournamentSettings?.simpleFees?.currency || '$'
                          }${(
                            tournamentSettings?.simpleFees?.fighterFee || 75
                          ).toFixed(2)}`
                        : 'Submit Registration'}
                    </button>
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
    </>
  )
}

export default FighterRegistrationPage
