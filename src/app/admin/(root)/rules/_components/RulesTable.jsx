'use client'

import { ChevronsUpDown, Search, Trash } from 'lucide-react'
import { useState } from 'react'
import PaginationHeader from '../../../../_components/PaginationHeader'
import Pagination from '../../../../_components/Pagination'

export function RulesTable({
  rules,
  limit,
  setLimit,
  currentPage,
  setCurrentPage,
  totalPages,
  totalItems,
  onEditRule,
  onDeleteRule,
}) {
  const [searchQuery, setSearchQuery] = useState('')

  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSubTab, setSelectedSubTab] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')

  const filteredRules = rules.filter((rule) => {
    const matchesSearch = rule.ruleTitle
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory
      ? rule.ruleCategory === selectedCategory
      : true
    const matchesSubTab = selectedSubTab
      ? rule.subTabName === selectedSubTab
      : true
    const matchesStatus = selectedStatus ? rule.status === selectedStatus : true
    return matchesSearch && matchesCategory && matchesSubTab && matchesStatus
  })

  const handleDelete = (id) => {
    if (onDeleteRule) onDeleteRule(id)
    console.log('Deleting rule with ID:', id)
  }

  const handleUpdate = (rule) => {
    if (onEditRule) onEditRule(rule)
    console.log('Editing rule:', rule)
  }

  const handleResetFilter = () => {
    setSelectedCategory('')
    setSelectedSubTab('')
    setSelectedStatus('')
    setSearchQuery('')
  }

  const renderHeader = (label) => (
    <th className='px-4 pb-3 whitespace-nowrap cursor-pointer'>
      <div className='flex items-center gap-1'>{label}</div>
    </th>
  )

  // Get unique categories and sub-tabs for filters
  const categories = [...new Set(rules.map((rule) => rule.ruleCategory))]
  const subTabs = [...new Set(rules.map((rule) => rule.subTabName))]

  return (
    <>
      <div className='relative mb-6'>
        <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
          <Search size={18} className='text-gray-400' />
        </div>
        <input
          type='text'
          className='bg-transparent border border-gray-700 text-white rounded-md pl-10 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600'
          placeholder='Search by Rule Title...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
        <div className='relative'>
          <label className='block mb-2 text-sm font-medium text-white'>
            Rule Category
          </label>
          <div className='relative'>
            <select
              className='w-full px-4 py-2 bg-transparent border border-gray-700 rounded-lg text-white appearance-none outline-none'
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
            >
              <option value='' className='text-black'>
                All Categories
              </option>
              {categories.map((category) => (
                <option key={category} value={category} className='text-black'>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className='relative'>
          <label className='block mb-2 text-sm font-medium text-white'>
            Sub-Tab
          </label>
          <div className='relative'>
            <select
              className='w-full px-4 py-2 bg-transparent border border-gray-700 rounded-lg text-white appearance-none outline-none'
              value={selectedSubTab || ''}
              onChange={(e) => setSelectedSubTab(e.target.value || null)}
            >
              <option value='' className='text-black'>
                All Sub-Tabs
              </option>
              {subTabs.map((subTab) => (
                <option key={subTab} value={subTab} className='text-black'>
                  {subTab}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className='relative'>
          <label className='block mb-2 text-sm font-medium text-white'>
            Status
          </label>
          <div className='relative'>
            <select
              className='w-full px-4 py-2 bg-transparent border border-gray-700 rounded-lg text-white appearance-none outline-none'
              value={selectedStatus || ''}
              onChange={(e) => setSelectedStatus(e.target.value || null)}
            >
              <option value='' className='text-black'>
                All
              </option>
              <option value='Active' className='text-black'>
                Active
              </option>
              <option value='Inactive' className='text-black'>
                Inactive
              </option>
            </select>
          </div>
        </div>
      </div>
      {(selectedCategory || selectedSubTab || selectedStatus) && (
        <div className='flex justify-end mb-6'>
          <button
            className='border border-gray-700 text-white rounded-lg px-4 py-2 hover:bg-gray-700 transition'
            onClick={handleResetFilter}
          >
            Reset Filters
          </button>
        </div>
      )}
      <div className='border border-[#343B4F] rounded-lg overflow-hidden'>
        <PaginationHeader
          limit={limit}
          setLimit={setLimit}
          currentPage={currentPage}
          totalItems={totalItems}
          label='rules'
        />
        <div className='overflow-x-auto'>
          <table className='w-full text-sm text-left'>
            <thead>
              <tr className='text-gray-400 text-sm'>
                {renderHeader('Rule Category', 'ruleCategory')}
                {renderHeader('Sub-Tab Name', 'subTabName')}
                {renderHeader('Rule Title', 'ruleTitle')}
                {renderHeader('Rule Description', 'ruleDescription')}
                {renderHeader('PDF', 'uploadPDF')}
                {renderHeader('Video Link', 'videoLink')}
                {renderHeader('Sort Order', 'sortOrder')}
                {renderHeader('Status', 'status')}
                {renderHeader('Actions', 'actions')}
              </tr>
            </thead>
            <tbody>
              {filteredRules && filteredRules.length > 0 ? (
                filteredRules.map((rule, index) => (
                  <tr
                    key={index}
                    className={`text-center ${
                      index % 2 === 0 ? 'bg-[#0A1330]' : 'bg-[#0B1739]'
                    }`}
                  >
                    <td className='p-4'>{rule.ruleCategory}</td>
                    <td className='p-4'>{rule.subTabName}</td>
                    <td className='p-4'>{rule.ruleTitle}</td>
                    <td className='p-4 max-w-xs truncate'>
                      {rule.ruleDescription}
                    </td>
                    <td className='p-4'>
                      {rule.uploadPDF && (
                        <a
                          href={rule.uploadPDF}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-blue-500 underline'
                        >
                          View PDF
                        </a>
                      )}
                    </td>
                    <td className='p-4'>
                      {rule.videoLink && (
                        <a
                          href={rule.videoLink}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-blue-500 underline'
                        >
                          View Video
                        </a>
                      )}
                    </td>
                    <td className='p-4'>{rule.sortOrder}</td>
                    <td className='p-4'>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          rule.status === 'Active'
                            ? 'bg-green-900 text-green-300'
                            : 'bg-gray-800 text-gray-300'
                        }`}
                      >
                        {rule.status}
                      </span>
                    </td>
                    <td className='p-4 py-8 flex items-center space-x-2'>
                      <button
                        onClick={() => handleUpdate(rule)}
                        className='bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs'
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id)}
                        className='text-red-600'
                      >
                        <Trash size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className='text-center bg-[#0A1330]'>
                  <td colSpan='9' className='p-4'>
                    No rules found.
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
    </>
  )
}
