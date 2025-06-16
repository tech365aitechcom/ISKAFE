'use client'
import React, { useEffect, useState } from 'react'
import {
  User,
  Phone,
  Award,
  Dumbbell,
  AlertTriangle,
  Calendar,
  Share,
  User2,
} from 'lucide-react'
import { Country, State } from 'country-state-city'
import { enqueueSnackbar } from 'notistack'
import { API_BASE_URL, apiConstants } from '../../../../constants'
import axios from 'axios'
import useStore from '../../../../stores/useStore'
import { uploadToS3 } from '../../../../utils/uploadToS3'
import moment from 'moment'
import Autocomplete from '../../../_components/Autocomplete'
import Loader from '../../../_components/Loader'

const TrainerProfileForm = ({ userDetails, onSuccess }) => {
  const { user } = useStore()
  const [formData, setFormData] = useState({
    // Basic Info
    profilePhoto: null,
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    country: '',
    dateOfBirth: '',
    age: '',
    gender: '',
    height: '',
    weight: '',

    // Gym Info
    gymName: '',
    gymLocation: '',
    yearsOfExperience: '',
    trainerType: '',
    preferredRuleSets: '',

    // Credentials
    certification: null,
    bio: '',

    // Public Profile
    instagram: '',
    facebook: '',
    youtube: '',
    affiliatedFighters: [],

    // Emergency Info
    emergencyContactName: '',
    emergencyContactNumber: '',

    // Event Info
    associatedEvents: [],
    accreditationType: '',

    // Suspension Info
    isSuspended: false,
    suspensionType: '',
    suspensionNotes: '',
    suspensionStartDate: '',
    suspensionEndDate: '',
    medicalClearance: false,
    medicalDocument: null,
  })
  const countries = Country.getAllCountries()
  const states = formData.country
    ? State.getStatesOfCountry(formData.country)
    : []
  const [fighters, setFighters] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (userDetails) {
      const {
        trainerProfile = {},
        suspension = {},
        dateOfBirth,
        ...rest
      } = userDetails

      // Format DOB
      const formattedDOB = dateOfBirth
        ? moment(dateOfBirth).format('YYYY-MM-DD')
        : ''

      // affiliatedFighters: convert to [{ label, value }]
      const affiliatedFighters =
        trainerProfile.affiliatedFighters?.map((fighter) => ({
          label: `${fighter.userId?.firstName || ''} ${
            fighter.userId?.lastName || ''
          } (${fighter.userId?.email || ''})`,
          value: fighter._id,
        })) ?? []

      // associatedEvents: convert to [{ label, value }]
      const associatedEvents =
        trainerProfile.associatedEvents?.map((event) => ({
          label: event.name,
          value: event._id,
        })) ?? []

      // Format suspension start date
      const suspensionStartDate = suspension.incidentDate
        ? moment(suspension.incidentDate).format('YYYY-MM-DD')
        : ''

      // Calculate suspension end date
      const suspensionEndDate =
        suspension.incidentDate && suspension.daysWithoutTraining
          ? moment(suspension.incidentDate)
              .add(suspension.daysWithoutTraining, 'days')
              .format('YYYY-MM-DD')
          : ''

      setFormData((prev) => ({
        ...prev,
        ...rest,
        ...trainerProfile,
        dateOfBirth: formattedDOB,
        age: moment().diff(dateOfBirth, 'years'),
        affiliatedFighters,
        associatedEvents,
        suspensionStartDate,
        suspensionEndDate,
        suspensionNotes: suspension.description,
        suspensionType: suspension.type,
      }))
    }
  }, [userDetails])

  console.log(formData, 'formData')

  useEffect(() => {
    setLoading(true)
    const getEvents = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/events?isPublished=true`
        )
        console.log('Response:', response.data)

        setEvents(response.data.data.items)
      } catch (error) {
        console.error('Error fetching events:', error)
      } finally {
        setLoading(false)
      }
    }
    getEvents()
  }, [])

  useEffect(() => {
    const getFighters = async () => {
      setLoading(true)
      try {
        const response = await axios.get(`${API_BASE_URL}/fighters`)
        console.log('Fighters Response:', response.data)

        setFighters(response.data.data.items)
      } catch (error) {
        console.error('Error fetching events:', error)
      } finally {
        setLoading(false)
      }
    }
    getFighters()
  }, [])

  console.log(fighters, 'fighters')
  console.log(events, 'events')

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target

    if (type === 'checkbox') {
      if (name === 'preferredRuleSets') {
        setFormData((prev) => ({
          ...prev,
          [name]: checked
            ? [...prev[name], value]
            : prev[name].filter((item) => item !== value),
        }))
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: checked,
        }))
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleAutocompleteChange = (eOrName, value) => {
    if (typeof eOrName === 'object' && eOrName?.target) {
      const { name, value, type, checked } = eOrName.target
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }))
    } else {
      const name = eOrName
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleFileChange = (e) => {
    const { name, files, multiple } = e.target
    if (files && files.length > 0) {
      if (multiple) {
        setFormData((prev) => ({
          ...prev,
          [name]: Array.from(files),
        }))
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: files[0],
        }))
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (formData.profilePhoto && typeof formData.profilePhoto !== 'string') {
        formData.profilePhoto = await uploadToS3(formData.profilePhoto)
      }
      if (
        formData.medicalDocument &&
        typeof formData.medicalDocument !== 'string'
      ) {
        formData.medicalDocument = await uploadToS3(formData.medicalDocument)
      }
      if (
        formData.certification &&
        typeof formData.certification !== 'string'
      ) {
        formData.certification = await uploadToS3(formData.certification)
      }

      if (Array.isArray(formData.affiliatedFighters)) {
        formData.affiliatedFighters = formData.affiliatedFighters.map(
          (fighter) => fighter.value
        )
      }
      if (Array.isArray(formData.associatedEvents)) {
        formData.associatedEvents = formData.associatedEvents.map(
          (event) => event.value
        )
      }
      let payload = {
        ...formData,
      }

      if (formData.isSuspended) {
        payload = {
          ...payload,
          daysWithoutTraining: moment(formData.suspensionEndDate).diff(
            moment(formData.suspensionStartDate),
            'days'
          ),
        }
      }
      const response = await axios.put(
        `${API_BASE_URL}/trainers/${user._id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      )
      if (response.status === apiConstants.success) {
        enqueueSnackbar(response.data.message, { variant: 'success' })
        onSuccess()
      }
    } catch (error) {
      enqueueSnackbar(
        error?.response?.data?.message || 'Something went wrong',
        { variant: 'error' }
      )
    }
  }

  const fightingStyles = [
    'Boxing',
    'Muay Thai',
    'Brazilian Jiu-Jitsu',
    'Wrestling',
    'Karate',
    'Judo',
    'Taekwondo',
    'Kickboxing',
  ]

  if (loading) {
    return (
      <div className='min-h-screen text-white bg-[#0B1739] py-6 px-4'>
        <div className='w-full container mx-auto'>
          <div className='flex items-center gap-4 mb-6'>
            <h1 className='text-4xl font-bold'>Trainer Profile</h1>
          </div>
          <div className='flex items-center justify-center'>
            <Loader />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen text-white bg-[#0B1739] py-6 px-4'>
      <div className='w-full container mx-auto'>
        <div className='flex items-center gap-4 mb-6'>
          <h1 className='text-4xl font-bold'>Trainer Profile</h1>
        </div>
        <form onSubmit={handleSubmit}>
          {/* Personal Information */}
          <div className='flex items-center gap-2 mb-4'>
            <User className='w-6 h-6 text-blue-400' />
            <h2 className='font-bold uppercase text-lg'>
              Personal Information
            </h2>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
            {/* Profile Photo */}
            <div className=''>
              <label className='block font-medium mb-2'>
                Profile Photo <span className='text-red-400'>*</span>
              </label>
              {formData.profilePhoto && (
                <div className='my-4 flex'>
                  <img
                    src={
                      typeof formData.profilePhoto === 'string'
                        ? formData.profilePhoto
                        : URL.createObjectURL(formData.profilePhoto)
                    }
                    alt='Profile Preview'
                    className='w-32 h-32 object-cover rounded-full border-4 border-purple-500'
                  />
                </div>
              )}
              <input
                type='file'
                name='profilePhoto'
                onChange={handleFileChange}
                accept='image/jpeg,image/jpg,image/png'
                className='w-full outline-none bg-transparent text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700'
              />
              <p className='text-xs text-gray-400 mt-1'>JPG/PNG, Max 2MB</p>
            </div>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
            {[
              { label: 'First Name', name: 'firstName', required: true },
              { label: 'Last Name', name: 'lastName', required: true },
              {
                label: 'Email Address',
                name: 'email',
                type: 'email',
                required: true,
              },
              {
                label: 'Phone Number',
                name: 'phoneNumber',
                type: 'tel',
                required: true,
              },
              {
                label: 'Date of Birth',
                name: 'dateOfBirth',
                type: 'date',
                required: true,
              },
              { label: 'Age', name: 'age', disabled: true, required: true },
              {
                label: 'Height',
                name: 'height',
                placeholder: 'e.g., 5.10 or 180cm',
                required: true,
              },
              {
                label: 'Weight',
                name: 'weight',
                placeholder: 'e.g., 175 lbs or 70kg',
                required: true,
              },
            ].map((field, index) => (
              <div key={field.name} className='bg-[#00000061] p-2 rounded'>
                <label className='block font-medium mb-1'>
                  {field.label}
                  <span className='text-red-500'>
                    {field.required ? '*' : ''}
                  </span>
                </label>
                <input
                  type={field.type || 'text'}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleInputChange}
                  placeholder={
                    field.placeholder || `Enter ${field.label.toLowerCase()}`
                  }
                  disabled={field.disabled}
                  className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
                  required={!field.required}
                />
              </div>
            ))}

            {/* Country Dropdown */}
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-1'>
                Country / Nationality<span className='text-red-500'>*</span>
              </label>
              <select
                name='country'
                value={formData.country}
                onChange={handleInputChange}
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

            {/* Gender Dropdown */}
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-1'>
                Gender <span className='text-red-500'>*</span>
              </label>
              <select
                name='gender'
                value={formData.gender}
                onChange={handleInputChange}
                className='w-full outline-none bg-transparent text-white'
                required
              >
                <option value='' className='text-black'>
                  Select Gender
                </option>
                <option value='Male' className='text-black'>
                  Male
                </option>
                <option value='Female' className='text-black'>
                  Female
                </option>
                <option value='Other' className='text-black'>
                  Other
                </option>
              </select>
            </div>
          </div>
          {/* Gym Information */}
          <div className='flex items-center gap-2 mb-4'>
            <Dumbbell className='w-6 h-6 text-orange-400' />
            <h2 className='font-bold uppercase text-lg'>Gym Information</h2>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-1'>Gym Name</label>
              <input
                type='text'
                name='gymName'
                value={formData.gymName}
                onChange={handleInputChange}
                placeholder='e.g., Elite Training Center'
                className='w-full outline-none bg-transparent text-white'
              />
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-1'>Gym Location</label>
              <select
                name='gymLocation'
                value={formData.gymLocation}
                onChange={handleInputChange}
                className='w-full outline-none bg-transparent text-white'
              >
                <option value='' className='text-black'>
                  Select Location
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
                Years of Experience<span className='text-red-500'>*</span>
              </label>
              <select
                name='yearsOfExperience'
                value={formData.yearsOfExperience}
                onChange={handleInputChange}
                className='w-full outline-none bg-transparent text-white'
                required
              >
                <option value='' className='text-black'>
                  Select Experience
                </option>
                <option value='1' className='text-black'>
                  1 year
                </option>
                <option value='2' className='text-black'>
                  2 years
                </option>
                <option value='3' className='text-black'>
                  3 years
                </option>
                <option value='5' className='text-black'>
                  5 years
                </option>
                <option value='10+' className='text-black'>
                  10+ years
                </option>
              </select>
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-1'>
                Trainer Type<span className='text-red-500'>*</span>
              </label>
              <select
                name='trainerType'
                value={formData.trainerType}
                onChange={handleInputChange}
                className='w-full outline-none bg-transparent text-white'
                required
              >
                <option value='' className='text-black'>
                  Select Trainer Type
                </option>
                <option value='coach' className='text-black'>
                  Coach
                </option>
                <option value='cutman' className='text-black'>
                  Cutman
                </option>
                <option value='assistant' className='text-black'>
                  Assistant
                </option>
              </select>
            </div>
          </div>
          {/* Fighting Styles */}
          <div className='mb-6 bg-[#00000061] p-4 rounded'>
            <label className='block font-medium mb-2'>
              Preferred Fighting Styles<span className='text-red-500'>*</span>
            </label>
            <div className='grid grid-cols-3 md:grid-cols-4 gap-2'>
              {fightingStyles.map((style) => (
                <div key={style} className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    name='preferredRuleSets'
                    value={style.toLowerCase().replace(' ', '-')}
                    checked={formData.preferredRuleSets.includes(
                      style.toLowerCase().replace(' ', '-')
                    )}
                    onChange={handleInputChange}
                    className='rounded text-yellow-400 bg-gray-700 border-gray-600 focus:ring-yellow-400'
                  />
                  <label>{style}</label>
                </div>
              ))}
            </div>
          </div>
          {/* Credentials */}
          <div className='flex items-center gap-2 mb-4'>
            <Award className='w-6 h-6 text-orange-400' />
            <h2 className='font-bold uppercase text-lg'>Credentials</h2>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-1'>Certifications</label>
              <input
                type='file'
                name='certification'
                onChange={handleFileChange}
                accept='.pdf,image/jpeg,image/jpg'
                className='w-full outline-none bg-transparent text-white'
              />
              <p className='text-xs text-gray-400 mt-1'>PDF/JPG, Max 5MB</p>
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-1'>
                Bio / Achievements
              </label>
              <textarea
                name='bio'
                value={formData.bio}
                onChange={handleInputChange}
                placeholder='Describe your career achievements'
                rows='4'
                className='w-full outline-none bg-transparent text-white resize-none'
              />
              <p className='text-xs text-gray-400 mt-1'>Max 1000 characters</p>
            </div>
          </div>
          {/* Social Media */}
          <div className='flex items-center gap-2 mb-4'>
            <Share className='text-yellow-400' />
            <h2 className='font-bold uppercase text-lg'>Social Media</h2>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-1'>Instagram URL</label>
              <input
                type='url'
                name='instagram'
                value={formData.instagram}
                onChange={handleInputChange}
                placeholder='https://instagram.com/username'
                className='w-full outline-none bg-transparent text-white'
              />
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-1'>Facebook URL</label>
              <input
                type='url'
                name='facebook'
                value={formData.facebook}
                onChange={handleInputChange}
                placeholder='https://facebook.com/username'
                className='w-full outline-none bg-transparent text-white'
              />
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-1'>YouTube URL</label>
              <input
                type='url'
                name='youtube'
                value={formData.youtube}
                onChange={handleInputChange}
                placeholder='https://youtube.com/channel'
                className='w-full outline-none bg-transparent text-white'
              />
            </div>
          </div>
          {/* Emergency Contact */}
          <div className='flex items-center gap-2 mb-4'>
            <Phone className='w-6 h-6 text-green-400' />
            <h2 className='font-bold uppercase text-lg'>Emergency Contact</h2>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-1'>
                Emergency Contact Name<span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                name='emergencyContactName'
                value={formData.emergencyContactName}
                onChange={handleInputChange}
                placeholder='Full Name'
                className='w-full outline-none bg-transparent text-white'
                required
              />
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-1'>
                Emergency Contact Number<span className='text-red-500'>*</span>
              </label>
              <input
                type='tel'
                name='emergencyContactNumber'
                value={formData.emergencyContactNumber}
                onChange={handleInputChange}
                placeholder='+1 555-123-4567'
                className='w-full outline-none bg-transparent text-white'
                required
              />
            </div>
          </div>
          {/* Associated Fighters */}
          <div className='flex items-center gap-2 mb-4'>
            <User2 className='w-6 h-6 text-violet-400' />
            <h2 className='font-bold uppercase text-lg'>Associated Fighters</h2>
          </div>{' '}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
            <Autocomplete
              label='Search Fighter'
              multiple
              selected={formData.affiliatedFighters}
              onChange={(value) =>
                handleAutocompleteChange('affiliatedFighters', value)
              }
              options={fighters.map((fighter) => ({
                label:
                  fighter.userId?.firstName +
                  ' ' +
                  fighter.userId?.lastName +
                  ' (' +
                  fighter.userId?.email +
                  ')',
                value: fighter._id,
              }))}
              placeholder='Search fighter name'
            />
          </div>
          {/* Event Information */}
          <div className='flex items-center gap-2 mb-4'>
            <Calendar className='w-6 h-6 text-violet-400' />
            <h2 className='font-bold uppercase text-lg'>Event Information</h2>
          </div>{' '}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
            <Autocomplete
              label='Search Events'
              multiple
              selected={formData.associatedEvents}
              onChange={(value) =>
                handleAutocompleteChange('associatedEvents', value)
              }
              options={[
                ...events.map((event) => ({
                  label: event.name,
                  value: event._id,
                })),
              ]}
              placeholder='Search event name'
            />

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-1'>
                Accreditation Type
              </label>
              <select
                name='accreditationType'
                value={formData.accreditationType}
                onChange={handleInputChange}
                className='w-full outline-none bg-transparent text-white'
              >
                <option value='' className='text-black'>
                  Select Role
                </option>
                <option value='coach' className='text-black'>
                  Coach
                </option>
                <option value='cutman' className='text-black'>
                  Cutman
                </option>
                <option value='assistant' className='text-black'>
                  Assistant
                </option>
              </select>
            </div>
          </div>
          {/* Suspension Information */}
          <div className='flex items-center gap-2 mb-4'>
            <AlertTriangle className='w-6 h-6 text-yellow-400' />
            <h2 className='font-bold uppercase text-lg'>
              Suspension Information
            </h2>
          </div>
          <div className='mb-6 bg-[#00000061] p-2 rounded'>
            <div className='flex items-center gap-2 mb-4'>
              <input
                type='checkbox'
                name='isSuspended'
                checked={formData.isSuspended}
                onChange={handleInputChange}
                className='rounded text-yellow-400 bg-gray-700 border-gray-600 focus:ring-yellow-400'
              />
              <label>Is Suspended?</label>
            </div>

            {formData.isSuspended && (
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='bg-[#00000030] p-2 rounded'>
                  <label className='block font-medium mb-1'>
                    Suspension Type
                  </label>
                  <select
                    name='suspensionType'
                    value={formData.suspensionType}
                    onChange={handleInputChange}
                    className='w-full outline-none bg-transparent text-white'
                  >
                    <option value='' className='text-black'>
                      Select Reason
                    </option>
                    <option value='Disciplinary' className='text-black'>
                      Disciplinary
                    </option>
                    <option value='Medical' className='text-black'>
                      Medical
                    </option>
                    <option value='administrative' className='text-black'>
                      Administrative
                    </option>
                  </select>
                </div>

                <div className='bg-[#00000030] p-2 rounded'>
                  <label className='block font-medium mb-1'>Start Date</label>
                  <input
                    type='date'
                    name='suspensionStartDate'
                    value={formData.suspensionStartDate}
                    onChange={handleInputChange}
                    className='w-full outline-none bg-transparent text-white'
                  />
                </div>

                <div className='bg-[#00000030] p-2 rounded'>
                  <label className='block font-medium mb-1'>End Date</label>
                  <input
                    type='date'
                    name='suspensionEndDate'
                    value={formData.suspensionEndDate}
                    onChange={handleInputChange}
                    className='w-full outline-none bg-transparent text-white'
                  />
                </div>

                <div className='md:col-span-3 bg-[#00000030] p-2 rounded'>
                  <label className='block font-medium mb-1'>
                    Suspension Notes
                  </label>
                  <textarea
                    name='suspensionNotes'
                    value={formData.suspensionNotes}
                    onChange={handleInputChange}
                    placeholder='Max 200 characters'
                    rows='3'
                    className='w-full outline-none bg-transparent text-white resize-none'
                    minLength={10}
                  />
                </div>

                <div className='md:col-span-3 flex items-center gap-2'>
                  <input
                    type='checkbox'
                    name='medicalClearance'
                    checked={formData.medicalClearance}
                    onChange={handleInputChange}
                    className='rounded text-yellow-400 bg-gray-700 border-gray-600 focus:ring-yellow-400'
                  />
                  <label>Medical Clearance Required</label>
                </div>

                {formData.medicalClearance && (
                  <div className='md:col-span-3 bg-[#00000030] p-2 rounded'>
                    <label className='block font-medium mb-1'>
                      Medical Documentation
                    </label>
                    <input
                      type='file'
                      name='medicalDocument'
                      onChange={handleFileChange}
                      accept='.pdf,image/jpeg,image/jpg'
                      className='w-full outline-none bg-transparent text-white'
                    />
                    <p className='text-xs text-gray-400 mt-1'>
                      PDF/JPG, Max 5MB
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Actions */}
          <div className='flex justify-center gap-4 mt-6'>
            <button
              type='submit'
              className='bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded transition duration-200'
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TrainerProfileForm
