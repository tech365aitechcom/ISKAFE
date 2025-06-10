'use client'

import { useEffect, useState } from 'react'
import {
  Search,
  Mail,
  ArrowUp,
  ArrowDown,
  Download,
  ExternalLink,
  X,
  Check,
  RefreshCw,
} from 'lucide-react'
import PaginationHeader from '../../../../_components/PaginationHeader'
import Pagination from '../../../../_components/Pagination'
import axios from 'axios'
import { API_BASE_URL, apiConstants } from '../../../../../constants'
import moment from 'moment'
import { enqueueSnackbar } from 'notistack'
import Loader from '../../../../_components/Loader'

export default function ContactUsReports() {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(1)
  const [limit, setLimit] = useState(10)
  const [sortField, setSortField] = useState('submissionTime')
  const [sortDirection, setSortDirection] = useState('desc')
  const [selectedStatus, setSelectedStatus] = useState('All')

  const [reports, setReports] = useState(null)
  const [loading, setLoading] = useState(false)

  const getContactReports = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_BASE_URL}/contact-us`)
      console.log('Response:', response.data)

      setReports(response.data.data.items)
      setTotalPages(response.data.data.pagination.totalPages)
      setTotalItems(response.data.data.pagination.totalItems)
    } catch (error) {
      console.log('Error fetching about details:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getContactReports()
  }, [])

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedStatus('All')
  }

  const handleGetReports = () => {
    getContactReports()
    setCurrentPage(1)
    setSortField('submissionTime')
    setSortDirection('desc')
    setSearchQuery('')
    setSelectedStatus('All')
  }

  const handleSendResponse = async (reportId) => {
    await axios.put(`${API_BASE_URL}/contact-us/${reportId}`, {
      state: 'In Progress',
      responseSent: 'Yes',
      responseDate: new Date(),
    })
    getContactReports()
  }

  const handleCloseReport = async (reportId) => {
    const response = await axios.put(`${API_BASE_URL}/contact-us/${reportId}`, {
      state: 'Closed',
    })
    if (response.status === apiConstants.success) {
      enqueueSnackbar('Report closed successfully', { variant: 'success' })
      getContactReports()
    }
  }

  const handleDownloadAttachment = (attachment) => {
    console.log('Downloading attachment:', attachment)
    // Implement download attachment logic
  }

  const getStatusBadge = (status) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium'
    switch (status) {
      case 'New':
        return `${baseClasses} bg-blue-100 text-blue-800`
      case 'In Progress':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'Closed':
        return `${baseClasses} bg-green-100 text-green-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const getResponseBadge = (responseSent) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium'
    return responseSent === 'Yes'
      ? `${baseClasses} bg-green-100 text-green-800`
      : `${baseClasses} bg-red-100 text-red-800`
  }

  const renderHeader = (label, field) => (
    <th
      className='px-4 pb-3 whitespace-nowrap cursor-pointer'
      onClick={() => handleSort(field)}
    >
      <div className='flex items-center gap-1'>
        {label}
        {sortField === field && (
          <span>
            {sortDirection === 'asc' ? (
              <ArrowUp size={14} />
            ) : (
              <ArrowDown size={14} />
            )}
          </span>
        )}
      </div>
    </th>
  )

  if (loading) return <Loader />

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
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-2xl font-semibold leading-8'>
            Contact Us Reports
          </h2>
          {/* Get Reports Button */}
          <div className='mb-6'>
            <button
              className='text-white px-4 py-2 rounded-md flex items-center gap-2 transition'
              style={{
                background:
                  'linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)',
              }}
              onClick={handleGetReports}
            >
              <RefreshCw size={18} />
              Get Reports
            </button>
          </div>{' '}
        </div>

        {/* Search and Filters Section */}
        <div className='mb-6 space-y-4'>
          {/* Search Bar */}
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
              <Search size={18} className='text-gray-400' />
            </div>
            <input
              type='text'
              className='bg-transparent border border-gray-700 text-white rounded-md pl-10 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600'
              placeholder='Search by Subject or Submitter...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div>
              <label className='block mb-2 text-sm font-medium text-white'>
                Status
              </label>
              <select
                className='w-full px-4 py-2 bg-transparent border border-gray-700 rounded-lg text-white appearance-none outline-none'
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value='All' className='text-black'>
                  All
                </option>
                <option value='New' className='text-black'>
                  New
                </option>
                <option value='In Progress' className='text-black'>
                  In Progress
                </option>
                <option value='Closed' className='text-black'>
                  Closed
                </option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex justify-end mb-6'>
            {/* Reset Filters Button */}
            {(searchQuery || (selectedStatus && selectedStatus !== 'All')) && (
              <button
                className='border border-gray-700 text-white rounded-lg px-4 py-2 hover:bg-gray-700 transition'
                onClick={handleResetFilters}
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Table Section */}
        <div className='border border-[#343B4F] rounded-lg overflow-hidden'>
          <PaginationHeader
            limit={limit}
            setLimit={setLimit}
            currentPage={currentPage}
            totalItems={totalItems}
            label='Contact Us Reports'
          />
          <div className='overflow-x-auto custom-scrollbar'>
            <table className='w-full text-sm text-left'>
              <thead>
                <tr className='text-gray-400 text-sm'>
                  {renderHeader('Date', 'date')}
                  {renderHeader('Submission Time', 'submissionTime')}
                  {renderHeader('Topic', 'topic')}
                  {renderHeader('Subject', 'subject')}
                  {renderHeader('Submitted By', 'submittedBy')}
                  {renderHeader('DB', 'db')}
                  {renderHeader('Event ID', 'eventId')}
                  {renderHeader('State', 'state')}
                  {renderHeader('Assigned Admin', 'assignedAdmin')}
                  {renderHeader('User Role', 'userRole')}
                  {renderHeader('Response Sent', 'responseSent')}
                  {renderHeader('Response Date', 'responseDate')}
                  {renderHeader('Last Updated', 'lastUpdated')}
                  {renderHeader('Attachment', 'attachment')}
                  {renderHeader('Email', 'email')}
                  {renderHeader('Close', 'close')}
                </tr>
              </thead>
              <tbody>
                {reports && reports.length > 0 ? (
                  reports.map((report, index) => (
                    <tr
                      key={report._id}
                      className={`${
                        index % 2 === 0 ? 'bg-[#0A1330]' : 'bg-[#0B1739]'
                      }`}
                    >
                      <td className='px-4 py-3'>
                        {moment(report.date).format('DD/MM/YYYY')}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs truncate'>
                        {moment(report.date).format('DD/MM/YYYY')}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs truncate'>
                        {report.topic}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs truncate'>
                        {report.subIssue}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs truncate'>
                        {report.createdBy?.email}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs truncate'>
                        {report?._id}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs truncate'>
                        {report?.eventId ? (
                          <a
                            href={`/admin/event-${report.eventId}`}
                            className='text-blue-400 hover:text-blue-300 flex items-center gap-1 '
                          >
                            {report.eventId} <ExternalLink size={14} />
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs truncate'>
                        <span className={getStatusBadge(report.state)}>
                          {report.state}
                        </span>
                      </td>
                      <td className='px-4 py-3'>
                        {report.assignedAdmin || 'Unassigned'}
                      </td>
                      <td className='px-4 py-3 uppercase'>
                        {report.createdBy?.role}
                      </td>
                      <td className='px-4 py-3'>
                        <span className={getResponseBadge(report.responseSent)}>
                          {report.responseSent}
                        </span>
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs truncate'>
                        {(report.responseDate &&
                          moment(report.responseDate).format(
                            'DD/MM/YYYY HH:mm:ss'
                          )) ||
                          '-'}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs truncate'>
                        {moment(report.updatedAt).format('DD/MM/YYYY HH:mm:ss')}
                      </td>
                      <td className='px-4 py-3'>
                        {report.attachment ? (
                          <button
                            onClick={() =>
                              handleDownloadAttachment(report.attachment)
                            }
                            className='text-blue-400 hover:text-blue-300 flex items-center gap-1'
                          >
                            <Download size={16} />
                          </button>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className='px-4 py-3'>
                        <button
                          onClick={() => handleSendResponse(report._id)}
                          className='text-purple-400 hover:text-purple-300 flex items-center gap-1'
                        >
                          <Mail size={16} />
                        </button>
                      </td>
                      <td className='px-4 py-3'>
                        {report.state !== 'Closed' ? (
                          <button
                            onClick={() => handleCloseReport(report._id)}
                            className='text-red-400 hover:text-red-300 flex items-center gap-1'
                            title='Close Report'
                          >
                            <X size={16} />
                          </button>
                        ) : (
                          <Check
                            size={16}
                            className='text-green-400'
                            title='Report Closed'
                          />
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className='text-center bg-[#0A1330]'>
                    <td colSpan='16' className='px-4 py-8 text-gray-400'>
                      No contact reports found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  )
}
