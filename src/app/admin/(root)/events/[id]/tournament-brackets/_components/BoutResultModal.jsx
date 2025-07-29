'use client'

import React, { useState, useEffect } from 'react'
import { X, Trophy, Clock, AlertTriangle, Plus } from 'lucide-react'
import { enqueueSnackbar } from 'notistack'
import { API_BASE_URL } from '../../../../../../../constants'
import useStore from '../../../../../../../stores/useStore'
import SuspensionModal from './SuspensionModal'

export default function BoutResultModal({ bout, onClose, onUpdate, eventId }) {
  const user = useStore((state) => state.user)
  const [boutStarted, setBoutStarted] = useState(!!bout.startDate)
  const [winner, setWinner] = useState(bout.fight?.winner || '')
  const [resultMethod, setResultMethod] = useState(bout.fight?.resultMethod || '')
  const [resultDetails, setResultDetails] = useState({
    round: bout.fight?.resultDetails?.round || '',
    time: bout.fight?.resultDetails?.time || '',
    reason: bout.fight?.resultDetails?.reason || ''
  })
  const [judgeScores, setJudgeScores] = useState({
    red: bout.fight?.judgeScores?.red || ['', '', ''],
    blue: bout.fight?.judgeScores?.blue || ['', '', '']
  })
  const [notes, setNotes] = useState(bout.fight?.notes || '')
  const [loading, setLoading] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [showRedSuspensionModal, setShowRedSuspensionModal] = useState(false)
  const [showBlueSuspensionModal, setShowBlueSuspensionModal] = useState(false)

  const resultMethods = [
    'Decision',
    'TKO',
    'KO',
    'Draw',
    'Disqualification',
    'Forfeit',
    'No Contest',
    'Technical Decision',
    'Other'
  ]

  const otherReasons = [
    'Forfeit',
    'Disqualification',
    'Injury',
    'Weight Miss',
    'No Show',
    'Technical Issues',
    'Doctor Stoppage'
  ]

  useEffect(() => {
    if (winner && !resultMethod) {
      setShowWarning(true)
    } else {
      setShowWarning(false)
    }
  }, [winner, resultMethod])

  const handleBoutStart = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/bouts/${bout._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          ...bout,
          startDate: new Date().toISOString()
        })
      })

      if (response.ok) {
        setBoutStarted(true)
        onUpdate()
      }
    } catch (err) {
      console.error('Error starting bout:', err)
    }
  }

  const handleJudgeScoreChange = (corner, judgeIndex, value) => {
    setJudgeScores(prev => ({
      ...prev,
      [corner]: prev[corner].map((score, index) => 
        index === judgeIndex ? value : score
      )
    }))
  }

  const handleSaveResult = async () => {
    if (!winner || !resultMethod) {
      enqueueSnackbar('Please select a winner and result method', { variant: 'warning' })
      return
    }

    setLoading(true)
    try {
      // Prepare fight result data
      const fightData = {
        event: eventId,
        bracket: bout.bracket._id || bout.bracket,
        bout: bout._id,
        status: 'Completed',
        winner,
        resultMethod,
        notes
      }

      // Add judge scores for Decision/Draw
      if (resultMethod === 'Decision' || resultMethod === 'Draw') {
        fightData.judgeScores = {
          red: judgeScores.red.map(score => parseInt(score) || 0),
          blue: judgeScores.blue.map(score => parseInt(score) || 0)
        }
      }

      // Add result details for KO/TKO
      if ((resultMethod === 'KO' || resultMethod === 'TKO') && resultDetails.round && resultDetails.time) {
        fightData.resultDetails = {
          round: parseInt(resultDetails.round),
          time: resultDetails.time,
          reason: resultDetails.reason
        }
      }

      // Add other result details
      if (resultMethod === 'Other' && resultDetails.reason) {
        fightData.resultDetails = {
          reason: resultDetails.reason
        }
      }

      let response
      // Check if fight already exists (update) or create new
      if (bout.fight && bout.fight._id) {
        // Update existing fight
        response = await fetch(`${API_BASE_URL}/fights/${bout.fight._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify(fightData)
        })
      } else {
        // Create new fight
        response = await fetch(`${API_BASE_URL}/fights`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify(fightData)
        })
      }

      if (response.ok) {
        const responseData = await response.json()
        console.log('Fight saved successfully:', responseData)
        onUpdate()
        onClose()
        // Use notification
        enqueueSnackbar('Fight result saved successfully!', { variant: 'success' })
      } else {
        const errorData = await response.json()
        console.error('Error response:', errorData)
        throw new Error(errorData.message || 'Failed to save result')
      }
    } catch (err) {
      console.error('Error saving result:', err)
      // Use error notification
      enqueueSnackbar(`Error saving result: ${err.message}`, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const renderJudgeScores = () => (
    <div className="space-y-4">
      <h4 className="font-medium text-white">Judge Scores</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((judgeNum) => (
          <div key={judgeNum} className="space-y-3">
            <h5 className="text-sm font-medium text-gray-300">Judge {judgeNum}</h5>
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-red-400 mb-1">Red Corner</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={judgeScores.red[judgeNum - 1]}
                  onChange={(e) => handleJudgeScoreChange('red', judgeNum - 1, e.target.value)}
                  className="w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white"
                  placeholder="0-10"
                />
              </div>
              <div>
                <label className="block text-xs text-blue-400 mb-1">Blue Corner</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={judgeScores.blue[judgeNum - 1]}
                  onChange={(e) => handleJudgeScoreChange('blue', judgeNum - 1, e.target.value)}
                  className="w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white"
                  placeholder="0-10"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderKODetails = () => (
    <div className="space-y-4">
      <h4 className="font-medium text-white">Stoppage Details</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-white mb-2">Round</label>
          <input
            type="number"
            min="1"
            max={bout.numberOfRounds || 12}
            value={resultDetails.round}
            onChange={(e) => setResultDetails(prev => ({ ...prev, round: e.target.value }))}
            className="w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white"
            placeholder="Round"
          />
        </div>
        <div>
          <label className="block text-sm text-white mb-2">Time (mm:ss)</label>
          <input
            type="text"
            pattern="[0-9]{1,2}:[0-9]{2}"
            value={resultDetails.time}
            onChange={(e) => setResultDetails(prev => ({ ...prev, time: e.target.value }))}
            className="w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white"
            placeholder="2:30"
          />
        </div>
        <div>
          <label className="block text-sm text-white mb-2">Reason</label>
          <input
            type="text"
            value={resultDetails.reason}
            onChange={(e) => setResultDetails(prev => ({ ...prev, reason: e.target.value }))}
            className="w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white"
            placeholder="Knockout punch"
          />
        </div>
      </div>
    </div>
  )

  const renderOtherReason = () => (
    <div>
      <label className="block text-sm text-white mb-2">Result Reason</label>
      <select
        value={resultDetails.reason}
        onChange={(e) => setResultDetails(prev => ({ ...prev, reason: e.target.value }))}
        className="w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white"
      >
        <option value="">Select Reason</option>
        {otherReasons.map((reason) => (
          <option key={reason} value={reason}>{reason}</option>
        ))}
      </select>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-[#0B1739] rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            Bout Result - {bout.redCorner?.userId.firstName} vs {bout.blueCorner?.userId.firstName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Bout Started Toggle */}
          <div className="flex items-center justify-between p-4 bg-[#07091D] rounded-lg">
            <div className="flex items-center gap-3">
              <Clock size={20} className="text-blue-400" />
              <span className="text-white">Bout Has Started</span>
            </div>
            <button
              onClick={handleBoutStart}
              disabled={boutStarted}
              className={`px-4 py-2 rounded ${
                boutStarted 
                  ? 'bg-green-600 text-white cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {boutStarted ? 'Started' : 'Start Bout'}
            </button>
          </div>

          {/* Winner Selection */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4">Winner Selection</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setWinner(bout.redCorner._id)}
                className={`p-4 border-2 rounded-lg ${
                  winner === bout.redCorner._id
                    ? 'border-red-500 bg-red-900/20'
                    : 'border-gray-600 bg-[#07091D] hover:border-red-500/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <div className="text-left">
                    <div className="font-medium text-white">
                      {bout.redCorner.userId.firstName} {bout.redCorner.userId.lastName}
                    </div>
                    <div className="text-sm text-gray-300">Red Corner</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setWinner(bout.blueCorner._id)}
                className={`p-4 border-2 rounded-lg ${
                  winner === bout.blueCorner._id
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-gray-600 bg-[#07091D] hover:border-blue-500/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <div className="text-left">
                    <div className="font-medium text-white">
                      {bout.blueCorner.userId.firstName} {bout.blueCorner.userId.lastName}
                    </div>
                    <div className="text-sm text-gray-300">Blue Corner</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Result Method */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Result Method</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {resultMethods.map((method) => (
                <button
                  key={method}
                  onClick={() => setResultMethod(method)}
                  className={`px-3 py-2 text-sm rounded ${
                    resultMethod === method
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#07091D] text-gray-300 border border-gray-600 hover:bg-gray-700'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Result Details */}
          {(resultMethod === 'Decision' || resultMethod === 'Draw') && renderJudgeScores()}
          {(resultMethod === 'KO' || resultMethod === 'TKO') && renderKODetails()}
          {resultMethod === 'Other' && renderOtherReason()}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
              className="w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white"
              placeholder="Optional notes about the bout..."
            />
          </div>

          {/* Suspensions Panel */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Fighter Suspensions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Red Fighter Suspension */}
              <div className="p-4 border border-red-500/30 rounded-lg bg-red-900/10">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-red-400">Red Corner</h4>
                  <button
                    onClick={() => setShowRedSuspensionModal(true)}
                    className="flex items-center gap-1 px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
                  >
                    <Plus size={14} />
                    Add Suspension
                  </button>
                </div>
                <div className="text-sm text-gray-300">
                  {bout.redCorner.userId.firstName} {bout.redCorner.userId.lastName}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Add disciplinary or medical suspensions post-bout
                </div>
              </div>

              {/* Blue Fighter Suspension */}
              <div className="p-4 border border-blue-500/30 rounded-lg bg-blue-900/10">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-blue-400">Blue Corner</h4>
                  <button
                    onClick={() => setShowBlueSuspensionModal(true)}
                    className="flex items-center gap-1 px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
                  >
                    <Plus size={14} />
                    Add Suspension
                  </button>
                </div>
                <div className="text-sm text-gray-300">
                  {bout.blueCorner.userId.firstName} {bout.blueCorner.userId.lastName}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Add disciplinary or medical suspensions post-bout
                </div>
              </div>
            </div>
          </div>

          {/* Warning */}
          {showWarning && (
            <div className="flex items-center gap-3 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
              <AlertTriangle className="text-yellow-400" size={20} />
              <span className="text-yellow-400 text-sm">
                Click the Save button or the result won't be posted!!!
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-600">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-300 border border-gray-600 rounded hover:bg-gray-700"
              disabled={loading}
            >
              Close
            </button>
            <button
              onClick={handleSaveResult}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              disabled={loading || !winner || !resultMethod}
            >
              {loading ? 'Saving...' : 'Save Result'}
            </button>
          </div>
        </div>

        {/* Suspension Modals */}
        {showRedSuspensionModal && (
          <SuspensionModal
            fighter={bout.redCorner}
            onClose={() => setShowRedSuspensionModal(false)}
            onSave={(suspension) => {
              setShowRedSuspensionModal(false)
              // Could refresh data or show success message
            }}
          />
        )}

        {showBlueSuspensionModal && (
          <SuspensionModal
            fighter={bout.blueCorner}
            onClose={() => setShowBlueSuspensionModal(false)}
            onSave={(suspension) => {
              setShowBlueSuspensionModal(false)
              // Could refresh data or show success message
            }}
          />
        )}
      </div>
    </div>
  )
}