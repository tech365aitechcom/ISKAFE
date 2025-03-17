import React from "react";

const Hero = () => {
  return (
    <div
      className="bg-black w-full flex flex-col md:flex-row"
      style={{ background: "linear-gradient(to right, #0a0a1a, #1a0010)" }}
    >
      {/* Left Content Section */}
      <div className="flex-1 p-8 pt-16 pb-16 flex flex-col justify-center">
        <h1 className="text-white font-bold text-4xl md:text-5xl uppercase tracking-wide">
          INTERNATIONAL KICKBOXING
        </h1>
        <h2 className="text-red-500 font-bold text-4xl md:text-5xl uppercase tracking-wide mt-2">
          FEDERATION
        </h2>

        <p className="text-gray-300 text-sm mt-10 max-w-lg leading-relaxed">
          Mr. Don Rodger and his Triangle Kickboxing Promotions will be hosing
          another IKF Super Show that will have fight fans at the edge of their
          seats in the State of NC!
        </p>

        <p className="text-gray-300 text-sm mt-6 leading-relaxed">
          Men and Women will be competing in Knockout Action!
        </p>

        <div className="mt-10">
          <button className="bg-red-600 text-white font-bold px-4 py-2 uppercase text-sm">
            Get Tickets
          </button>
        </div>

        <div className=" text-center hidden md:block">
          <p className="text-gray-400 text-xs">Scroll to explore</p>
          <div className="text-white text-xl font-bold mt-1">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="11" y="4" width="2" height="16" fill="white" />
              <path d="M7 16L12 21L17 16" stroke="white" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>

      {/* Right Image Section */}
      <div className="flex-1 border-4 border-red-600 relative overflow-hidden w-[530px] h-[600px]">
        <img
          src="https://images.unsplash.com/photo-1602668195478-2161aa8d1a0b?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Kickboxer in white gloves"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-red-600/30"></div>

        {/* Pagination Dots */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-white"></div>
          <div className="h-2 w-2 rounded-full bg-gray-500"></div>
          <div className="h-2 w-2 rounded-full bg-gray-500"></div>
          <div className="h-2 w-2 rounded-full bg-gray-500"></div>
          <div className="h-2 w-2 rounded-full bg-gray-500"></div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
