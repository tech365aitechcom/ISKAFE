import React from "react";

const EventCard = () => {
  return (
    <div className="bg-[#0f0217] min-h-screen p-8 text-white">
      <div className="max-w-4xl mx-auto bg-[#1b0c2e] p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">
          PBSC POINT BOXING SPARRING CIRCUIT
        </h1>
        <div className="flex space-x-8">
          <div className="w-1/2">
            <img
              src="/promo.png"
              alt="Battle for LA Poster"
              className="rounded-lg shadow-lg"
            />
          </div>
          <div className="w-1/2">
            <div className="mb-4">
              <p className="text-gray-400 text-sm">Event Starts</p>
              <p className="text-lg font-bold">4 PM</p>
            </div>
            <div className="mb-4">
              <p className="text-gray-400 text-sm">Location</p>
              <p className="font-semibold">
                9 Thirty LA, 930 Mateo St., Los Angeles, CA, USA
              </p>
            </div>
            <div className="mb-4">
              <p className="text-gray-400 text-sm">Register Till</p>
              <p className="font-bold">Mar 20, 4 PM</p>
            </div>
            <div className="mt-6">
              <button className="bg-gradient-to-r from-[#B02FEC] to-[#5141B5] hover:opacity-90 text-white px-6 py-2 rounded-sm text-lg font-semibold">
                Register To Compete
              </button>
              <p className="mt-2 text-gray-400">
                Registration Fee:{" "}
                <span className="text-white font-semibold">$75.00</span>
              </p>
            </div>
            <div className="mt-6 text-center">
              <button className="bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold uppercase">
                Full Rules Muay Thai/Kickboxing - Sanctioned by IKF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
