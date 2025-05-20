'use client'

import { useState } from 'react'
import {
  Search,
  Mail,
  ArrowUp,
  ArrowDown,
  FileText,
  Download,
  ExternalLink,
  X,
  Check,
  Clock,
  RefreshCw,
} from 'lucide-react'
import PaginationHeader from '../../../../_components/PaginationHeader'
import Pagination from '../../../../_components/Pagination'

export default function ContactUsReports() {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(3)
  const [limit, setLimit] = useState(10)
  const [sortField, setSortField] = useState('submissionTime')
  const [sortDirection, setSortDirection] = useState('desc')
  const [selectedStatus, setSelectedStatus] = useState('All')

  // Mock data for demonstration
  const [reports, setReports] = useState([
    {
      id: 1,
      eventId: 'EVT-2023-001',
      date: '2025-05-15',
      submissionTime: '2025-05-15 09:23:45',
      topic: 'General Inquiry',
      subject: 'Question about membership',
      submittedBy: 'john.doe@example.com',
      db: 'MYSQL-PROD-01',
      state: 'New',
      assignedAdmin: 'Sarah Johnson',
      userRole: 'Fighter',
      responseSent: 'Yes',
      responseDate: '2025-05-15 14:30:22',
      lastUpdated: '2025-05-15 14:30:22',
      attachment: 'membership_form.pdf',
      email: 'john.doe@example.com',
    },
    {
      id: 2,
      eventId: 'EVT-2023-002',
      date: '2025-05-14',
      submissionTime: '2025-05-14 15:45:10',
      topic: 'Technical Support',
      subject: 'Cannot upload profile picture',
      submittedBy: 'jane.smith@example.com',
      db: 'MYSQL-PROD-01',
      state: 'In Progress',
      assignedAdmin: 'Michael Brown',
      userRole: 'Coach',
      responseSent: 'No',
      responseDate: null,
      lastUpdated: '2025-05-14 16:02:45',
      attachment: null,
      email: 'jane.smith@example.com',
    },
    {
      id: 3,
      eventId: 'EVT-2023-003',
      date: '2025-05-13',
      submissionTime: '2025-05-13 11:12:33',
      topic: 'Complaint',
      subject: 'Issue with tournament registration',
      submittedBy: 'robert.miller@example.com',
      db: 'MYSQL-PROD-01',
      state: 'Closed',
      assignedAdmin: 'Jessica White',
      userRole: 'Gym Owner',
      responseSent: 'Yes',
      responseDate: '2025-05-13 14:05:17',
      lastUpdated: '2025-05-13 14:05:17',
      attachment: 'screenshot.jpg',
      email: 'robert.miller@example.com',
    },
  ])

  // Filter reports based on search query and status
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.submittedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.topic.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      selectedStatus === 'All' || report.state === selectedStatus

    return matchesSearch && matchesStatus
  })

  // Sort reports based on sortField and sortDirection
  const sortedReports = [...filteredReports].sort((a, b) => {
    if (sortDirection === 'asc') {
      return a[sortField] > b[sortField] ? 1 : -1
    } else {
      return a[sortField] < b[sortField] ? 1 : -1
    }
  })

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
    console.log('Fetching latest registration forms...')
    // Implement API call to refresh data
  }

  const handleSendResponse = (report) => {
    console.log('Sending response to:', report.submittedBy)
    // Implement send response logic
  }

  const handleCloseReport = (reportId) => {
    setReports((prev) =>
      prev.map((report) =>
        report.id === reportId ? { ...report, state: 'Closed' } : report
      )
    )
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

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '-'
    return new Date(dateTimeString).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })
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
                {sortedReports && sortedReports.length > 0 ? (
                  sortedReports.map((report, index) => (
                    <tr
                      key={report.id}
                      className={`${
                        index % 2 === 0 ? 'bg-[#0A1330]' : 'bg-[#0B1739]'
                      }`}
                    >
                      <td className='px-4 py-3'>{formatDate(report.date)}</td>
                      <td className='px-4 py-3 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs truncate'>
                        {formatDateTime(report.submissionTime)}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs truncate'>
                        {report.topic}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs truncate'>
                        {report.subject}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs truncate'>
                        {report.submittedBy}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs truncate'>
                        {report.db}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs truncate'>
                        {report.eventId ? (
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
                      <td className='px-4 py-3'>{report.userRole}</td>
                      <td className='px-4 py-3'>
                        <span className={getResponseBadge(report.responseSent)}>
                          {report.responseSent}
                        </span>
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs truncate'>
                        {formatDateTime(report.responseDate) || '-'}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs truncate'>
                        {formatDateTime(report.lastUpdated)}
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
                          onClick={() => handleSendResponse(report)}
                          className='text-purple-400 hover:text-purple-300 flex items-center gap-1'
                        >
                          <Mail size={16} />
                        </button>
                      </td>
                      <td className='px-4 py-3'>
                        {report.state !== 'Closed' ? (
                          <button
                            onClick={() => handleCloseReport(report.id)}
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
