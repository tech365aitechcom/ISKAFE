import React from "react";
import { ArrowDownIcon } from "lucide-react";

export default function UsersByCountry() {
  const countries = [
    { name: "United states", percentage: 30, color: "bg-purple-500" },
    { name: "United Kingdom", percentage: 20, color: "bg-purple-500" },
    { name: "Canada", percentage: 20, color: "bg-purple-500" },
    { name: "Australia", percentage: 15, color: "bg-blue-400" },
    { name: "Spain", percentage: 15, color: "bg-purple-500" },
  ];

  return (
    <div className="bg-slate-900 text-white p-6 rounded-lg m-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-sm font-medium text-gray-300">
            Users by country
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold">12.4 K</span>
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
              +8.5%
            </span>
          </div>
        </div>
        <button className="flex items-center text-sm text-gray-300 gap-1 hover:text-white">
          Export <ArrowDownIcon size={16} />
        </button>
      </div>

      <div className="flex">
        <div className="w-1/3 space-y-6">
          {countries.map((country, index) => (
            <div key={index} className="space-y-1">
              <div className="text-sm text-gray-300">{country.name}</div>
              <div className="flex items-center gap-4">
                <div className="w-24 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${country.color} rounded-full`}
                    style={{ width: `${country.percentage * 3}px` }}
                  />
                </div>
                <span className="text-xs text-gray-300">
                  {country.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="w-2/3 relative">
          <div className="absolute inset-0 grid place-items-center">
            <div className="w-full h-full relative">
              {/* Dotted world map background */}
              <div className="w-full h-full opacity-50 bg-dotted-map" />

              {/* Highlight points */}
              <div className="absolute top-1/4 left-1/4 h-4 w-4 rounded-full bg-purple-600/50 animate-pulse">
                <div className="absolute inset-0 h-4 w-4 rounded-full bg-purple-600 animate-ping opacity-75" />
              </div>
              <div className="absolute top-1/3 left-1/2 h-4 w-4 rounded-full bg-purple-600/50 animate-pulse">
                <div className="absolute inset-0 h-4 w-4 rounded-full bg-purple-600 animate-ping opacity-75" />
              </div>
              <div className="absolute top-1/2 left-2/3 h-4 w-4 rounded-full bg-purple-600/50 animate-pulse">
                <div className="absolute inset-0 h-4 w-4 rounded-full bg-purple-600 animate-ping opacity-75" />
              </div>
              <div className="absolute top-1/4 right-1/4 h-4 w-4 rounded-full bg-purple-600/50 animate-pulse">
                <div className="absolute inset-0 h-4 w-4 rounded-full bg-purple-600 animate-ping opacity-75" />
              </div>
              <div className="absolute bottom-1/3 right-1/4 h-4 w-4 rounded-full bg-purple-600/50 animate-pulse">
                <div className="absolute inset-0 h-4 w-4 rounded-full bg-purple-600 animate-ping opacity-75" />
              </div>

              {/* Australia callout */}
              <div className="absolute bottom-1/4 right-1/5">
                <div className="h-4 w-4 rounded-full bg-blue-400/50 animate-pulse">
                  <div className="absolute inset-0 h-4 w-4 rounded-full bg-blue-400 animate-ping opacity-75" />
                </div>
                <div className="absolute right-6 -top-1">
                  <div className="text-blue-400 font-bold text-xl">1.86 K</div>
                  <div className="text-blue-400 text-xs">Australia</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
