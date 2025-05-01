import {
  ArrowUpRight,
  ArrowDownRight,
  Users,
  MapPin,
  Star,
  Calendar,
} from "lucide-react";
import { useState } from "react";

export default function DashboardStats() {
  const [stats] = useState([
    {
      id: 1,
      title: "Event Checkin",
      value: "50.8K",
      change: 28.4,
      increase: true,
      icon: Calendar,
    },
    {
      id: 2,
      title: "Monthly users",
      value: "23.6K",
      change: 12.6,
      increase: false,
      icon: Users,
    },
    {
      id: 3,
      title: "Venues",
      value: "756",
      change: 3.1,
      increase: true,
      icon: MapPin,
    },
    {
      id: 4,
      title: "Subscriptions",
      value: "2.3K",
      change: 11.3,
      increase: true,
      icon: Star,
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
            <button className="text-slate-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-white">{stat.value}</span>
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
          </div>

          <div
            className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-20 blur-xl bg-[#0B1739]
            "
          />
        </div>
      ))}
    </div>
  );
}
