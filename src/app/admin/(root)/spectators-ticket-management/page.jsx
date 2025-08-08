"use client";
import { useState, useEffect } from "react";
import { Ticket, Plus, Trash2, Save, Calendar, Info, DollarSign, Search, Download, Edit } from "lucide-react";

export default function SpectatorsTicketManagement() {
  const [ticketTiers, setTicketTiers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [savedTiers, setSavedTiers] = useState(new Set());
  const [validationErrors, setValidationErrors] = useState({});

  // Load sample data
  useEffect(() => {
    const loadData = async () => {
      setTimeout(() => {
        setTicketTiers([
          {
            id: "1",
            order: 1,
            name: "General Admission",
            description: "Entry to all preliminary and main card bouts",
            price: 35,
            capacity: 150,
            remaining: 110,
            saleMode: "Online Only",
            startDate: "01-05-2025",
            endDate: "09-05-2025",
            limitPerUser: 4,
            isActive: true,
          },
          {
            id: "2",
            order: 2,
            name: "VIP Cage-Side",
            description: "Premium cage-side seating with amenities",
            price: 120,
            capacity: 30,
            remaining: 30,
            saleMode: "Both",
            startDate: "01-05-2025",
            endDate: "10-05-2025",
            limitPerUser: 2,
            isActive: true,
          },
        ]);
        setIsLoading(false);
      }, 500);
    };

    loadData();
  }, []);

  const handleAddNewTier = () => {
    const newTier = {
      id: `temp-${Date.now()}`,
      order: ticketTiers.length + 1,
      name: "",
      description: "",
      price: 0,
      capacity: 0,
      remaining: 0,
      saleMode: "Online Only",
      startDate: new Date().toLocaleDateString('en-GB').split('/').join('-'),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB').split('/').join('-'),
      limitPerUser: null,
      isActive: true,
    };
    setTicketTiers([...ticketTiers, newTier]);
    setHasChanges(true);
  };

  const handleDeleteTier = (id) => {
    setTicketTiers(ticketTiers.filter((tier) => tier.id !== id));
    setHasChanges(true);
  };

  const validateTier = (tier) => {
    const errors = {};
    
    // Validate Name field (required, max 50 chars, letters and spaces only)
    if (!tier.name.trim()) {
      errors.name = "Name is required";
    } else if (tier.name.length > 50) {
      errors.name = "Name must be 50 characters or less";
    } else if (!/^[a-zA-Z\s]+$/.test(tier.name)) {
      errors.name = "Name can only contain letters and spaces";
    }
    
    // Validate Description field (optional but max 250 chars if provided)
    if (tier.description && tier.description.length > 250) {
      errors.description = "Description must be 250 characters or less";
    }
    
    // Validate Price field (required, must be > 0)
    if (tier.price <= 0) {
      errors.price = "Price must be greater than 0";
    }
    
    // Validate Capacity field (required, must be > 0)
    if (tier.capacity <= 0) {
      errors.capacity = "Capacity must be greater than 0";
    }
    
    return errors;
  };

  const handleSaveTier = (id) => {
    const tier = ticketTiers.find((t) => t.id === id);
    if (!tier) return;

    const errors = validateTier(tier);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(prev => ({ ...prev, [id]: errors }));
      const errorMessages = Object.values(errors).join(', ');
      alert(`Please fix the following errors: ${errorMessages}`);
      return;
    }

    // Clear validation errors for this tier
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });

    // Mark tier as saved (disable editing)
    setSavedTiers(prev => new Set([...prev, id]));
    alert(`${tier.name} has been successfully saved`);
    setHasChanges(false);
  };

  const handleEditTier = (id) => {
    // Remove from saved tiers to enable editing
    setSavedTiers(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const handleSaveAll = () => {
    const allErrors = {};
    let hasAnyErrors = false;
    
    ticketTiers.forEach(tier => {
      if (!savedTiers.has(tier.id)) {
        const errors = validateTier(tier);
        if (Object.keys(errors).length > 0) {
          allErrors[tier.id] = errors;
          hasAnyErrors = true;
        }
      }
    });
    
    if (hasAnyErrors) {
      setValidationErrors(allErrors);
      alert("Please fix validation errors in all tiers before saving");
      return;
    }
    
    // Clear all validation errors
    setValidationErrors({});
    alert("All changes have been saved successfully");
    setHasChanges(false);
  };

  const handleFieldChange = (id, field, value) => {
    // Clear validation errors for this field when user starts typing
    if (validationErrors[id] && validationErrors[id][field]) {
      setValidationErrors(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          [field]: undefined
        }
      }));
    }
    
    setTicketTiers(
      ticketTiers.map((tier) => {
        if (tier.id === id) {
          if (field === "capacity" && tier.remaining === tier.capacity) {
            return { ...tier, [field]: value, remaining: value };
          }
          return { ...tier, [field]: value };
        }
        return tier;
      })
    );
    setHasChanges(true);
  };

  const handleExport = (format) => {
    alert(`Would export ${format} file`);
  };

  const filteredTiers = ticketTiers.filter(tier => 
    tier.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Welcome back, ISKA ADMIN</h1>
        <h2 className="text-xl text-[#AEB9E1]">Fight Platform Admin</h2>
      </div>

      {/* Main Content */}
      <div className="bg-[#0B1739] bg-opacity-80 rounded-lg p-6 shadow-lg">
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">Spectators Ticket Management</h3>
          
          {/* Search and Actions */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search size={16} className="text-[#AEB9E1]" />
              </div>
              <input
                type="text"
                className="w-full bg-[#0A1330] border border-[#343B4F] text-white rounded-lg pl-10 py-2 text-sm"
                placeholder="Search ticket Users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex space-x-2">
              <button
                className="flex items-center px-4 py-2 bg-[#0A1330] border border-[#343B4F] rounded-lg text-sm"
                onClick={handleAddNewTier}
              >
                <Plus size={16} className="mr-2" />
                Add New Tier
              </button>
              <button
                className="flex items-center px-4 py-2 bg-gradient-to-r from-[#CB3CFF] to-[#7F25FB] rounded-lg text-sm"
                onClick={handleSaveAll}
                disabled={!hasChanges || isLoading}
              >
                <Save size={16} className="mr-2" />
                Save All
              </button>
            </div>
          </div>

          {/* Ticket Tiers */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : filteredTiers.length > 0 ? (
            filteredTiers.map((tier) => (
              <div key={tier.id} className="mb-8 last:mb-0">
                <h4 className="text-lg font-medium mb-4">{tier.name || "New Ticket Tier"}</h4>
                
                <div className="mb-4">
                  <h5 className="text-[#AEB9E1] mb-2">Ticket Configuration</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm text-[#AEB9E1] mb-1">Ticket Order <span className="text-red-400">*</span></label>
                      <input
                        type="number"
                        min="1"
                        className={`w-full border text-white rounded px-3 py-2 ${
                          savedTiers.has(tier.id) 
                            ? 'bg-gray-700 border-gray-600 cursor-not-allowed opacity-75' 
                            : 'bg-[#0B1739] border-[#343B4F]'
                        }`}
                        value={tier.order}
                        onChange={(e) =>
                          handleFieldChange(tier.id, "order", parseInt(e.target.value))
                        }
                        disabled={savedTiers.has(tier.id)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[#AEB9E1] mb-1">Ticket Name <span className="text-red-400">*</span></label>
                      <input
                        className={`w-full border text-white rounded px-3 py-2 ${
                          savedTiers.has(tier.id) 
                            ? 'bg-gray-700 border-gray-600 cursor-not-allowed opacity-75' 
                            : validationErrors[tier.id]?.name
                            ? 'bg-[#0B1739] border-red-500'
                            : 'bg-[#0B1739] border-[#343B4F]'
                        }`}
                        value={tier.name}
                        onChange={(e) =>
                          handleFieldChange(tier.id, "name", e.target.value)
                        }
                        placeholder="e.g., General Admission"
                        disabled={savedTiers.has(tier.id)}
                        maxLength={50}
                      />
                      {validationErrors[tier.id]?.name && (
                        <p className="text-red-400 text-xs mt-1">{validationErrors[tier.id].name}</p>
                      )}
                      <p className="text-gray-400 text-xs mt-1">{tier.name.length}/50 characters</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm text-[#AEB9E1] mb-1">Ticket Description <span className="text-gray-400">(optional)</span></label>
                    <textarea
                      className={`w-full border text-white rounded px-3 py-2 ${
                        savedTiers.has(tier.id) 
                          ? 'bg-gray-700 border-gray-600 cursor-not-allowed opacity-75' 
                          : validationErrors[tier.id]?.description
                          ? 'bg-[#0B1739] border-red-500'
                          : 'bg-[#0B1739] border-[#343B4F]'
                      }`}
                      value={tier.description}
                      onChange={(e) =>
                        handleFieldChange(tier.id, "description", e.target.value)
                      }
                      rows={2}
                      disabled={savedTiers.has(tier.id)}
                      maxLength={250}
                      placeholder="Optional description for this ticket tier"
                    />
                    {validationErrors[tier.id]?.description && (
                      <p className="text-red-400 text-xs mt-1">{validationErrors[tier.id].description}</p>
                    )}
                    <p className="text-gray-400 text-xs mt-1">{tier.description.length}/250 characters</p>
                  </div>
                </div>

                <div className="mb-4">
                  <h5 className="text-[#AEB9E1] mb-2">Pricing & Inventory</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm text-[#AEB9E1] mb-1">Price ($) <span className="text-red-400">*</span></label>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        className={`w-full border text-white rounded px-3 py-2 ${
                          savedTiers.has(tier.id) 
                            ? 'bg-gray-700 border-gray-600 cursor-not-allowed opacity-75' 
                            : validationErrors[tier.id]?.price
                            ? 'bg-[#0B1739] border-red-500'
                            : 'bg-[#0B1739] border-[#343B4F]'
                        }`}
                        value={tier.price}
                        onChange={(e) =>
                          handleFieldChange(tier.id, "price", parseFloat(e.target.value) || 0)
                        }
                        disabled={savedTiers.has(tier.id)}
                        placeholder="Enter price greater than 0"
                      />
                      {validationErrors[tier.id]?.price && (
                        <p className="text-red-400 text-xs mt-1">{validationErrors[tier.id].price}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm text-[#AEB9E1] mb-1">Capacity <span className="text-red-400">*</span></label>
                      <input
                        type="number"
                        min="1"
                        className={`w-full border text-white rounded px-3 py-2 ${
                          savedTiers.has(tier.id) 
                            ? 'bg-gray-700 border-gray-600 cursor-not-allowed opacity-75' 
                            : validationErrors[tier.id]?.capacity
                            ? 'bg-[#0B1739] border-red-500'
                            : 'bg-[#0B1739] border-[#343B4F]'
                        }`}
                        value={tier.capacity}
                        onChange={(e) =>
                          handleFieldChange(tier.id, "capacity", parseInt(e.target.value) || 0)
                        }
                        disabled={savedTiers.has(tier.id)}
                        placeholder="Enter capacity greater than 0"
                      />
                      {validationErrors[tier.id]?.capacity && (
                        <p className="text-red-400 text-xs mt-1">{validationErrors[tier.id].capacity}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm text-[#AEB9E1] mb-1">Remaining</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full bg-[#0B1739] border border-[#343B4F] text-white rounded px-3 py-2"
                        value={tier.remaining}
                        onChange={(e) =>
                          handleFieldChange(tier.id, "remaining", parseInt(e.target.value))
                        }
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h5 className="text-[#AEB9E1] mb-2">Availability & Restrictions</h5>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block text-sm text-[#AEB9E1] mb-1">Online/ On-Site <span className="text-red-400">*</span></label>
                      <select
                        className={`w-full border text-white rounded px-3 py-2 ${
                          savedTiers.has(tier.id) 
                            ? 'bg-gray-700 border-gray-600 cursor-not-allowed opacity-75' 
                            : 'bg-[#0B1739] border-[#343B4F]'
                        }`}
                        value={tier.saleMode}
                        onChange={(e) =>
                          handleFieldChange(tier.id, "saleMode", e.target.value)
                        }
                        disabled={savedTiers.has(tier.id)}
                      >
                        <option value="Online Only">Online Only</option>
                        <option value="On-Site">On-Site Only</option>
                        <option value="Both">Both</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-[#AEB9E1] mb-1">Sales Start Date <span className="text-red-400">*</span></label>
                      <input
                        type="date"
                        className={`w-full border text-white rounded px-3 py-2 ${
                          savedTiers.has(tier.id) 
                            ? 'bg-gray-700 border-gray-600 cursor-not-allowed opacity-75' 
                            : 'bg-[#0B1739] border-[#343B4F]'
                        }`}
                        value={tier.startDate.split('-').reverse().join('-')}
                        onChange={(e) =>
                          handleFieldChange(tier.id, "startDate", e.target.value.split('-').reverse().join('-'))
                        }
                        disabled={savedTiers.has(tier.id)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[#AEB9E1] mb-1">Sales End Date <span className="text-red-400">*</span></label>
                      <input
                        type="date"
                        className={`w-full border text-white rounded px-3 py-2 ${
                          savedTiers.has(tier.id) 
                            ? 'bg-gray-700 border-gray-600 cursor-not-allowed opacity-75' 
                            : 'bg-[#0B1739] border-[#343B4F]'
                        }`}
                        value={tier.endDate.split('-').reverse().join('-')}
                        onChange={(e) =>
                          handleFieldChange(tier.id, "endDate", e.target.value.split('-').reverse().join('-'))
                        }
                        disabled={savedTiers.has(tier.id)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[#AEB9E1] mb-1">Limit Per User (optional)</label>
                      <input
                        type="number"
                        min="0"
                        className={`w-full border text-white rounded px-3 py-2 ${
                          savedTiers.has(tier.id) 
                            ? 'bg-gray-700 border-gray-600 cursor-not-allowed opacity-75' 
                            : 'bg-[#0B1739] border-[#343B4F]'
                        }`}
                        value={tier.limitPerUser || ""}
                        onChange={(e) =>
                          handleFieldChange(
                            tier.id,
                            "limitPerUser",
                            e.target.value ? parseInt(e.target.value) : null
                          )
                        }
                        disabled={savedTiers.has(tier.id)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-[#AEB9E1]">
                    {tier.remaining} of {tier.capacity} tickets available (
                    {Math.round((tier.remaining / tier.capacity) * 100)}% remaining)
                  </div>
                  <div className="flex space-x-2">
                    <button
                      className="text-[#AEB9E1] hover:text-red-500 p-1"
                      onClick={() => handleDeleteTier(tier.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                    {savedTiers.has(tier.id) ? (
                      <button
                        className="text-[#AEB9E1] hover:text-blue-400 p-1"
                        onClick={() => handleEditTier(tier.id)}
                        title="Edit tier"
                      >
                        <Edit size={18} />
                      </button>
                    ) : (
                      <button
                        className="text-[#AEB9E1] hover:text-purple-400 p-1"
                        onClick={() => handleSaveTier(tier.id)}
                        disabled={!hasChanges}
                        title="Save tier"
                      >
                        <Save size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-[#AEB9E1]">
              <Ticket size={48} className="mx-auto mb-4 text-[#343B4F]" />
              <h3 className="text-lg font-medium mb-2">No Ticket Tiers Found</h3>
              <p className="mb-4">Create your first ticket tier to get started</p>
              <button
                className="flex items-center px-4 py-2 bg-gradient-to-r from-[#CB3CFF] to-[#7F25FB] rounded-lg mx-auto"
                onClick={handleAddNewTier}
              >
                <Plus size={16} className="mr-2" />
                Add Ticket Tier
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}