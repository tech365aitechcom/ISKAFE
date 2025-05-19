'use client'
import React, { useEffect, useState } from 'react'
import { AddRulesForm } from './AddRulesForm'
import { RulesTable } from './RulesTable'
import axios from 'axios'
import { API_BASE_URL } from '../../../../../constants'
import Loader from '../../../../_components/Loader'

export const RuleContainer = () => {
  const [showAddRuleForm, setShowAddRuleForm] = useState(false)
  const [rules, setRules] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(1)
  const [limit, setLimit] = useState(10)

  const getRules = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/rules?page=${currentPage}&limit=${limit}`
      )
      console.log('Response:', response.data)

      setRules(response.data.data.items)
      setTotalPages(response.data.data.pagination.totalPages)
      setTotalItems(response.data.data.pagination.totalItems)
    } catch (error) {
      console.log('Error fetching rules:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getRules()
  }, [showAddRuleForm, limit, currentPage])

  return (
    <div className='bg-[#0B1739] bg-opacity-80 rounded-lg p-10 shadow-lg w-full z-50'>
      {showAddRuleForm ? (
        <AddRulesForm setShowAddRuleForm={setShowAddRuleForm} />
      ) : (
        <>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-2xl font-semibold leading-8'>Rules</h2>
            <button
              className='text-white px-4 py-2 rounded-md'
              style={{
                background:
                  'linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)',
              }}
              onClick={() => setShowAddRuleForm(true)}
            >
              Create New
            </button>
          </div>

          {loading ? (
            <Loader />
          ) : (
            <RulesTable
              rules={rules}
              limit={limit}
              setLimit={setLimit}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              onSuccess={getRules}
            />
          )}
        </>
      )}
    </div>
  )
}
