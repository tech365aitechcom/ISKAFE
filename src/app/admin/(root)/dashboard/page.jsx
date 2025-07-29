// src/app/dashboard/page.jsx
"use client";
import React, { useState } from "react";
import {
  Users,
  Calendar,
  Sword,
  Ticket,
  MapPin,
  DollarSign,
  ArrowUpRight,
  Filter,
  Download,
  Mail,
  RefreshCw,
  ChevronDown,
  Circle,
  BarChart2,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  ShieldAlert,
  Clock,
  Flag,
  User,
  GanttChart,
  CreditCard,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  BarChart ,
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
} from "recharts";

// Top Cards Component
export function DashboardStats() {
  const [stats] = useState([
    {
      id: 1,
      title: "Total Fighters",
      value: "12.4K",
      change: 8.5,
      increase: true,
      icon: Users,
      breakdown: { male: 8240, female: 4160 },
    },
    {
      id: 2,
      title: "Total Events",
      value: "24",
      icon: Calendar,
      statuses: { upcoming: 8, ongoing: 6, completed: 10 },
    },
    {
      id: 3,
      title: "Bouts Today",
      value: "86",
      live: true,
      icon: Sword,
    },
    {
      id: 4,
      title: "Total Revenue",
      value: "$240.8K",
      change: 14.8,
      increase: true,
      icon: DollarSign,
    },
    {
      id: 5,
      title: "Tickets Sold",
      value: "8.3K",
      change: 12.6,
      increase: true,
      icon: Ticket,
      breakdown: { general: 5200, vip: 2100, student: 1000 },
    },
    {
      id: 6,
      title: "Total Venues",
      value: "42",
      icon: MapPin,
    },
  ]);

  return (
    <div className="flex flex-wrap gap-4 w-full bg-slate-950 p-6">
      {stats.map((stat) => (
        <div
          key={stat.id}
          className="flex-1 min-w-64 bg-slate-900 rounded-xl border border-slate-800 p-5 relative overflow-hidden"
        >
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2 text-slate-400">
              <stat.icon size={16} />
              <span className="text-sm">{stat.title}</span>
            </div>
            {stat.live && (
              <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded flex items-center">
                <div className="w-2 h-2 rounded-full bg-red-500 mr-1 animate-pulse"></div>
                LIVE
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-white">{stat.value}</span>
            {stat.change && (
              <div
                className={`px-1 py-0.5 rounded flex items-center text-xs ${
                  stat.increase
                    ? "text-emerald-500 border border-[#05C16833] bg-[#05C16833]"
                    : "text-rose-500 border border-[#FF5A6533] bg-[#FF5A6533]"
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
            <div className="mt-2 flex gap-2 text-xs text-slate-500">
              {Object.entries(stat.breakdown).map(([key, value]) => (
                <span key={key}>
                  {key}: {value.toLocaleString()}
                </span>
              ))}
            </div>
          )}

          {stat.statuses && (
            <div className="flex gap-2 mt-3">
              {Object.entries(stat.statuses).map(([status, count]) => (
                <div key={status} className="flex items-center gap-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      status === "upcoming"
                        ? "bg-blue-500"
                        : status === "ongoing"
                        ? "bg-emerald-500"
                        : "bg-slate-600"
                    }`}
                  ></div>
                  <span className="text-xs text-slate-400">
                    {count} {status}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-20 blur-xl bg-[#0B1739]" />
        </div>
      ))}
    </div>
  );
}

// Graphs Section
export function DashboardGraphs() {
  const [activeFilter, setActiveFilter] = useState("monthly");

  // Event participation data
  const participationData = [
    { month: "Jan", fighters: 1200 },
    { month: "Feb", fighters: 1800 },
    { month: "Mar", fighters: 1500 },
    { month: "Apr", fighters: 2400 },
    { month: "May", fighters: 2800 },
    { month: "Jun", fighters: 3200 },
    { month: "Jul", fighters: 3000 },
    { month: "Aug", fighters: 3400 },
    { month: "Sep", fighters: 2900 },
    { month: "Oct", fighters: 3500 },
    { month: "Nov", fighters: 3800 },
    { month: "Dec", fighters: 4200 },
  ];

  // Ticket types data
  const ticketTypes = [
    { name: "General", value: 5200, color: "#3b82f6" },
    { name: "VIP", value: 2100, color: "#8b5cf6" },
    { name: "Student", value: 1000, color: "#ec4899" },
    { name: "Press", value: 300, color: "#f43f5e" },
  ];

  // Daily ticket sales
  const dailySales = [
    { day: "1", sales: 120 },
    { day: "2", sales: 150 },
    { day: "3", sales: 200 },
    { day: "4", sales: 180 },
    { day: "5", sales: 240 },
    { day: "6", sales: 300 },
    { day: "7", sales: 350 },
    { day: "8", sales: 420 },
    { day: "9", sales: 500 },
    { day: "10", sales: 600 },
  ];

  // Revenue vs redemption
  const revenueData = [
    { day: "Mon", revenue: 12000, redemption: 8000 },
    { day: "Tue", revenue: 18000, redemption: 12000 },
    { day: "Wed", revenue: 15000, redemption: 10000 },
    { day: "Thu", revenue: 22000, redemption: 18000 },
    { day: "Fri", revenue: 28000, redemption: 22000 },
    { day: "Sat", revenue: 32000, redemption: 28000 },
    { day: "Sun", revenue: 30000, redemption: 25000 },
  ];

  // Weight class distribution
  const weightClasses = [
    { class: "Flyweight", male: 420, female: 180 },
    { class: "Bantamweight", male: 680, female: 220 },
    { class: "Featherweight", male: 720, female: 280 },
    { class: "Lightweight", male: 840, female: 160 },
    { class: "Welterweight", male: 780, female: 120 },
    { class: "Middleweight", male: 650, female: 50 },
    { class: "Heavyweight", male: 480, female: 20 },
  ];

  // Bout progress
  const boutProgress = [
    { name: "Completed", value: 70, color: "#10b981" },
    { name: "Scheduled", value: 20, color: "#3b82f6" },
    { name: "Pending Result", value: 10, color: "#f59e0b" },
  ];

  return (
    <div className="bg-slate-900 p-6 rounded-xl m-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Event Analytics</h2>
        <div className="flex items-center gap-4">
          <div className="flex gap-2 bg-slate-800 rounded-lg p-1">
            {["daily", "weekly", "monthly"].map((filter) => (
              <button
                key={filter}
                className={`px-3 py-1 rounded-md text-sm ${
                  activeFilter === filter
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 text-slate-400 hover:text-white text-sm">
            <Filter size={16} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Event Participation Trend */}
        <div className="lg:col-span-2 bg-slate-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-4 text-slate-300">
            <LineChartIcon size={16} />
            <h3 className="font-medium">Event Participation Trend</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={participationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="month"
                  stroke="#64748b"
                  tick={{ fill: "#94a3b8" }}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: "#94a3b8" }}
                  tickFormatter={(value) => `${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    color: "#f8fafc",
                    borderRadius: "0.375rem",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="fighters"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  activeDot={{ r: 6, fill: "#082f49" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ticket Types Breakdown */}
        <div className="bg-slate-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-4 text-slate-300">
            <PieChartIcon size={16} />
            <h3 className="font-medium">Ticket Types Breakdown</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ticketTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {ticketTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    color: "#f8fafc",
                    borderRadius: "0.375rem",
                  }}
                  formatter={(value) => [value, "Tickets"]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Ticket Sales */}
        <div className="bg-slate-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-4 text-slate-300">
            <LineChart size={16} />
            <h3 className="font-medium">Daily Ticket Sales</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="day"
                  stroke="#64748b"
                  tick={{ fill: "#94a3b8" }}
                />
                <YAxis stroke="#64748b" tick={{ fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    color: "#f8fafc",
                    borderRadius: "0.375rem",
                  }}
                />
                <Bar dataKey="sales" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue vs Redemption */}
        <div className="lg:col-span-2 bg-slate-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-4 text-slate-300">
            <BarChart2 size={16} />
            <h3 className="font-medium">Revenue vs Redemption</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="day"
                  stroke="#64748b"
                  tick={{ fill: "#94a3b8" }}
                />
                <YAxis stroke="#64748b" tick={{ fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    color: "#f8fafc",
                    borderRadius: "0.375rem",
                  }}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue ($)" />
                <Bar
                  dataKey="redemption"
                  fill="#f59e0b"
                  name="Redemption (%)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bout Result Progress Tracker */}
        <div className="bg-slate-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-4 text-slate-300">
            <GanttChart size={16} />
            <h3 className="font-medium">Bout Result Progress</h3>
          </div>
          <div className="flex flex-col items-center justify-center h-64">
            <div className="relative w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={boutProgress}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {boutProgress.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">86%</span>
                <span className="text-slate-400 text-sm">Completed</span>
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              {boutProgress.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-slate-400">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weight Class Distribution */}
        <div className="lg:col-span-3 bg-slate-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-4 text-slate-300">
            <BarChart2 size={16} />
            <h3 className="font-medium">Weight Class Distribution</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weightClasses}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="class"
                  stroke="#64748b"
                  tick={{ fill: "#94a3b8" }}
                />
                <YAxis stroke="#64748b" tick={{ fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    color: "#f8fafc",
                    borderRadius: "0.375rem",
                  }}
                />
                <Legend />
                <Bar dataKey="male" stackId="a" fill="#3b82f6" name="Male" />
                <Bar
                  dataKey="female"
                  stackId="a"
                  fill="#ec4899"
                  name="Female"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tables Section
export function DashboardTables() {
  // Upcoming events data
  const upcomingEvents = [
    {
      id: 1,
      name: "IKF World Championship",
      date: "2023-11-15",
      venue: "Madison Square Garden",
      fighters: 128,
    },
    {
      id: 2,
      name: "European Open",
      date: "2023-11-22",
      venue: "O2 Arena London",
      fighters: 96,
    },
    {
      id: 3,
      name: "Asian Qualifiers",
      date: "2023-11-30",
      venue: "Tokyo Dome",
      fighters: 84,
    },
    {
      id: 4,
      name: "North American Cup",
      date: "2023-12-05",
      venue: "Staples Center",
      fighters: 112,
    },
  ];

  // Recent fighter registrations
  const fighterRegistrations = [
    {
      id: 1,
      name: "Alex Johnson",
      age: 24,
      class: "Welterweight",
      gym: "Elite MMA",
      date: "2023-11-05",
    },
    {
      id: 2,
      name: "Maria Rodriguez",
      age: 22,
      class: "Featherweight",
      gym: "Team Alpha",
      date: "2023-11-04",
    },
    {
      id: 3,
      name: "James Wilson",
      age: 28,
      class: "Lightweight",
      gym: "Tiger Muay Thai",
      date: "2023-11-03",
    },
    {
      id: 4,
      name: "Li Wei",
      age: 21,
      class: "Flyweight",
      gym: "Dragon Gym",
      date: "2023-11-02",
    },
  ];

  // Bouts missing results
  const missingResults = [
    {
      id: "B-245",
      fighter1: "Alex Johnson",
      fighter2: "Mike Chen",
      time: "14:30",
    },
    {
      id: "B-248",
      fighter1: "Sarah Miller",
      fighter2: "Jessica Lee",
      time: "15:15",
    },
    {
      id: "B-252",
      fighter1: "Carlos Silva",
      fighter2: "David Kim",
      time: "16:45",
    },
    {
      id: "B-256",
      fighter1: "Thomas Wright",
      fighter2: "Ryan Park",
      time: "17:30",
    },
  ];

  // Fighters with alerts
  const fighterAlerts = [
    {
      id: 1,
      name: "Robert Garcia",
      issue: "Medical Expired",
      status: "Critical",
    },
    {
      id: 2,
      name: "Emma Thompson",
      issue: "Weight Verification",
      status: "Warning",
    },
    {
      id: 3,
      name: "Daniel Kim",
      issue: "Suspension Active",
      status: "Critical",
    },
    {
      id: 4,
      name: "Sophia Martinez",
      issue: "Documentation Incomplete",
      status: "Warning",
    },
  ];

  // Ticket logs
  const ticketLogs = [
    {
      id: 1,
      type: "VIP",
      qty: 2,
      revenue: "$450",
      event: "IKF World Championship",
      time: "2023-11-05 10:23",
    },
    {
      id: 2,
      type: "General",
      qty: 4,
      revenue: "$280",
      event: "European Open",
      time: "2023-11-04 14:45",
    },
    {
      id: 3,
      type: "Student",
      qty: 1,
      revenue: "$50",
      event: "Asian Qualifiers",
      time: "2023-11-04 09:12",
    },
    {
      id: 4,
      type: "Press",
      qty: 1,
      revenue: "$0",
      event: "North American Cup",
      time: "2023-11-03 16:30",
    },
  ];

  return (
    <div className="bg-slate-900 p-6 rounded-xl m-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Operational Data</h2>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 text-slate-400 hover:text-white text-sm">
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          <button className="flex items-center gap-2 text-slate-400 hover:text-white text-sm">
            <Download size={16} />
            <span>Export PDF</span>
          </button>
          <button className="flex items-center gap-2 text-slate-400 hover:text-white text-sm">
            <Mail size={16} />
            <span>Email Report</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="bg-slate-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-4 text-slate-300">
            <Calendar size={16} />
            <h3 className="font-medium">Upcoming Events</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-400">
              <thead className="text-xs uppercase bg-slate-700 text-slate-400">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    Event
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Date
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Venue
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Fighters
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {upcomingEvents.map((event) => (
                  <tr
                    key={event.id}
                    className="border-b border-slate-700 hover:bg-slate-750"
                  >
                    <td className="px-4 py-3 font-medium text-white">
                      {event.name}
                    </td>
                    <td className="px-4 py-3">{event.date}</td>
                    <td className="px-4 py-3">{event.venue}</td>
                    <td className="px-4 py-3">{event.fighters}</td>
                    <td className="px-4 py-3">
                      <button className="text-blue-500 hover:text-blue-400 text-sm">
                        Manage Brackets
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Fighter Registrations */}
        <div className="bg-slate-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-4 text-slate-300">
            <User size={16} />
            <h3 className="font-medium">Recent Fighter Registrations</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-400">
              <thead className="text-xs uppercase bg-slate-700 text-slate-400">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    Name
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Age
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Class
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Gym
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Date
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {fighterRegistrations.map((fighter) => (
                  <tr
                    key={fighter.id}
                    className="border-b border-slate-700 hover:bg-slate-750"
                  >
                    <td className="px-4 py-3 font-medium text-white">
                      {fighter.name}
                    </td>
                    <td className="px-4 py-3">{fighter.age}</td>
                    <td className="px-4 py-3">{fighter.class}</td>
                    <td className="px-4 py-3">{fighter.gym}</td>
                    <td className="px-4 py-3">{fighter.date}</td>
                    <td className="px-4 py-3">
                      <button className="text-blue-500 hover:text-blue-400 text-sm">
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bouts Missing Results */}
        <div className="bg-slate-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-4 text-slate-300">
            <Clock size={16} />
            <h3 className="font-medium">Bouts Missing Results</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-400">
              <thead className="text-xs uppercase bg-slate-700 text-slate-400">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    Bout ID
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Fighter 1
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Fighter 2
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Scheduled
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {missingResults.map((bout) => (
                  <tr
                    key={bout.id}
                    className="border-b border-slate-700 hover:bg-slate-750"
                  >
                    <td className="px-4 py-3 font-medium text-white">
                      {bout.id}
                    </td>
                    <td className="px-4 py-3">{bout.fighter1}</td>
                    <td className="px-4 py-3">{bout.fighter2}</td>
                    <td className="px-4 py-3">{bout.time}</td>
                    <td className="px-4 py-3">
                      <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded text-sm">
                        Add Result
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fighters with Alerts */}
        <div className="bg-slate-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-4 text-slate-300">
            <ShieldAlert size={16} />
            <h3 className="font-medium">Fighters with Alerts</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-400">
              <thead className="text-xs uppercase bg-slate-700 text-slate-400">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    Name
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Issue Type
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {fighterAlerts.map((fighter) => (
                  <tr
                    key={fighter.id}
                    className="border-b border-slate-700 hover:bg-slate-750"
                  >
                    <td className="px-4 py-3 font-medium text-white">
                      {fighter.name}
                    </td>
                    <td className="px-4 py-3">{fighter.issue}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          fighter.status === "Critical"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {fighter.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button className="text-blue-500 hover:text-blue-400 text-sm">
                          Fix
                        </button>
                        <button className="text-red-500 hover:text-red-400 text-sm">
                          Suspend
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Spectator Ticket Logs */}
        <div className="lg:col-span-2 bg-slate-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-4 text-slate-300">
            <CreditCard size={16} />
            <h3 className="font-medium">Spectator Ticket Logs</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-400">
              <thead className="text-xs uppercase bg-slate-700 text-slate-400">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    Type
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Qty
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Revenue
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Event
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Time
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {ticketLogs.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="border-b border-slate-700 hover:bg-slate-750"
                  >
                    <td className="px-4 py-3 font-medium text-white">
                      {ticket.type}
                    </td>
                    <td className="px-4 py-3">{ticket.qty}</td>
                    <td className="px-4 py-3">{ticket.revenue}</td>
                    <td className="px-4 py-3">{ticket.event}</td>
                    <td className="px-4 py-3">{ticket.time}</td>
                    <td className="px-4 py-3">
                      <button className="text-blue-500 hover:text-blue-400 text-sm">
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export Controls
function ExportControls() {
  return (
    <div className="fixed top-4 right-6 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-lg p-3">
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 text-slate-300 hover:text-white text-sm px-3 py-1.5 bg-slate-800 rounded-md">
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>

          <div className="relative group">
            <button className="flex items-center gap-2 text-slate-300 hover:text-white text-sm px-3 py-1.5 bg-slate-800 rounded-md">
              <Download size={16} />
              <span>Export</span>
              <ChevronDown size={16} />
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-md shadow-lg hidden group-hover:block">
              <button className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2">
                <Download size={14} />
                <span>Export CSV</span>
              </button>
              <button className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2">
                <Download size={14} />
                <span>Export PDF</span>
              </button>
              <button className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2">
                <Mail size={14} />
                <span>Email Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Dashboard Page
const DashboardPage = () => {
  return (
    <div className="bg-slate-950 min-h-screen">
      <div className="container mx-auto">
        <div className="flex justify-between items-center p-6">
          <h1 className="text-2xl font-bold text-white">IKF Admin Dashboard</h1>
          <div className="text-sm text-slate-400">
            Last updated: {new Date().toLocaleDateString()} at{" "}
            {new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>

        <ExportControls />
        <DashboardStats />
        <DashboardGraphs />
        <DashboardTables />
      </div>
    </div>
  );
};

export default DashboardPage;
