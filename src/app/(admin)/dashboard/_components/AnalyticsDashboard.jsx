import { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CalendarRange, TrendingUp, Circle, ArrowUpRight } from "lucide-react";

export default function AnalyticsDashboard() {
  // Sample data for the revenue line chart
  const [revenueData] = useState([
    { month: "Jan", value: 25000 },
    { month: "Feb", value: 15000 },
    { month: "Mar", value: 10000 },
    { month: "Apr", value: 35000 },
    { month: "May", value: 65000 },
    { month: "Jun", value: 125200 },
    { month: "Jul", value: 110000 },
    { month: "Aug", value: 175000 },
    { month: "Sep", value: 220000 },
    { month: "Oct", value: 190000 },
    { month: "Nov", value: 135000 },
    { month: "Dec", value: 90000 },
  ]);

  // Sample data for the profit bar chart
  const [profitData] = useState(
    Array.from({ length: 24 }, (_, i) => ({
      hour: i % 12 === 0 ? 12 : i % 12,
      ampm: i < 12 ? "AM" : "PM",
      value: Math.floor(Math.random() * 40) + 60,
      secondary: Math.floor(Math.random() * 40) + 20,
    }))
  );

  // Sample data for the events line chart
  const [eventsData] = useState(
    Array.from({ length: 24 }, (_, i) => ({
      hour: i % 12 === 0 ? 12 : i % 12,
      ampm: i < 12 ? "AM" : "PM",
      value: Math.floor(Math.random() * 300) + (i === 16 ? 400 : 50), // Spike at 4PM
    }))
  );

  return (
    <div className="bg-slate-950 text-white p-4 rounded-xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart - Left Section (2/3 width) */}
        <div className="col-span-1 lg:col-span-2 bg-slate-900 p-6 rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-slate-400 text-sm">Total revenue</h3>
              <div className="flex items-center gap-2">
                <h2 className="text-3xl font-bold">$240.8K</h2>
                <span className="text-xs bg-emerald-500/20 text-emerald-500 px-2 py-1 rounded-md flex items-center">
                  <ArrowUpRight size={12} className="mr-1" />
                  24.6%
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Circle size={8} className="fill-cyan-500 text-cyan-500" />
                <span className="text-sm text-slate-400">Revenue</span>
              </div>

              <button className="flex items-center gap-2 text-sm text-slate-400 border border-slate-700 rounded-md px-3 py-1.5">
                <CalendarRange size={14} />
                <span>Jan 2024 - Dec 2024</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            </div>
          </div>

          <div className="h-80 relative">
            <div className="absolute top-0 left-0 bottom-0 flex flex-col justify-between text-xs text-slate-400">
              <span>250K</span>
              <span>200K</span>
              <span>150K</span>
              <span>100K</span>
              <span>50K</span>
              <span>0K</span>
            </div>

            <div className="pl-10 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#22d3ee"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{
                      r: 6,
                      stroke: "#22d3ee",
                      strokeWidth: 2,
                      fill: "#082f49",
                    }}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      color: "#f8fafc",
                      borderRadius: "0.375rem",
                      boxShadow:
                        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    }}
                    formatter={(value) => [
                      `$${value.toLocaleString()}`,
                      "Revenue",
                    ]}
                    labelFormatter={(month) => month}
                    cursor={{
                      stroke: "#475569",
                      strokeWidth: 1,
                      strokeDasharray: "5 5",
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Highlighted data point */}
            <div className="absolute left-1/3 top-1/2 text-left">
              <div className="bg-slate-800 rounded-md p-2 text-sm border border-slate-700">
                <div className="text-cyan-500 font-semibold">$125.2k</div>
                <div className="text-xs text-slate-400">June 21, 2025</div>
                <div className="text-xs text-emerald-500 flex items-center">
                  <ArrowUpRight size={10} className="mr-1" />
                  12.5%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right section with profit and events (1/3 width) */}
        <div className="col-span-1 flex flex-col gap-4">
          {/* Total Profit Section */}
          <div className="bg-slate-900 p-6 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-slate-400">
                <TrendingUp size={14} />
                <span className="text-sm">Total Profit</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-3xl font-bold">$144.6K</h2>
              <span className="text-xs bg-emerald-500/20 text-emerald-500 px-2 py-1 rounded-md flex items-center">
                <ArrowUpRight size={12} className="mr-1" />
                28.5%
              </span>
            </div>

            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={profitData}>
                  <Bar dataKey="value" fill="#22d3ee" radius={[2, 2, 0, 0]} />
                  <Bar
                    dataKey="secondary"
                    fill="#d946ef"
                    radius={[2, 2, 0, 0]}
                  />
                  <XAxis
                    dataKey="hour"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    tickFormatter={(hour, index) => {
                      if (index % 8 === 0)
                        return `${hour} ${profitData[index].ampm}`;
                      return "";
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-slate-400">Last 12 months</span>
              <a href="#" className="text-sm text-purple-500">
                View report
              </a>
            </div>
          </div>

          {/* Total Events Section */}
          <div className="bg-slate-900 p-6 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-slate-400">
                <Circle size={14} className="fill-slate-400 text-slate-400" />
                <span className="text-sm">Total Events</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-3xl font-bold">400</h2>
              <span className="text-xs bg-emerald-500/20 text-emerald-500 px-2 py-1 rounded-md flex items-center">
                <ArrowUpRight size={12} className="mr-1" />
                16.8%
              </span>
            </div>

            <div className="flex text-xs text-slate-400 justify-between px-2">
              <span>500</span>
              <span>250</span>
              <span>10</span>
              <span>0</span>
            </div>

            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={eventsData}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#d946ef"
                    strokeWidth={2}
                    dot={false}
                  />
                  <XAxis
                    dataKey="hour"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    tickFormatter={(hour, index) => {
                      if (index % 8 === 0)
                        return `${hour} ${eventsData[index].ampm}`;
                      return "";
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-between items-center mt-8">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                <span className="text-xs text-slate-400">Live</span>
                <span className="text-xs font-medium">10k visitors</span>
              </div>
              <a href="#" className="text-sm text-purple-500">
                View report
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
