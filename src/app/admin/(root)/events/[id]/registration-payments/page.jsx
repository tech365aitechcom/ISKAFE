// File: app/admin/events/[id]/registration-payments/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Download, Search, Filter, ChevronLeft } from "lucide-react";
import Link from "next/link";
import Loader from "../../../../../_components/Loader";

const RegistrationPaymentsPage = () => {
  const params = useParams();
  const eventId = params.id;
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    startDate: "",
    endDate: "",
    paymentType: "all",
    minAmount: "",
    maxAmount: "",
    transactionId: "",
    last4: "",
  });

  // Summary stats
  const [stats, setStats] = useState({
    totalParticipants: 0,
    totalCollected: 0,
  });

  const [eventDetails, setEventDetails] = useState(null);

  // Fetch registration data from API
  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/registrations/event/${eventId}`);3
        const data = await response.json();
        
        if (data.success) {
          const registrations = data.data.items;
          
          // Transform registrations to payment format
          const paymentsData = registrations
            .filter(reg => reg.paymentStatus === 'Paid') // Only show paid registrations
            .map((reg, index) => ({
              id: reg._id,
              eventId: reg.event._id,
              date: reg.createdAt,
              description: `Event registration fee - ${reg.registrationType}`,
              type: reg.paymentMethod === 'cash' ? 'Cash' : 'One-time',
              total: reg.amount, // Default to $30 if amount is 0
              payer: `${reg.firstName} ${reg.lastName}`,
              email: reg.email,
              transactionId: reg.transactionId || null,
              receiptNumber: reg.receiptNumber || null,
              orderId: reg.orderId || null,
              last4: reg.last4 || null
            }));
          
          setPayments(paymentsData);
          
          // Set event details for event date
          if (registrations.length > 0) {
            setEventDetails(registrations[0].event);
          }
          
          // Calculate stats
          const totalCollected = paymentsData.reduce((sum, item) => sum + item.total, 0);
          const uniquePayers = new Set(paymentsData.map(item => item.email)).size;
          
          setStats({
            totalParticipants: uniquePayers,
            totalCollected: totalCollected.toFixed(2),
          });
        }
      } catch (error) {
        console.error('Error fetching registrations:', error);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchRegistrations();
    }
  }, [eventId]);

  // Apply filters
  const filteredPayments = payments.filter(payment => {
    const paymentDate = new Date(payment.date);
    const startDate = filters.startDate ? new Date(filters.startDate) : null;
    const endDate = filters.endDate ? new Date(filters.endDate) : null;
    const minAmount = filters.minAmount ? parseFloat(filters.minAmount) : null;
    const maxAmount = filters.maxAmount ? parseFloat(filters.maxAmount) : null;
    
    return (
      (!filters.name || payment.payer.toLowerCase().includes(filters.name.toLowerCase())) &&
      (!filters.email || payment.email.toLowerCase().includes(filters.email.toLowerCase())) &&
      (!filters.paymentType || filters.paymentType === "all" || 
        payment.type.toLowerCase() === filters.paymentType.toLowerCase()) &&
      (!startDate || paymentDate >= startDate) &&
      (!endDate || paymentDate <= endDate) &&
      (!minAmount || payment.total >= minAmount) &&
      (!maxAmount || payment.total <= maxAmount) &&
      (!filters.transactionId || (payment.transactionId && payment.transactionId.toLowerCase().includes(filters.transactionId.toLowerCase()))) &&
      (!filters.last4 || (payment.last4 && payment.last4.includes(filters.last4)))
    );
  });

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
            <Link href={`/admin/events/view/${eventId}`}>
              <button className="flex items-center mr-4">
                <ChevronLeft size={24} />
                <span className="ml-2">Back</span>
              </button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Registration Payments</h1>
              <p className="text-[#AEB9E1] text-sm mt-1">
                {eventDetails ? eventDetails.name : 'Tournament Results'}
              </p>
            </div>
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
            <p className="text-[#AEB9E1] text-sm">Total Participants</p>
            <p className="text-2xl font-bold mt-2">{stats.totalParticipants}</p>
          </div>
          <div className="bg-[#122046] rounded-lg p-6 text-center">
            <p className="text-[#AEB9E1] text-sm">Total Amount Collected</p>
            <p className="text-2xl font-bold mt-2">${stats.totalCollected}</p>
          </div>
          <div className="bg-[#122046] rounded-lg p-6 text-center">
            <p className="text-[#AEB9E1] text-sm">Payment Cut-off Date</p>
            <p className="text-2xl font-bold mt-2">
              {eventDetails ? new Date(eventDetails.startDate).toLocaleDateString() : 'Event Date'}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#122046] rounded-lg p-6 mb-8">
          <h2 className="text-lg font-bold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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

            {/* Payment Type Filter */}
            <div>
              <label className="block text-sm text-[#AEB9E1] mb-1">Payment Type</label>
              <select
                className="w-full bg-[#0A1330] border border-[#343B4F] rounded-lg px-4 py-2"
                value={filters.paymentType}
                onChange={(e) => setFilters({...filters, paymentType: e.target.value})}
              >
                <option value="all">All Types</option>
                <option value="one-time">One-time</option>
                <option value="cash">Cash</option>
              </select>
            </div>

            {/* Transaction ID Filter */}
            <div>
              <label className="block text-sm text-[#AEB9E1] mb-1">Transaction ID</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded-lg px-4 py-2 pl-10"
                  placeholder="Search by transaction ID"
                  value={filters.transactionId}
                  onChange={(e) => setFilters({...filters, transactionId: e.target.value})}
                />
                <Search size={16} className="absolute left-3 top-3 text-[#AEB9E1]" />
              </div>
            </div>
          </div>
          
          {/* Second Row of Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Date Range Filter */}
            <div>
              <label className="block text-sm text-[#AEB9E1] mb-2">Date Range</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="date"
                    className="w-full bg-[#0A1330] border border-[#343B4F] rounded-lg px-3 py-2 text-sm"
                    value={filters.startDate}
                    onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                  />
                  <span className="text-xs text-[#AEB9E1] mt-1 block">From</span>
                </div>
                <div>
                  <input
                    type="date"
                    className="w-full bg-[#0A1330] border border-[#343B4F] rounded-lg px-3 py-2 text-sm"
                    value={filters.endDate}
                    onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                  />
                  <span className="text-xs text-[#AEB9E1] mt-1 block">To</span>
                </div>
              </div>
            </div>
            
            {/* Amount Range Filter */}
            <div>
              <label className="block text-sm text-[#AEB9E1] mb-2">Amount Range ($)</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="number"
                    className="w-full bg-[#0A1330] border border-[#343B4F] rounded-lg px-3 py-2"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    value={filters.minAmount}
                    onChange={(e) => setFilters({...filters, minAmount: e.target.value})}
                  />
                  <span className="text-xs text-[#AEB9E1] mt-1 block">Min</span>
                </div>
                <div>
                  <input
                    type="number"
                    className="w-full bg-[#0A1330] border border-[#343B4F] rounded-lg px-3 py-2"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    value={filters.maxAmount}
                    onChange={(e) => setFilters({...filters, maxAmount: e.target.value})}
                  />
                  <span className="text-xs text-[#AEB9E1] mt-1 block">Max</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Third Row of Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {/* Last 4 Filter */}
            <div>
              <label className="block text-sm text-[#AEB9E1] mb-2">Card Last 4</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded-lg px-4 py-2 pl-10"
                  placeholder="Last 4 digits"
                  maxLength="4"
                  value={filters.last4}
                  onChange={(e) => setFilters({...filters, last4: e.target.value})}
                />
                <Search size={16} className="absolute left-3 top-3 text-[#AEB9E1]" />
              </div>
            </div>
            
            {/* Empty space for alignment */}
            <div></div>
            
            {/* Clear Filters Button */}
            <div className="flex items-end">
              <button
                onClick={() => setFilters({
                  name: "",
                  email: "",
                  startDate: "",
                  endDate: "",
                  paymentType: "all",
                  minAmount: "",
                  maxAmount: "",
                  transactionId: "",
                  last4: "",
                })}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#122046]">
                <th className="p-4 text-left">#</th>
                <th className="p-4 text-left">Reg Date</th>
                <th className="p-4 text-left">Description</th>
                <th className="p-4 text-left">Event ID</th>
                <th className="p-4 text-left">Type</th>
                <th className="p-4 text-left">Total</th>
                <th className="p-4 text-left">Payer</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Square Transaction ID</th>
                <th className="p-4 text-left">Square Receipt Number</th>
                <th className="p-4 text-left">Square Order ID</th>
                <th className="p-4 text-left">Last4</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="12" className="text-center p-8">
                    No registration payments found
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment, index) => (
                  <tr key={payment.id} className="border-b border-[#343B4F] hover:bg-[#122046]">
                    <td className="p-4">{index + 1}</td>
                    <td className="p-4">
                      {new Date(payment.date).toLocaleDateString()} {new Date(payment.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td className="p-4">{payment.description}</td>
                    <td className="p-4 text-xs">{payment.eventId}</td>
                    <td className="p-4">{payment.type}</td>
                    <td className="p-4">${payment.total.toFixed(2)}</td>
                    <td className="p-4">{payment.payer}</td>
                    <td className="p-4">{payment.email}</td>
                    <td className="p-4 text-xs">
                      {payment.transactionId || "N/A"}
                    </td>
                    <td className="p-4">
                      {payment.receiptNumber || "N/A"}
                    </td>
                    <td className="p-4 text-xs">
                      {payment.orderId || "N/A"}
                    </td>
                    <td className="p-4">
                      {payment.last4 || "N/A"}
                    </td>
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

export default RegistrationPaymentsPage;