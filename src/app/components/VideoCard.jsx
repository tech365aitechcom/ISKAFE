import React from "react";

const VideoCard = () => {
  return (
    <div className="video-card w-full overflow-hidden cursor-pointer">
      {/* Video Thumbnail Container */}
      <div className="relative">
        {/* Thumbnail Image */}
        <img
          src="https://images.unsplash.com/photo-1602668195478-2161aa8d1a0b?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="MMA fighter in cage"
          className="w-full h-full object-cover"
        />

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white bg-opacity-20 rounded-full p-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="white"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-90" />

        {/* Bottom Text Overlay */}
        <div className="absolute bottom-0 left-0 p-4">
          <h3 className="text-white font-bold text-xl">IFS</h3>
          <p className="text-gray-300 text-sm">
            The Grand Theater Anaheim, CA, USA
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
