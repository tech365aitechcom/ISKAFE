import React from 'react'
import {
  Users,
  Calendar,
  Sword,
  Ticket,
  MapPin,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  MapIcon,
} from 'lucide-react'

export default function DashboardStats({ dashboardData }) {
  const formatValue = (value) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`
    }
    return value.toString()
  }

  const formatCurrency = (value) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`
    }
    return `$${value}`
  }

  if (!dashboardData) {
    return (
      <div className='flex flex-wrap gap-4 w-full bg-slate-950 p-6'>
        <div className='flex-1 min-w-64 bg-slate-900 rounded-xl border border-slate-800 p-5 animate-pulse'>
          <div className='h-4 bg-slate-800 rounded mb-2'></div>
          <div className='h-8 bg-slate-800 rounded'></div>
        </div>
      </div>
    )
  }

  const stats = [
    {
      id: 1,
      title: 'Total Fighters',
      value: formatValue(dashboardData.totalFightersData.total),
      icon: Users,
      breakdown: {
        male: dashboardData.totalFightersData.genderSplit.male,
        female: dashboardData.totalFightersData.genderSplit.female,
        other: dashboardData.totalFightersData.genderSplit.other,
      },
    },
    {
      id: 2,
      title: 'Total Events',
      value: dashboardData.totalEvents.toString(),
      icon: Calendar,
    },
    {
      id: 3,
      title: 'Bouts Today',
      value: dashboardData.todaysBoutCount.toString(),
      live: true,
      icon: Sword,
    },
    {
      id: 4,
      title: 'Total Revenue',
      value: formatCurrency(dashboardData.totalRevenue),
      icon: DollarSign,
    },
    {
      id: 5,
      title: 'Tickets Sold',
      value: dashboardData.totalTickets.toString(),
      icon: Ticket,
    },
    {
      id: 6,
      title: 'Total Venues',
      value: dashboardData.totalVenues.toString(),
      icon: MapPin,
      hasMap: true,
    },
  ]

  return (
    <div className='flex flex-wrap gap-4 w-full bg-slate-950 p-6'>
      {stats.map((stat) => (
        <div
          key={stat.id}
          className='flex-1 min-w-64 bg-slate-900 rounded-xl border border-slate-800 p-5 relative overflow-hidden'
        >
          <div className='flex justify-between items-center mb-2'>
            <div className='flex items-center gap-2 text-slate-400'>
              <stat.icon size={16} />
              <span className='text-sm'>{stat.title}</span>
            </div>
            {stat.live && (
              <span className='text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded flex items-center'>
                <div className='w-2 h-2 rounded-full bg-red-500 mr-1 animate-pulse'></div>
                LIVE
              </span>
            )}
          </div>

          <div className='flex items-center gap-2'>
            <span className='text-3xl font-bold text-white'>{stat.value}</span>
            {stat.change && (
              <div
                className={`px-1 py-0.5 rounded flex items-center text-xs ${
                  stat.increase
                    ? 'text-emerald-500 border border-[#05C16833] bg-[#05C16833]'
                    : 'text-rose-500 border border-[#FF5A6533] bg-[#FF5A6533]'
                }`}
              >
                {stat.increase ? (
                  <ArrowUpRight size={14} />
                ) : (
                  <ArrowDownRight size={14} />
                )}
                <span>{stat.change}%</span>
              </div>
            )}
          </div>

          {stat.breakdown && (
            <div className='mt-2 flex gap-2 text-xs text-slate-500'>
              {Object.entries(stat.breakdown).map(([key, value]) => (
                <span key={key}>
                  {key}: {value.toLocaleString()}
                </span>
              ))}
            </div>
          )}

          {stat.statuses && (
            <div className='flex gap-2 mt-3'>
              {Object.entries(stat.statuses).map(([status, count]) => (
                <div key={status} className='flex items-center gap-1'>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      status === 'upcoming'
                        ? 'bg-blue-500'
                        : status === 'ongoing'
                        ? 'bg-emerald-500'
                        : 'bg-slate-600'
                    }`}
                  ></div>
                  <span className='text-xs text-slate-400'>
                    {count} {status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {stat.hasMap && (
            <div className='mt-2 flex items-center gap-2 text-xs text-slate-500'>
              <MapIcon size={12} className='text-blue-400' />
              <span>View on map</span>
            </div>
          )}

          <div className='absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-20 blur-xl bg-[#0B1739]' />
        </div>
      ))}
    </div>
  )
}
