'use client'

import React, { useState } from 'react'
import { Trash, Clock, User, Trophy, Play, Crown, Edit } from 'lucide-react'
import BoutResultModal from './BoutResultModal'
import { sportsData, getAgeClasses } from './bracketUtils'

export default function BoutCard({
  bout,
  onDelete,
  onUpdate,
  onEdit,
  eventId,
}) {
  const [showResultModal, setShowResultModal] = useState(false)

  const getStatusColor = (hasResult) => {
    if (hasResult) {
      return 'text-green-500 bg-green-500/20'
    }
    return 'text-yellow-500 bg-yellow-500/20'
  }

  const getSportLabel = (sportValue) => {
    const sport = sportsData.find((s) => s.label === sportValue)
    return sport ? sport.label : sportValue
  }

  const getAgeClassLabel = (ageClassValue, sportValue) => {
    if (!sportValue) return ageClassValue
    const ageClasses = getAgeClasses(sportValue)
    const ageClass = ageClasses.find((ac) => ac.value === ageClassValue)
    return ageClass ? ageClass.label : ageClassValue
  }

  const getResultText = () => {
    if (bout.fight) {
      const result = bout.fight
      const winner =
        result.winner === bout.redCorner?._id ? bout.redCorner : bout.blueCorner
      return `Winner: ${winner?.firstName} ${winner?.lastName} by ${result?.resultMethod}`
    }
    return 'No Result'
  }

  return (
    <div className='bg-[#0B1739] border border-gray-600 rounded-lg p-4 space-y-4 w-full max-w-md'>
      {/* Bout Header */}
      <div className='flex justify-between items-start'>
        <div>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-gray-400'>
              Bout #{bout.boutNumber || 'TBD'}
            </span>
            <span
              className={`text-xs px-2 py-1 rounded ${getStatusColor(
                bout.fight
              )}`}
            >
              {bout.fight
                ? 'Completed'
                : bout.isStarted
                ? 'Started'
                : 'Pending'}
            </span>
          </div>
          <div className='text-xs text-gray-400 mt-1'>
            {getSportLabel(bout.sport)} •{' '}
            {getAgeClassLabel(bout.ageClass, bout.sport)}
          </div>
        </div>

        <div className='flex gap-2'>
          {bout.fight && (
            <button
              onClick={() => setShowResultModal(true)}
              className='p-1 text-blue-400 hover:text-blue-300'
              title='Manage Result'
            >
              <Trophy size={16} />
            </button>
          )}
          <button
            onClick={() => onEdit(bout)}
            className='p-1 text-gray-400 hover:text-gray-300'
            title='Edit Bout'
          >
            <Edit size={16} />
          </button>
          <button
            onClick={onDelete}
            className='p-1 text-red-400 hover:text-red-300'
            title='Delete Bout'
          >
            <Trash size={16} />
          </button>
        </div>
      </div>

      {/* Fighters */}
      <div className='space-y-3 pt-4'>
        {/* Red Corner */}
        <div
          className={`relative flex items-center gap-3 p-3 border rounded ${
            bout.fight?.winner === bout.redCorner?._id
              ? 'bg-amber-900/20 border-amber-500'
              : 'bg-red-900/10 border-red-500/20'
          }`}
        >
          {bout.fight?.winner === bout.redCorner?._id && (
            <Crown className='absolute -top-5 -left-4 text-amber-400 w-8 h-8' />
          )}
          <div className='w-3 h-3 bg-red-500 rounded-full'></div>
          <div className='flex-1'>
            <div className='font-medium text-white'>
              {bout.redCorner
                ? `${bout.redCorner?.firstName} ${bout.redCorner?.lastName}`
                : 'TBD'}
            </div>
            {bout.redCorner && (
              <div className='text-sm text-gray-400'>
                {bout.redCornerDetails?.weight || 'N/A'}
                <span className='lowercase ml-1'>kg</span>
              </div>
            )}
          </div>
        </div>

        {/* VS Divider */}
        <div className='text-center'>
          <span className='text-gray-400 text-sm font-medium'>VS</span>
        </div>

        {/* Blue Corner */}
        <div
          className={`relative flex items-center gap-3 p-3 border rounded ${
            bout.fight?.winner === bout.blueCorner?._id
              ? 'bg-amber-900/20 border-amber-500'
              : 'bg-blue-900/10 border-blue-500/20'
          }`}
        >
          {bout.fight?.winner === bout.blueCorner?._id && (
            <Crown className='absolute -top-5 -left-4 text-amber-400 w-8 h-8' />
          )}
          <div className='w-3 h-3 bg-blue-500 rounded-full'></div>
          <div className='flex-1'>
            <div className='font-medium text-white'>
              {bout.blueCorner
                ? `${bout.blueCorner?.firstName} ${bout.blueCorner?.lastName}`
                : 'TBD'}
            </div>
            {bout.blueCorner && (
              <div className='text-sm text-gray-400'>
                {bout.blueCornerDetails?.weight || 'N/A'}
                <span className='lowercase ml-1'>kg</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bout Details */}
      <div className='grid grid-cols-2 gap-4 text-sm'>
        <div className='flex items-center gap-2 text-gray-400'>
          <Clock size={14} />
          <span>
            {bout.numberOfRounds || 3} rounds × {bout.roundDuration || 90}s
          </span>
        </div>
        <div className='flex items-center gap-2 text-gray-400'>
          <User size={14} />
          <span>
            {bout.weightClass?.min || 0}-{bout.weightClass?.max || 999}{' '}
            {bout.weightClass?.unit || 'lbs'}
          </span>
        </div>
      </div>

      {/* Result */}
      {bout.fight && (
        <div className='p-3 bg-green-900/10 border border-green-500/20 rounded'>
          <div className='text-sm font-medium text-green-400'>Result</div>
          <div className='text-sm text-gray-300 mt-1 flex items-center gap-1'>
            <Trophy size={14} />
            {getResultText()}
          </div>
        </div>
      )}

      {/* Notes */}
      {bout.notes && (
        <div className='text-xs text-gray-400 p-2 bg-gray-800/20 rounded'>
          <strong>Notes:</strong> {bout.notes}
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={() => setShowResultModal(true)}
        className='w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2'
      >
        {bout.fight ? 'Edit Result' : 'Enter Result'}
      </button>

      {/* Result Modal */}
      {showResultModal && (
        <BoutResultModal
          bout={bout}
          onClose={() => setShowResultModal(false)}
          onUpdate={onUpdate}
          eventId={eventId}
        />
      )}
    </div>
  )
}
