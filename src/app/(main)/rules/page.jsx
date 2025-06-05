'use client'
import React, { useState } from 'react'
import { FileText, Video } from 'lucide-react'

const dummyRules = [
  {
    categoryTabName: 'Kickboxing',
    subTabName: 'General Rules',
    subTabRuleDescription:
      'Basic competition guidelines and scoring rules for Kickboxing.',
    ruleTitle: 'Kickboxing Match Guidelines',
    ruleDescription: `
      <h3>Basic Rules</h3>
      <ul>
        <li>Protective gear is mandatory</li>
        <li>Three 2-minute rounds per match</li>
        <li>Matches officiated by certified referees</li>
      </ul>
    `,
    pdfUploadUrl: '/downloads/kickboxing-general.pdf',
    videoLink: 'https://youtube.com/watch?v=kickboxing123',
    sortOrder: 1,
    status: true,
    createdBy: '60f7f291bcf86cd799439011',
  },
  {
    categoryTabName: 'Kickboxing',
    subTabName: 'Safety',
    subTabRuleDescription: 'Required safety equipment and medical clearance.',
    ruleTitle: 'Kickboxing Safety Standards',
    ruleDescription: `
      <p>All participants must pass a medical exam and wear approved protective gear.</p>
    `,
    pdfUploadUrl: '/downloads/kickboxing-safety.pdf',
    sortOrder: 2,
    status: true,
    createdBy: '60f7f291bcf86cd799439011',
  },
  {
    categoryTabName: 'Muay Thai',
    subTabName: 'Traditional Techniques',
    subTabRuleDescription: 'Detailed look at the techniques used in Muay Thai.',
    ruleTitle: 'Muay Thai Techniques',
    ruleDescription: `
      <p>Includes elbow, knee, punch, and kick techniques with clinch rules.</p>
    `,
    videoLink: 'https://youtube.com/watch?v=muaythai101',
    sortOrder: 1,
    status: true,
    createdBy: '60f7f291bcf86cd799439011',
  },
]

const groupRules = (rules) => {
  const categoryMap = {}
  for (const rule of rules) {
    if (!categoryMap[rule.categoryTabName]) {
      categoryMap[rule.categoryTabName] = {}
    }
    if (!categoryMap[rule.categoryTabName][rule.subTabName]) {
      categoryMap[rule.categoryTabName][rule.subTabName] = {
        description: rule.subTabRuleDescription,
        rules: [],
      }
    }
    categoryMap[rule.categoryTabName][rule.subTabName].rules.push(rule)
  }
  return categoryMap
}

const PublicRulesScreen = () => {
  const [expandedRules, setExpandedRules] = useState(new Set())
  const grouped = groupRules(dummyRules)
  const categoryTabs = Object.keys(grouped)
  const [activeCategory, setActiveCategory] = useState(categoryTabs[0])

  const toggleRule = (id) => {
    const newSet = new Set(expandedRules)
    newSet.has(id) ? newSet.delete(id) : newSet.add(id)
    setExpandedRules(newSet)
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
        {Object.entries(grouped[activeCategory]).map(
          ([subTabName, { description, rules }]) => (
            <div key={subTabName} className='mb-8'>
              <h2 className='text-2xl font-semibold mb-1'>{subTabName}</h2>
              <p className='text-gray-400 mb-4'>{description}</p>

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
                          className='prose prose-invert max-w-none text-gray-300'
                          dangerouslySetInnerHTML={{
                            __html: rule.ruleDescription,
                          }}
                        />
                        <div className='mt-4 flex gap-4 flex-wrap'>
                          {rule.pdfUploadUrl && (
                            <a
                              href={rule.pdfUploadUrl}
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
