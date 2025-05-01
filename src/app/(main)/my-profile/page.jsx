import React from "react";
import { Instagram, Twitter } from "lucide-react";

const ProfileUI = () => {
  return (
    <div className="h-fit py-20 bg-black text-white flex flex-col items-center p-4">
      <div className="w-full max-w-2xl flex flex-col">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-lg overflow-hidden">
            <img
              src="/profile-girl.jpg"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h1 className="text-2xl font-bold text-white mb-2">MARIE DOE</h1>
              <button className="border border-white text-white text-xs px-3 py-1 rounded hover:bg-white hover:text-black transition-colors">
                Edit Profile
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-400 mt-2">
              <div>
                <span>Age: </span>
                <span className="text-white">38</span>
              </div>
              <div>
                <span>Gender: </span>
                <span className="text-white">M</span>
              </div>
              <div>
                <span>From: </span>
                <span className="text-white">Gilroy, CA, USA</span>
              </div>
              <div>
                <span>Email: </span>
                <span className="text-white">marie@gmail.com</span>
              </div>
              <div>
                <span>Phone: </span>
                <span className="text-white"></span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Social</h3>
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-500 flex items-center justify-center">
              <Instagram size={18} />
            </div>
            <div className="w-8 h-8 rounded-lg bg-black border border-gray-700 flex items-center justify-center">
              <Twitter size={18} />
            </div>
          </div>
        </div>
        <div className="mt-6 bg-purple-900/30 rounded-lg p-5">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">Go Premium</h2>
              <svg
                className="w-6 h-6 text-yellow-600"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" />
              </svg>
            </div>
            <div className="text-4xl font-bold">$24.99</div>
          </div>
          <p className="text-xs text-gray-300 mb-4 max-w-lg">
            It is a 1-time payment that gives you a year of exposure on the
            Fight Platform. This is not a subscription; it's your choice if you
            want to purchase the next year.
          </p>
          <div className="flex justify-end">
            <button className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 rounded">
              Promote Yourself
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileUI;
