'use client'
import axios from 'axios'
import { API_BASE_URL, apiConstants } from '../../../../../constants/index'
import { ArrowLeft } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import useStore from '../../../../../stores/useStore'
import { enqueueSnackbar } from 'notistack'
import { CustomMultiSelect } from '../../../../_components/CustomMultiSelect'

export const AddTournamentForm = ({ setShowAddTournament }) => {
  const user = useStore((state) => state.user)
  const [formData, setFormData] = useState({
    name: '',
    dateTime: '',
    location: '',
    rules: '',
    participants: [],
  })

  const [userList, setUserList] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/users`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      })
      console.log('Users Response:', response.data)
      setUserList(response.data.data.items)
    } catch (error) {
      console.log('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    try {
      e.preventDefault()

      const payload = {
        ...formData,
        createdBy: user?.id,
      }

      console.log('Form submitted:', payload)

      const response = await axios.post(
        `${API_BASE_URL}/tournaments/add`,
        payload
      )

      console.log('Response:', response)
      if (response.status === apiConstants.create) {
        enqueueSnackbar(response.data.message, {
          variant: 'success',
        })
        setFormData({
          name: '',
          dateTime: '',
          location: '',
          rules: '',
          participants: [],
        })
      }
    } catch (error) {
      enqueueSnackbar(
        error?.response?.data?.message || 'Something went wrong',
        {
          variant: 'error',
        }
      )
    }
  }

  console.log(formData, 'Form Data')

  return (
    <div className='min-h-screen text-white bg-dark-blue-900'>
      <div className='w-full'>
        <div className='flex items-center gap-4 mb-6'>
          <button
            onClick={() => setShowAddTournament(false)}
            className='mr-2 text-white'
          >
            <ArrowLeft className='h-6 w-6' />
          </button>
          <h1 className='text-2xl font-bold'>Tournament Details</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <h2 className='font-bold mb-4 uppercase text-sm'>
            Tournament Information
          </h2>

          {/* Tournament Name */}
          <div className='mb-6 bg-[#00000061] p-2 rounded'>
            <label className='block text-sm font-medium mb-1'>
              Tournament Name<span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              name='name'
              value={formData.name}
              onChange={handleChange}
              className='w-full outline-none'
              placeholder='Enter Tournament Name'
              required
            />
          </div>

          {/* Date & Time */}
          <div className='mb-6 bg-[#00000061] p-2 rounded'>
            <label className='block text-sm font-medium mb-1'>
              Date & Time<span className='text-red-500'>*</span>
            </label>
            <input
              type='datetime-local'
              name='dateTime'
              value={formData.dateTime}
              onChange={handleChange}
              className='w-full outline-none'
              required
            />
          </div>

          {/* Location */}
          <div className='mb-6 bg-[#00000061] p-2 rounded'>
            <label className='block text-sm font-medium mb-1'>
              Location<span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              name='location'
              value={formData.location}
              onChange={handleChange}
              className='w-full outline-none'
              placeholder='Enter Location'
              required
            />
          </div>

          {/* Rules & Regulations */}
          <div className='mb-6 bg-[#00000061] p-2 rounded'>
            <label className='block text-sm font-medium mb-1'>
              Rules & Regulations<span className='text-red-500'>*</span>
            </label>
            <textarea
              name='rules'
              value={formData.rules}
              onChange={handleChange}
              rows='6'
              className='w-full outline-none resize-none'
              placeholder='Enter Rules'
              required
            />
          </div>

          {/* Participants Dropdown */}
          <div className='mb-6 bg-[#00000061] p-2 rounded'>
            <label className='block text-sm font-medium mb-1'>
              Participants<span className='text-red-500'>*</span>
            </label>
            <CustomMultiSelect
              label='Select Participants'
              options={userList}
              onChange={(selectedIds) =>
                setFormData({ ...formData, participants: selectedIds })
              }
            />
          </div>

          {/* Action Buttons */}
          <div className='flex justify-center gap-4'>
            <button
              type='submit'
              className='text-white font-medium py-2 px-6 rounded'
              style={{
                background:
                  'linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)',
              }}
            >
              Create Tournament
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
