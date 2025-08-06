// File: app/admin/events/[id]/spectator-payments/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Download, Search, Filter } from "lucide-react";
import Link from "next/link";
import Loader from "../../../../../_components/Loader";
import axios from "../../../../../../shared/axios";

const SpectatorPaymentsPage = () => {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id;
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    startDate: "",
    endDate: "",
    ticketType: "all",
    minTotal: "",
    maxTotal: "",
    minNet: "",
    maxNet: "",
  });

  // Summary stats
  const [stats, setStats] = useState({
    totalFees: 0,
    totalCollected: 0,
    netRevenue: 0,
  });

  // Fetch spectator payments data
  const fetchSpectatorPayments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/spectator-ticket/purchase/event/${eventId}`);
      
      if (response.data.success) {
        const rawData = response.data.data.items || [];
        
        // Transform API data to match UI requirements
        const transformedData = rawData.map((item, index) => ({
          id: item._id,
          serialNumber: index + 1,
          date: item.createdAt,
          payer: item.user ? `${item.user.firstName} ${item.user.lastName}` : 
                 (item.guestDetails ? `${item.guestDetails.firstName} ${item.guestDetails.lastName}` : 'Guest'),
          email: item.user ? item.user.email : 
                 (item.guestDetails ? item.guestDetails.email : ''),
          ticketDescription: `${item.tier} - Event Ticket`,
          quantity: item.quantity,
          unitPrice: item.totalAmount / item.quantity,
          // Custom fee calculation (not Square logic - as per requirements)
          fee: item.totalAmount * 0.05, // 5% fee as per IKF custom logic
          total: item.totalAmount,
          net: item.totalAmount - (item.totalAmount * 0.05),
          paymentStatus: item.paymentStatus,
          paymentMethod: item.paymentMethod,
          ticketCode: item.ticketCode,
          redemptionStatus: item.redemptionStatus
        }));
        
        setPayments(transformedData);
        setFilteredPayments(transformedData);
      }
    } catch (error) {
      console.error('Error fetching spectator payments:', error);
      setPayments([]);
      setFilteredPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchSpectatorPayments();
    }
  }, [eventId]);

  // Apply filters and calculate stats whenever payments or filters change
  useEffect(() => {
    let filtered = payments.filter(payment => {
      // Name filter
      const nameMatch = !filters.name || 
        payment.payer.toLowerCase().includes(filters.name.toLowerCase());
      
      // Email filter
      const emailMatch = !filters.email || 
        payment.email.toLowerCase().includes(filters.email.toLowerCase());
      
      // Date range filter
      let dateMatch = true;
      if (filters.startDate || filters.endDate) {
        const paymentDate = new Date(payment.date);
        if (filters.startDate) {
          const startDate = new Date(filters.startDate);
          dateMatch = dateMatch && paymentDate >= startDate;
        }
        if (filters.endDate) {
          const endDate = new Date(filters.endDate);
          dateMatch = dateMatch && paymentDate <= endDate;
        }
      }
      
      // Ticket type filter
      const ticketTypeMatch = !filters.ticketType || filters.ticketType === "all" || 
        payment.ticketDescription.toLowerCase().includes(filters.ticketType.toLowerCase());
      
      // Total amount range filter
      let totalMatch = true;
      if (filters.minTotal) {
        totalMatch = totalMatch && payment.total >= parseFloat(filters.minTotal);
      }
      if (filters.maxTotal) {
        totalMatch = totalMatch && payment.total <= parseFloat(filters.maxTotal);
      }
      
      // Net revenue range filter
      let netMatch = true;
      if (filters.minNet) {
        netMatch = netMatch && payment.net >= parseFloat(filters.minNet);
      }
      if (filters.maxNet) {
        netMatch = netMatch && payment.net <= parseFloat(filters.maxNet);
      }
      
      return nameMatch && emailMatch && dateMatch && ticketTypeMatch && totalMatch && netMatch;
    });

    setFilteredPayments(filtered);
    
    // Calculate summary stats
    const totalFees = filtered.reduce((sum, item) => sum + item.fee, 0);
    const totalCollected = filtered.reduce((sum, item) => sum + item.total, 0);
    const netRevenue = filtered.reduce((sum, item) => sum + item.net, 0);
    
    setStats({
      totalFees: totalFees.toFixed(2),
      totalCollected: totalCollected.toFixed(2),
      netRevenue: netRevenue.toFixed(2),
    });
  }, [payments, filters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-[#07091D]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="text-white p-8 flex justify-center relative overflow-hidden">
      <div className="bg-[#0B1739] bg-opacity-80 rounded-lg p-10 shadow-lg w-full z-50">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <button 
              onClick={() => router.back()}
              className="flex items-center mr-4"
            >
              <ChevronLeft size={24} />
              <span className="ml-2">Back</span>
            </button>
            <h1 className="text-2xl font-bold">Tournament Results</h1>
            <div className="text-sm text-[#AEB9E1] mt-1">Spectator-Only Payments</div>
          </div>
          <div className="flex space-x-4">
            <button className="flex items-center px-4 py-2 bg-blue-600 rounded-lg">
              <Download size={16} className="mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Summary Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#122046] rounded-lg p-6 text-center">
            <p className="text-[#AEB9E1] text-sm">Total Spectator Fees</p>
            <p className="text-2xl font-bold mt-2">${stats.totalFees}</p>
          </div>
          <div className="bg-[#122046] rounded-lg p-6 text-center">
            <p className="text-[#AEB9E1] text-sm">Total Amount Collected</p>
            <p className="text-2xl font-bold mt-2">${stats.totalCollected}</p>
          </div>
          <div className="bg-[#122046] rounded-lg p-6 text-center">
            <p className="text-[#AEB9E1] text-sm">Total Net Revenue</p>
            <p className="text-2xl font-bold mt-2">${stats.netRevenue}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#122046] rounded-lg p-6 mb-8">
          <h2 className="text-lg font-bold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Name Filter */}
            <div>
              <label className="block text-sm text-[#AEB9E1] mb-1">Search by Name</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded-lg px-4 py-2 pl-10"
                  placeholder="Search by name"
                  value={filters.name}
                  onChange={(e) => setFilters({...filters, name: e.target.value})}
                />
                <Search size={16} className="absolute left-3 top-3 text-[#AEB9E1]" />
              </div>
            </div>

            {/* Email Filter */}
            <div>
              <label className="block text-sm text-[#AEB9E1] mb-1">Search by Email</label>
              <div className="relative">
                <input
                  type="email"
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded-lg px-4 py-2 pl-10"
                  placeholder="Search by email"
                  value={filters.email}
                  onChange={(e) => setFilters({...filters, email: e.target.value})}
                />
                <Search size={16} className="absolute left-3 top-3 text-[#AEB9E1]" />
              </div>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm text-[#AEB9E1] mb-1">Date Range</label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded-lg px-4 py-2"
                  value={filters.startDate}
                  onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                />
                <span className="self-center text-xs">to</span>
                <input
                  type="date"
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded-lg px-4 py-2"
                  value={filters.endDate}
                  onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                />
              </div>
            </div>

            {/* Ticket Type Filter */}
            <div>
              <label className="block text-sm text-[#AEB9E1] mb-1">Ticket Type</label>
              <select
                className="w-full bg-[#0A1330] border border-[#343B4F] rounded-lg px-4 py-2"
                value={filters.ticketType}
                onChange={(e) => setFilters({...filters, ticketType: e.target.value})}
              >
                <option value="all">All Types</option>
                <option value="general">General Admission</option>
                <option value="vip">VIP</option>
                <option value="adult">Adult</option>
                <option value="child">Child</option>
              </select>
            </div>

            {/* Total Amount Range Filter */}
            <div>
              <label className="block text-sm text-[#AEB9E1] mb-1">Total Amount Range</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded-lg px-4 py-2"
                  placeholder="Min"
                  value={filters.minTotal}
                  onChange={(e) => setFilters({...filters, minTotal: e.target.value})}
                />
                <span className="self-center text-xs">to</span>
                <input
                  type="number"
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded-lg px-4 py-2"
                  placeholder="Max"
                  value={filters.maxTotal}
                  onChange={(e) => setFilters({...filters, maxTotal: e.target.value})}
                />
              </div>
            </div>

            {/* Net Revenue Range Filter */}
            <div>
              <label className="block text-sm text-[#AEB9E1] mb-1">Net Revenue Range</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded-lg px-4 py-2"
                  placeholder="Min"
                  value={filters.minNet}
                  onChange={(e) => setFilters({...filters, minNet: e.target.value})}
                />
                <span className="self-center text-xs">to</span>
                <input
                  type="number"
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded-lg px-4 py-2"
                  placeholder="Max"
                  value={filters.maxNet}
                  onChange={(e) => setFilters({...filters, maxNet: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#122046]">
                <th className="p-4 text-left">#</th>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Payer</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Ticket Description</th>
                <th className="p-4 text-left">Ticket(s)</th>
                <th className="p-4 text-left">Fee</th>
                <th className="p-4 text-left">Total</th>
                <th className="p-4 text-left">Net</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center p-8">
                    No spectator payments found
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-[#343B4F] hover:bg-[#122046]">
                    <td className="p-4">{payment.serialNumber}</td>
                    <td className="p-4">
                      {new Date(payment.date).toLocaleDateString()} {new Date(payment.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td className="p-4">{payment.payer}</td>
                    <td className="p-4">{payment.email}</td>
                    <td className="p-4">{payment.ticketDescription}</td>
                    <td className="p-4">{payment.quantity} @ ${payment.unitPrice.toFixed(2)}</td>
                    <td className="p-4">${payment.fee.toFixed(2)}</td>
                    <td className="p-4">${payment.total.toFixed(2)}</td>
                    <td className="p-4">${payment.net.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SpectatorPaymentsPage;