'use client'
import React, { useState } from 'react'
import { Check, X } from 'lucide-react'

export default function UserAccessControl() {
  const roles = [
    { id: 1, name: 'Super Admin', color: 'bg-purple-100 text-purple-800' },
    { id: 2, name: 'Promoter', color: 'bg-blue-100 text-blue-800' },
    { id: 3, name: 'Trainer', color: 'bg-green-100 text-green-800' },
    { id: 4, name: 'Fighter', color: 'bg-yellow-100 text-yellow-800' },
    { id: 5, name: 'Parent', color: 'bg-orange-100 text-orange-800' },
    { id: 6, name: 'User (Spectator)', color: 'bg-gray-100 text-gray-800' },
  ]

  const defaultPermissions = [
    { module: 'View Homepage', roles: ['All'] },
    { module: 'Buy Tickets', roles: ['All'] },
    { module: 'Register Fighter', roles: ['All'] },
    { module: 'View Events', roles: ['All'] },
    { module: 'View Results', roles: ['All'] },
    { module: 'Event Management Panel', roles: ['Promoter', 'Super Admin'] },
    {
      module: 'Fighter Dashboard',
      roles: ['Fighter', 'Trainer', 'Promoter', 'Super Admin'],
    },
    {
      module: 'Trainer Dashboard',
      roles: ['Trainer', 'Promoter', 'Super Admin'],
    },
    {
      module: 'Bracket Builder / Fight Card',
      roles: ['Promoter', 'Super Admin'],
    },
    { module: 'Rule Management', roles: ['Super Admin'] },
    { module: 'Admin Dashboard & Analytics', roles: ['Super Admin'] },
    { module: 'Create/Manage Users', roles: ['Super Admin'] },
    { module: 'Assign Roles & Permissions', roles: ['Super Admin'] },
    { module: 'Score Fighters', roles: ['Judge', 'Super Admin'] },
    {
      module: 'Upload Fighter Documents',
      roles: ['Trainer', 'Super Admin'],
    },
    {
      module: 'View Fighter History',
      roles: ['Parent', 'Trainer', 'Super Admin'],
    },
    {
      module: 'Request Record Updates',
      roles: ['Parent', 'Super Admin'],
    },
  ]

  const [permissions, setPermissions] = useState(
    defaultPermissions.map((p) => ({
      ...p,
      roles: p.roles.includes('All') ? roles.map((r) => r.name) : p.roles,
    }))
  )

  const toggleRole = (moduleName, roleName) => {
    setPermissions((prev) =>
      prev.map((perm) => {
        if (perm.module !== moduleName) return perm

        const hasRole = perm.roles.includes(roleName)
        return {
          ...perm,
          roles: hasRole
            ? perm.roles.filter((r) => r !== roleName)
            : [...perm.roles, roleName],
        }
      })
    )
  }

  return (
    <div className='text-white p-8 flex justify-center relative overflow-hidden min-h-screen'>
      <div
        className='absolute -left-10 top-1/2 transform -translate-y-1/2 w-60 h-96 rounded-full opacity-70 blur-xl'
        style={{
          background:
            'linear-gradient(317.9deg, #6F113E 13.43%, rgba(111, 17, 62, 0) 93.61%)',
        }}
      />
      <div className='bg-[#0B1739] bg-opacity-80 rounded-lg p-10 shadow-lg w-full z-50'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-2xl font-semibold'>
            Editable User Roles And Permissions
          </h2>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='text-gray-400 border-b border-gray-700'>
                <th className='text-left py-3 px-4'>Module / Screen</th>
                {roles.map((role) => (
                  <th key={role.id} className='text-center py-3 px-2'>
                    {role.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissions.map((permission, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? 'bg-[#0A1330]' : 'bg-[#0B1739]'}
                >
                  <td className='py-3 px-4'>{permission.module}</td>
                  {roles.map((role) => {
                    const isChecked = permission.roles.includes(role.name)
                    return (
                      <td key={role.id} className='text-center py-3 px-2'>
                        {isChecked ? (
                          <input
                            type='checkbox'
                            checked={true}
                            onChange={() =>
                              toggleRole(permission.module, role.name)
                            }
                            className='accent-green-500 w-4 h-4'
                          />
                        ) : (
                          <button
                            onClick={() =>
                              toggleRole(permission.module, role.name)
                            }
                          >
                            <X className='text-red-500 mx-auto' size={20} />
                          </button>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className='flex justify-center gap-4 mt-6'>
            <button
              type='submit'
              className='bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded transition duration-200'
            >
              Save Changes
            </button>{' '}
          </div>
        </div>
      </div>
    </div>
  )
}
