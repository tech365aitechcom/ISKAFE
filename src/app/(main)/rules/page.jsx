'use client'
import React, { useState } from 'react'

const PublicRulesScreen = () => {
  const [activeTab, setActiveTab] = useState('kickboxing')
  const [expandedRules, setExpandedRules] = useState(new Set())

  const toggleRule = (ruleId) => {
    const newExpanded = new Set(expandedRules)
    if (newExpanded.has(ruleId)) {
      newExpanded.delete(ruleId)
    } else {
      newExpanded.add(ruleId)
    }
    setExpandedRules(newExpanded)
  }

  const rulesData = {
    kickboxing: {
      title: 'Kickboxing Rules',
      description: 'Official rules and regulations for kickboxing competition',
      rules: [
        {
          id: 'general',
          title: 'General Rules',
          content: `
            <h3>Basic Competition Guidelines</h3>
            <p>All kickboxing competitions must adhere to the following fundamental principles:</p>
            <ul>
              <li>Competitors must wear appropriate protective gear at all times</li>
              <li>Matches are conducted under official supervision with certified referees</li>
              <li>Weight classes must be strictly observed</li>
              <li>Medical clearance is required for all participants</li>
            </ul>
            
            <h3>Scoring System</h3>
            <p>Points are awarded based on clean techniques that demonstrate:</p>
            <ul>
              <li>Accuracy and timing</li>
              <li>Power and effectiveness</li>
              <li>Proper technique execution</li>
            </ul>
          `,
          pdfUrl: '/downloads/kickboxing-general-rules.pdf',
          videoUrl: 'https://youtube.com/watch?v=kickboxing-general',
        },
        {
          id: 'safety',
          title: 'Safety Regulations',
          content: `
            <h3>Mandatory Safety Equipment</h3>
            <p>All competitors must wear the following protective gear:</p>
            <ul>
              <li>Approved headgear with face protection</li>
              <li>Mouthguard (custom-fitted recommended)</li>
              <li>Hand wraps and approved gloves</li>
              <li>Shin guards and foot protection</li>
              <li>Groin protection for male competitors</li>
              <li>Chest protection for female competitors</li>
            </ul>
            
            <h3>Medical Requirements</h3>
            <p>Pre-competition medical examination including:</p>
            <ul>
              <li>Current physical examination certificate</li>
              <li>Blood work within 6 months</li>
              <li>Neurological clearance if applicable</li>
            </ul>
          `,
          pdfUrl: '/downloads/kickboxing-safety-rules.pdf',
        },
        {
          id: 'judging',
          title: 'Judging Methods',
          content: `
            <h3>Scoring Criteria</h3>
            <p>Judges evaluate competitors based on:</p>
            <ul>
              <li><strong>Technical Skill (40%)</strong> - Proper execution of techniques</li>
              <li><strong>Effectiveness (30%)</strong> - Impact and control of strikes</li>
              <li><strong>Ring Control (20%)</strong> - Aggression and positioning</li>
              <li><strong>Sportsmanship (10%)</strong> - Conduct and respect</li>
            </ul>
            
            <h3>Point Deductions</h3>
            <p>Points may be deducted for:</p>
            <ul>
              <li>Illegal techniques or targeting</li>
              <li>Unsportsmanlike conduct</li>
              <li>Excessive clinching or holding</li>
              <li>Ignoring referee instructions</li>
            </ul>
          `,
          videoUrl: 'https://youtube.com/watch?v=kickboxing-judging',
        },
      ],
    },
    muaythai: {
      title: 'Muay Thai Rules',
      description: 'Traditional Muay Thai competition guidelines',
      rules: [
        {
          id: 'traditional',
          title: 'Traditional Muay Thai',
          content: `
            <h3>The Art of Eight Limbs</h3>
            <p>Muay Thai utilizes punches, kicks, elbows, and knee strikes:</p>
            <ul>
              <li>Punching techniques similar to western boxing</li>
              <li>Kicks using shins rather than feet</li>
              <li>Elbow strikes in close range combat</li>
              <li>Knee strikes from clinch position</li>
            </ul>
            
            <h3>Clinch Work</h3>
            <p>The clinch is a fundamental aspect of Muay Thai:</p>
            <ul>
              <li>Collar ties and arm control</li>
              <li>Knee strikes from clinch position</li>
              <li>Throws and sweeps are permitted</li>
              <li>Time limits may apply to clinch engagement</li>
            </ul>
          `,
          pdfUrl: '/downloads/muaythai-traditional-rules.pdf',
        },
      ],
    },
    boxing: {
      title: 'Boxing Rules',
      description: 'Professional and amateur boxing regulations',
      rules: [
        {
          id: 'professional',
          title: 'Professional Boxing',
          content: `
            <h3>Professional Competition Standards</h3>
            <p>Professional boxing follows these key regulations:</p>
            <ul>
              <li>Rounds typically last 3 minutes with 1-minute rest</li>
              <li>Championship fights are 12 rounds maximum</li>
              <li>Non-title fights range from 4-10 rounds</li>
              <li>Only punches are permitted - no kicks, elbows, or knees</li>
            </ul>
            
            <h3>Scoring System</h3>
            <p>Professional boxing uses the 10-point must system:</p>
            <ul>
              <li>Winner of each round receives 10 points</li>
              <li>Loser typically receives 9 points</li>
              <li>Knockdowns result in point deductions</li>
              <li>Fouls may result in point deductions</li>
            </ul>
          `,
          pdfUrl: '/downloads/boxing-professional-rules.pdf',
          videoUrl: 'https://youtube.com/watch?v=boxing-professional',
        },
      ],
    },
  }

  return (
    <div className='bg-transparent border-t border-gray-700 text-white min-h-screen'>
      {/* Header Navigation */}
      <div className='p-4'>
        <div className='max-w-6xl mx-auto'>
          <h1 className='text-2xl font-bold mb-4'>Competition Rules</h1>

          {/* Main Tabs Navigation */}
          <div className='flex space-x-1 bg-gray-700 rounded-lg p-1'>
            {Object.entries(rulesData).map(([key, data]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 rounded-md font-medium transition-all ${
                  activeTab === key
                    ? 'bg-yellow-500 text-black'
                    : 'text-gray-300 hover:text-white hover:bg-gray-600'
                }`}
              >
                {data.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className='max-w-6xl mx-auto'>
        {/* Sub-Tab Description */}
        <div className='mb-6'>
          <h2 className='text-xl font-semibold mb-2'>
            {rulesData[activeTab].title}
          </h2>
          <p className='text-gray-400'>{rulesData[activeTab].description}</p>
        </div>

        {/* Rules Content */}
        <div className='space-y-4'>
          {rulesData[activeTab].rules.map((rule) => (
            <div
              key={rule.id}
              className='bg-gray-600 rounded-lg overflow-hidden'
            >
              {/* Rule Header - Expandable */}
              <button
                onClick={() => toggleRule(rule.id)}
                className='w-full p-4 text-left flex justify-between items-center hover:bg-gray-700 transition-colors'
              >
                <h3 className='text-lg font-semibold'>{rule.title}</h3>
                <div className='flex items-center space-x-2'>
                  {/* Active Tab Highlight Indicator */}
                  {activeTab && (
                    <span className='w-2 h-2 bg-yellow-500 rounded-full'></span>
                  )}
                  <svg
                    className={`w-5 h-5 transition-transform ${
                      expandedRules.has(rule.id) ? 'rotate-180' : ''
                    }`}
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 9l-7 7-7-7'
                    />
                  </svg>
                </div>
              </button>

              {/* Expanded Rule Content */}
              {expandedRules.has(rule.id) && (
                <div className='border-t border-gray-700'>
                  <div className='p-6'>
                    {/* Rule Description - Rich Text/HTML */}
                    <div
                      className='prose prose-invert max-w-none mb-6'
                      dangerouslySetInnerHTML={{ __html: rule.content }}
                    />

                    {/* Downloads and Media */}
                    <div className='flex flex-wrap gap-4'>
                      {/* PDF Download */}
                      {rule.pdfUrl && (
                        <a
                          href={rule.pdfUrl}
                          className='inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors'
                          download
                        >
                          <svg
                            className='w-4 h-4 mr-2'
                            fill='currentColor'
                            viewBox='0 0 20 20'
                          >
                            <path
                              fillRule='evenodd'
                              d='M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z'
                              clipRule='evenodd'
                            />
                          </svg>
                          Download PDF Rules
                        </a>
                      )}

                      {/* Embedded Video */}
                      {rule.videoUrl && (
                        <a
                          href={rule.videoUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors'
                        >
                          <svg
                            className='w-4 h-4 mr-2'
                            fill='currentColor'
                            viewBox='0 0 20 20'
                          >
                            <path
                              fillRule='evenodd'
                              d='M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z'
                              clipRule='evenodd'
                            />
                          </svg>
                          Watch Video Guide
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* SEO Meta Information */}
        <div className='mt-8 text-center'>
          <p className='text-gray-500 text-sm'>
            Official competition rules and regulations - Updated{' '}
            {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  )
}

export default PublicRulesScreen
