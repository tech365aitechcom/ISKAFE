import React, { useState } from "react";
import { ChevronLeft, Upload, Calendar } from "lucide-react";

const FighterDetails = ({ fighter, onBack, onUpdate, onRestore }) => {
  const [fighterData, setFighterData] = useState(fighter);

  const handleInputChange = (field, value) => {
    setFighterData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-[#0B1739] text-white min-h-screen p-10 m-8 rounded-lg">
      <div className="p-4 flex items-center">
        <button
          onClick={onBack}
          className="mr-2 text-gray-400 hover:text-white"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-medium">Fighter Details</h1>
      </div>
      <div className="mx-4 mb-6 border border-dashed border-gray-600 rounded-md p-6 flex flex-col items-center justify-center text-center">
        <div className="bg-yellow-500 rounded-full p-2 mb-2">
          <Upload size={20} className="text-black" />
        </div>
        <p className="text-xs text-gray-400">
          Click to upload a <span className="text-yellow-500">PNG</span> or{" "}
          <span className="text-yellow-500">JPG</span> profile pic
          <br />
          (PNG, JPG or GIF max. 800 x 600px)
        </p>
      </div>
      <div className="px-4 mb-6">
        <h2 className="text-sm font-medium mb-4 text-gray-300">
          PERSONAL DETAILS
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-[#00000061] p-2 rounded">
            <label className="block text-xs text-gray-400 mb-1">
              First Name
            </label>
            <input
              type="text"
              value={fighterData.firstName || ""}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              className="w-full text-white"
            />
          </div>
          <div className="bg-[#00000061] p-2 rounded">
            <label className="block text-xs text-gray-400 mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={fighterData.lastName || ""}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              className="w-full  text-white"
            />
          </div>
          <div className="bg-[#00000061] p-2 rounded">
            <label className="block text-xs text-gray-400 mb-1">Gender</label>
            <input
              type="text"
              value={fighterData.gender || ""}
              onChange={(e) => handleInputChange("gender", e.target.value)}
              className="w-full  text-white"
            />
          </div>
          <div className="bg-[#00000061] p-2 rounded">
            <label className="block text-xs text-gray-400 mb-1">Age</label>
            <input
              type="text"
              value={fighterData.age || ""}
              onChange={(e) => handleInputChange("age", e.target.value)}
              className="w-full  text-white"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#00000061] p-2 rounded">
            <label className="block text-xs text-gray-400 mb-1">Age</label>
            <input
              type="text"
              value={fighterData.age || ""}
              onChange={(e) => handleInputChange("age", e.target.value)}
              className="w-full  text-white"
            />
          </div>
          <div className="bg-[#00000061] p-2 rounded">
            <label className="block text-xs text-gray-400 mb-1">Weight</label>
            <input
              type="text"
              value={fighterData.weight || ""}
              onChange={(e) => handleInputChange("weight", e.target.value)}
              className="w-full  text-white"
            />
          </div>
          <div className="bg-[#00000061] p-2 rounded">
            <label className="block text-xs text-gray-400 mb-1">Height</label>
            <input
              type="text"
              value={fighterData.height || ""}
              onChange={(e) => handleInputChange("height", e.target.value)}
              className="w-full  text-white"
            />
          </div>
          <div className="bg-[#00000061] p-2 rounded">
            <label className="block text-xs text-gray-400 mb-1">
              Experience
            </label>
            <input
              type="text"
              value={fighterData.experience || ""}
              onChange={(e) => handleInputChange("experience", e.target.value)}
              className="w-full  text-white"
            />
          </div>
          <div className="bg-[#00000061] p-2 rounded">
            <label className="block text-xs text-gray-400 mb-1">Training</label>
            <input
              type="text"
              value={fighterData.training || ""}
              onChange={(e) => handleInputChange("training", e.target.value)}
              className="w-full  text-white"
            />
          </div>
          <div className="bg-[#00000061] p-2 rounded">
            <label className="block text-xs text-gray-400 mb-1">Gym</label>
            <input
              type="text"
              value={fighterData.gym || ""}
              onChange={(e) => handleInputChange("gym", e.target.value)}
              className="w-full  text-white"
            />
          </div>
        </div>
      </div>
      <div className="px-4 mb-6">
        <h2 className="text-sm font-medium mb-4 text-gray-300">
          TRAINING DETAILS
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#00000061] p-2 rounded">
            <label className="block text-xs text-gray-400 mb-1">
              Fighter Physical Renewal Date
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="DD/MM/YYYY"
                value={fighterData.physicalExamDate || ""}
                onChange={(e) =>
                  handleInputChange("physicalExamDate", e.target.value)
                }
                className="w-full text-white pr-8"
              />
              <Calendar
                size={16}
                className="absolute right-2 top-3 text-gray-400"
              />
            </div>
          </div>
          <div className="bg-[#00000061] p-2 rounded">
            <label className="block text-xs text-gray-400 mb-1">
              Fighter License Renewal Date
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="DD/MM/YYYY"
                value={fighterData.fighterLicenseRenewalDate || ""}
                onChange={(e) =>
                  handleInputChange("fighterLicenseRenewalDate", e.target.value)
                }
                className="w-full rounded text-white pr-8"
              />
              <Calendar
                size={16}
                className="absolute right-2 top-3 text-gray-400"
              />
            </div>
          </div>
          <div className="bg-[#00000061] p-2 rounded">
            <label className="block text-xs text-gray-400 mb-1">
              Hotel Confirmation
            </label>
            <input
              type="text"
              value={fighterData.hotelConfirmation || ""}
              onChange={(e) =>
                handleInputChange("hotelConfirmation", e.target.value)
              }
              className="w-full rounded text-white"
            />
          </div>
          <div className="bg-[#00000061] p-2 rounded">
            <label className="block text-xs text-gray-400 mb-1">
              Suspended
            </label>
            <input
              type="text"
              value={fighterData.suspended || ""}
              onChange={(e) => handleInputChange("suspended", e.target.value)}
              className="w-full  text-white"
            />
          </div>
        </div>
      </div>
      <div className="px-4 mb-6">
        <h2 className="text-sm font-medium mb-4 text-gray-300">
          PAYMENT DETAILS
        </h2>
        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            checked={fighterData.paymentsCompleted || false}
            onChange={(e) =>
              handleInputChange("paymentsCompleted", e.target.checked)
            }
            className="h-4 w-4 text-blue-600 rounded"
          />
          <label className="ml-2 text-sm">All Required Payments Made</label>
        </div>
      </div>
      <div className="px-4 mb-6">
        <h2 className="text-sm font-medium mb-4 text-gray-300">
          MEDICAL DETAILS
        </h2>
        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            checked={fighterData.examDone || false}
            onChange={(e) => handleInputChange("examDone", e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded"
          />
          <label className="ml-2 text-sm">Exam Done</label>
        </div>
      </div>
      <div className="px-4 mb-6 bg-[#00000061] rounded p-2">
        <label className="block text-xs text-gray-400 mb-1">Comments</label>
        <textarea
          value={fighterData.comments || ""}
          onChange={(e) => handleInputChange("comments", e.target.value)}
          className="w-full rounded text-white h-20"
        />
      </div>
      <div className="p-4 flex justify-center gap-8">
        <button
          onClick={() => onRestore(fighterData)}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded"
        >
          Remove
        </button>
        <button
          onClick={() => onUpdate(fighterData)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded"
        >
          Update
        </button>
      </div>
    </div>
  );
};

export default FighterDetails;
