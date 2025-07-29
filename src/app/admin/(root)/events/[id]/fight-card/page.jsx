'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Edit, Trophy, Clock, User, Filter, Search, X } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { enqueueSnackbar } from 'notistack'
import { API_BASE_URL } from '../../../../../../constants'
import useStore from '../../../../../../stores/useStore'
import Loader from '../../../../../_components/Loader'

export default function FightCardPage() {
  const params = useParams()
  const user = useStore((state) => state.user)
  const [eventId, setEventId] = useState(null)
  const [event, setEvent] = useState(null)
  const [fights, setFights] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showNewFightModal, setShowNewFightModal] = useState(false)
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    resultMethod: ''
  })

  useEffect(() => {
    if (params?.id) {
      setEventId(params.id)
      fetchEventData(params.id)
      fetchFights(params.id)
    }
  }, [params])

  const fetchEventData = async (id) => {
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

  const fetchFights = async (id) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/fights?eventId=${id}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setFights(data.data.items || [])
        } else {
          setFights([])
        }
      } else {
        setFights([])
      }
    } catch (err) {
      setError(err.message)
      setFights([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (fight) => {
    if (fight.status === 'Completed') {
      return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Completed</span>
    } else if (fight.status === 'In Progress') {
      return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">In Progress</span>
    } else {
      return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">Scheduled</span>
    }
  }

  const getResultText = (fight) => {
    if (fight.status === 'Completed' && fight.winner) {
      const winnerName = `${fight.winner.userId.firstName} ${fight.winner.userId.lastName}`
      return `Winner: ${winnerName} by ${fight.resultMethod}`
    }
    return '-'
  }

  const getResultDetails = (fight) => {
    if (fight.resultDetails) {
      if (fight.resultDetails.round && fight.resultDetails.time) {
        return `Round ${fight.resultDetails.round} • ${fight.resultDetails.time}`
      } else if (fight.resultDetails.reason) {
        return fight.resultDetails.reason
      }
    }
    return ''
  }

  const filteredFights = fights.filter(fight => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      const winnerName = fight.winner ? 
        `${fight.winner.userId.firstName} ${fight.winner.userId.lastName}`.toLowerCase() : ''
      
      if (!winnerName.includes(searchTerm)) {
        return false
      }
    }

    if (filters.status && fight.status !== filters.status) {
      return false
    }

    if (filters.resultMethod && fight.resultMethod !== filters.resultMethod) {
      return false
    }

    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-[#07091D]">
        <Loader />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-white p-8">
        <div className="bg-[#0B1739] bg-opacity-80 rounded-lg p-10 shadow-lg">
          <p className="text-red-500">Error: {error}</p>
          <Link href={`/admin/events/view/${eventId}`}>
            <button className="mt-4 bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
              Back to Event
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="text-white p-8 relative flex justify-center overflow-hidden">
      <div
        className="absolute -left-10 top-1/2 transform -translate-y-1/2 w-60 h-96 rounded-full opacity-70 blur-xl"
        style={{
          background:
            'linear-gradient(317.9deg, #6F113E 13.43%, rgba(111, 17, 62, 0) 93.61%)',
        }}
      ></div>
      
      <div className="bg-[#0B1739] bg-opacity-80 rounded-lg p-10 shadow-lg w-full z-50">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href={`/admin/events/view/${eventId}`}>
            <button className="mr-2 hover:bg-gray-700 p-2 rounded">
              <ArrowLeft size={24} />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Fight Card</h1>
            {event && (
              <p className="text-sm text-gray-300">
                {event.name} ({new Date(event.startDate).toLocaleDateString()})
              </p>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#07091D] p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">{fights.length}</div>
            <div className="text-sm text-gray-400">Total Fights</div>
          </div>
          <div className="bg-[#07091D] p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-400">
              {fights.filter(fight => fight.status === 'Completed').length}
            </div>
            <div className="text-sm text-gray-400">Completed</div>
          </div>
          <div className="bg-[#07091D] p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400">
              {fights.filter(fight => fight.status === 'In Progress').length}
            </div>
            <div className="text-sm text-gray-400">In Progress</div>
          </div>
          <div className="bg-[#07091D] p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-400">
              {fights.filter(fight => fight.status === 'Scheduled').length}
            </div>
            <div className="text-sm text-gray-400">Scheduled</div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 p-4 bg-[#07091D] rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search fights..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full pl-10 bg-[#0B1739] border border-gray-600 rounded px-3 py-2 text-white"
              />
            </div>

            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="bg-[#0B1739] border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value="">All Status</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>

            <select
              value={filters.resultMethod}
              onChange={(e) => setFilters({...filters, resultMethod: e.target.value})}
              className="bg-[#0B1739] border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value="">All Methods</option>
              <option value="Decision">Decision</option>
              <option value="KO">KO</option>
              <option value="TKO">TKO</option>
              <option value="Draw">Draw</option>
              <option value="Disqualification">Disqualification</option>
            </select>
          </div>
        </div>

        {/* Fights Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-[#07091D] rounded-lg">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="px-4 py-3 text-left">Fight #</th>
                <th className="px-4 py-3 text-left">Bracket</th>
                <th className="px-4 py-3 text-left">Bout</th>
                <th className="px-4 py-3 text-left">Winner</th>
                <th className="px-4 py-3 text-left">Method</th>
                <th className="px-4 py-3 text-left">Details</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredFights.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-400">
                    No fights found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredFights.map((fight, index) => (
                  <tr key={fight._id} className="border-b border-gray-700 hover:bg-gray-800/30">
                    <td className="px-4 py-3">
                      <span className="font-medium">#{index + 1}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        {fight.bracket?.divisionTitle || fight.bracket?.title || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        Bout #{fight.bout?.boutNumber || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        {fight.winner ? 
                          `${fight.winner.userId.firstName} ${fight.winner.userId.lastName}` : 
                          'TBD'
                        }
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm">{fight.resultMethod || '-'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-400">
                        {getResultDetails(fight)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(fight)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-400">
                        {new Date(fight.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Results showing count */}
        <div className="mt-4 text-sm text-gray-400 text-center">
          Showing {filteredFights.length} of {fights.length} fights
        </div>
      </div>
    </div>
  )
}