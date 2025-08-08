'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '../../../../../../../components/ui/button'
import { Search, X } from 'lucide-react'
import { API_BASE_URL } from '../../../../../../constants'

const FighterSelectionScreen = ({ eventDetails, onNext, onBack, onCancel, purchaseData }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [fighters, setFighters] = useState([])
  const [selectedFighters, setSelectedFighters] = useState(purchaseData.selectedFighters || [])
  const [loading, setLoading] = useState(false)
  const [searchResults, setSearchResults] = useState([])

  useEffect(() => {
    // Load registered fighters for this event
    if (eventDetails?.registeredFighters) {
      setFighters(eventDetails.registeredFighters)
    }
  }, [eventDetails])

  const searchFighters = async (term) => {
    if (!term.trim()) {
      setSearchResults([])
      return
    }

    setLoading(true)
    try {
      // Filter from registered fighters first
      const localResults = fighters.filter(fighter => 
        `${fighter.firstName} ${fighter.lastName}`.toLowerCase().includes(term.toLowerCase())
      )
      
      setSearchResults(localResults)
    } catch (error) {
      console.error('Error searching fighters:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchFighters(searchTerm)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm])

  const addFighter = (fighter) => {
    if (!selectedFighters.find(f => f.fighterProfileId === fighter.fighterProfileId)) {
      setSelectedFighters(prev => [...prev, fighter])
    }
    setSearchTerm('')
    setSearchResults([])
  }

  const removeFighter = (fighterProfileId) => {
    setSelectedFighters(prev => prev.filter(f => f.fighterProfileId !== fighterProfileId))
  }

  const handleNext = () => {
    onNext('payment', {
      selectedFighters
    })
  }

  const handleSkip = () => {
    onNext('payment', {
      selectedFighters: []
    })
  }

  return (
    <div className="bg-[#1b0c2e] rounded-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Support Your Fighters</h2>
        <p className="text-gray-400">
          If you are buying tickets to see specific fighters, please add them here.
        </p>
        <p className="text-gray-500 text-sm mt-2">This step is optional</p>
      </div>

      {/* Search Box */}
      <div className="relative mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0A1330] border border-gray-600 rounded px-10 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            placeholder="Search for fighters..."
          />
        </div>
        
        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-[#0A1330] border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((fighter, index) => (
              <div
                key={`search-${fighter.fighterProfileId || fighter._id || 'unknown'}-${index}`}
                onClick={() => addFighter(fighter)}
                className="px-4 py-3 hover:bg-[#1b0c2e] cursor-pointer border-b border-gray-700 last:border-b-0"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{fighter.firstName} {fighter.lastName}</p>
                    <p className="text-sm text-gray-400">
                      {fighter.weightClass} • {fighter.country}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {searchTerm && searchResults.length === 0 && !loading && (
          <div className="absolute z-10 w-full mt-1 bg-[#0A1330] border border-gray-600 rounded-lg shadow-lg">
            <div className="px-4 py-3 text-gray-400 text-center">
              No fighters found matching "{searchTerm}"
            </div>
          </div>
        )}
      </div>

      {/* Selected Fighters */}
      {selectedFighters.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Selected Fighters ({selectedFighters.length})</h3>
          <div className="space-y-2">
            {selectedFighters.map((fighter, index) => (
              <div
                key={`selected-${fighter.fighterProfileId || fighter._id || 'unknown'}-${index}`}
                className="bg-[#0A1330] rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{fighter.firstName} {fighter.lastName}</p>
                  <p className="text-sm text-gray-400">
                    {fighter.weightClass} • {fighter.country}
                  </p>
                </div>
                <button
                  onClick={() => removeFighter(fighter.fighterProfileId)}
                  className="text-red-400 hover:text-red-300 p-1"
                >
                  <X size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Registered Fighters */}
      {fighters.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">All Registered Fighters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
            {fighters.map((fighter, index) => {
              const isSelected = selectedFighters.find(f => f.fighterProfileId === fighter.fighterProfileId)
              
              return (
                <div
                  key={`all-${fighter.fighterProfileId || fighter._id || 'unknown'}-${index}`}
                  onClick={() => isSelected ? removeFighter(fighter.fighterProfileId) : addFighter(fighter)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-purple-600 hover:bg-purple-700' 
                      : 'bg-[#0A1330] hover:bg-[#1b0c2e]'
                  }`}
                >
                  <p className="font-medium text-sm">{fighter.firstName} {fighter.lastName}</p>
                  <p className="text-xs text-gray-400">
                    {fighter.weightClass} • {fighter.country}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={handleNext}
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded font-medium"
        >
          Next
        </Button>
        
        <Button
          onClick={handleSkip}
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded font-medium"
        >
          Skip
        </Button>
      </div>

      <div className="flex justify-center space-x-6 mt-4">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-white underline"
        >
          Back
        </button>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-white underline"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default FighterSelectionScreen