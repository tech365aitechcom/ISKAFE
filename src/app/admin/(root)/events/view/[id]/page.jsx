'use client'
import React, { use, useEffect, useState } from 'react'
import {
  ChevronDown,
  Edit,
  Pencil,
  Plus,
  Trash2,
  Save,
  Ticket,
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { API_BASE_URL } from '../../../../../../constants'
import Loader from '../../../../../_components/Loader'
import Image from 'next/image'
import axiosInstance from '../../../../../../shared/axios'
import TournamentSettingsModal from '../../_components/TournamentSettingsModal'
import { enqueueSnackbar } from 'notistack'

export default function EventDetailsPage({ params }) {
  // const router = useRouter();
  const { id } = use(params)

  const [eventId, setEventId] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [settingsModalVisible, setSettingsModalVisible] = useState(false)
  const [tournamentSettings, setTournamentSettings] = useState({
    simpleFees: {
      fighterFee: 0,
      trainerFee: 0,
      currency: '$',
    },
    detailedFees: [],
    bracketSettings: {
      maxFightersPerBracket: 0,
    },
    ruleStyles: {
      semiContact: [],
      fullContact: [],
    },
    numBrackets: 0,
  })
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [spectatorTickets, setSpectatorTickets] = useState(null)
  const [ticketsLoading, setTicketsLoading] = useState(false)
  const [showTierForm, setShowTierForm] = useState(false)
  const [editingTier, setEditingTier] = useState(null)
  const [editingTierIndex, setEditingTierIndex] = useState(null)
  const [saleMode, setSaleMode] = useState('Online')
  const [currentTier, setCurrentTier] = useState({
    order: 1,
    name: '',
    price: 0,
    capacity: 0,
    remaining: 0,
    description: '',
    availabilityMode: 'Online',
    salesStartDate: new Date().toISOString(),
    salesEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    limitPerUser: 2,
    refundPolicyNotes: '',
  })

  const initializeTournamentSettings = async (eventId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tournament-setting`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: eventId,
          simpleFees: {
            fighterFee: 0,
            trainerFee: 0,
            currency: '$',
          },
          detailedFees: [],
          bracketSettings: {
            maxFightersPerBracket: 0,
          },
          ruleStyles: {
            semiContact: [],
            fullContact: [],
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error(`API Error ${response.status}:`, errorData)
        throw new Error(
          `Failed to initialize tournament settings: ${response.status} - ${errorData}`
        )
      }

      const data = await response.json()
      return data.data || data
    } catch (err) {
      console.error('Error initializing tournament settings:', err)
      throw err
    }
  }

  const fetchSpectatorTickets = async (id) => {
    try {
      setTicketsLoading(true)
      const response = await axiosInstance.get(`/spectator-ticket/${id}`)

      if (response.data.success) {
        setSpectatorTickets(response.data.data)
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setSpectatorTickets(null)
      } else {
        console.error('Error fetching spectator tickets:', err)
        setSpectatorTickets(null)
      }
    } finally {
      setTicketsLoading(false)
    }
  }

  const handleAddNewTier = () => {
    const nextOrder = spectatorTickets?.tiers
      ? spectatorTickets.tiers.length + 1
      : 1

    setCurrentTier({
      order: nextOrder,
      name: '',
      price: 0,
      capacity: 0,
      remaining: 0,
      description: '',
      availabilityMode: 'Online',
      salesStartDate: '',
      salesEndDate: '',
      limitPerUser: 0,
      refundPolicyNotes: '',
    })
    setEditingTier(null)
    setEditingTierIndex(null)
    // Reset date tracking for new tier
    setOriginalDates({ startDate: null, endDate: null })
    setDateModified({ startDate: false, endDate: false })
    setShowTierForm(true)
  }

  const handleEditTier = (tier, index) => {
    setCurrentTier({ ...tier })
    setEditingTier(tier)
    setEditingTierIndex(index)
    // Initialize date tracking - mark as unmodified when editing starts
    setOriginalDates({
      startDate: tier.salesStartDate,
      endDate: tier.salesEndDate,
    })
    setDateModified({ startDate: false, endDate: false })
    setShowTierForm(true)
  }

  // Track original dates to avoid validation on unmodified dates
  const [originalDates, setOriginalDates] = useState({
    startDate: null,
    endDate: null,
  })
  const [dateModified, setDateModified] = useState({
    startDate: false,
    endDate: false,
  })

  const validateTier = () => {
    const errors = []

    if (!currentTier.name.trim()) {
      errors.push('Tier name is required')
    } else if (currentTier.name.length > 64) {
      errors.push('Tier name must be 64 characters or less')
    }

    if (currentTier.description.length > 250) {
      errors.push('Description must be 250 characters or less')
    }

    if (currentTier.price <= 0) {
      errors.push('Price must be greater than 0')
    }

    if (!currentTier.capacity || currentTier.capacity <= 0) {
      errors.push('Capacity is required and must be greater than 0')
    }

    if (currentTier.remaining < 0) {
      errors.push('Remaining tickets cannot be negative')
    }

    if (currentTier.remaining > currentTier.capacity) {
      errors.push('Remaining tickets cannot exceed total capacity')
    }

    if (!currentTier.limitPerUser || currentTier.limitPerUser <= 0) {
      errors.push('Limit per user is required and must be greater than 0')
    }

    if (!currentTier.salesStartDate) {
      errors.push('Sales start date and time is required')
    }

    if (!currentTier.salesEndDate) {
      errors.push('Sales end date and time is required')
    }

    if (currentTier.salesStartDate && currentTier.salesEndDate) {
      const startDate = new Date(currentTier.salesStartDate)
      const endDate = new Date(currentTier.salesEndDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Set to start of today for comparison
      startDate.setHours(0, 0, 0, 0) // Normalize start date for comparison

      // Only validate start date if it was modified during editing
      if (dateModified.startDate && startDate < today) {
        errors.push('Sales start date must be today or in the future')
      }

      if (startDate >= endDate) {
        errors.push('Sales end date must be after the sales start date')
      }
    }

    return errors
  }

  const saveTier = async () => {
    const validationErrors = validateTier()
    if (validationErrors.length > 0) {
      // Create a more user-friendly error display
      const errorList = validationErrors
        .map((error, index) => `${index + 1}. ${error}`)
        .join('\n')
      enqueueSnackbar(
        `Please fix the following errors before saving:\n\n${errorList}`,
        {
          variant: 'error',
        }
      )
      return
    }

    try {
      setTicketsLoading(true)

      let updatedTiers = []
      if (spectatorTickets?.tiers) {
        if (editingTier && editingTierIndex !== null) {
          // Update existing tier - ensure proper data structure
          const updatedTier = {
            ...currentTier,
            price: Math.round(currentTier.price),
            capacity: parseInt(currentTier.capacity),
            remaining: parseInt(currentTier.remaining),
            limitPerUser: parseInt(currentTier.limitPerUser),
            order: parseInt(currentTier.order),
          }
          updatedTiers = spectatorTickets.tiers.map((tier, index) =>
            index === editingTierIndex ? updatedTier : tier
          )
        } else {
          // Add new tier
          const newTier = {
            ...currentTier,
            price: Math.round(currentTier.price),
            capacity: parseInt(currentTier.capacity),
            remaining: parseInt(currentTier.capacity), // New tier starts with full capacity
            limitPerUser: parseInt(currentTier.limitPerUser),
            order: parseInt(currentTier.order),
          }
          updatedTiers = [...spectatorTickets.tiers, newTier]
        }
      } else {
        // First tier
        const firstTier = {
          ...currentTier,
          price: Math.round(currentTier.price),
          capacity: parseInt(currentTier.capacity),
          remaining: parseInt(currentTier.capacity),
          limitPerUser: parseInt(currentTier.limitPerUser),
          order: parseInt(currentTier.order),
        }
        updatedTiers = [firstTier]
      }

      let response
      const requestData = {
        eventId: eventId,
        tiers: updatedTiers,
      }

      console.log('Sending request data:', requestData) // Debug log

      if (spectatorTickets) {
        // Update existing
        response = await axiosInstance.put(
          `/spectator-ticket/${eventId}`,
          requestData
        )
      } else {
        // Create new
        response = await axiosInstance.post('/spectator-ticket', requestData)
      }

      if (response.data.success) {
        setSpectatorTickets(response.data.data)
        setShowTierForm(false)
        // Reset tracking states
        setDateModified({ startDate: false, endDate: false })
        setOriginalDates({ startDate: null, endDate: null })
        enqueueSnackbar(
          editingTier
            ? 'Tier updated successfully!'
            : 'Tier added successfully!',
          {
            variant: 'success',
          }
        )
      }
    } catch (err) {
      console.error('Error saving tier:', err)
      // More detailed error message
      const errorMessage =
        err.response?.data?.message || err.message || 'Unknown error occurred'
      enqueueSnackbar(`Error saving tier: ${errorMessage}`, {
        variant: 'error',
      })
    } finally {
      setTicketsLoading(false)
    }
  }

  const toggleTierAvailability = async (tierIndex, currentMode) => {
    try {
      setTicketsLoading(true)

      // Toggle between Online and OnSite
      const newMode = currentMode === 'Online' ? 'OnSite' : 'Online'

      // Update the tier with new availability mode
      const updatedTiers = spectatorTickets.tiers.map((tier, index) => {
        if (index === tierIndex) {
          return {
            ...tier,
            availabilityMode: newMode,
            price:
              typeof tier.price === 'number'
                ? tier.price
                : Math.round(tier.price || 0),
            capacity: parseInt(tier.capacity) || 0,
            remaining: parseInt(tier.remaining) || 0,
            limitPerUser: parseInt(tier.limitPerUser) || 1,
            order: parseInt(tier.order) || 1,
          }
        }
        return {
          ...tier,
          price:
            typeof tier.price === 'number'
              ? tier.price
              : Math.round(tier.price || 0),
          capacity: parseInt(tier.capacity) || 0,
          remaining: parseInt(tier.remaining) || 0,
          limitPerUser: parseInt(tier.limitPerUser) || 1,
          order: parseInt(tier.order) || 1,
        }
      })

      const requestData = {
        eventId: eventId,
        tiers: updatedTiers,
      }

      const response = await axiosInstance.put(
        `/spectator-ticket/${eventId}`,
        requestData
      )

      if (response.data.success) {
        setSpectatorTickets(response.data.data)
        // Show success feedback
        const modeText = newMode === 'Online' ? 'Online Only' : 'On-Site Only'
        enqueueSnackbar(`Tier availability updated to ${modeText}`, {
          variant: 'success',
        })
      }
    } catch (err) {
      console.error('Error updating tier availability:', err)
      const errorMessage =
        err.response?.data?.message || err.message || 'Unknown error occurred'
      enqueueSnackbar(`Error updating availability: ${errorMessage}`, {
        variant: 'error',
      })
    } finally {
      setTicketsLoading(false)
    }
  }

  const deleteTier = async () => {
    if (!editingTier || editingTierIndex === null) return

    if (
      !confirm(
        'Are you sure you want to delete this tier? This action cannot be undone.'
      )
    )
      return

    try {
      setTicketsLoading(true)

      // Remove the tier by index
      const filteredTiers = spectatorTickets.tiers.filter(
        (_, index) => index !== editingTierIndex
      )

      // Ensure proper data structure for remaining tiers
      const updatedTiers = filteredTiers.map((tier) => ({
        ...tier,
        price:
          typeof tier.price === 'number'
            ? tier.price
            : Math.round(tier.price || 0),
        capacity: parseInt(tier.capacity) || 0,
        remaining: parseInt(tier.remaining) || 0,
        limitPerUser: parseInt(tier.limitPerUser) || 1,
        order: parseInt(tier.order) || 1,
      }))

      console.log('Original tiers:', spectatorTickets.tiers.length)
      console.log('Updated tiers:', updatedTiers.length)
      console.log('Deleting tier at index:', editingTierIndex)

      if (updatedTiers.length === 0) {
        // If no tiers left, delete the entire spectator ticket
        const response = await axiosInstance.delete(
          `/spectator-ticket/${eventId}`
        )

        if (
          response.data.success ||
          response.status === 200 ||
          response.status === 204
        ) {
          setSpectatorTickets(null)
          setShowTierForm(false)
          setEditingTier(null)
          setEditingTierIndex(null)
          enqueueSnackbar('All tiers deleted. Spectator tickets removed!')
        } else {
          throw new Error('Failed to delete spectator ticket')
        }
      } else {
        // Update with remaining tiers - ensure proper request structure
        const requestData = {
          eventId: eventId,
          tiers: updatedTiers,
        }

        console.log('Sending delete request with data:', requestData)

        const response = await axiosInstance.put(
          `/spectator-ticket/${eventId}`,
          requestData
        )

        if (response.data.success) {
          setSpectatorTickets(response.data.data)
          setShowTierForm(false)
          setEditingTier(null)
          setEditingTierIndex(null)
          // Reset tracking states
          setDateModified({ startDate: false, endDate: false })
          setOriginalDates({ startDate: null, endDate: null })
          enqueueSnackbar('Tier deleted successfully!', {
            variant: 'success',
          })
        } else {
          throw new Error(
            response.data.message || 'Failed to update tiers after deletion'
          )
        }
      }
    } catch (err) {
      console.error('Error deleting tier:', err)
      // More detailed error message
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Unknown error occurred during tier deletion'
      enqueueSnackbar(
        `Error deleting tier: ${errorMessage}\n\nPlease try again or contact support if the problem persists.`,
        {
          variant: 'error',
        }
      )
    } finally {
      setTicketsLoading(false)
    }
  }

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    if (id) {
      setEventId(id)
      fetchEventData(id)
    }
  }, [id])

  useEffect(() => {
    if (eventId) {
      fetchTournamentSettings(eventId)
      fetchSpectatorTickets(eventId)
    }
  }, [eventId])

  const fetchTournamentSettings = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tournament-setting/${id}`)

      if (response.status === 404) {
        // Settings don't exist, initialize them
        try {
          const initializedSettings = await initializeTournamentSettings(id)
          setTournamentSettings({
            simpleFees: initializedSettings.simpleFees || {
              fighterFee: 0,
              trainerFee: 0,
              currency: '$',
            },
            bracketSettings: initializedSettings.bracketSettings || {
              maxFightersPerBracket: 0,
            },
            numBrackets: initializedSettings.numBrackets || 0,
          })
        } catch (initError) {
          console.error('Failed to initialize tournament settings:', initError)
          // Set default values even if initialization fails
          setTournamentSettings({
            simpleFees: {
              fighterFee: 0,
              trainerFee: 0,
              currency: '$',
            },
            bracketSettings: {
              maxFightersPerBracket: 0,
            },
            numBrackets: 0,
          })
        }
        return
      }

      if (!response.ok) {
        const errorData = await response.text()
        console.error(`API Error ${response.status}:`, errorData)
        throw new Error(
          `Failed to fetch tournament settings: ${response.status}`
        )
      }

      const data = await response.json()
      if (data.success) {
        setTournamentSettings({
          simpleFees: data.data.simpleFees || {
            fighterFee: 0,
            trainerFee: 0,
            currency: '$',
          },
          bracketSettings: data.data.bracketSettings || {
            maxFightersPerBracket: 0,
          },
          numBrackets: data.data.numBrackets || 0,
        })
      }
    } catch (err) {
      console.error('Error fetching tournament settings:', err)
      // Set default values if everything fails
      setTournamentSettings({
        simpleFees: {
          fighterFee: 0,
          trainerFee: 0,
          currency: '$',
        },
        bracketSettings: {
          maxFightersPerBracket: 0,
        },
        numBrackets: 0,
      })
    }
  }

  const fetchEventData = async (id) => {
    try {
      setLoading(true)
      const response = await axiosInstance.get(`/events/${id}`)
      if (response.data.success) {
        setEvent(response.data.data)
      } else {
        throw new Error(response.data.message || 'Error fetching event')
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatAddress = (address) => {
    if (!address) return 'N/A'
    if (typeof address === 'string') return address

    const { street1, street2, city, state, postalCode, country } = address
    return [street1, street2, `${city}, ${state} ${postalCode}`, country]
      .filter(Boolean)
      .join(', ')
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen w-full bg-[#07091D]'>
        <Loader />
      </div>
    )
  }

  if (error) {
    return (
      <div className='text-white p-8 flex justify-center'>
        <div className='bg-[#0B1739] bg-opacity-80 rounded-lg p-10 shadow-lg w-full'>
          <p className='text-red-500'>Error: {error}</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className='text-white p-8 flex justify-center'>
        <div className='bg-[#0B1739] bg-opacity-80 rounded-lg p-10 shadow-lg w-full'>
          <p>Event not found</p>
        </div>
      </div>
    )
  }

  console.log('Fetched event data:', event) // Debug log

  // Format the event data to match your component's structure
  const formattedEvent = {
    name: event.name,
    poster: event.poster,
    format: event.format,
    koPolicy: event.koPolicy,
    sportType: event.sportType,
    startDate: formatDate(event.startDate),
    endDate: formatDate(event.endDate),
    registrationStartDate: formatDate(event.registrationStartDate),
    registrationDeadline: formatDate(event.registrationDeadline),
    weighInDateTime: formatDateTime(event.weighInDateTime),
    rulesMeetingTime: event.rulesMeetingTime || 'N/A',
    spectatorDoorsOpenTime: event.spectatorDoorsOpenTime || 'N/A',
    fightStartTime: event.fightStartTime || 'N/A',
    promoter: {
      name: event.promoter?.userId?.name || 'N/A',
      abbreviation: event.promoter?.abbreviation || 'N/A',
      website: event.promoter?.websiteURL || 'N/A',
      about: event.promoter?.aboutUs || 'N/A',
      sanctioningBody: event.promoter?.sanctioningBody || 'N/A',
      contactPerson: event.promoter?.contactPersonName || 'N/A',
      phone: event.promoter?.userId?.phoneNumber || 'N/A',
      alternatePhone: event.promoter?.alternatePhoneNumber || 'N/A',
      email: event.promoter?.userId?.email || 'N/A',
    },
    iskaRep: {
      name: event.iskaRepName || 'N/A',
      phone: event.iskaRepPhone || 'N/A',
    },
    venue: {
      name: event.venue?.name || 'N/A',
      contactName: event.venue?.contactName || 'N/A',
      contactPhone: event.venue?.contactPhone || 'N/A',
      contactEmail: event.venue?.contactEmail || 'N/A',
      capacity: event.venue?.capacity || 'N/A',
      mapLink: event.venue?.mapLink || 'N/A',
      address: formatAddress(event.venue?.address),
    },
    shortDescription: event.briefDescription || 'N/A',
    fullDescription: event.fullDescription || 'N/A',
    rules: event.rules || 'N/A',
    matchingMethod: event.matchingMethod || 'N/A',
    sanctioning: {
      name: event.sectioningBodyName || 'N/A',
      description: event.sectioningBodyDescription || 'N/A',
      image: event.sectioningBodyImage || null,
    },
    ageCategories:
      event.ageCategories?.length > 0 ? event.ageCategories.join(', ') : 'N/A',
    weightClasses:
      event.weightClasses?.length > 0 ? event.weightClasses.join(', ') : 'N/A',
    status: {
      isDraft: event.isDraft ? 'Yes' : 'No',
      publishBrackets: event.publishBrackets ? 'Yes' : 'No',
    },
    createdBy:
      `${event.createdBy?.firstName || ''} ${
        event.createdBy?.lastName || ''
      }`.trim() || 'N/A',
    createdAt: formatDateTime(event.createdAt),
    updatedAt: formatDateTime(event.updatedAt),
    stats: {
      bracketCount: {
        value: `${event.bracketCount || 0}`,
      },
      boutCount: {
        value: `${event.boutCount || 0}`,
      },
      registrationFee: {
        fighter: '$0',
        trainer: '$0',
        breakdown: 'No breakdown available',
      },
      participants: {
        value: event.registeredParticipants || 0,
        breakdown: `Fighters: ${event.registeredFighters?.length || 0}`,
      },
      spectatorPayments: {
        totalFee: event.totalFee || 0,
        totalCollected: event.totalSpectatorTicketAmount || 0,
        totalNetRevenue: event.totalNetRevenue || 0,
        breakdown: 'No payments recorded',
      },
      registrationPayments: {
        totalCollected: event.totalRegistrationFees,
        totalParticipants: event.registeredParticipants || 0,
        breakdown: 'No payments recorded',
      },
      tournamentSettings: {
        simpleFees: {
          fighterFee: 0,
          trainerFee: 0,
          currency: '$',
        },
        bracketSettings: {
          maxFightersPerBracket: 'N/A',
        },
        numBrackets: 'N/A',
      },
    },
  }

  return (
    <div className='text-white p-8 flex justify-center relative overflow-hidden'>
      <div
        className='absolute -left-10 top-1/2 transform -translate-y-1/2 w-60 h-96 rounded-full opacity-70 blur-xl'
        style={{
          background:
            'linear-gradient(317.9deg, #6F113E 13.43%, rgba(111, 17, 62, 0) 93.61%)',
        }}
      ></div>
      <div className='bg-[#0B1739] bg-opacity-80 rounded-lg p-10 shadow-lg w-full z-50'>
        <div className='flex justify-between mb-6'>
          {/* Header with back button */}
          <div className='flex items-center gap-4 '>
            <Link href={`/admin/events`}>
              <button className='mr-2'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-6 w-6'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M10 19l-7-7m0 0l7-7m-7 7h18'
                  />
                </svg>
              </button>
            </Link>
            <h1 className='text-2xl font-bold'>{formattedEvent.name}</h1>
          </div>
          <div className='relative w-64'>
            {/* Dropdown Button */}
            <button
              onClick={toggleDropdown}
              className='flex items-center justify-between w-full px-4 py-2 bg-[#0A1330] border border-white rounded-lg'
            >
              <span>Features</span>
              <ChevronDown
                size={16}
                className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <div className='absolute w-full mt-2 bg-[#081028] shadow-lg z-10'>
                <ul className='py-1'>
                  <Link href={`/admin/events/${eventId}/fighter-checkin`}>
                    <li className='mx-4 py-3 border-b border-[#6C6C6C] hover:bg-[#0f1a40] cursor-pointer'>
                      Fighter Check-in
                    </li>
                  </Link>
                  <Link href={`/admin/events/${eventId}/bout-list`}>
                    <li className='mx-4 py-3 border-b border-[#6C6C6C] hover:bg-[#0f1a40] cursor-pointer'>
                      Bout List
                    </li>
                  </Link>
                  <Link href={`/admin/events/${eventId}/tournament-results`}>
                    <li className='mx-4 py-3 border-b border-[#6C6C6C] hover:bg-[#0f1a40] cursor-pointer'>
                      Tournament Result
                    </li>
                  </Link>
                  <Link href={`/admin/events/${eventId}/tournament-brackets`}>
                    <li className='mx-4 py-3 border-b border-[#6C6C6C] hover:bg-[#0f1a40] cursor-pointer'>
                      Fight Card
                    </li>
                  </Link>
                  <Link href={`/admin/events/${eventId}/participants`}>
                    <li className='mx-4 py-3 border-b border-[#6C6C6C] hover:bg-[#0f1a40] cursor-pointer'>
                      Competitor Listing
                    </li>
                  </Link>
                  <Link href={`/admin/events/${eventId}/registration-payments`}>
                    <li className='mx-4 py-3 border-b border-[#6C6C6C] hover:bg-[#0f1a40] cursor-pointer'>
                      Registration Payments
                    </li>
                  </Link>
                  <Link href={`/admin/events/${eventId}/spectator-payments`}>
                    <li className='mx-4 py-3 border-b border-[#6C6C6C] hover:bg-[#0f1a40] cursor-pointer'>
                      Spectator Payments
                    </li>
                  </Link>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
          {/* Bout Management */}
          <div className='border border-[#343B4F] rounded-lg p-4 relative'>
            <div className='flex justify-between items-start'>
              <span className='text-sm text-[#AEB9E1]'>
                Tournament Brackets & Bouts
              </span>
              <Link href={`/admin/events/${eventId}/tournament-brackets`}>
                <button
                  className='hover:text-blue-400'
                  title='Manage Tournament Brackets & Bouts'
                >
                  <Pencil size={16} />
                </button>
              </Link>
            </div>
            <div className='mt-2'>
              <h2 className='text-2xl font-bold'>
                {formattedEvent.stats.bracketCount.value} Brackets ,
                {formattedEvent.stats.boutCount.value} Bouts
              </h2>
              <p className='text-sm text-[#AEB9E1] mt-2 whitespace-pre-line'>
                Click to manage brackets and bouts
              </p>
            </div>
          </div>

          <div className='border border-[#343B4F] rounded-lg p-4 relative'>
            <div className='flex justify-between items-start'>
              <span className='text-sm text-[#AEB9E1]'>
                Registration Payments
              </span>
              <Link href={`/admin/events/${eventId}/registration-payments`}>
                <button className=''>
                  <Pencil size={16} />
                </button>
              </Link>
            </div>
            <div className='mt-2'>
              <h2 className='text-2xl font-bold'>
                ${formattedEvent.stats.registrationPayments.totalCollected}
              </h2>
              <p className='text-sm text-[#AEB9E1] mt-2 whitespace-pre-line'>
                Participants:{' '}
                {formattedEvent.stats.registrationPayments.totalParticipants}
              </p>
            </div>
          </div>
          <div className='border border-[#343B4F] rounded-lg p-4 relative'>
            <div className='flex justify-between items-start'>
              <span className='text-sm text-[#AEB9E1]'>Spectator Payments</span>
              <Link href={`/admin/events/${eventId}/spectator-payments`}>
                <button className=''>
                  <Pencil size={16} />
                </button>
              </Link>
            </div>
            <div className='mt-2'>
              <h2 className='text-2xl font-bold'>
                ${formattedEvent.stats.spectatorPayments.totalCollected}
              </h2>
              <div className='flex justify-between items-center'>
                <p className='text-sm text-[#AEB9E1] mt-2 whitespace-pre-line'>
                  Total Fee: ${formattedEvent.stats.spectatorPayments.totalFee}
                </p>
                <p className='text-sm text-[#AEB9E1] mt-2 whitespace-pre-line'>
                  Net Revenue: $
                  {formattedEvent.stats.spectatorPayments.totalNetRevenue}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tournament Settings */}
        <div className='border border-[#343B4F] rounded-lg p-4 relative mb-6'>
          <div className='flex justify-between items-start'>
            <h2 className='font-bold text-lg'>Tournament Settings</h2>
            <button
              onClick={() => setSettingsModalVisible(true)}
              className='text-white hover:text-gray-300'
            >
              <Pencil size={16} />
            </button>
          </div>
          <div className='mt-2 space-y-2 grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div>
              <p className='text-sm text-[#AEB9E1]'>Fighter Registration Fee</p>
              <p className='font-medium'>
                {tournamentSettings.simpleFees.currency}
                {tournamentSettings.simpleFees.fighterFee}
              </p>
            </div>
            <div>
              <p className='text-sm text-[#AEB9E1]'>Trainer Registration Fee</p>
              <p className='font-medium'>
                {tournamentSettings.simpleFees.currency}
                {tournamentSettings.simpleFees.trainerFee}
              </p>
            </div>
            <div>
              <p className='text-sm text-[#AEB9E1]'>Max Fighters per Bracket</p>
              <p className='font-medium'>
                {tournamentSettings.bracketSettings.maxFightersPerBracket ||
                  'N/A'}
              </p>
            </div>
            <div>
              <p className='text-sm text-[#AEB9E1]'>
                Num Registration Brackets
              </p>
              <p className='font-medium'>
                {formattedEvent.stats.bracketCount.value || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Spectator Ticketing Section */}
        <div className='border border-[#343B4F] rounded-lg p-4 relative mb-6'>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='font-bold text-lg'>SPECTATOR TICKETING</h2>
            <div className='flex items-center gap-4'>
              <button
                onClick={handleAddNewTier}
                className='flex items-center px-4 py-2 bg-gradient-to-r from-[#CB3CFF] to-[#7F25FB] rounded-lg text-sm hover:opacity-90'
              >
                <Plus size={16} className='mr-2' />
                Add New Tier
              </button>
            </div>
          </div>

          {ticketsLoading && (
            <div className='flex justify-center py-8'>
              <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500'></div>
            </div>
          )}

          {!ticketsLoading &&
            (!spectatorTickets ||
              !spectatorTickets.tiers ||
              spectatorTickets.tiers.length === 0) && (
              <div className='text-center py-12 text-[#AEB9E1]'>
                <Ticket size={48} className='mx-auto mb-4 text-[#343B4F]' />
                <h3 className='text-lg font-medium mb-2'>
                  No Ticket Tiers Created
                </h3>
                <p className='mb-4'>
                  Create ticket tiers for spectators to purchase and attend your
                  event
                </p>
              </div>
            )}

          {!ticketsLoading &&
            spectatorTickets?.tiers &&
            spectatorTickets.tiers.length > 0 && (
              <div className='space-y-4'>
                {spectatorTickets.tiers.map((tier, index) => (
                  <div
                    key={index}
                    className='border border-[#343B4F] rounded-lg p-4 bg-[#0A1330]/50'
                  >
                    <div className='flex justify-between items-start'>
                      <div className='flex-1 space-y-3'>
                        {/* Tier Header */}
                        <div className='flex items-center justify-between'>
                          <div>
                            <h4 className='font-medium text-lg text-white'>
                              Tier {tier.order} - {tier.name}
                            </h4>
                            <p className='text-sm text-gray-400 mt-1'>
                              {tier.description}
                            </p>
                          </div>
                          <div className='text-right'>
                            <p className='text-xl font-bold text-[#CB3CFF]'>
                              ${tier.price}
                            </p>
                          </div>
                        </div>

                        {/* Tier Details Grid */}
                        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                          <div>
                            <p className='text-gray-400 mb-1'>Capacity</p>
                            <p className='font-medium'>
                              {tier.capacity.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className='text-gray-400 mb-1'>Remaining</p>
                            <p className='font-medium'>
                              <span
                                className={
                                  tier.remaining <= 0
                                    ? 'text-red-400'
                                    : tier.remaining < tier.capacity * 0.1
                                    ? 'text-yellow-400'
                                    : 'text-green-400'
                                }
                              >
                                {tier.remaining.toLocaleString()}
                              </span>
                            </p>
                          </div>
                          <div>
                            <p className='text-gray-400 mb-1'>Availability</p>
                            <div className='flex items-center gap-2'>
                              <button
                                onClick={() =>
                                  toggleTierAvailability(
                                    index,
                                    tier.availabilityMode
                                  )
                                }
                                disabled={ticketsLoading}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 ${
                                  tier.availabilityMode === 'Online'
                                    ? 'bg-blue-600'
                                    : 'bg-orange-600'
                                }`}
                                title={`Click to switch to ${
                                  tier.availabilityMode === 'Online'
                                    ? 'On-Site'
                                    : 'Online'
                                } mode`}
                              >
                                <span
                                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition duration-200 ease-in-out ${
                                    tier.availabilityMode === 'Online'
                                      ? 'translate-x-5'
                                      : 'translate-x-1'
                                  }`}
                                />
                              </button>
                              <span
                                className={`text-xs font-medium ${
                                  tier.availabilityMode === 'Online'
                                    ? 'text-blue-400'
                                    : 'text-orange-400'
                                }`}
                              >
                                {tier.availabilityMode === 'Online'
                                  ? 'Online'
                                  : 'On-Site'}
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className='text-gray-400 mb-1'>Limit Per User</p>
                            <p className='font-medium'>{tier.limitPerUser}</p>
                          </div>
                        </div>

                        {/* Sales Dates */}
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                          <div>
                            <p className='text-gray-400 mb-1'>
                              Sales Start Date
                            </p>
                            <p className='font-medium'>
                              {tier.salesStartDate
                                ? new Date(tier.salesStartDate).toLocaleString()
                                : 'Not set'}
                            </p>
                          </div>
                          <div>
                            <p className='text-gray-400 mb-1'>Sales End Date</p>
                            <p className='font-medium'>
                              {tier.salesEndDate
                                ? new Date(tier.salesEndDate).toLocaleString()
                                : 'Not set'}
                            </p>
                          </div>
                        </div>

                        {/* Refund Policy */}
                        {tier.refundPolicyNotes && (
                          <div className='text-sm'>
                            <p className='text-gray-400 mb-1'>Refund Policy</p>
                            <p className='font-medium text-gray-300'>
                              {tier.refundPolicyNotes}
                            </p>
                          </div>
                        )}

                        {/* Status Indicators */}
                        <div className='flex items-center gap-4 text-xs'>
                          <div
                            className={`flex items-center gap-1 ${
                              new Date(tier.salesStartDate) <= new Date() &&
                              new Date() <= new Date(tier.salesEndDate)
                                ? 'text-green-400'
                                : 'text-gray-400'
                            }`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full ${
                                new Date(tier.salesStartDate) <= new Date() &&
                                new Date() <= new Date(tier.salesEndDate)
                                  ? 'bg-green-400'
                                  : 'bg-gray-400'
                              }`}
                            ></div>
                            {new Date(tier.salesStartDate) <= new Date() &&
                            new Date() <= new Date(tier.salesEndDate)
                              ? 'Sales Active'
                              : 'Sales Inactive'}
                          </div>
                          <div
                            className={`flex items-center gap-1 ${
                              tier.remaining > 0
                                ? 'text-blue-400'
                                : 'text-red-400'
                            }`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full ${
                                tier.remaining > 0
                                  ? 'bg-blue-400'
                                  : 'bg-red-400'
                              }`}
                            ></div>
                            {tier.remaining > 0 ? 'Available' : 'Sold Out'}
                          </div>
                        </div>
                      </div>

                      {/* Edit Button */}
                      <button
                        onClick={() => handleEditTier(tier, index)}
                        className='ml-4 text-white hover:text-gray-300 p-2 rounded-lg hover:bg-[#343B4F] transition-colors flex-shrink-0'
                        title='Edit tier'
                      >
                        <Edit size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* Tier Form Modal */}
        {showTierForm && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
            <div className='bg-[#0B1739] border border-[#343B4F] rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto'>
              <h3 className='text-lg font-medium mb-6'>
                {editingTier ? 'Edit Tier' : 'Add New Tier'}
              </h3>

              <div className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm text-[#AEB9E1] mb-1'>
                      Order <span className='text-red-400'>*</span>
                    </label>
                    <input
                      type='number'
                      min='1'
                      className='w-full bg-[#0A1330] border border-[#343B4F] text-white rounded px-3 py-2 text-sm'
                      value={currentTier.order}
                      onChange={(e) =>
                        setCurrentTier({
                          ...currentTier,
                          order: parseInt(e.target.value) || 1,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className='block text-sm text-[#AEB9E1] mb-1'>
                      Price ($) <span className='text-red-400'>*</span>
                    </label>
                    <input
                      type='number'
                      min='0.01'
                      step='0.01'
                      className='w-full bg-[#0A1330] border border-[#343B4F] text-white rounded px-3 py-2 text-sm'
                      value={currentTier.price}
                      onChange={(e) =>
                        setCurrentTier({
                          ...currentTier,
                          price: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder='Enter price greater than 0'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-sm text-[#AEB9E1] mb-1'>
                    Name <span className='text-red-400'>*</span>{' '}
                    <span className='text-xs'>(64 characters max)</span>
                  </label>
                  <input
                    type='text'
                    maxLength='64'
                    className='w-full bg-[#0A1330] border border-[#343B4F] text-white rounded px-3 py-2 text-sm'
                    value={currentTier.name}
                    onChange={(e) =>
                      setCurrentTier({ ...currentTier, name: e.target.value })
                    }
                    placeholder='e.g., General Admission'
                  />
                  <p className='text-xs text-[#AEB9E1] mt-1'>
                    {currentTier.name.length}/64 characters
                  </p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm text-[#AEB9E1] mb-1'>
                      Capacity <span className='text-red-400'>*</span>
                    </label>
                    <input
                      type='number'
                      min='0'
                      className='w-full bg-[#0A1330] border border-[#343B4F] text-white rounded px-3 py-2 text-sm'
                      value={currentTier.capacity}
                      onChange={(e) => {
                        const capacity = parseInt(e.target.value) || 0
                        const newRemaining = editingTier
                          ? // For editing: maintain current remaining unless it exceeds new capacity
                            Math.min(currentTier.remaining, capacity)
                          : // For new tier: set remaining equal to capacity
                            capacity
                        setCurrentTier({
                          ...currentTier,
                          capacity,
                          remaining: newRemaining,
                        })
                      }}
                    />
                  </div>

                  <div>
                    <label className='block text-sm text-[#AEB9E1] mb-1'>
                      Remaining <span className='text-red-400'>*</span>
                    </label>
                    <input
                      type='number'
                      className='w-full bg-[#0A1330] border border-[#343B4F] text-white rounded px-3 py-2 text-sm'
                      value={currentTier.remaining}
                      onChange={(e) =>
                        setCurrentTier({
                          ...currentTier,
                          remaining: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-sm text-[#AEB9E1] mb-1'>
                    Description{' '}
                    <span className='text-xs'>
                      (optional - 250 characters max)
                    </span>
                  </label>
                  <textarea
                    maxLength='250'
                    rows='3'
                    className='w-full bg-[#0A1330] border border-[#343B4F] text-white rounded px-3 py-2 text-sm'
                    value={currentTier.description}
                    onChange={(e) =>
                      setCurrentTier({
                        ...currentTier,
                        description: e.target.value,
                      })
                    }
                    placeholder='Optional description of what this ticket includes'
                  />
                  <p className='text-xs text-[#AEB9E1] mt-1'>
                    {currentTier.description.length}/250 characters
                  </p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm text-[#AEB9E1] mb-1'>
                      Availability Mode <span className='text-red-400'>*</span>
                    </label>
                    <select
                      className='w-full bg-[#0A1330] border border-[#343B4F] text-white rounded px-3 py-2 text-sm'
                      value={currentTier.availabilityMode}
                      onChange={(e) =>
                        setCurrentTier({
                          ...currentTier,
                          availabilityMode: e.target.value,
                        })
                      }
                    >
                      <option value='Online'>Online Only</option>
                      <option value='OnSite'>On-Site Only</option>
                      <option value='Both'>Both</option>
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm text-[#AEB9E1] mb-1'>
                      Limit Per User <span className='text-red-400'>*</span>
                    </label>
                    <input
                      type='number'
                      min='1'
                      className='w-full bg-[#0A1330] border border-[#343B4F] text-white rounded px-3 py-2 text-sm'
                      value={currentTier.limitPerUser}
                      onChange={(e) =>
                        setCurrentTier({
                          ...currentTier,
                          limitPerUser: parseInt(e.target.value) || 1,
                        })
                      }
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm text-[#AEB9E1] mb-1'>
                      Sales Start Date & Time{' '}
                      <span className='text-red-400'>*</span>
                    </label>
                    <input
                      type='datetime-local'
                      min={new Date().toISOString().slice(0, 16)}
                      className='w-full bg-[#0A1330] border border-[#343B4F] text-white rounded px-3 py-2 text-sm'
                      value={
                        currentTier.salesStartDate
                          ? new Date(currentTier.salesStartDate)
                              .toISOString()
                              .slice(0, 16)
                          : ''
                      }
                      onChange={(e) => {
                        if (e.target.value) {
                          setCurrentTier({
                            ...currentTier,
                            salesStartDate: new Date(
                              e.target.value
                            ).toISOString(),
                          })
                          setDateModified((prev) => ({
                            ...prev,
                            startDate: true,
                          }))
                        }
                      }}
                    />
                  </div>

                  <div>
                    <label className='block text-sm text-[#AEB9E1] mb-1'>
                      Sales End Date & Time{' '}
                      <span className='text-red-400'>*</span>
                    </label>
                    <input
                      type='datetime-local'
                      min={
                        currentTier.salesStartDate
                          ? new Date(currentTier.salesStartDate)
                              .toISOString()
                              .slice(0, 16)
                          : new Date().toISOString().slice(0, 16)
                      }
                      className='w-full bg-[#0A1330] border border-[#343B4F] text-white rounded px-3 py-2 text-sm'
                      value={
                        currentTier.salesEndDate
                          ? new Date(currentTier.salesEndDate)
                              .toISOString()
                              .slice(0, 16)
                          : ''
                      }
                      onChange={(e) => {
                        if (e.target.value) {
                          setCurrentTier({
                            ...currentTier,
                            salesEndDate: new Date(
                              e.target.value
                            ).toISOString(),
                          })
                          setDateModified((prev) => ({
                            ...prev,
                            endDate: true,
                          }))
                        }
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-sm text-[#AEB9E1] mb-1'>
                    Refund Policy Notes{' '}
                    <span className='text-xs'>(optional)</span>
                  </label>
                  <input
                    type='text'
                    className='w-full bg-[#0A1330] border border-[#343B4F] text-white rounded px-3 py-2 text-sm'
                    value={currentTier.refundPolicyNotes}
                    onChange={(e) =>
                      setCurrentTier({
                        ...currentTier,
                        refundPolicyNotes: e.target.value,
                      })
                    }
                    placeholder='e.g., Non-refundable or Refundable up to 7 days before event'
                  />
                </div>
              </div>

              <div className='flex justify-end space-x-3 mt-6'>
                {editingTier && (
                  <button
                    onClick={deleteTier}
                    disabled={ticketsLoading}
                    className='flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors'
                  >
                    <Trash2 size={16} className='mr-2' />
                    Delete
                  </button>
                )}
                <button
                  onClick={() => setShowTierForm(false)}
                  className='px-4 py-2 bg-transparent hover:bg-gray-800 text-gray-300 hover:text-white rounded-lg text-sm font-medium transition-colors border border-gray-600 hover:border-gray-500'
                >
                  Cancel
                </button>
                <button
                  onClick={saveTier}
                  disabled={ticketsLoading}
                  className='flex items-center px-4 py-2 bg-gradient-to-r from-[#CB3CFF] to-[#7F25FB] rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all shadow-lg'
                >
                  <Save size={16} className='mr-2' />
                  {editingTier ? 'Update' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Event Properties */}
        <div className='border border-[#343B4F] rounded-lg p-4 relative mb-6'>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='font-bold text-lg'>EVENT PROPERTIES</h2>
          </div>
          {/* Event Poster */}
          {formattedEvent.poster && (
            <div className='mb-6'>
              <Image
                src={formattedEvent.poster}
                alt='Event poster'
                width={300}
                height={400}
                className='rounded-lg'
              />
            </div>
          )}

          <div className='grid grid-cols-1 md:grid-cols-2 gap-y-6'>
            {/* Event Name */}
            <div>
              <p className='text-sm mb-1'>Event Name</p>
              <p className='font-medium'>{formattedEvent.name}</p>
            </div>

            {/* Event Format */}
            <div>
              <p className='text-sm mb-1'>Event Format</p>
              <p className='font-medium'>{formattedEvent.format}</p>
            </div>

            {/* KO Policy */}
            <div>
              <p className='text-sm mb-1'>KO Policy</p>
              <p className='font-medium'>{formattedEvent.koPolicy}</p>
            </div>

            {/* Sport Type */}
            <div>
              <p className='text-sm mb-1'>Sport Type</p>
              <p className='font-medium'>{formattedEvent.sportType}</p>
            </div>

            {/* Start Date */}
            <div>
              <p className='text-sm mb-1'>Start Date</p>
              <p className='font-medium'>{formattedEvent.startDate}</p>
            </div>

            {/* End Date */}
            <div>
              <p className='text-sm mb-1'>End Date</p>
              <p className='font-medium'>{formattedEvent.endDate}</p>
            </div>

            {/* Registration Start Date */}
            <div>
              <p className='text-sm mb-1'>Registration Start Date</p>
              <p className='font-medium'>
                {formattedEvent.registrationStartDate}
              </p>
            </div>

            {/* Registration Deadline */}
            <div>
              <p className='text-sm mb-1'>Registration Deadline</p>
              <p className='font-medium'>
                {formattedEvent.registrationDeadline}
              </p>
            </div>

            {/* Weigh-in Date/Time */}
            <div>
              <p className='text-sm mb-1'>Weigh-in Date/Time</p>
              <p className='font-medium'>{formattedEvent.weighInDateTime}</p>
            </div>

            {/* Rules Meeting Time */}
            <div>
              <p className='text-sm mb-1'>Rules Meeting Time</p>
              <p className='font-medium'>{formattedEvent.rulesMeetingTime}</p>
            </div>

            {/* Spectator Doors Open Time */}
            <div>
              <p className='text-sm mb-1'>Spectator Doors Open Time</p>
              <p className='font-medium'>
                {formattedEvent.spectatorDoorsOpenTime}
              </p>
            </div>

            {/* Fight Start Time */}
            <div>
              <p className='text-sm mb-1'>Fight Start Time</p>
              <p className='font-medium'>{formattedEvent.fightStartTime}</p>
            </div>

            {/* Matching Method */}
            <div>
              <p className='text-sm mb-1'>Matching Method</p>
              <p className='font-medium'>{formattedEvent.matchingMethod}</p>
            </div>

            {/* Age Categories */}
            <div>
              <p className='text-sm mb-1'>Age Categories</p>
              <p className='font-medium'>{formattedEvent.ageCategories}</p>
            </div>

            {/* Weight Classes */}
            <div>
              <p className='text-sm mb-1'>Weight Classes</p>
              <p className='font-medium'>{formattedEvent.weightClasses}</p>
            </div>

            {/* Short Description */}
            <div className='md:col-span-2'>
              <p className='text-sm mb-1'>Short Description</p>
              <p className='font-medium'>{formattedEvent.shortDescription}</p>
            </div>

            {/* Full Description */}
            <div className='md:col-span-2'>
              <p className='text-sm mb-1'>Full Description</p>
              <p className='font-medium'>{formattedEvent.fullDescription}</p>
            </div>

            {/* Rules */}
            <div className='md:col-span-2'>
              <p className='text-sm mb-1'>Rules</p>
              <p className='font-medium'>{formattedEvent.rules}</p>
            </div>
          </div>
        </div>

        {/* Venue Information */}
        <div className='border border-[#343B4F] rounded-lg p-4 relative mb-6'>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='font-bold text-lg'>VENUE INFORMATION</h2>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-y-6'>
            {/* Venue Name */}
            <div>
              <p className='text-sm mb-1'>Venue Name</p>
              <p className='font-medium'>{formattedEvent.venue.name}</p>
            </div>

            {/* Venue Address */}
            <div>
              <p className='text-sm mb-1'>Venue Address</p>
              <p className='font-medium'>{formattedEvent.venue.address}</p>
            </div>

            {/* Venue Contact Name */}
            <div>
              <p className='text-sm mb-1'>Contact Name</p>
              <p className='font-medium'>{formattedEvent.venue.contactName}</p>
            </div>

            {/* Venue Contact Phone */}
            <div>
              <p className='text-sm mb-1'>Contact Phone</p>
              <p className='font-medium'>{formattedEvent.venue.contactPhone}</p>
            </div>

            {/* Venue Contact Email */}
            <div>
              <p className='text-sm mb-1'>Contact Email</p>
              <p className='font-medium'>{formattedEvent.venue.contactEmail}</p>
            </div>

            {/* Venue Capacity */}
            <div>
              <p className='text-sm mb-1'>Capacity</p>
              <p className='font-medium'>{formattedEvent.venue.capacity}</p>
            </div>

            {/* Venue Map Link */}
            <div className='md:col-span-2'>
              <p className='text-sm mb-1'>Map Link</p>
              {formattedEvent.venue.mapLink !== 'N/A' ? (
                <a
                  href={formattedEvent.venue.mapLink}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='font-medium text-blue-400 hover:underline'
                >
                  View on Map
                </a>
              ) : (
                <p className='font-medium'>N/A</p>
              )}
            </div>
          </div>
        </div>

        {/* Promoter Information */}
        <div className='border border-[#343B4F] rounded-lg p-4 relative mb-6'>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='font-bold text-lg'>PROMOTER INFORMATION</h2>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-y-6'>
            {/* Promoter Name */}
            <div>
              <p className='text-sm mb-1'>Promoter Name</p>
              <p className='font-medium'>{formattedEvent.promoter.name}</p>
            </div>

            {/* Promoter Abbreviation */}
            <div>
              <p className='text-sm mb-1'>Abbreviation</p>
              <p className='font-medium'>
                {formattedEvent.promoter.abbreviation}
              </p>
            </div>

            {/* Promoter Website */}
            <div>
              <p className='text-sm mb-1'>Website</p>
              {formattedEvent.promoter.website !== 'N/A' ? (
                <a
                  href={formattedEvent.promoter.website}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='font-medium text-blue-400 hover:underline'
                >
                  {formattedEvent.promoter.website}
                </a>
              ) : (
                <p className='font-medium'>N/A</p>
              )}
            </div>

            {/* Sanctioning Body */}
            <div>
              <p className='text-sm mb-1'>Sanctioning Body</p>
              <p className='font-medium'>
                {formattedEvent.promoter.sanctioningBody}
              </p>
            </div>

            {/* Contact Person */}
            <div>
              <p className='text-sm mb-1'>Contact Person</p>
              <p className='font-medium'>
                {formattedEvent.promoter.contactPerson}
              </p>
            </div>

            {/* Phone */}
            <div>
              <p className='text-sm mb-1'>Phone</p>
              <p className='font-medium'>{formattedEvent.promoter.phone}</p>
            </div>

            {/* Alternate Phone */}
            <div>
              <p className='text-sm mb-1'>Alternate Phone</p>
              <p className='font-medium'>
                {formattedEvent.promoter.alternatePhone}
              </p>
            </div>

            {/* Email */}
            <div>
              <p className='text-sm mb-1'>Email</p>
              <p className='font-medium'>{formattedEvent.promoter.email}</p>
            </div>

            {/* About Promoter */}
            <div className='md:col-span-2'>
              <p className='text-sm mb-1'>About</p>
              <p className='font-medium break-words max-w-full'>
                {formattedEvent.promoter.about}
              </p>
            </div>
          </div>
        </div>

        {/* Sanctioning Information */}
        <div className='border border-[#343B4F] rounded-lg p-4 relative mb-6'>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='font-bold text-lg'>SANCTIONING INFORMATION</h2>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-y-6'>
            {/* Sanctioning Body Name */}
            <div>
              <p className='text-sm mb-1'>Sanctioning Body</p>
              <p className='font-medium'>{formattedEvent.sanctioning.name}</p>
            </div>

            {/* Sanctioning Body Image */}
            {formattedEvent.sanctioning.image && (
              <div className='md:col-span-2'>
                <p className='text-sm mb-1'>Sanctioning Body Logo</p>
                <Image
                  src={formattedEvent.sanctioning.image}
                  alt='Sanctioning body logo'
                  width={150}
                  height={150}
                  className='rounded-lg'
                />
              </div>
            )}

            {/* Sanctioning Body Description */}
            <div className='md:col-span-2'>
              <p className='text-sm mb-1'>Description</p>
              <p className='font-medium break-words max-w-full'>
                {formattedEvent.sanctioning.description}
              </p>
            </div>
          </div>
        </div>

        {/* ISKA Representative */}
        <div className='border border-[#343B4F] rounded-lg p-4 relative mb-6'>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='font-bold text-lg'>ISKA REPRESENTATIVE</h2>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-y-6'>
            {/* ISKA Rep Name */}
            <div>
              <p className='text-sm mb-1'>Name</p>
              <p className='font-medium'>{formattedEvent.iskaRep.name}</p>
            </div>

            {/* ISKA Rep Phone */}
            <div>
              <p className='text-sm mb-1'>Phone</p>
              <p className='font-medium'>{formattedEvent.iskaRep.phone}</p>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className='border border-[#343B4F] rounded-lg p-4 relative mb-6'>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='font-bold text-lg'>SYSTEM INFORMATION</h2>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-y-6'>
            {/* Created By */}
            <div>
              <p className='text-sm mb-1'>Created By</p>
              <p className='font-medium'>{formattedEvent.createdBy}</p>
            </div>

            {/* Created At */}
            <div>
              <p className='text-sm mb-1'>Created At</p>
              <p className='font-medium'>{formattedEvent.createdAt}</p>
            </div>

            {/* Updated At */}
            <div>
              <p className='text-sm mb-1'>Updated At</p>
              <p className='font-medium'>{formattedEvent.updatedAt}</p>
            </div>

            {/* Is Draft */}
            <div>
              <p className='text-sm mb-1'>Is Draft</p>
              <p className='font-medium'>{formattedEvent.status.isDraft}</p>
            </div>

            {/* Publish Brackets */}
            <div>
              <p className='text-sm mb-1'>Publish Brackets</p>
              <p className='font-medium'>
                {formattedEvent.status.publishBrackets}
              </p>
            </div>
          </div>
        </div>
      </div>
      <TournamentSettingsModal
        eventId={eventId}
        visible={settingsModalVisible}
        onClose={() => setSettingsModalVisible(false)}
        onSave={(updatedSettings) => {
          setTournamentSettings(updatedSettings)
        }}
        initialSettings={tournamentSettings} // Pass current settings to modal
      />
    </div>
  )
}
