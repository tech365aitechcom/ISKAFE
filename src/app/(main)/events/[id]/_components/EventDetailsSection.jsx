import React from 'react'
import { Button } from '../../../../../../components/ui/button'
import RegistrationSection from './RegistrationSection'
import ReactMarkdown from 'react-markdown'
import moment from 'moment'

const EventDetailsSection = ({ id, eventDetails }) => {
  const cleanDescription = eventDetails?.fullDescription?.replace(
    /^\*+\s*|\s*\*+$/g,
    ''
  )
  return (
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
      {/* Left Column - Poster */}
      <div className='lg:col-span-1'>
        <div className='bg-[#1b0c2e] rounded-lg p-6 mb-6'>
          <img
            src={eventDetails?.poster}
            alt='Event Poster'
            className='w-full rounded-lg mb-6'
          />
          <RegistrationSection eventId={id} />

          {eventDetails?.externalURL && (
            <a
              href={eventDetails.externalURL}
              target='_blank'
              rel='noopener noreferrer'
              className='block w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 mt-2 px-4 rounded-lg text-center transition-colors'
            >
              Visit Website
            </a>
          )}
        </div>
      </div>

      {/* Right Column - Details */}
      <div className='lg:col-span-2 space-y-8'>
        {/* Event Schedule */}
        <div className='bg-[#1b0c2e] rounded-lg p-6'>
          <h2 className='text-xl font-bold text-yellow-500 mb-6 border-b border-gray-700 pb-2'>
            Event Schedule
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <h3 className='text-gray-400 text-sm font-medium mb-1'>
                Event Start Date
              </h3>
              <p className='text-white font-semibold'>
                {moment(eventDetails?.startDate).format('ddd, MMM DD • h:mm A')}
              </p>
            </div>
            <div>
              <h3 className='text-gray-400 text-sm font-medium mb-1'>
                Event End Date
              </h3>
              <p className='text-white font-semibold'>
                {moment(eventDetails?.endDate).format('ddd, MMM DD • h:mm A')}
              </p>
            </div>
            <div>
              <h3 className='text-gray-400 text-sm font-medium mb-1'>
                Fights Begin
              </h3>
              <p className='text-white font-semibold'>
                {moment(eventDetails?.fightStartTime, 'HH:mm').format('h:mm A')}
              </p>
            </div>
            <div>
              <h3 className='text-gray-400 text-sm font-medium mb-1'>
                Doors Open
              </h3>
              <p className='text-white font-semibold'>
                {moment(eventDetails?.spectatorDoorsOpenTime, 'HH:mm').format(
                  'h:mm A'
                )}
              </p>
            </div>
            <div>
              <h3 className='text-gray-400 text-sm font-medium mb-1'>
                Weigh-in
              </h3>
              <p className='text-white font-semibold'>
                {moment(eventDetails?.weighInDateTime).format(
                  'ddd, MMM DD • h:mm A'
                )}
              </p>
            </div>
            <div>
              <h3 className='text-gray-400 text-sm font-medium mb-1'>
                Rules Meeting
              </h3>
              <p className='text-white font-semibold'>
                {moment(eventDetails?.rulesMeetingTime, 'HH:mm').format(
                  'h:mm A'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Registration */}
        <div className='bg-[#1b0c2e] rounded-lg p-6'>
          <h2 className='text-xl font-bold text-yellow-500 mb-6 border-b border-gray-700 pb-2'>
            Registration
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <h3 className='text-gray-400 text-sm font-medium mb-1'>
                Registration Opens
              </h3>
              <p className='text-white font-semibold'>
                {moment(eventDetails?.registrationStartDate).format(
                  'MMM DD, YYYY'
                )}
              </p>
            </div>
            <div>
              <h3 className='text-gray-400 text-sm font-medium mb-1'>
                Registration Deadline
              </h3>
              <p className='text-white font-semibold'>
                {moment(eventDetails?.registrationDeadline).format(
                  'MMM DD, YYYY • h:mm A'
                )}
              </p>
            </div>
            <div>
              <h3 className='text-gray-400 text-sm font-medium mb-1'>
                Total Fighters Registered
              </h3>
              <p className='text-white font-bold text-lg'>
                {eventDetails?.registeredFighters?.length || 0}
              </p>
            </div>
            <div>
              <h3 className='text-gray-400 text-sm font-medium mb-1'>
                Matching Method
              </h3>
              <p className='text-white font-semibold'>
                {eventDetails?.matchingMethod}
              </p>
            </div>
          </div>
        </div>

        {/* Venue */}
        <div className='bg-[#1b0c2e] rounded-lg p-6'>
          <h2 className='text-xl font-bold text-yellow-500 mb-6 border-b border-gray-700 pb-2'>
            Venue Information
          </h2>
          <div className='space-y-4'>
            <div>
              <h3 className='text-gray-400 text-sm font-medium mb-1'>Venue</h3>
              <p className='text-white font-semibold text-lg'>
                {eventDetails?.venue?.name}
              </p>
            </div>
            <div>
              <h3 className='text-gray-400 text-sm font-medium mb-1'>
                Address
              </h3>
              <div className='text-white'>
                <p>{eventDetails?.venue?.address?.street1}</p>
                {eventDetails?.venue?.address?.street2 && (
                  <p>{eventDetails?.venue?.address?.street2}</p>
                )}
                <p>
                  {eventDetails?.venue?.address?.city},{' '}
                  {eventDetails?.venue?.address?.state}{' '}
                  {eventDetails?.venue?.address?.postalCode}
                </p>
              </div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <h3 className='text-gray-400 text-sm font-medium mb-1'>
                  Contact
                </h3>
                <p className='text-white'>{eventDetails?.venue?.contactName}</p>
                <p className='text-gray-300 text-sm'>
                  {eventDetails?.venue?.contactPhone}
                </p>
              </div>
              <div>
                <h3 className='text-gray-400 text-sm font-medium mb-1'>
                  Capacity
                </h3>
                <p className='text-white font-semibold'>
                  {eventDetails?.venue?.capacity} people
                </p>
              </div>
            </div>
            {eventDetails?.venue?.mapLink && (
              <div>
                <a
                  href={eventDetails.venue.mapLink}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center text-yellow-400 hover:text-yellow-300 font-medium'
                >
                  View on Google Maps →
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Competition Details */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='bg-[#1b0c2e] rounded-lg p-6'>
            <h2 className='text-xl font-bold text-yellow-500 mb-4 border-b border-gray-700 pb-2'>
              Categories
            </h2>
            <div className='space-y-4'>
              <div>
                <h3 className='text-gray-400 text-sm font-medium mb-1'>
                  Age Groups
                </h3>
                <p className='text-white'>
                  {eventDetails?.ageCategories?.join(', ') || 'All Ages'}
                </p>
              </div>
              <div>
                <h3 className='text-gray-400 text-sm font-medium mb-1'>
                  Weight Classes
                </h3>
                <p className='text-white'>
                  {eventDetails?.weightClasses?.join(', ') || 'Open Weight'}
                </p>
              </div>
              <div>
                <h3 className='text-gray-400 text-sm font-medium mb-1'>
                  KO Policy
                </h3>
                <p className='text-white'>{eventDetails?.koPolicy}</p>
              </div>
            </div>
          </div>

          <div className='bg-[#1b0c2e] rounded-lg p-6'>
            <h2 className='text-xl font-bold text-yellow-500 mb-4 border-b border-gray-700 pb-2'>
              Organization
            </h2>
            <div className='space-y-4'>
              <div>
                <h3 className='text-gray-400 text-sm font-medium mb-1'>
                  Promoter
                </h3>
                <p className='text-white font-semibold'>
                  {eventDetails?.promoter?.userId?.firstName}{' '}
                  {eventDetails?.promoter?.userId?.lastName}
                </p>
                <p className='text-gray-300 text-sm'>
                  {eventDetails?.promoter?.abbreviation}
                </p>
              </div>
              <div>
                <h3 className='text-gray-400 text-sm font-medium mb-1'>
                  Sanctioning Body
                </h3>
                <p className='text-white'>
                  {eventDetails?.sectioningBodyName ||
                    eventDetails?.promoter?.sanctioningBody}
                </p>
              </div>
              {eventDetails?.iskaRepName && (
                <div>
                  <h3 className='text-gray-400 text-sm font-medium mb-1'>
                    Representative
                  </h3>
                  <p className='text-white'>{eventDetails.iskaRepName}</p>
                  <p className='text-gray-300 text-sm'>
                    {eventDetails.iskaRepPhone}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className='bg-[#1b0c2e] rounded-lg p-6'>
          <h2 className='text-xl font-bold text-yellow-500 mb-4 border-b border-gray-700 pb-2'>
            About This Event
          </h2>
          <div className='text-gray-300 leading-relaxed mb-4 prose prose-invert'>
            <ReactMarkdown>{cleanDescription}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetailsSection
