"use client";
import { useState, useEffect } from "react";
import { Ticket, Plus, Trash2, Save, Calendar, Info, DollarSign, Search, Download } from "lucide-react";

export default function SpectatorsTicketManagement() {
  const [ticketTiers, setTicketTiers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleSaveTier = (id) => {
    const tier = ticketTiers.find((t) => t.id === id);
    if (!tier) return;

    if (!tier.name || tier.price < 0 || tier.capacity <= 0) {
      alert("Please fill all required fields with valid values");
      return;
    }

    alert(`${tier.name} has been successfully saved`);
    setHasChanges(false);
  };

  const handleSaveAll = () => {
    const hasErrors = ticketTiers.some(
      (tier) => !tier.name || tier.price < 0 || tier.capacity <= 0
    );

    if (hasErrors) {
      alert("Some ticket tiers have invalid data");
      return;
    }

    alert("All changes have been saved successfully");
    setHasChanges(false);
  };

  const handleFieldChange = (id, field, value) => {
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
                      <label className="block text-sm text-[#AEB9E1] mb-1">Ticket Order*</label>
                      <input
                        type="number"
                        min="1"
                        className="w-full bg-[#0B1739] border border-[#343B4F] text-white rounded px-3 py-2"
                        value={tier.order}
                        onChange={(e) =>
                          handleFieldChange(tier.id, "order", parseInt(e.target.value))
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[#AEB9E1] mb-1">Ticket Name*</label>
                      <input
                        className="w-full bg-[#0B1739] border border-[#343B4F] text-white rounded px-3 py-2"
                        value={tier.name}
                        onChange={(e) =>
                          handleFieldChange(tier.id, "name", e.target.value)
                        }
                        placeholder="e.g., General Admission"
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm text-[#AEB9E1] mb-1">Ticket Description</label>
                    <textarea
                      className="w-full bg-[#0B1739] border border-[#343B4F] text-white rounded px-3 py-2"
                      value={tier.description}
                      onChange={(e) =>
                        handleFieldChange(tier.id, "description", e.target.value)
                      }
                      rows={2}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <h5 className="text-[#AEB9E1] mb-2">Pricing & Inventory</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm text-[#AEB9E1] mb-1">Price ($)*</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full bg-[#0B1739] border border-[#343B4F] text-white rounded px-3 py-2"
                        value={tier.price}
                        onChange={(e) =>
                          handleFieldChange(tier.id, "price", parseFloat(e.target.value))
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[#AEB9E1] mb-1">Capacity*</label>
                      <input
                        type="number"
                        min="1"
                        className="w-full bg-[#0B1739] border border-[#343B4F] text-white rounded px-3 py-2"
                        value={tier.capacity}
                        onChange={(e) =>
                          handleFieldChange(tier.id, "capacity", parseInt(e.target.value))
                        }
                      />
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
                      <label className="block text-sm text-[#AEB9E1] mb-1">Online/ On-Site*</label>
                      <select
                        className="w-full bg-[#0B1739] border border-[#343B4F] text-white rounded px-3 py-2"
                        value={tier.saleMode}
                        onChange={(e) =>
                          handleFieldChange(tier.id, "saleMode", e.target.value)
                        }
                      >
                        <option value="Online Only">Online Only</option>
                        <option value="On-Site">On-Site Only</option>
                        <option value="Both">Both</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-[#AEB9E1] mb-1">Sales Start Date*</label>
                      <input
                        type="date"
                        className="w-full bg-[#0B1739] border border-[#343B4F] text-white rounded px-3 py-2"
                        value={tier.startDate.split('-').reverse().join('-')}
                        onChange={(e) =>
                          handleFieldChange(tier.id, "startDate", e.target.value.split('-').reverse().join('-'))
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[#AEB9E1] mb-1">Sales End Date*</label>
                      <input
                        type="date"
                        className="w-full bg-[#0B1739] border border-[#343B4F] text-white rounded px-3 py-2"
                        value={tier.endDate.split('-').reverse().join('-')}
                        onChange={(e) =>
                          handleFieldChange(tier.id, "endDate", e.target.value.split('-').reverse().join('-'))
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[#AEB9E1] mb-1">Limit Per User (optional)</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full bg-[#0B1739] border border-[#343B4F] text-white rounded px-3 py-2"
                        value={tier.limitPerUser || ""}
                        onChange={(e) =>
                          handleFieldChange(
                            tier.id,
                            "limitPerUser",
                            e.target.value ? parseInt(e.target.value) : null
                          )
                        }
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
                    <button
                      className="text-[#AEB9E1] hover:text-purple-400 p-1"
                      onClick={() => handleSaveTier(tier.id)}
                      disabled={!hasChanges}
                    >
                      <Save size={18} />
                    </button>
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