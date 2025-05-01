import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Calendar, ChevronDown } from "lucide-react";

export default function ReportsOverview() {
  const [revenueData] = useState([
    { month: "Jan", users: 15000, fighters: 7000, newCustomers: 6000 },
    { month: "Feb", users: 28000, fighters: 12000, newCustomers: 8000 },
    { month: "Mar", users: 36000, fighters: 14000, newCustomers: 22000 },
    { month: "Apr", users: 38000, fighters: 12000, newCustomers: 10000 },
    { month: "May", users: 16000, fighters: 8000, newCustomers: 4000 },
    { month: "Jun", users: 22000, fighters: 14000, newCustomers: 8000 },
    { month: "Jul", users: 14000, fighters: 6000, newCustomers: 0 },
    { month: "Aug", users: 42000, fighters: 8000, newCustomers: 18000 },
    { month: "Sep", users: 18000, fighters: 12000, newCustomers: 4000 },
    { month: "Oct", users: 24000, fighters: 6000, newCustomers: 2000 },
    { month: "Nov", users: 34000, fighters: 8000, newCustomers: 4000 },
    { month: "Dec", users: 32000, fighters: 9000, newCustomers: 8000 },
  ]);

  return (
    <div className="bg-slate-950 text-white p-6">
      <h1 className="text-2xl font-semibold mb-6">Reports overview</h1>

      <div className="mb-6">
        <button className="flex items-center text-sm text-slate-400 bg-transparent border border-slate-700 rounded-md px-3 py-1.5">
          <Calendar size={14} className="mr-2" />
          <span>Select date</span>
          <ChevronDown size={14} className="ml-2" />
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900 p-6 rounded-xl">
          <h2 className="text-lg font-medium mb-6">Website Visitors</h2>
          <div
            className="flex justify-center items-center relative"
            style={{ height: "240px" }}
          >
            <div className="relative w-56 h-56">
              <svg className="w-full h-full" viewBox="0 0 200 200">
                <path
                  d="M40,100 A60,60 0 1,1 160,100"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="16"
                  strokeLinecap="round"
                />
                <path
                  d="M40,100 A60,60 0 0,1 160,100"
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="16"
                  strokeLinecap="round"
                />
                <path
                  d="M100,160 A60,60 0 0,1 40,100"
                  fill="none"
                  stroke="#d946ef"
                  strokeWidth="16"
                  strokeLinecap="round"
                />
                <path
                  d="M160,100 A60,60 0 0,1 124,142"
                  fill="none"
                  stroke="#d946ef"
                  strokeWidth="16"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold">150k</span>
              </div>
            </div>
          </div>
          <div className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                <span className="text-slate-300">Subscribed</span>
              </div>
              <span className="font-medium">30%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-cyan-400 mr-2"></div>
                <span className="text-slate-300">Non-Subscribed</span>
              </div>
              <span className="font-medium">50%</span>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 p-6 rounded-xl lg:col-span-2">
          <div className="flex flex-col">
            <h2 className="text-lg mb-2">Revenue by customer type</h2>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-3xl font-bold">$240.8K</h2>
              <span className="text-xs bg-emerald-500/20 text-emerald-500 px-2 py-1 rounded-md">
                14.8%
              </span>
              <div className="flex flex-wrap gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span className="text-sm text-slate-300">Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-slate-300">
                    Fighters & Trainers
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                  <span className="text-sm text-slate-300">New customers</span>
                </div>
                <div className="ml-auto">
                  <button className="flex items-center text-sm text-slate-400 bg-[#0A1330] rounded-md px-3 py-1.5">
                    <Calendar size={14} className="mr-2" />
                    <span>Jan 2024 - Dec 2024</span>
                    <ChevronDown size={14} className="ml-2" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-2" style={{ height: "260px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={revenueData}
                margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
                barSize={20}
              >
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  padding={{ left: 10, right: 10 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  tickFormatter={(value) =>
                    value === 0 ? "0K" : `${value / 1000}K`
                  }
                  ticks={[0, 20000, 40000, 60000, 80000, 100000]}
                />
                <Bar
                  dataKey="users"
                  stackId="a"
                  fill="#d946ef"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="fighters"
                  stackId="a"
                  fill="#3b82f6"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="newCustomers"
                  stackId="a"
                  fill="#22d3ee"
                  radius={[0, 0, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
