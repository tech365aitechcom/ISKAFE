import React from "react";

const MyFightFamilyUI = () => {
  return (
    <div className="h-fit bg-black">
      <div
        className="w-full bg-gradient-to-b from-purple-900 to-purple-800 py-16 px-8 text-center text-white"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, rgba(76, 29, 149, 0.9), rgba(91, 33, 182, 0.8)), url('/api/placeholder/900/300')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundBlend: "overlay",
        }}
      >
        <h1 className="text-4xl font-bold mb-4">MY FIGHT FAMILY</h1>
        <p className="text-lg max-w-2xl mx-auto">
          The Fight Family feature enables parents/guardians to manage their
          kids' Fight Platform accounts so that the parent/guardian can register
          their kids to compete in events without having to log into each kid's
          account.
        </p>
      </div>
      <div
        className="w-full py-16 px-8 bg-black"
        style={{
          backgroundImage: "url('/api/placeholder/100/100')",
          backgroundSize: "200px 200px",
          backgroundPosition: "center",
          backgroundRepeat: "repeat",
        }}
      >
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="bg-black border border-purple-900 p-8 flex flex-col">
            <h2 className="text-2xl font-bold text-white mb-6">
              Accounts I Manage
            </h2>
            <p className="text-gray-300 mb-6">
              This section shows accounts that have allowed you to register them
              to compete. Parents (or coaches), add your kids (fighters) to this
              section.
            </p>
            <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 mb-8 self-start">
              Request to Manage Another Account
            </button>
            <p className="text-gray-400 mt-auto">
              You don't currently Manage Other Accounts
            </p>
          </div>
          <div className="bg-black border border-purple-900 p-8 flex flex-col">
            <h2 className="text-2xl font-bold text-white mb-6">
              Accounts That Manage Me
            </h2>
            <p className="text-gray-300 mb-6">
              This section shows accounts that you have authorized to register
              you to compete in events.
            </p>
            <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 mb-8 self-start">
              Choose an Account to Manage Me
            </button>
            <p className="text-gray-400 mt-auto">
              No other accounts manage yours
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyFightFamilyUI;
