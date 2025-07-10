// File: app/admin/events/[id]/tournament-results/page.jsx
"use client";

import React, { useState } from "react";
import { ChevronLeft, Download, ChevronDown, ChevronUp, Trophy, Award, User, Shield, Scale } from "lucide-react";
import Link from "next/link";

const TournamentResultsPage = () => {
  const [activeTab, setActiveTab] = useState("final-results");
  const [expandedBrackets, setExpandedBrackets] = useState({});

  // Mock data for tournament results
  const event = {
    id: "evt-12345",
    title: "IKF Point Muay Thai Championships - Moncks Corner, SC",
    date: "April 13-14, 2025",
    brackets: [
      {
        id: "brkt-001",
        title: "Boys' Novice 130-140lbs",
        classification: "Amateur",
        gender: "Boys",
        division: "Light Welterweight",
        weightRange: "130.1 – 140.0LBS",
        ruleStyle: "Point Sparring",
        rulesFormat: "International Rules",
        matches: [
          {
            id: "mtch-13113",
            round: "Finals",
            winner: "Michael Chen",
            winnerColor: "blue",
            loser: "David Rodriguez",
            loserColor: "red",
            method: "Decision (3-0)",
            time: "2:30"
          },
          {
            id: "mtch-13114",
            round: "Semifinals",
            winner: "Michael Chen",
            winnerColor: "blue",
            loser: "Thomas Wilson",
            loserColor: "red",
            method: "KO",
            time: "1:45"
          },
          {
            id: "mtch-13115",
            round: "Semifinals",
            winner: "David Rodriguez",
            winnerColor: "blue",
            loser: "James Anderson",
            loserColor: "red",
            method: "Decision (2-1)",
            time: "3:00"
          }
        ]
      },
      {
        id: "brkt-002",
        title: "Girls' Intermediate 110-120lbs",
        classification: "Amateur",
        gender: "Girls",
        division: "Lightweight",
        weightRange: "110.1 – 120.0LBS",
        ruleStyle: "Continuous Sparring",
        rulesFormat: "Modified Rules",
        matches: [
          {
            id: "mtch-13116",
            round: "Finals",
            winner: "Sarah Johnson",
            winnerColor: "blue",
            loser: "Emma Williams",
            loserColor: "red",
            method: "Decision (3-0)",
            time: "3:00"
          },
          {
            id: "mtch-13117",
            round: "Semifinals",
            winner: "Sarah Johnson",
            winnerColor: "blue",
            loser: "Olivia Martinez",
            loserColor: "red",
            method: "TKO",
            time: "2:15"
          }
        ]
      },
      {
        id: "brkt-003",
        title: "Men's Pro 170-180lbs",
        classification: "Professional",
        gender: "Men",
        division: "Welterweight",
        weightRange: "170.1 – 180.0LBS",
        ruleStyle: "Full Contact",
        rulesFormat: "IKF Championship Rules",
        matches: [
          {
            id: "mtch-13118",
            round: "Finals",
            winner: "Robert Taylor",
            winnerColor: "blue",
            loser: "Marcus Brown",
            loserColor: "red",
            method: "KO",
            time: "1:20"
          },
          {
            id: "mtch-13119",
            round: "Semifinals",
            winner: "Robert Taylor",
            winnerColor: "blue",
            loser: "Kevin Davis",
            loserColor: "red",
            method: "Decision (2-1)",
            time: "3:00"
          }
        ]
      }
    ]
  };

  // Tabs configuration
  const tabs = [
    { id: "final-results", label: "Final Results", icon: <Trophy size={16} /> },
    { id: "competitors", label: "Competitors", icon: <User size={16} /> },
    { id: "registration-payments", label: "Registration Payments", icon: <Award size={16} /> },
    { id: "spectator-payments", label: "Spectator Payments", icon: <Shield size={16} /> },
  ];

  // Toggle bracket expansion
  const toggleBracket = (bracketId) => {
    setExpandedBrackets(prev => ({
      ...prev,
      [bracketId]: !prev[bracketId]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1026] to-[#1A2A4F] text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center">
            <Link href={`/admin/events/${event.id}`}>
              <button className="flex items-center px-4 py-2 bg-[#1E3A8A] hover:bg-[#2D4AB2] rounded-lg transition-all">
                <ChevronLeft size={20} />
                <span className="ml-2">Back to Event</span>
              </button>
            </Link>
            <div className="ml-6">
              <h1 className="text-2xl md:text-3xl font-bold">{event.title}</h1>
              <p className="text-blue-300 mt-1">{event.date}</p>
            </div>
          </div>
          <button className="flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 rounded-lg transition-all shadow-lg">
            <Download size={20} className="mr-2" />
            Export Results
          </button>
        </div>

        {/* Main Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-[#2D3A6D] pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`flex items-center px-4 py-2 rounded-t-lg font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-[#1E3A8A] text-white border-b-2 border-blue-400"
                  : "bg-[#0F1A3F] text-[#AEB9E1] hover:bg-[#1A2A5F]"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-[#0B1739] bg-opacity-80 rounded-xl p-6 shadow-2xl border border-[#1E3A8A]">
          {/* Final Results Tab */}
          {activeTab === "final-results" && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold flex items-center">
                  <Trophy className="mr-3 text-yellow-400" size={28} />
                  Final Bout Results
                </h2>
                <button 
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all flex items-center"
                >
                  <RefreshCw className="mr-2" size={18} />
                  Refresh Results
                </button>
              </div>

              {/* Brackets Section */}
              <div className="space-y-6">
                {event.brackets.map(bracket => (
                  <div key={bracket.id} className="border border-[#2D3A6D] rounded-xl overflow-hidden bg-[#0F1A3F]">
                    {/* Bracket Header */}
                    <div 
                      className="p-4 flex justify-between items-center cursor-pointer bg-gradient-to-r from-[#1A2A5F] to-[#2D3A6D]"
                      onClick={() => toggleBracket(bracket.id)}
                    >
                      <div>
                        <h3 className="font-bold text-xl flex items-center">
                          <Scale className="mr-2 text-blue-300" size={20} />
                          {bracket.title}
                        </h3>
                        <div className="flex flex-wrap gap-4 mt-2">
                          <div className="flex items-center text-sm">
                            <span className="text-[#AEB9E1] mr-1">Class:</span>
                            <span className="font-medium">{bracket.classification}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <span className="text-[#AEB9E1] mr-1">Gender:</span>
                            <span className="font-medium">{bracket.gender}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <span className="text-[#AEB9E1] mr-1">Division:</span>
                            <span className="font-medium">{bracket.division}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-4 text-sm bg-[#1E3A8A] px-2 py-1 rounded">ID: {bracket.id}</span>
                        {expandedBrackets[bracket.id] ? (
                          <ChevronUp size={24} className="text-blue-300" />
                        ) : (
                          <ChevronDown size={24} className="text-blue-300" />
                        )}
                      </div>
                    </div>

                    {/* Bracket Details */}
                    {expandedBrackets[bracket.id] && (
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                          <div className="bg-[#122046] rounded-lg p-4">
                            <p className="text-sm text-[#AEB9E1]">Weight Class</p>
                            <p className="font-medium text-lg">{bracket.weightRange}</p>
                          </div>
                          <div className="bg-[#122046] rounded-lg p-4">
                            <p className="text-sm text-[#AEB9E1]">Rule Style</p>
                            <p className="font-medium text-lg">{bracket.ruleStyle}</p>
                          </div>
                          <div className="bg-[#122046] rounded-lg p-4">
                            <p className="text-sm text-[#AEB9E1]">Rules Format</p>
                            <p className="font-medium text-lg">{bracket.rulesFormat}</p>
                          </div>
                        </div>

                        {/* Bout Results */}
                        <h4 className="font-bold text-xl mb-4 flex items-center">
                          <Award className="mr-2 text-yellow-400" size={20} />
                          Bout Results
                        </h4>
                        <div className="space-y-4">
                          {bracket.matches.map(match => (
                            <div key={match.id} className="border border-[#2D3A6D] rounded-xl p-4 bg-[#122046] hover:bg-[#1A2A5F] transition-all">
                              <div className="flex flex-wrap justify-between mb-3">
                                <span className="text-sm text-blue-300 bg-[#1E3A8A] px-2 py-1 rounded">ID: {match.id}</span>
                                <span className="text-sm text-yellow-300 bg-[#3D2E0F] px-2 py-1 rounded">Round: {match.round}</span>
                              </div>
                              
                              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center w-full md:w-auto">
                                  <div className={`w-4 h-8 rounded mr-3 ${match.winnerColor === "blue" ? "bg-blue-500" : "bg-red-500"}`}></div>
                                  <span className="font-bold text-lg text-blue-300">{match.winner}</span>
                                </div>
                                
                                <div className="flex flex-col items-center">
                                  <div className="px-4 py-1 bg-[#1A2A5F] rounded-lg font-bold text-yellow-400">WINNER</div>
                                  <div className="text-sm mt-1 bg-[#2D3A6D] px-3 py-1 rounded-full">
                                    {match.method} at {match.time}
                                  </div>
                                </div>
                                
                                <div className="flex items-center w-full md:w-auto">
                                  <div className={`w-4 h-8 rounded mr-3 ${match.loserColor === "blue" ? "bg-blue-500" : "bg-red-500"}`}></div>
                                  <span className="font-medium text-red-300">{match.loser}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Stats Summary */}
              <div className="mt-10 bg-[#122046] rounded-xl p-6 border border-[#2D3A6D]">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <BarChart2 className="mr-2 text-green-400" size={24} />
                  Tournament Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#0F1A3F] rounded-lg p-4 text-center">
                    <p className="text-[#AEB9E1]">Total Brackets</p>
                    <p className="text-2xl font-bold">8</p>
                  </div>
                  <div className="bg-[#0F1A3F] rounded-lg p-4 text-center">
                    <p className="text-[#AEB9E1]">Total Bouts</p>
                    <p className="text-2xl font-bold">42</p>
                  </div>
                  <div className="bg-[#0F1A3F] rounded-lg p-4 text-center">
                    <p className="text-[#AEB9E1]">Participants</p>
                    <p className="text-2xl font-bold">86</p>
                  </div>
                  <div className="bg-[#0F1A3F] rounded-lg p-4 text-center">
                    <p className="text-[#AEB9E1]">KO/TKO Rate</p>
                    <p className="text-2xl font-bold">38%</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Competitors Tab */}
          {activeTab === "competitors" && (
            <div className="text-center py-12">
              <div className="inline-block p-8 bg-[#122046] rounded-2xl border-2 border-dashed border-[#2D3A6D]">
                <User size={64} className="mx-auto text-blue-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Competitor Management</h2>
                <p className="text-[#AEB9E1] max-w-md mx-auto">
                  View and manage all competitors participating in this tournament.
                  Detailed competitor information will appear here.
                </p>
                <button className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all">
                  View Competitor List
                </button>
              </div>
            </div>
          )}

          {/* Payment Tabs */}
          {activeTab === "registration-payments" && (
            <div className="text-center py-12">
              <div className="inline-block p-8 bg-[#122046] rounded-2xl border-2 border-dashed border-[#2D3A6D]">
                <CreditCard size={64} className="mx-auto text-green-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Registration Payments</h2>
                <p className="text-[#AEB9E1] max-w-md mx-auto">
                  View all registration payments for fighters and trainers.
                  Detailed payment information will appear here.
                </p>
                <button className="mt-6 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-700 rounded-lg hover:from-green-700 hover:to-teal-800 transition-all">
                  View Payment Records
                </button>
              </div>
            </div>
          )}
          
          {activeTab === "spectator-payments" && (
            <div className="text-center py-12">
              <div className="inline-block p-8 bg-[#122046] rounded-2xl border-2 border-dashed border-[#2D3A6D]">
                <Ticket size={64} className="mx-auto text-purple-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Spectator Payments</h2>
                <p className="text-[#AEB9E1] max-w-md mx-auto">
                  View all spectator ticket purchases and payments.
                  Detailed spectator payment information will appear here.
                </p>
                <button className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-lg hover:from-purple-700 hover:to-indigo-800 transition-all">
                  View Ticket Sales
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-[#AEB9E1] text-sm">
          <p>IKF Tournament Management System • {new Date().getFullYear()}</p>
          <p className="mt-1">All bout results are final after 24-hour review period</p>
        </div>
      </div>
    </div>
  );
};

// Helper components (for icons not in lucide-react)
const RefreshCw = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
    <path d="M16 16h5v5" />
  </svg>
);

const BarChart2 = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const CreditCard = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const Ticket = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
    <path d="M13 5v2" />
    <path d="M13 17v2" />
    <path d="M13 11v2" />
  </svg>
);

export default TournamentResultsPage;