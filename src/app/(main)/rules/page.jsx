'use client'
import React, { useEffect, useState } from 'react'
import { FileText, Video } from 'lucide-react'
import axios from 'axios'
import { API_BASE_URL } from '../../../constants'
import Loader from '../../_components/Loader'

const groupRules = (rules) => {
  const categoryMap = {}
  for (const rule of rules) {
    if (!categoryMap[rule.category]) {
      categoryMap[rule.category] = {}
    }
    if (!categoryMap[rule.category][rule.subTab]) {
      categoryMap[rule.category][rule.subTab] = {
        description: rule.subTabRuleDescription,
        rules: [],
      }
    }
    categoryMap[rule.category][rule.subTab].rules.push(rule)
  }
  return categoryMap
}

const PublicRulesScreen = () => {
  const [expandedRules, setExpandedRules] = useState(new Set())
  const [rules, setRules] = useState([])
  const [activeCategory, setActiveCategory] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getRules = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/rules/active?page=1&limit=500`
        )
        const fetchedRules = response.data.data.items
        setRules(fetchedRules)

        // Set default active category safely after rules are available
        const grouped = groupRules(fetchedRules)
        const categories = Object.keys(grouped)
        if (categories.length > 0) {
          setActiveCategory(categories[0])
        }
      } catch (error) {
        console.log('Error fetching rules:', error)
      } finally {
        setLoading(false)
      }
    }

    getRules()
  }, [])

  const toggleRule = (id) => {
    const newSet = new Set(expandedRules)
    newSet.has(id) ? newSet.delete(id) : newSet.add(id)
    setExpandedRules(newSet)
  }

  if (loading) {
    return (
      <div className='text-white min-h-screen flex items-center justify-center'>
        <Loader />
      </div>
    )
  }

  const grouped = groupRules(rules)
  const categoryTabs = Object.keys(grouped)

  if (categoryTabs.length === 0 || !grouped[activeCategory]) {
    return (
      <div className='text-white min-h-screen bg-transparent border-t border-gray-700'>
        <div className='p-4 container mx-auto'>
          <h1 className='text-4xl font-bold mb-6'>Competition Rules</h1>
          <p className='text-gray-400 text-lg'>
            No rules available at the moment.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='text-white min-h-screen bg-transparent border-t border-gray-700'>
      <div className='p-4 container mx-auto'>
        <h1 className='text-4xl font-bold mb-6'>Competition Rules</h1>

        {/* Category Tabs */}
        <div className='flex space-x-4 border-b border-gray-600 mb-8'>
          {categoryTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveCategory(tab)}
              className={`pb-2 text-lg font-medium uppercase tracking-wide border-b-2 ${
                activeCategory === tab
                  ? 'text-yellow-500 border-yellow-500'
                  : 'text-gray-400 border-transparent hover:text-white hover:border-gray-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* SubTabs and Rules */}
        {Object.entries(grouped[activeCategory] || {}).map(
          ([subTab, { description, rules }]) => (
            <div key={subTab} className='mb-8'>
              <h2 className='text-2xl font-semibold mb-1'>{subTab}</h2>
              <p className='text-gray-400 mb-4 break-words whitespace-pre-wrap'>
                {description}
              </p>

              {rules
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((rule) => (
                  <div
                    key={rule._id || rule.ruleTitle}
                    className='mb-6 border border-gray-600 rounded-xl'
                  >
                    <button
                      onClick={() => toggleRule(rule._id || rule.ruleTitle)}
                      className={`w-full text-left p-4 bg-gray-800 hover:bg-gray-700 ${
                        expandedRules.has(rule._id || rule.ruleTitle)
                          ? 'rounded-t-xl'
                          : 'rounded-xl'
                      } transition`}
                    >
                      <div className='flex justify-between items-center'>
                        <span className='text-lg font-semibold'>
                          {rule.ruleTitle}
                        </span>
                        <span className='text-sm text-gray-400'>
                          {expandedRules.has(rule._id || rule.ruleTitle)
                            ? '▲ Hide'
                            : '▼ Show'}
                        </span>
                      </div>
                    </button>

                    {expandedRules.has(rule._id || rule.ruleTitle) && (
                      <div className='p-4 bg-gray-900 rounded-b-xl'>
                        <div
                          className='prose prose-invert max-w-none text-gray-300 break-words whitespace-pre-wrap'
                          dangerouslySetInnerHTML={{
                            __html: rule.ruleDescription,
                          }}
                        />

                        <div className='mt-4 flex gap-4 flex-wrap'>
                          {rule.rule && (
                            <a
                              href={rule.rule}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='flex items-center gap-2 text-blue-400 hover:underline'
                            >
                              <FileText size={18} /> View PDF
                            </a>
                          )}
                          {rule.videoLink && (
                            <a
                              href={rule.videoLink}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='flex items-center gap-2 text-green-400 hover:underline'
                            >
                              <Video size={18} /> Watch Video
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default PublicRulesScreen
