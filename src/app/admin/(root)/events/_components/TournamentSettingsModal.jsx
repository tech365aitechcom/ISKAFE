"use client";
import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../../../../../constants";
import { Pencil } from "lucide-react";

const TournamentSettingsModal = ({ eventId, visible, onClose, onSave, initialSettings }) => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);
 const [formData, setFormData] = useState(initialSettings || {
    simpleFees: {
      fighterFee: 0,
      trainerFee: 0,
      currency: "$",
    },
    detailedFees: [],
    bracketSettings: {
      maxFightersPerBracket: 0,
    },
    ruleStyles: {
      semiContact: [],
      fullContact: []
    }
  });

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
          detailedFees: data.data.detailedFees || [],
          bracketSettings: data.data.bracketSettings || {
            maxFightersPerBracket: 0,
          },
          ruleStyles: data.data.ruleStyles || {
            semiContact: [],
            fullContact: []
          }
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
      
      console.log('Sending tournament settings:', formData);
      
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
      <div className="bg-[#0B1739] rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 pb-0">
          <h2 className="text-xl font-bold">Tournament Settings</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white text-2xl"
          >
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
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

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Detailed Fees</h3>
              <button
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    detailedFees: [
                      ...prev.detailedFees,
                      {
                        type: 'Bracket',
                        name: '',
                        feeAmount: 0,
                        minPurchase: 1,
                        maxPurchase: null,
                        sport: ''
                      }
                    ]
                  }));
                }}
                className="px-3 py-1 bg-green-600 rounded text-sm hover:bg-green-700"
              >
                + Add Fee
              </button>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {formData.detailedFees?.map((fee, index) => (
                <div key={index} className="bg-[#0A1330] p-4 rounded-lg border border-[#343B4F]">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className="block text-xs mb-1">Type</label>
                      <select
                        value={fee.type}
                        onChange={(e) => {
                          const newFees = [...formData.detailedFees];
                          newFees[index] = { ...newFees[index], type: e.target.value };
                          setFormData(prev => ({ ...prev, detailedFees: newFees }));
                        }}
                        className="w-full bg-[#0B1739] border border-[#343B4F] rounded p-1 text-sm"
                      >
                        <option value="Bracket">Bracket</option>
                        <option value="Single Bout">Single Bout</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Name</label>
                      <input
                        type="text"
                        value={fee.name}
                        onChange={(e) => {
                          const newFees = [...formData.detailedFees];
                          newFees[index] = { ...newFees[index], name: e.target.value };
                          setFormData(prev => ({ ...prev, detailedFees: newFees }));
                        }}
                        className="w-full bg-[#0B1739] border border-[#343B4F] rounded p-1 text-sm"
                        placeholder="Fee name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Fee Amount</label>
                      <input
                        type="number"
                        value={fee.feeAmount}
                        onChange={(e) => {
                          const newFees = [...formData.detailedFees];
                          newFees[index] = { ...newFees[index], feeAmount: Number(e.target.value) };
                          setFormData(prev => ({ ...prev, detailedFees: newFees }));
                        }}
                        className="w-full bg-[#0B1739] border border-[#343B4F] rounded p-1 text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs mb-1">Min Purchase</label>
                      <input
                        type="number"
                        value={fee.minPurchase}
                        onChange={(e) => {
                          const newFees = [...formData.detailedFees];
                          newFees[index] = { ...newFees[index], minPurchase: Number(e.target.value) };
                          setFormData(prev => ({ ...prev, detailedFees: newFees }));
                        }}
                        className="w-full bg-[#0B1739] border border-[#343B4F] rounded p-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Max Purchase</label>
                      <input
                        type="number"
                        value={fee.maxPurchase || ''}
                        onChange={(e) => {
                          const newFees = [...formData.detailedFees];
                          newFees[index] = { ...newFees[index], maxPurchase: e.target.value ? Number(e.target.value) : null };
                          setFormData(prev => ({ ...prev, detailedFees: newFees }));
                        }}
                        className="w-full bg-[#0B1739] border border-[#343B4F] rounded p-1 text-sm"
                        placeholder="Optional"
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Sport</label>
                      <input
                        type="text"
                        value={fee.sport}
                        onChange={(e) => {
                          const newFees = [...formData.detailedFees];
                          newFees[index] = { ...newFees[index], sport: e.target.value };
                          setFormData(prev => ({ ...prev, detailedFees: newFees }));
                        }}
                        className="w-full bg-[#0B1739] border border-[#343B4F] rounded p-1 text-sm"
                        placeholder="Sport"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => {
                          const newFees = formData.detailedFees.filter((_, i) => i !== index);
                          setFormData(prev => ({ ...prev, detailedFees: newFees }));
                        }}
                        className="px-2 py-1 bg-red-600 rounded text-xs hover:bg-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Rule Styles</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Semi Contact</h4>
                  <button
                    onClick={() => {
                      const newStyle = prompt('Enter new semi contact style:');
                      if (newStyle?.trim()) {
                        setFormData(prev => ({
                          ...prev,
                          ruleStyles: {
                            ...prev.ruleStyles,
                            semiContact: [...(prev.ruleStyles.semiContact || []), newStyle.trim()]
                          }
                        }));
                      }
                    }}
                    className="px-2 py-1 bg-blue-600 rounded text-xs hover:bg-blue-700"
                  >
                    + Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.ruleStyles?.semiContact?.map((style, index) => (
                    <div
                      key={`semi-${index}-${style}`}
                      className="bg-gray-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      <span>{style}</span>
                      <button
                        onClick={() => {
                          const newStyles = formData.ruleStyles.semiContact.filter((_, i) => i !== index);
                          setFormData(prev => ({
                            ...prev,
                            ruleStyles: {
                              ...prev.ruleStyles,
                              semiContact: newStyles
                            }
                          }));
                        }}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Full Contact</h4>
                  <button
                    onClick={() => {
                      const newStyle = prompt('Enter new full contact style:');
                      if (newStyle?.trim()) {
                        setFormData(prev => ({
                          ...prev,
                          ruleStyles: {
                            ...prev.ruleStyles,
                            fullContact: [...(prev.ruleStyles.fullContact || []), newStyle.trim()]
                          }
                        }));
                      }
                    }}
                    className="px-2 py-1 bg-blue-600 rounded text-xs hover:bg-blue-700"
                  >
                    + Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.ruleStyles?.fullContact?.map((style, index) => (
                    <div
                      key={`full-${index}-${style}`}
                      className="bg-gray-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      <span>{style}</span>
                      <button
                        onClick={() => {
                          const newStyles = formData.ruleStyles.fullContact.filter((_, i) => i !== index);
                          setFormData(prev => ({
                            ...prev,
                            ruleStyles: {
                              ...prev.ruleStyles,
                              fullContact: newStyles
                            }
                          }));
                        }}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
        </div>
        <div className="flex justify-end gap-4 p-6 pt-4 border-t border-[#343B4F]">
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
  );
};

export default TournamentSettingsModal;