import React from "react";

const FighterProfile = () => {
  return (
    <div className="bg-[#121212] text-white min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Top Section with Fighter Details */}
        <div className="flex space-x-6 mb-6">
          {/* Fighter Image */}
          <div className="w-64 h-64 bg-gray-800 rounded-lg overflow-hidden">
            <img
              src="/api/placeholder/256/256"
              alt="Eric Franks"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Fighter Info */}
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-bold">ERIC FRANKS</h1>
              <button className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold">
                Follow
              </button>
            </div>

            {/* Fighter Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
              <div>
                <span className="text-gray-400">Height</span>
                <p>5'9"</p>
              </div>
              <div>
                <span className="text-gray-400">Weight</span>
                <p>145 LBS</p>
              </div>
              <div>
                <span className="text-gray-400">Record</span>
                <p>1-0-0</p>
              </div>
              <div>
                <span className="text-gray-400">Age</span>
                <p>38</p>
              </div>
              <div>
                <span className="text-gray-400">Gender</span>
                <p>M</p>
              </div>
              <div>
                <span className="text-gray-400">Location</span>
                <p>Gilroy, CA, USA</p>
              </div>
            </div>
          </div>
        </div>

        {/* Biography Section */}
        <div className="bg-[#1E1E1E] p-4 rounded-lg mb-6">
          <p className="text-sm text-gray-300">
            February 2022 - Johnny Davis is a Former 2x World Kickboxing
            Champion and now Global V.P. of Operations and Promotions for
            International Kickboxing Federation (IKF)...IKF CEO Ms. Toni Fossum.
            He is also President: IKF Point Muay Thai (PMT), Point Kickboxing
            (PKB), and Point Boxing Sparring Circuit (PBSC). Additionally, he's
            owner and President of www.AKPLive.com a Pay Per View Streaming
            Company with partner Mr. Derrick Rhems and has other business
            entities. Johnny Morris Davis (born July 15, 1962) is an American
            former kickboxer who competed in the welterweight and middleweight
            divisions. Nicknamed "Superfoof".
          </p>
        </div>

        {/* Win-Loss Record */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Win-Los Record</h2>
          <div className="bg-[#1E1E1E] p-4 rounded-lg">
            <p className="text-2xl font-bold">29-6-0 Overall</p>
          </div>
        </div>

        {/* Official Calculated Records */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Official Calculated Records
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-green-900 to-green-700 p-4 rounded-lg text-center">
              <h3 className="text-lg">Wins</h3>
              <p className="text-3xl font-bold">0</p>
              <div className="text-sm mt-2">
                <p>By Decision: 0</p>
                <p>By Stoppage: 0</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-red-900 to-red-700 p-4 rounded-lg text-center">
              <h3 className="text-lg">Losses</h3>
              <p className="text-3xl font-bold">0</p>
              <div className="text-sm mt-2">
                <p>By Decision: 0</p>
                <p>By Stoppage: 0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Semi-Contact / Sparring */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Semi-Contact / Sparring
          </h2>
          <div className="bg-[#1E1E1E] p-4 rounded-lg">
            <p>0 Bouts Experience</p>
          </div>
        </div>

        {/* Purported Records */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Purported Records</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#1E1E1E] p-4 rounded-lg">
              <h3 className="text-lg">Full Contact</h3>
              <p className="text-xl font-bold">29-6-0 Overall</p>
            </div>
            <div className="bg-[#1E1E1E] p-4 rounded-lg">
              <h3 className="text-lg">Semi-Contact / Sparring</h3>
              <p className="text-xl font-bold">--</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FighterProfile;
