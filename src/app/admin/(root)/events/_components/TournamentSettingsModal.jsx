'use client'
import React, { useState, useEffect } from 'react'
import { API_BASE_URL } from '../../../../../constants'
import { Pencil } from 'lucide-react'
import { enqueueSnackbar } from 'notistack'
import { sportsData } from '../[id]/tournament-brackets/_components/bracketUtils'

const TournamentSettingsModal = ({
  eventId,
  visible,
  onClose,
  onSave,
  initialSettings,
}) => {
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState(
    initialSettings || {
      simpleFees: {
        fighterFee: 0,
        trainerFee: 0,
        currency: '$',
      },
      detailedFees: [],
      bracketSettings: {
        maxFightersPerBracket: 0,
      },
      ruleStyles: {
        semiContact: [],
        fullContact: [],
      },
    }
  )

  useEffect(() => {
    if (visible && eventId) {
      fetchSettings()
    }
  }, [visible, eventId])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `${API_BASE_URL}/tournament-setting/${eventId}`
      )
      if (!response.ok) {
        throw new Error('Failed to fetch tournament settings')
      }
      const data = await response.json()
      if (data.success) {
        setFormData({
          simpleFees: data.data.simpleFees || {
            fighterFee: 0,
            trainerFee: 0,
            currency: '$',
          },
          detailedFees: data.data.detailedFees || [],
          bracketSettings: data.data.bracketSettings || {
            maxFightersPerBracket: 0,
          },
          ruleStyles: data.data.ruleStyles || {
            semiContact: [],
            fullContact: [],
          },
        })
      } else {
        alert(data.message || 'Error fetching settings')
      }
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const validateField = (name, value) => {
    const newErrors = { ...errors }

    if (name === 'simpleFees.fighterFee') {
      if (value === '' || value === null || value === undefined) {
        newErrors.fighterFee = 'Fighter Registration Fee is required'
      } else if (isNaN(value)) {
        newErrors.fighterFee = 'Fighter fee must be a valid number'
      } else {
        const numValue = parseFloat(value)
        if (numValue !== -1 && (numValue < 1 || numValue === 0)) {
          newErrors.fighterFee = 'Fighter fee must be ≥ 1 or -1 to disable'
        } else {
          delete newErrors.fighterFee
        }
      }
    }

    if (name === 'simpleFees.trainerFee') {
      if (value === '' || value === null || value === undefined) {
        newErrors.trainerFee = 'Trainer Registration Fee is required'
      } else if (isNaN(value)) {
        newErrors.trainerFee = 'Trainer fee must be a valid number'
      } else {
        const numValue = parseFloat(value)
        if (numValue !== -1 && (numValue < 1 || numValue === 0)) {
          newErrors.trainerFee = 'Trainer fee must be ≥ 1 or -1 to disable'
        } else {
          delete newErrors.trainerFee
        }
      }
    }

    if (name === 'bracketSettings.maxFightersPerBracket') {
      if (value === '' || value === null || value === undefined) {
        newErrors.maxFighters = 'Max Fighters per Bracket is required'
      } else if (isNaN(value) || parseInt(value) < 1) {
        newErrors.maxFighters = 'Max Fighters must be at least 1'
      } else {
        delete newErrors.maxFighters
      }
    }

    setErrors(newErrors)
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    // Validate the field
    validateField(name, value)

    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const validateForm = () => {
    const validationErrors = {}

    // Validate Simple Fees
    if (
      formData.simpleFees.fighterFee === '' ||
      formData.simpleFees.fighterFee === null ||
      formData.simpleFees.fighterFee === undefined
    ) {
      validationErrors.fighterFee = 'Fighter Registration Fee is required'
    } else if (isNaN(formData.simpleFees.fighterFee)) {
      validationErrors.fighterFee = 'Fighter fee must be a valid number'
    } else {
      const numValue = parseFloat(formData.simpleFees.fighterFee)
      if (numValue !== -1 && (numValue < 1 || numValue === 0)) {
        validationErrors.fighterFee = 'Fighter fee must be ≥ 1 or -1 to disable'
      }
    }

    if (
      formData.simpleFees.trainerFee === '' ||
      formData.simpleFees.trainerFee === null ||
      formData.simpleFees.trainerFee === undefined
    ) {
      validationErrors.trainerFee = 'Trainer Registration Fee is required'
    } else if (isNaN(formData.simpleFees.trainerFee)) {
      validationErrors.trainerFee = 'Trainer fee must be a valid number'
    } else {
      const numValue = parseFloat(formData.simpleFees.trainerFee)
      if (numValue !== -1 && (numValue < 1 || numValue === 0)) {
        validationErrors.trainerFee = 'Trainer fee must be ≥ 1 or -1 to disable'
      }
    }

    // Validate Bracket Settings
    if (
      formData.bracketSettings.maxFightersPerBracket === '' ||
      formData.bracketSettings.maxFightersPerBracket === null
    ) {
      validationErrors.maxFighters = 'Max Fighters per Bracket is required'
    } else if (
      isNaN(formData.bracketSettings.maxFightersPerBracket) ||
      parseInt(formData.bracketSettings.maxFightersPerBracket) < 1
    ) {
      validationErrors.maxFighters = 'Max Fighters must be at least 1'
    }

    // Validate Detailed Fees
    formData.detailedFees?.forEach((fee, index) => {
      if (!fee.name?.trim()) {
        validationErrors[`detailedFee_${index}_name`] = `Detailed fee ${
          index + 1
        }: Name is required`
      }

      if (
        fee.feeAmount === '' ||
        fee.feeAmount === null ||
        fee.feeAmount <= 0
      ) {
        validationErrors[`detailedFee_${index}_amount`] = `Detailed fee ${
          index + 1
        }: Fee amount must be greater than 0`
      }

      if (
        fee.minPurchase === '' ||
        fee.minPurchase === null ||
        fee.minPurchase < 1
      ) {
        validationErrors[`detailedFee_${index}_min`] = `Detailed fee ${
          index + 1
        }: Minimum purchase must be at least 1`
      }

      if (
        fee.maxPurchase !== null &&
        fee.maxPurchase !== '' &&
        fee.maxPurchase < fee.minPurchase
      ) {
        validationErrors[`detailedFee_${index}_max`] = `Detailed fee ${
          index + 1
        }: Maximum purchase must be greater than or equal to minimum purchase`
      }
    })

    // Validate Rule Styles - at least one rule must be selected
    const hasRules =
      formData.ruleStyles?.semiContact?.length > 0 ||
      formData.ruleStyles?.fullContact?.length > 0
    if (!hasRules) {
      validationErrors.ruleStyles = 'At least one rule style must be selected'
    }

    return validationErrors
  }

  const handleSave = async () => {
    const validationErrors = validateForm()

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      const errorMessages = Object.values(validationErrors)
      const errorList = errorMessages
        .map((error, index) => `${index + 1}. ${error}`)
        .join('\n')
      enqueueSnackbar(
        `Please fix the following errors before saving:\n\n${errorList}`,
        { variant: 'error' }
      )
      return
    }

    try {
      setLoading(true)

      console.log('Sending tournament settings:', formData)

      const response = await fetch(
        `${API_BASE_URL}/tournament-setting/${eventId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.message || 'Failed to update tournament settings'
        )
      }

      const data = await response.json()
      if (data.success) {
        enqueueSnackbar('Tournament settings updated successfully!', {
          variant: 'success',
        })
        onSave(data.data)
        onClose()
      } else {
        enqueueSnackbar(data.message || 'Error updating tournament settings', {
          variant: 'error',
        })
      }
    } catch (err) {
      enqueueSnackbar(`Error updating settings: ${err.message}`, {
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!visible) return null

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-[#0B1739] rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col'>
        <div className='flex justify-between items-center p-6 pb-0'>
          <h2 className='text-xl font-bold'>Tournament Settings</h2>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-white text-2xl'
          >
            &times;
          </button>
        </div>

        <div className='flex-1 overflow-y-auto p-6'>
          <div className='space-y-6'>
            <div>
              <h3 className='text-lg font-semibold mb-4'>Simple Fees</h3>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                <div>
                  <label className='block text-sm mb-1'>
                    Fighter Registration Fee{' '}
                    <span className='text-red-400'>*</span>
                  </label>
                  <div className='relative'>
                    <span className='absolute left-3 top-1/2 transform -translate-y-1/2'>
                      {formData.simpleFees.currency}
                    </span>
                    <input
                      type='number'
                      name='simpleFees.fighterFee'
                      value={formData.simpleFees.fighterFee}
                      onChange={handleChange}
                      placeholder='e.g., 50 or -1 to disable'
                      step='1'
                      className={`w-full bg-[#0A1330] border rounded-lg p-2 pl-8 ${
                        errors.fighterFee
                          ? 'border-red-500'
                          : 'border-[#343B4F]'
                      }`}
                    />
                  </div>
                  {errors.fighterFee && (
                    <p className='text-red-400 text-xs mt-1'>
                      {errors.fighterFee}
                    </p>
                  )}
                  <p className='text-xs text-gray-400 mt-1'>
                    Must be ≥ 1 or -1 to disable
                  </p>
                </div>
                <div>
                  <label className='block text-sm mb-1'>
                    Trainer Registration Fee{' '}
                    <span className='text-red-400'>*</span>
                  </label>
                  <div className='relative'>
                    <span className='absolute left-3 top-1/2 transform -translate-y-1/2'>
                      {formData.simpleFees.currency}
                    </span>
                    <input
                      type='number'
                      name='simpleFees.trainerFee'
                      value={formData.simpleFees.trainerFee}
                      onChange={handleChange}
                      placeholder='e.g., 5 or -1 to disable'
                      step='1'
                      className={`w-full bg-[#0A1330] border rounded-lg p-2 pl-8 ${
                        errors.trainerFee
                          ? 'border-red-500'
                          : 'border-[#343B4F]'
                      }`}
                    />
                  </div>
                  {errors.trainerFee && (
                    <p className='text-red-400 text-xs mt-1'>
                      {errors.trainerFee}
                    </p>
                  )}
                  <p className='text-xs text-gray-400 mt-1'>
                    Must be ≥ 1 or -1 to disable
                  </p>
                </div>
                <div>
                  <label className='block text-sm mb-1'>
                    Currency Type <span className='text-red-400'>*</span>
                  </label>
                  <select
                    name='simpleFees.currency'
                    value={formData.simpleFees.currency}
                    onChange={handleChange}
                    className='w-full bg-[#0A1330] border border-[#343B4F] rounded-lg p-2'
                  >
                    <option value='$'>USD ($)</option>
                    <option value='₹'>INR (₹)</option>
                    <option value='€'>EUR (€)</option>
                    <option value='£'>GBP (£)</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h3 className='text-lg font-semibold mb-4'>Bracket Settings</h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
                <div>
                  <label className='block text-sm mb-1'>
                    Max Fighters per Bracket{' '}
                    <span className='text-red-400'>*</span>
                  </label>
                  <input
                    type='number'
                    name='bracketSettings.maxFightersPerBracket'
                    value={formData.bracketSettings.maxFightersPerBracket}
                    onChange={handleChange}
                    placeholder='e.g., 4'
                    min='1'
                    className={`w-full bg-[#0A1330] border rounded-lg p-2 ${
                      errors.maxFighters ? 'border-red-500' : 'border-[#343B4F]'
                    }`}
                  />
                  {errors.maxFighters && (
                    <p className='text-red-400 text-xs mt-1'>
                      {errors.maxFighters}
                    </p>
                  )}
                  <p className='text-xs text-gray-400 mt-1'>
                    Must be at least 1
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className='flex justify-between items-center mb-4'>
                <h3 className='text-lg font-semibold'>Detailed Fees</h3>
                <button
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      detailedFees: [
                        ...prev.detailedFees,
                        {
                          id: Date.now(), // Add unique ID
                          type: 'Bracket',
                          name: '',
                          feeAmount: '',
                          minPurchase: 1,
                          maxPurchase: '',
                          sport: '',
                          allSports: false,
                        },
                      ],
                    }))
                  }}
                  className='px-3 py-1 bg-green-600 rounded text-sm hover:bg-green-700'
                >
                  + Add Fee
                </button>
              </div>
              <div className='space-y-3 max-h-60 overflow-y-auto'>
                {formData.detailedFees?.map((fee, index) => (
                  <div
                    key={index}
                    className='bg-[#0A1330] p-4 rounded-lg border border-[#343B4F]'
                  >
                    <div className='grid grid-cols-2 md:grid-cols-3 gap-3 mb-3'>
                      <div>
                        <label className='block text-xs mb-1'>
                          Bracket / Single Bout{' '}
                          <span className='text-red-400'>*</span>
                        </label>
                        <select
                          value={fee.type}
                          onChange={(e) => {
                            const newFees = [...formData.detailedFees]
                            newFees[index] = {
                              ...newFees[index],
                              type: e.target.value,
                            }
                            setFormData((prev) => ({
                              ...prev,
                              detailedFees: newFees,
                            }))
                          }}
                          className='w-full bg-[#0B1739] border border-[#343B4F] rounded p-1 text-sm'
                        >
                          <option value='Bracket'>Bracket</option>
                          <option value='Single Bout'>Single Bout</option>
                        </select>
                      </div>
                      <div>
                        <label className='block text-xs mb-1'>
                          Name <span className='text-red-400'>*</span>
                        </label>
                        <input
                          type='text'
                          value={fee.name}
                          onChange={(e) => {
                            const newFees = [...formData.detailedFees]
                            newFees[index] = {
                              ...newFees[index],
                              name: e.target.value,
                            }
                            setFormData((prev) => ({
                              ...prev,
                              detailedFees: newFees,
                            }))
                          }}
                          className={`w-full bg-[#0B1739] border rounded p-1 text-sm ${
                            errors[`detailedFee_${index}_name`]
                              ? 'border-red-500'
                              : 'border-[#343B4F]'
                          }`}
                          placeholder='e.g., "Discounts by Age"'
                        />
                        {errors[`detailedFee_${index}_name`] && (
                          <p className='text-red-400 text-xs mt-1'>
                            {errors[`detailedFee_${index}_name`]}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className='block text-xs mb-1'>
                          Registration Fee Amount (USD){' '}
                          <span className='text-red-400'>*</span>
                        </label>
                        <input
                          type='number'
                          value={fee.feeAmount}
                          onChange={(e) => {
                            const newFees = [...formData.detailedFees]
                            newFees[index] = {
                              ...newFees[index],
                              feeAmount: e.target.value,
                            }
                            setFormData((prev) => ({
                              ...prev,
                              detailedFees: newFees,
                            }))
                          }}
                          className={`w-full bg-[#0B1739] border rounded p-1 text-sm ${
                            errors[`detailedFee_${index}_amount`]
                              ? 'border-red-500'
                              : 'border-[#343B4F]'
                          }`}
                          placeholder='e.g., 25'
                          min='0.01'
                          step='0.01'
                        />
                        {errors[`detailedFee_${index}_amount`] && (
                          <p className='text-red-400 text-xs mt-1'>
                            {errors[`detailedFee_${index}_amount`]}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className='grid grid-cols-2 md:grid-cols-5 gap-3'>
                      <div>
                        <label className='block text-xs mb-1'>
                          When Purchasing At Least{' '}
                          <span className='text-red-400'>*</span>
                        </label>
                        <select
                          value={fee.minPurchase}
                          onChange={(e) => {
                            const newFees = [...formData.detailedFees]
                            newFees[index] = {
                              ...newFees[index],
                              minPurchase: Number(e.target.value),
                            }
                            setFormData((prev) => ({
                              ...prev,
                              detailedFees: newFees,
                            }))
                          }}
                          className={`w-full bg-[#0B1739] border rounded p-1 text-sm ${
                            errors[`detailedFee_${index}_min`]
                              ? 'border-red-500'
                              : 'border-[#343B4F]'
                          }`}
                        >
                          <option value=''>REQUIRED</option>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <option key={num} value={num}>
                              {num}
                            </option>
                          ))}
                        </select>
                        {errors[`detailedFee_${index}_min`] && (
                          <p className='text-red-400 text-xs mt-1'>
                            {errors[`detailedFee_${index}_min`]}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className='block text-xs mb-1'>
                          When Purchasing At Most
                        </label>
                        <input
                          type='number'
                          value={fee.maxPurchase || ''}
                          onChange={(e) => {
                            const newFees = [...formData.detailedFees]
                            newFees[index] = {
                              ...newFees[index],
                              maxPurchase: e.target.value
                                ? Number(e.target.value)
                                : '',
                            }
                            setFormData((prev) => ({
                              ...prev,
                              detailedFees: newFees,
                            }))
                          }}
                          className={`w-full bg-[#0B1739] border rounded p-1 text-sm border-[#343B4F]`}
                          placeholder='OPTIONAL'
                          min={fee.minPurchase || 1}
                        />
                      </div>
                      <div>
                        <label className='block text-xs mb-1'>
                          Select Sport
                        </label>
                        <select
                          value={fee.sport}
                          onChange={(e) => {
                            const newFees = [...formData.detailedFees]
                            newFees[index] = {
                              ...newFees[index],
                              sport: e.target.value,
                              allSports: false,
                            }
                            setFormData((prev) => ({
                              ...prev,
                              detailedFees: newFees,
                            }))
                          }}
                          className='w-full bg-[#0B1739] border border-[#343B4F] rounded p-1 text-sm'
                          disabled={fee.allSports}
                        >
                          <option value=''>Select Sport</option>
                          {sportsData.map((sport) => (
                            <option key={sport.value} value={sport.label}>
                              {sport.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className='block text-xs mb-1'>All Sports</label>
                        <button
                          type='button'
                          onClick={() => {
                            const newFees = [...formData.detailedFees]
                            newFees[index] = {
                              ...newFees[index],
                              allSports: !fee.allSports,
                              sport: fee.allSports ? '' : 'All Sports',
                            }
                            setFormData((prev) => ({
                              ...prev,
                              detailedFees: newFees,
                            }))
                          }}
                          className={`w-full p-1 rounded text-xs ${
                            fee.allSports
                              ? 'bg-blue-600 text-white'
                              : 'bg-[#0B1739] border border-[#343B4F] text-gray-300'
                          }`}
                        >
                          {fee.allSports
                            ? 'All Sports Selected'
                            : 'Apply to All Sports'}
                        </button>
                      </div>
                      <div className='flex items-end'>
                        <button
                          onClick={() => {
                            const newFees = formData.detailedFees.filter(
                              (_, i) => i !== index
                            )
                            setFormData((prev) => ({
                              ...prev,
                              detailedFees: newFees,
                            }))
                          }}
                          className='px-2 py-1 bg-red-600 rounded text-xs hover:bg-red-700'
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className='text-lg font-semibold mb-4'>
                Rule Styles for Registration{' '}
                <span className='text-red-400'>*</span>
              </h3>
              {errors.ruleStyles && (
                <p className='text-red-400 text-sm mb-3'>{errors.ruleStyles}</p>
              )}
              <div className='space-y-4'>
                <div>
                  <h4 className='font-medium mb-3'>Semi Contact Rules</h4>
                  <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
                    {[
                      'Point Sparring: Unified Rules',
                      'Point Sparring: Point Boxing',
                      'Point Sparring: Modified Muay Thai',
                      'Point Sparring: MMA',
                      'Point Sparring: International Rules',
                    ].map((rule) => (
                      <label
                        key={`semi-${rule}`}
                        className='flex items-center space-x-2 text-sm'
                      >
                        <input
                          type='checkbox'
                          checked={
                            formData.ruleStyles?.semiContact?.includes(rule) ||
                            false
                          }
                          onChange={(e) => {
                            const isChecked = e.target.checked
                            setFormData((prev) => {
                              const currentSemi =
                                prev.ruleStyles?.semiContact || []
                              const newSemi = isChecked
                                ? [...currentSemi, rule]
                                : currentSemi.filter((r) => r !== rule)
                              return {
                                ...prev,
                                ruleStyles: {
                                  ...prev.ruleStyles,
                                  semiContact: newSemi,
                                },
                              }
                            })
                          }}
                          className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                        />
                        <span>{rule}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className='font-medium mb-3'>Full Contact Rules</h4>
                  <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
                    {[
                      'Boxing',
                      'Brazilian Jiu-Jitsu: No Gi',
                      'Brazilian Jiu-Jitsu: Gi',
                      'Kickboxing: International Rules',
                      'Kickboxing: IKF Unified Rules',
                      'Kickboxing: American High Kick',
                      'Kickboxing: Freestyle',
                      'MMA',
                      'Muay Thai: Modified',
                      'Muay Thai: Full Rules',
                      'Wrestling',
                    ].map((rule) => (
                      <label
                        key={`full-${rule}`}
                        className='flex items-center space-x-2 text-sm'
                      >
                        <input
                          type='checkbox'
                          checked={
                            formData.ruleStyles?.fullContact?.includes(rule) ||
                            false
                          }
                          onChange={(e) => {
                            const isChecked = e.target.checked
                            setFormData((prev) => {
                              const currentFull =
                                prev.ruleStyles?.fullContact || []
                              const newFull = isChecked
                                ? [...currentFull, rule]
                                : currentFull.filter((r) => r !== rule)
                              return {
                                ...prev,
                                ruleStyles: {
                                  ...prev.ruleStyles,
                                  fullContact: newFull,
                                },
                              }
                            })
                          }}
                          className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                        />
                        <span>{rule}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='flex justify-end gap-4 p-6 pt-4 border-t border-[#343B4F]'>
          <button
            onClick={onClose}
            className='px-4 py-2 border border-[#343B4F] rounded-lg hover:bg-[#0f1a40]'
          >
            Close
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className='px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50'
          >
            {loading ? (
              'Saving...'
            ) : (
              <>
                <Pencil size={16} />
                Save
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default TournamentSettingsModal
