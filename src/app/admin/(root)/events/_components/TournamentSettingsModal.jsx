"use client";
import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../../../../../constants";
import { Pencil } from "lucide-react";

const TournamentSettingsModal = ({ eventId, visible, onClose, onSave, initialSettings }) => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);
 const [formData, setFormData] = useState(initialSettings);

  useEffect(() => {
    if (visible && eventId) {
      fetchSettings();
    }
  }, [visible, eventId]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/tournament-setting/${eventId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch tournament settings");
      }
      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
        setFormData({
          simpleFees: data.data.simpleFees || {
            fighterFee: 0,
            trainerFee: 0,
            currency: "$",
          },
          bracketSettings: data.data.bracketSettings || {
            maxFightersPerBracket: 0,
          },
        });
      } else {
        alert(data.message || "Error fetching settings");
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(
        `${API_BASE_URL}/tournament-setting/${eventId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update tournament settings");
      }

      const data = await response.json();
      if (data.success) {
        alert("Settings updated successfully");
        onSave(data.data);
        onClose();
      } else {
        alert(data.message || "Error updating settings");
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0B1739] rounded-lg p-6 shadow-lg w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Tournament Settings</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white text-2xl"
          >
            &times;
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Simple Fees</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm mb-1">Fighter Fee</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    {formData.simpleFees.currency}
                  </span>
                  <input
                    type="number"
                    name="simpleFees.fighterFee"
                    value={formData.simpleFees.fighterFee}
                    onChange={handleChange}
                    className="w-full bg-[#0A1330] border border-[#343B4F] rounded-lg p-2 pl-8"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">Trainer Fee</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    {formData.simpleFees.currency}
                  </span>
                  <input
                    type="number"
                    name="simpleFees.trainerFee"
                    value={formData.simpleFees.trainerFee}
                    onChange={handleChange}
                    className="w-full bg-[#0A1330] border border-[#343B4F] rounded-lg p-2 pl-8"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">Currency</label>
                <select
                  name="simpleFees.currency"
                  value={formData.simpleFees.currency}
                  onChange={handleChange}
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded-lg p-2"
                >
                  <option value="$">USD ($)</option>
                  <option value="₹">INR (₹)</option>
                  <option value="€">EUR (€)</option>
                  <option value="£">GBP (£)</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Bracket Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm mb-1">
                  Max Fighters Per Bracket
                </label>
                <input
                  type="number"
                  name="bracketSettings.maxFightersPerBracket"
                  value={formData.bracketSettings.maxFightersPerBracket}
                  onChange={handleChange}
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded-lg p-2"
                />
              </div>
            </div>
          </div>

          {settings?.detailedFees && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Detailed Fees</h3>
              <div className="overflow-x-auto">
                <table className="w-full border border-[#343B4F] rounded-lg">
                  <thead>
                    <tr className="border-b border-[#343B4F]">
                      <th className="p-3 text-left">Type</th>
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Fee Amount</th>
                      <th className="p-3 text-left">Min Purchase</th>
                      <th className="p-3 text-left">Max Purchase</th>
                      <th className="p-3 text-left">Sport</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settings.detailedFees.map((fee) => (
                      <tr 
                        key={`${fee.type}-${fee.name}-${fee.sport}`} 
                        className="border-b border-[#343B4F]"
                      >
                        <td className="p-3">{fee.type}</td>
                        <td className="p-3">{fee.name}</td>
                        <td className="p-3">{fee.feeAmount}</td>
                        <td className="p-3">{fee.minPurchase}</td>
                        <td className="p-3">{fee.maxPurchase || "-"}</td>
                        <td className="p-3">{fee.sport}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {settings?.ruleStyles && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Rule Styles</h3>
              <div className="mb-6">
                <h4 className="font-medium mb-2">Semi Contact</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {settings.ruleStyles.semiContact?.map((style, index) => (
                    <span
                      key={`semi-${index}-${style}`}
                      className="bg-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {style}
                    </span>
                  ))}
                </div>
                <h4 className="font-medium mb-2">Full Contact</h4>
                <div className="flex flex-wrap gap-2">
                  {settings.ruleStyles.fullContact?.map((style, index) => (
                    <span
                      key={`full-${index}-${style}`}
                      className="bg-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {style}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[#343B4F] rounded-lg hover:bg-[#0f1a40]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                "Saving..."
              ) : (
                <>
                  <Pencil size={16} />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentSettingsModal;