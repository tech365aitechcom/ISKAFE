import React from "react";

const Joinus = () => {
  return (
    <div
      className="w-full py-16 px-4"
      style={{
        background: "linear-gradient(to right, #0f0525, #1a0a2e, #0f0525)",
        boxShadow: "inset 0 0 50px rgba(76, 0, 255, 0.2)",
      }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-white text-3xl md:text-4xl font-medium mb-4">
          Join us for
        </h2>
        <h1 className="text-red-500 text-4xl md:text-5xl font-bold mb-8">
          Premium Fighter Profile
        </h1>
        <button className="bg-red-600 hover:bg-red-700 text-white py-3 px-8 text-xl font-medium transition-colors duration-200">
          Promote Yourself
        </button>
      </div>
    </div>
  );
};

export default Joinus;
