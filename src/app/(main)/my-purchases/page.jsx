import React from "react";

const MyPurchasesUI = () => {
  return (
    <div className="h-fit mb-20 bg-black">
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
        <h1 className="text-4xl font-bold mb-4">MY PURCHASES</h1>
        <p className="text-lg max-w-2xl mx-auto">
          If you have paid to compete as a fighter or trainer, or to attend an
          event, those transactions will be shown below.
        </p>
      </div>
      <div className="w-full py-16 px-8 bg-purple-950">
        <div className="max-w-4xl mx-auto h-fit flex flex-col items-center justify-center">
          <img src="/receipt.png" alt="" className="w-[256px] h-[256px]" />
          <p className="text-white text-xl font-bold uppercase">
            NO RECEIPTS FOUND
          </p>
        </div>
      </div>
    </div>
  );
};

export default MyPurchasesUI;
