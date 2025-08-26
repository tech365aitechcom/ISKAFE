import React from 'react'
import {
  ResponsiveContainer,
  LineChart,
  BarChart,
  PieChart,
  Bar,
  Line,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import {
  Filter,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  BarChart2,
  GanttChart,
} from 'lucide-react'

export default function DashboardGraphs({ dashboardData, activeFilter, setActiveFilter }) {
  if (!dashboardData) {
    return (
      <div className='bg-slate-900 p-6 rounded-xl m-6'>
        <div className='animate-pulse'>
          <div className='h-6 bg-slate-800 rounded mb-6 w-48'></div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6'>
            {[...Array(6)].map((_, i) => (
              <div key={i} className='bg-slate-800 p-4 rounded-lg'>
                <div className='h-4 bg-slate-700 rounded mb-4 w-32'></div>
                <div className='h-64 bg-slate-700 rounded'></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Event participation data - format API data
  const participationData = dashboardData.eventParticipationTrend.map(
    (item) => ({
      date: new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      count: item.count,
    })
  )

  // Ticket types data - format API data and sort by count (most to least purchased)
  const ticketTypes = dashboardData.ticketTypeBreakdown
    .sort((a, b) => b.count - a.count) // Sort by count descending
    .map((item, index) => {
      const colors = [
        '#3b82f6',
        '#8b5cf6',
        '#ec4899',
        '#f43f5e',
        '#10b981',
        '#f59e0b',
      ]
      return {
        name: item.type,
        value: item.count,
        color: colors[index % colors.length],
      }
    })

  // Daily ticket sales - format API data
  const dailySales = dashboardData.dailyTicketSales.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    sales: item.count,
  }))

  // Revenue vs redemption - format API data
  const revenueData = dashboardData.redemptionStats.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    revenue: item.totalRevenue,
    redemption: item.redeemedRevenue,
  }))

  // Weight class distribution - format API data
  const weightClasses = dashboardData.weightClassDistribution.map((item) => ({
    class: item.weightClass.split(' (')[0], // Remove weight details for display
    male: item.male,
    female: item.female,
    other: item.other,
  }))

  // Bout progress - format API data
  const completedPercent = parseFloat(dashboardData.boutProgress.completed)
  const pendingPercent = parseFloat(dashboardData.boutProgress.pending)
  const boutProgress = [
    { name: 'Completed', value: completedPercent, color: '#10b981' },
    { name: 'Pending', value: pendingPercent, color: '#f59e0b' },
  ]

  return (
    <div className='bg-slate-900 p-6 rounded-xl m-6'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-xl font-semibold text-slate-400'>
          Event Analytics
        </h2>
        <div className='flex items-center gap-4'>
          <div className='flex gap-2 bg-slate-800 rounded-lg p-1'>
            {['daily', 'weekly', 'monthly'].map((filter) => (
              <button
                key={filter}
                className={`px-3 py-1 rounded-md text-sm ${
                  activeFilter === filter
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
          <button className='flex items-center gap-2 text-slate-400 hover:text-white text-sm'>
            <Filter size={16} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6'>
        {/* Event Participation Trend */}
        <div className='md:col-span-2 lg:col-span-2 bg-slate-800 p-4 rounded-lg'>
          <div className='flex items-center gap-2 mb-4 text-slate-300'>
            <LineChartIcon size={16} />
            <h3 className='font-medium'>Event Participation Trend</h3>
          </div>
          <div className='h-48 sm:h-64'>
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart data={participationData}>
                <CartesianGrid strokeDasharray='3 3' stroke='#334155' />
                <XAxis
                  dataKey='date'
                  stroke='#64748b'
                  tick={{ fill: '#94a3b8' }}
                />
                <YAxis stroke='#64748b' tick={{ fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    color: '#f8fafc',
                    borderRadius: '0.375rem',
                  }}
                />
                <Line
                  type='monotone'
                  dataKey='count'
                  stroke='#22d3ee'
                  strokeWidth={2}
                  activeDot={{ r: 6, fill: '#082f49' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ticket Types Breakdown */}
        <div className='bg-slate-800 p-4 rounded-lg'>
          <div className='flex items-center gap-2 mb-4 text-slate-300'>
            <PieChartIcon size={16} />
            <h3 className='font-medium'>Ticket Types Breakdown</h3>
          </div>
          <div className='h-80 flex flex-col'>
            <div className='flex-1 min-h-0'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={ticketTypes}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    outerRadius='85%'
                    innerRadius='0%'
                    fill='#8884d8'
                    dataKey='value'
                    label={false}
                  >
                    {ticketTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#475569',
                      color: '#ffffff',
                      borderRadius: '0.5rem',
                      border: '1px solid #475569',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    }}
                    labelStyle={{ color: '#ffffff' }}
                    formatter={(value, name) => [`${value} tickets`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Custom Legend */}
            <div className='grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-700'>
              {ticketTypes.map((entry, index) => (
                <div
                  key={`legend-${index}`}
                  className='flex items-center gap-2 text-sm'
                >
                  <div
                    className='w-3 h-3 rounded-sm flex-shrink-0'
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className='text-slate-300 truncate'>{entry.name}</span>
                  <span className='text-slate-400 text-xs ml-auto'>
                    {entry.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Daily Ticket Sales */}
        <div className='bg-slate-800 p-4 rounded-lg'>
          <div className='flex items-center gap-2 mb-4 text-slate-300'>
            <LineChart size={16} />
            <h3 className='font-medium'>Daily Ticket Sales</h3>
          </div>
          <div className='h-48 sm:h-64'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={dailySales}>
                <CartesianGrid strokeDasharray='3 3' stroke='#334155' />
                <XAxis
                  dataKey='date'
                  stroke='#64748b'
                  tick={{ fill: '#94a3b8' }}
                />
                <YAxis stroke='#64748b' tick={{ fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    color: '#f8fafc',
                    borderRadius: '0.375rem',
                  }}
                />
                <Bar dataKey='sales' fill='#8b5cf6' radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue vs Redemption */}
        <div className='lg:col-span-2 bg-slate-800 p-4 rounded-lg'>
          <div className='flex items-center gap-2 mb-4 text-slate-300'>
            <BarChart2 size={16} />
            <h3 className='font-medium'>Revenue vs Redemption</h3>
          </div>
          <div className='h-48 sm:h-64'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray='3 3' stroke='#334155' />
                <XAxis
                  dataKey='date'
                  stroke='#64748b'
                  tick={{ fill: '#94a3b8' }}
                />
                <YAxis stroke='#64748b' tick={{ fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    color: '#f8fafc',
                    borderRadius: '0.375rem',
                  }}
                />
                <Legend />
                <Bar dataKey='revenue' fill='#10b981' name='Revenue ($)' />
                <Bar dataKey='redemption' fill='#f59e0b' name='Redeemed ($)' />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bout Result Progress Tracker */}
        <div className='bg-slate-800 p-4 rounded-lg'>
          <div className='flex items-center gap-2 mb-4 text-slate-300'>
            <GanttChart size={16} />
            <h3 className='font-medium'>Bout Result Progress</h3>
          </div>
          <div className='flex flex-col items-center justify-center h-64'>
            <div className='relative w-48 h-48'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={boutProgress}
                    cx='50%'
                    cy='50%'
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey='value'
                  >
                    {boutProgress.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className='absolute inset-0 flex flex-col items-center justify-center'>
                <span className='text-3xl font-bold'>
                  {completedPercent.toFixed(0)}%
                </span>
                <span className='text-slate-400 text-sm'>Completed</span>
              </div>
            </div>
            <div className='flex gap-4 mt-4'>
              {boutProgress.map((item) => (
                <div key={item.name} className='flex items-center gap-2'>
                  <div
                    className='w-3 h-3 rounded-full'
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className='text-sm text-slate-400'>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weight Class Distribution */}
        <div className='lg:col-span-2 bg-slate-800 p-4 rounded-lg'>
          <div className='flex items-center gap-2 mb-4 text-slate-300'>
            <BarChart2 size={16} />
            <h3 className='font-medium'>Weight Class Distribution</h3>
          </div>
          <div className='h-48 sm:h-64'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart
                data={weightClasses}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray='3 3' stroke='#334155' />
                <XAxis
                  dataKey='class'
                  stroke='#64748b'
                  tick={{ fill: '#94a3b8' }}
                />
                <YAxis stroke='#64748b' tick={{ fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    color: '#f8fafc',
                    borderRadius: '0.375rem',
                  }}
                />
                <Legend />
                <Bar dataKey='male' stackId='a' fill='#3b82f6' name='Male' />
                <Bar
                  dataKey='female'
                  stackId='a'
                  fill='#ec4899'
                  name='Female'
                />
                <Bar dataKey='other' stackId='a' fill='#10b981' name='Other' />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}