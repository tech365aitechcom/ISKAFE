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
    minTotal: "",
    maxTotal: "",
  });

  // Summary stats
  const [stats, setStats] = useState({
    totalParticipants: 0,
    totalCollected: 0,
  });

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockData = [
        {
          id: 1,
          date: "2025-04-08T10:15:00Z",
          payer: "Sarah Johnson",
          email: "sarah@example.com",
          description: "Event registration fee - fighter",
          type: "One-time",
          total: 30.00,
          transactionId: "SQ-123456789",
          receiptNumber: "RC-987654",
          orderId: "ORD-123",
          last4: "4242"
        },
        {
          id: 2,
          date: "2025-04-09T14:20:00Z",
          payer: "Mike Thompson",
          email: "mike@example.com",
          description: "Event registration fee - trainer",
          type: "Cash",
          total: 25.00,
          transactionId: null,
          receiptNumber: null,
          orderId: null,
          last4: null
        },
      ];
      
      setPayments(mockData);
      
      // Calculate stats
      const totalCollected = mockData.reduce((sum, item) => sum + item.total, 0);
      const uniquePayers = new Set(mockData.map(item => item.email)).size;
      
      setStats({
        totalParticipants: uniquePayers,
        totalCollected: totalCollected.toFixed(2),
      });
      
      setLoading(false);
    }, 1000);
  }, []);

  // Apply filters
  const filteredPayments = payments.filter(payment => {
    return (
      (!filters.name || payment.payer.toLowerCase().includes(filters.name.toLowerCase())) &&
      (!filters.email || payment.email.toLowerCase().includes(filters.email.toLowerCase())) &&
      (!filters.paymentType || filters.paymentType === "all" || 
        payment.type.toLowerCase() === filters.paymentType.toLowerCase())
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
            <Link href={`/admin/events/${eventId}/view/${eventId}`}>
              <button className="flex items-center mr-4">
                <ChevronLeft size={24} />
                <span className="ml-2">Back</span>
              </button>
            </Link>
            <h1 className="text-2xl font-bold">Registration Payments</h1>
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
            <p className="text-2xl font-bold mt-2">Event Date</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#122046] rounded-lg p-6 mb-8">
          <h2 className="text-lg font-bold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <span className="self-center">to</span>
                <input
                  type="date"
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded-lg px-4 py-2"
                  value={filters.endDate}
                  onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                />
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
                <option value="trainer">Trainer</option>
              </select>
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
                <th className="p-4 text-left">Type</th>
                <th className="p-4 text-left">Total</th>
                <th className="p-4 text-left">Payer</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Transaction ID</th>
                <th className="p-4 text-left">Receipt</th>
                <th className="p-4 text-left">Last 4</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center p-8">
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
                    <td className="p-4">{payment.type}</td>
                    <td className="p-4">${payment.total.toFixed(2)}</td>
                    <td className="p-4">{payment.payer}</td>
                    <td className="p-4">{payment.email}</td>
                    <td className="p-4">
                      {payment.transactionId || "N/A"}
                    </td>
                    <td className="p-4">
                      {payment.receiptNumber || "N/A"}
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