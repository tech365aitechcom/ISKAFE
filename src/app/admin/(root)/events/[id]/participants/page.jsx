'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Search, Filter, Users, UserCheck, Phone, Mail, FileText, ArrowLeft, X, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { API_BASE_URL } from '../../../../../../constants'
import useStore from '../../../../../../stores/useStore'
import Loader from '../../../../../_components/Loader'
import CompetitorTable from './_components/CompetitorTable'
import SearchFilters from './_components/SearchFilters'
import CompetitorDetailModal from './_components/CompetitorDetailModal'

export default function CompetitorList() {
  const params = useParams()
  const user = useStore((state) => state.user)
  const [eventId, setEventId] = useState(null)
  const [event, setEvent] = useState(null)
  const [competitors, setCompetitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Filter states
  const [activeTab, setActiveTab] = useState('all') // all, fighters, trainers
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    ageMin: '',
    ageMax: '',
    phone: '',
    email: '',
    type: '',
    eventParticipation: false
  })
  
  // Modal state
  const [selectedCompetitor, setSelectedCompetitor] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  
  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10
  })

  useEffect(() => {
    if (params?.id) {
      setEventId(params.id)
      fetchEvent(params.id)
      fetchCompetitors(params.id)
    }
  }, [params, activeTab, searchTerm, filters])

  const fetchEvent = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${id}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setEvent(data.data)
        }
      }
    } catch (err) {
      console.error('Error fetching event:', err)
    }
  }

  const fetchCompetitors = async (id, page = 1) => {
    try {
      setLoading(true)
      
      // Build query parameters
      const queryParams = new URLSearchParams()
      
      if (activeTab === 'fighters') queryParams.append('type', 'fighter')
      if (activeTab === 'trainers') queryParams.append('type', 'trainer')
      if (searchTerm) queryParams.append('search', searchTerm)
      if (filters.ageMin) queryParams.append('ageMin', filters.ageMin)
      if (filters.ageMax) queryParams.append('ageMax', filters.ageMax)
      if (filters.phone) queryParams.append('phone', filters.phone)
      if (filters.email) queryParams.append('email', filters.email)
      if (filters.eventParticipation) queryParams.append('participated', 'true')
      queryParams.append('page', page.toString())
      queryParams.append('limit', pagination.pageSize.toString())
      
      const response = await fetch(`${API_BASE_URL}/registrations/event/${id}?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setCompetitors(data.data.items || [])
          setPagination(data.data.pagination)
        } else {
          setCompetitors([])
        }
      } else {
        setCompetitors([])
      }
    } catch (err) {
      setError(err.message)
      setCompetitors([])
    } finally {
      setLoading(false)
    }
  }

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A'
    const birth = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  const handleViewRegistration = (competitor) => {
    setSelectedCompetitor(competitor)
    setShowDetailModal(true)
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  if (loading && competitors.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-[#07091D]">
        <Loader />
      </div>
    )
  }

  return (
    <div className='text-white p-8 relative flex justify-center overflow-hidden'>
      <div
        className='absolute -left-10 top-1/2 transform -translate-y-1/2 w-60 h-96 rounded-full opacity-70 blur-xl'
        style={{
          background:
            'linear-gradient(317.9deg, #6F113E 13.43%, rgba(111, 17, 62, 0) 93.61%)',
        }}
      ></div>
      
      <div className='bg-[#0B1739] bg-opacity-80 rounded-lg p-10 shadow-lg w-full z-50'>
        {/* Header */}
        <div className='flex items-center gap-4 mb-6'>
          <Link href={`/admin/events/view/${eventId}`}>
            <button className='mr-2 hover:bg-gray-700 p-2 rounded'>
              <ArrowLeft className='h-6 w-6' />
            </button>
          </Link>
          <div>
            <h1 className='text-2xl font-bold'>Event Participants</h1>
            {event && (
              <p className='text-sm text-gray-300'>
                {event.name} ({event.startDate ? new Date(event.startDate).toLocaleDateString() : 'Date not set'})
              </p>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className='flex border border-[#797979] px-2 py-1 rounded-md w-fit mb-6'>
          {[
            { key: 'all', label: 'All Participants', icon: Users },
            { key: 'fighters', label: 'Fighters Only', icon: UserCheck },
            { key: 'trainers', label: 'Trainers Only', icon: Users }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`px-4 py-2 rounded-md text-white text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === tab.key ? 'bg-[#2E3094] shadow-md' : ''
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <SearchFilters
          searchTerm={searchTerm}
          filters={filters}
          onSearchChange={handleSearch}
          onFilterChange={handleFilterChange}
        />

        {/* Results Summary */}
        <div className='mb-4 text-sm text-gray-300'>
          Showing {competitors.length} of {pagination.totalItems} participants
          {activeTab !== 'all' && ` (${activeTab} only)`}
        </div>

        {/* Competitor Table */}
        <CompetitorTable
          competitors={competitors}
          calculateAge={calculateAge}
          onViewRegistration={handleViewRegistration}
          loading={loading}
        />

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className='flex justify-center items-center gap-4 mt-6'>
            <button
              onClick={() => fetchCompetitors(eventId, pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className='px-4 py-2 bg-gray-600 rounded disabled:opacity-50'
            >
              Previous
            </button>
            <span className='text-sm'>
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => fetchCompetitors(eventId, pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className='px-4 py-2 bg-gray-600 rounded disabled:opacity-50'
            >
              Next
            </button>
          </div>
        )}

        {/* No Results */}
        {!loading && competitors.length === 0 && (
          <div className='text-center py-12'>
            <Users size={48} className='mx-auto mb-4 text-gray-600' />
            <p className='text-gray-400 mb-2'>No participants found</p>
            <p className='text-sm text-gray-500'>
              Try adjusting your search criteria or filters
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className='mb-4 p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg'>
            <p className='text-red-400'>Error: {error}</p>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedCompetitor && (
          <CompetitorDetailModal
            competitor={selectedCompetitor}
            onClose={() => {
              setShowDetailModal(false)
              setSelectedCompetitor(null)
            }}
            calculateAge={calculateAge}
          />
        )}
      </div>
    </div>
  )
}