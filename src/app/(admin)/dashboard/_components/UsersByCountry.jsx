import { ArrowUp, Download } from "lucide-react";
import { useState } from "react";

export default function UsersByCountry() {
  const [countryData] = useState([
    { country: "United states", percentage: 30, color: "#d946ef" },
    { country: "United Kingdom", percentage: 20, color: "#d946ef" },
    { country: "Canada", percentage: 20, color: "#d946ef" },
    { country: "Australia", percentage: 15, color: "#22d3ee" },
    { country: "Spain", percentage: 15, color: "#d946ef" },
  ]);

  // Sample coordinates for glowing dots on the map
  const [dots] = useState([
    { x: 25, y: 42, color: "#d946ef", scale: 1 }, // North America
    { x: 48, y: 28, color: "#d946ef", scale: 1 }, // Europe
    { x: 57, y: 40, color: "#d946ef", scale: 0.8 }, // Eastern Europe
    { x: 67, y: 38, color: "#d946ef", scale: 1.2 }, // Central Asia
    { x: 75, y: 60, color: "#22d3ee", scale: 1 }, // Australia
    { x: 75, y: 25, color: "#d946ef", scale: 1 }, // Southeast Asia
    { x: 92, y: 26, color: "#d946ef", scale: 0.9 }, // East Asia
  ]);

  return (
    <div className="bg-slate-900 text-white p-6 rounded-xl w-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-slate-300 text-sm mb-1">Users by country</h2>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">12.4 K</h1>
            <span className="text-xs bg-emerald-500/20 text-emerald-500 px-2 py-1 rounded-md flex items-center">
              <ArrowUp size={10} className="mr-1" />
              28.5%
            </span>
          </div>
        </div>

        <button className="flex items-center gap-1 text-sm text-slate-300 border border-slate-700 rounded-md px-3 py-1.5">
          <span>Export</span>
          <Download size={14} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Country statistics - left column */}
        <div className="space-y-4">
          {countryData.map((item, index) => (
            <div key={index} className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-300">{item.country}</span>
                <span className="text-slate-400">{item.percentage}%</span>
              </div>
              <div className="h-1 w-full bg-slate-800 rounded-full">
                <div
                  className="h-1 rounded-full"
                  style={{
                    width: `${item.percentage * 3}%`,
                    backgroundColor: item.color,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* World map visualization - spans 2 columns */}
        <div className="lg:col-span-2 relative h-64">
          {/* World map made with dots */}
          <div className="absolute inset-0">
            <svg viewBox="0 0 100 70" width="100%" height="100%">
              {/* World map dots pattern */}
              {Array.from({ length: 200 }, (_, i) => {
                // Create a grid pattern that roughly resembles a world map
                const x = (i % 20) * 5;
                const y = Math.floor(i / 20) * 5;

                // Skip dots to create the rough shape of continents and oceans
                const shouldRender = !(
                  // Oceans
                  (
                    (x < 15 && y < 15) || // Top left (ocean)
                    (x > 80 && y < 25) || // Top right (ocean)
                    (x < 15 && y > 50) || // Bottom left (ocean)
                    (x > 15 && x < 40 && y > 55) || // Bottom middle (ocean)
                    x > 85 || // Far right edge
                    y > 65 || // Bottom edge
                    (x > 30 && x < 50 && y > 25 && y < 35) || // Mediterranean
                    (x > 30 && x < 45 && y > 10 && y < 20)
                  ) // North Atlantic
                );

                return shouldRender ? (
                  <circle key={i} cx={x} cy={y} r={0.6} fill="#334155" />
                ) : null;
              })}

              {/* Glowing location dots */}
              {dots.map((dot, i) => (
                <g key={i}>
                  {/* Glow effect */}
                  <circle
                    cx={dot.x}
                    cy={dot.y}
                    r={1.5 * dot.scale}
                    fill={dot.color}
                    opacity={0.5}
                    filter="blur(5px)"
                  />
                  {/* Main dot */}
                  <circle
                    cx={dot.x}
                    cy={dot.y}
                    r={1 * dot.scale}
                    fill={dot.color}
                  />
                </g>
              ))}
            </svg>
          </div>

          {/* Australia callout */}
          <div className="absolute right-16 bottom-6">
            <div className="flex items-center">
              <div className="h-8 w-1 bg-cyan-400 rounded-full mr-2"></div>
              <div>
                <div className="text-xl font-bold">1.86 K</div>
                <div className="text-sm text-slate-400">Australia</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
