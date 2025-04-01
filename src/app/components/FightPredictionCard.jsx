import React, { useState } from "react";

const FightPredictionCard = ({ fighters }) => {
  const [selectedFighter, setSelectedFighter] = useState(null);

  return (
    <div className="w-full border border-[#D9E2F930]">
      <div className="bg-gradient-to-b from-[#1A1A2E] to-[#16213E] flex justify-center items-center">
        {fighters.map((fighter, index) => (
          <div
            key={fighter.name}
            className="flex items-center text-white space-x-4 p-10"
          >
            {index === 1 && (
              <div className="flex items-center">
                <img src="/vs.png" alt="VS" className="w-12 h-12 mx-4" />
              </div>
            )}
            <div className="flex flex-col items-center space-y-2">
              <div
                className={`
          w-20 h-20 rounded-xl p-1 
          ${
            index === 0
              ? "bg-gradient-to-br from-blue-500 to-purple-600"
              : "bg-gradient-to-br from-red-500 to-orange-600"
          }
        `}
              >
                <img
                  src={fighter.image}
                  alt={fighter.name}
                  className="w-full h-full rounded-lg object-cover"
                />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold">{fighter.name}</h2>
                <p className="text-sm text-gray-300">{fighter.location}</p>
                <p className="text-sm text-gray-400">{fighter.record}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-transparent p-6 mt-4">
        <h3 className="text-center text-white text-xl font-semibold mb-4">
          Predict the Fight Outcome
        </h3>
        <div className="flex justify-between space-x-4">
          {fighters.map((fighter, index) => (
            <button
              key={fighter.name}
              onClick={() => setSelectedFighter(index)}
              className={`
                  flex-1 py-3 rounded-lg transition-all duration-300
                  flex items-center justify-center space-x-2 text-white text-lg font-semibold
                  ${
                    index === 0
                      ? "bg-gradient-to-br from-blue-500 to-purple-600"
                      : "bg-gradient-to-br from-red-500 to-orange-600"
                  }
                `}
            >
              <img
                src={fighter.image}
                alt={fighter.name}
                className="w-8 h-8 rounded-lg"
              />
              <span>{fighter.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FightPredictionCard;
