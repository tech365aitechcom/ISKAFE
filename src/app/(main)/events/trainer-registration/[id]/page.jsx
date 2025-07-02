'use client'
import React, { use, useState } from 'react'
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

const TrainerRegistrationPage = ({ params }) => {
  const { id } = use(params)
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

    // Payment
    paymentMethod: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cashCode: '',
  })

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
  }

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return (
          formData.firstName &&
          formData.lastName &&
          formData.gender &&
          formData.dateOfBirth &&
          formData.phoneNumber &&
          formData.email &&
          formData.street1 &&
          formData.city &&
          formData.state &&
          formData.country &&
          formData.postalCode
        )
      case 2:
        return formData.fightersRepresented.trim().length > 0
      case 3:
        return formData.agreementChecked && formData.waiverSignature
      case 4:
        if (formData.paymentMethod === 'card') {
          return formData.cardNumber && formData.expiryDate && formData.cvv
        } else if (formData.paymentMethod === 'cash') {
          return formData.cashCode
        }
        return formData.paymentMethod !== ''
      default:
        return true
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 4) {
    }
    setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (validateStep(4)) {
      // Handle form submission
      console.log('Form submitted:', formData)
      alert('Registration completed successfully!')
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
              onChange={handleChange}
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
              onChange={handleChange}
              checked={formData.gender === 'Female'}
              className='mr-2'
            />
            Female
          </label>
        </div>
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
        />
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
        <p className='text-gray-400 text-sm mt-1'>
          This serves as your legal digital signature
        </p>
      </div>
    </div>
  )

  const renderPaymentStep = () => (
    <div className='space-y-4'>
      <div>
        <label className='text-white font-medium'>Payment Method *</label>
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
        <div className='space-y-4'>
          <div className='grid grid-cols-3 gap-4'>
            <div>
              <label className='text-white font-medium'>Card Number *</label>
              <input
                type='text'
                name='cardNumber'
                value={formData.cardNumber}
                onChange={handleChange}
                placeholder='1234 5678 9012 3456'
                className='w-full mt-1 p-2 rounded bg-[#00000061] text-white placeholder-gray-400'
                required
              />
            </div>
            <div>
              <label className='text-white font-medium'>Expiry Date *</label>
              <input
                type='text'
                name='expiryDate'
                value={formData.expiryDate}
                onChange={handleChange}
                placeholder='MM/YY'
                className='w-full mt-1 p-2 rounded bg-[#00000061] text-white placeholder-gray-400'
                required
              />
            </div>
            <div>
              <label className='text-white font-medium'>CVV *</label>
              <input
                type='text'
                name='cvv'
                value={formData.cvv}
                onChange={handleChange}
                placeholder='123'
                className='w-full mt-1 p-2 rounded bg-[#00000061] text-white placeholder-gray-400'
                required
              />
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
            placeholder='Enter event code'
            className='w-full mt-1 p-2 rounded bg-[#00000061] text-white placeholder-gray-400'
            required
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
                  // disabled={!validateStep(currentStep)}
                  className='flex items-center space-x-2 bg-yellow-500 text-black px-4 py-2 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-600 transition-colors'
                >
                  <span>Next</span>
                  <ChevronRight className='w-4 h-4' />
                </button>
              ) : (
                <button
                  type='button'
                  onClick={handleSubmit}
                  disabled={!validateStep(4)}
                  className='flex items-center space-x-2 bg-yellow-500 text-black px-4 py-2 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-600 transition-colors'
                >
                  {formData.paymentMethod === 'card' ? 'Pay' : 'Submit'}
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
