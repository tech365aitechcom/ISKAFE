'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Loader from '../../../../_components/Loader'
import { API_BASE_URL } from '../../../../../constants'
import { AddPeopleForm } from './AddPeopleForm'
import { PeopleTable } from './PeopleTable'
import useStore from '../../../../../stores/useStore'

export const PeopleContainer = () => {
  const user = useStore((state) => state.user)
  const [showAddPeopleForm, setShowAddPeopleForm] = useState(false)
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(1)
  const [limit, setLimit] = useState(10)

  const getPeople = async () => {
    setLoading(true)
    try {
      const response = await axios.get(
        `${API_BASE_URL}/auth/users?page=${currentPage}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      )
      console.log('Response:', response.data)

      setPeople(response.data.data.items)
      setTotalPages(response.data.data.pagination.totalPages)
      setTotalItems(response.data.data.pagination.totalItems)
    } catch (error) {
      console.log('Error fetching people:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getPeople()
  }, [showAddPeopleForm, limit, currentPage])

  return (
    <div className='bg-[#0B1739] bg-opacity-80 rounded-lg p-10 shadow-lg w-full z-50'>
      {showAddPeopleForm ? (
        <AddPeopleForm setShowAddPeopleForm={setShowAddPeopleForm} />
      ) : (
        <>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-2xl font-semibold leading-8'>Peoples</h2>
            <button
              className='text-white px-4 py-2 rounded-md'
              style={{
                background:
                  'linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)',
              }}
              onClick={() => setShowAddPeopleForm(true)}
            >
              New Person
            </button>
          </div>

          {loading ? (
            <Loader />
          ) : (
            <PeopleTable
              people={people}
              limit={limit}
              setLimit={setLimit}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              onSuccess={getPeople}
            />
          )}
        </>
      )}
    </div>
  )
}
