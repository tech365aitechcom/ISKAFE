"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, Download, ChevronDown, ChevronUp, Trophy, Award, User, Shield, Scale } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { API_BASE_URL } from "../../../../../../constants/index";
import useStore from "../../../../../../stores/useStore";
import Loader from "../../../../../_components/Loader";

const TournamentResultsPage = () => {
  const [activeTab, setActiveTab] = useState("final-results");
  const [expandedBrackets, setExpandedBrackets] = useState({});
  const [event, setEvent] = useState(null);
  const [brackets, setBrackets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const params = useParams();
  const eventId = params.id;
  const user = useStore((state) => state.user);

  useEffect(() => {
    if (eventId && user?.token) {
      fetchEventData();
      fetchTournamentResults();
    }
  }, [eventId, user?.token]);

  const fetchEventData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setEvent(data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching event data:', err);
      setError('Failed to load event data');
    }
  };

  const fetchTournamentResults = async () => {
    try {
      setLoading(true);
      // First, get all brackets for this event
      const bracketsResponse = await fetch(`${API_BASE_URL}/brackets?eventId=${eventId}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (bracketsResponse.ok) {
        const bracketsData = await bracketsResponse.json();
        if (bracketsData.success) {
          const bracketsWithResults = await Promise.all(
            (bracketsData.data || []).map(async (bracket) => {
              try {
                // Get all bouts for this bracket
                const boutsResponse = await fetch(`${API_BASE_URL}/bouts?bracketId=${bracket._id}`, {
                  headers: {
                    Authorization: `Bearer ${user?.token}`,
                  },
                });

                if (boutsResponse.ok) {
                  const boutsData = await boutsResponse.json();
                  if (boutsData.success) {
                    // Get fight results for each bout
                    const matches = await Promise.all(
                      (boutsData.data || []).map(async (bout) => {
                        try {
                          const fightResponse = await fetch(
                            `${API_BASE_URL}/fights?eventId=${eventId}&bracketId=${bracket._id}&boutId=${bout._id}`,
                            {
                              headers: {
                                Authorization: `Bearer ${user?.token}`,
                              },
                            }
                          );

                          if (fightResponse.ok) {
                            const fightData = await fightResponse.json();
                            if (fightData.success && fightData.data.items && fightData.data.items.length > 0) {
                              const fight = fightData.data.items[0];
                              return {
                                id: fight._id,
                                boutId: bout._id,
                                boutNumber: bout.boutNumber,
                                round: fight.resultDetails?.round || 1,
                                winner: fight.winner,
                                winnerColor: determineCornerColor(bout, fight.winner._id),
                                loser: bout.redCorner._id === fight.winner._id ? bout.blueCorner : bout.redCorner,
                                loserColor: determineCornerColor(bout, fight.winner._id === bout.redCorner._id ? bout.blueCorner._id : bout.redCorner._id),
                                method: fight.resultMethod || 'Decision',
                                time: fight.resultDetails?.time || '3:00',
                                reason: fight.resultDetails?.reason || '',
                                judgeScores: fight.judgeScores
                              };
                            }
                          }
                          return null;
                        } catch (err) {
                          console.error(`Error fetching fight for bout ${bout._id}:`, err);
                          return null;
                        }
                      })
                    );

                    return {
                      ...bracket,
                      matches: matches.filter(match => match !== null)
                    };
                  }
                }
                return { ...bracket, matches: [] };
              } catch (err) {
                console.error(`Error fetching bouts for bracket ${bracket._id}:`, err);
                return { ...bracket, matches: [] };
              }
            })
          );

          setBrackets(bracketsWithResults);
        }
      }
    } catch (err) {
      console.error('Error fetching tournament results:', err);
      setError('Failed to load tournament results');
    } finally {
      setLoading(false);
    }
  };

  const determineCornerColor = (bout, fighterId) => {
    return bout.redCorner._id === fighterId ? 'red' : 'blue';
  };

  const refreshResults = async () => {
    setRefreshing(true);
    await fetchTournamentResults();
    setRefreshing(false);
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
            <Link href={`/admin/events/${eventId}`}>
              <button className="flex items-center px-4 py-2 bg-[#1E3A8A] hover:bg-[#2D4AB2] rounded-lg transition-all">
                <ChevronLeft size={20} />
                <span className="ml-2">Back to Event</span>
              </button>
            </Link>
            <div className="ml-6">
              <h1 className="text-2xl md:text-3xl font-bold">{event?.name || 'Loading...'}</h1>
              <p className="text-blue-300 mt-1">
                {event?.startDate && event?.endDate
                  ? `${new Date(event.startDate).toLocaleDateString()} - ${new Date(event.endDate).toLocaleDateString()}`
                  : 'Loading...'}
              </p>
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
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all flex items-center disabled:opacity-50"
                  onClick={refreshResults}
                  disabled={refreshing}
                >
                  <RefreshCw className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} size={18} />
                  {refreshing ? 'Refreshing...' : 'Get Results'}
                </button>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <Loader />
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="text-center py-8">
                  <p className="text-red-400">Error: {error}</p>
                  <button 
                    onClick={refreshResults}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Brackets Section */}
              {!loading && !error && (
                <div className="space-y-6 max-h-[600px] overflow-y-auto">
                  {brackets.map(bracket => (
                  <div key={bracket._id} className="border border-[#2D3A6D] rounded-xl overflow-hidden bg-[#0F1A3F]">
                    {/* Bracket Header */}
                    <div 
                      className="p-4 flex justify-between items-center cursor-pointer bg-gradient-to-r from-[#1A2A5F] to-[#2D3A6D]"
                      onClick={() => toggleBracket(bracket._id)}
                    >
                      <div>
                        <h3 className="font-bold text-xl flex items-center">
                          <Scale className="mr-2 text-blue-300" size={20} />
                          {bracket.title || bracket.divisionTitle}
                        </h3>
                        <div className="flex flex-wrap gap-4 mt-2">
                          <div className="flex items-center text-sm">
                            <span className="text-[#AEB9E1] mr-1">Class:</span>
                            <span className="font-medium">{bracket.proClass || 'N/A'}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <span className="text-[#AEB9E1] mr-1">Age:</span>
                            <span className="font-medium">{bracket.ageClass || 'N/A'}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <span className="text-[#AEB9E1] mr-1">Sport:</span>
                            <span className="font-medium">{bracket.sport || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-4 text-sm bg-[#1E3A8A] px-2 py-1 rounded">ID: {bracket._id}</span>
                        {expandedBrackets[bracket._id] ? (
                          <ChevronUp size={24} className="text-blue-300" />
                        ) : (
                          <ChevronDown size={24} className="text-blue-300" />
                        )}
                      </div>
                    </div>

                    {/* Bracket Details */}
                    {expandedBrackets[bracket._id] && (
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                          <div className="bg-[#122046] rounded-lg p-4">
                            <p className="text-sm text-[#AEB9E1]">Weight Class</p>
                            <p className="font-medium text-lg">
                              {bracket.weightClass 
                                ? `${bracket.weightClass.min} - ${bracket.weightClass.max} lbs` 
                                : 'N/A'}
                            </p>
                          </div>
                          <div className="bg-[#122046] rounded-lg p-4">
                            <p className="text-sm text-[#AEB9E1]">Rule Style</p>
                            <p className="font-medium text-lg">{bracket.ruleStyle || 'N/A'}</p>
                          </div>
                          <div className="bg-[#122046] rounded-lg p-4">
                            <p className="text-sm text-[#AEB9E1]">Ring</p>
                            <p className="font-medium text-lg">{bracket.ring || 'N/A'}</p>
                          </div>
                        </div>

                        {/* Bout Results */}
                        <h4 className="font-bold text-xl mb-4 flex items-center">
                          <Award className="mr-2 text-yellow-400" size={20} />
                          Bout Results
                        </h4>
                        <div className="space-y-4">
                          {bracket.matches && bracket.matches.length > 0 ? (
                            bracket.matches.map(match => (
                              <div key={match.id} className="border border-[#2D3A6D] rounded-xl p-4 bg-[#122046] hover:bg-[#1A2A5F] transition-all">
                                <div className="flex flex-wrap justify-between mb-3">
                                  <span className="text-sm text-blue-300 bg-[#1E3A8A] px-2 py-1 rounded">Match ID: {match.id}</span>
                                  <span className="text-sm text-green-300 bg-[#0F3D2E] px-2 py-1 rounded">Bout #{match.boutNumber}</span>
                                  <span className="text-sm text-yellow-300 bg-[#3D2E0F] px-2 py-1 rounded">Round: {match.round}</span>
                                </div>
                                
                                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                  <div className="flex items-center w-full md:w-auto">
                                    <div className={`w-4 h-8 rounded mr-3 ${match.winnerColor === "blue" ? "bg-blue-500" : "bg-red-500"}`}></div>
                                    <span className="font-bold text-lg text-blue-300">
                                      {match.winner?.userId?.firstName} {match.winner?.userId?.lastName}
                                    </span>
                                  </div>
                                  
                                  <div className="flex flex-col items-center">
                                    <div className="px-4 py-1 bg-[#1A2A5F] rounded-lg font-bold text-yellow-400">WINNER</div>
                                    <div className="text-sm mt-1 bg-[#2D3A6D] px-3 py-1 rounded-full">
                                      {match.method} at {match.time}
                                    </div>
                                    {match.reason && (
                                      <div className="text-xs mt-1 text-gray-400">{match.reason}</div>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center w-full md:w-auto">
                                    <div className={`w-4 h-8 rounded mr-3 ${match.loserColor === "blue" ? "bg-blue-500" : "bg-red-500"}`}></div>
                                    <span className="font-medium text-red-300">
                                      {match.loser?.userId?.firstName} {match.loser?.userId?.lastName}
                                    </span>
                                  </div>
                                </div>

                                {/* Judge Scores */}
                                {match.judgeScores && (
                                  <div className="mt-3 pt-3 border-t border-[#2D3A6D]">
                                    <p className="text-sm text-gray-400 mb-2">Judge Scores:</p>
                                    <div className="flex gap-4 text-sm">
                                      <div className="text-red-400">
                                        Red: {match.judgeScores.red?.join(', ') || 'N/A'}
                                      </div>
                                      <div className="text-blue-400">
                                        Blue: {match.judgeScores.blue?.join(', ') || 'N/A'}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-gray-400">
                              <p>No bout results available for this bracket yet.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  ))}
                  
                  {brackets.length === 0 && (
                    <div className="text-center py-12">
                      <div className="inline-block p-8 bg-[#122046] rounded-2xl border-2 border-dashed border-[#2D3A6D]">
                        <Trophy size={64} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-bold mb-2">No Tournament Results</h3>
                        <p className="text-[#AEB9E1] max-w-md mx-auto">
                          No brackets with completed bouts found for this event yet. 
                          Create brackets and complete bouts to see results here.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Stats Summary */}
              {!loading && !error && brackets.length > 0 && (
                <div className="mt-10 bg-[#122046] rounded-xl p-6 border border-[#2D3A6D]">
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <BarChart2 className="mr-2 text-green-400" size={24} />
                    Tournament Statistics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#0F1A3F] rounded-lg p-4 text-center">
                      <p className="text-[#AEB9E1]">Total Brackets</p>
                      <p className="text-2xl font-bold">{brackets.length}</p>
                    </div>
                    <div className="bg-[#0F1A3F] rounded-lg p-4 text-center">
                      <p className="text-[#AEB9E1]">Total Bouts</p>
                      <p className="text-2xl font-bold">{brackets.reduce((total, bracket) => total + (bracket.matches?.length || 0), 0)}</p>
                    </div>
                    <div className="bg-[#0F1A3F] rounded-lg p-4 text-center">
                      <p className="text-[#AEB9E1]">Fighters</p>
                      <p className="text-2xl font-bold">{brackets.reduce((total, bracket) => total + (bracket.fighters?.length || 0), 0)}</p>
                    </div>
                    <div className="bg-[#0F1A3F] rounded-lg p-4 text-center">
                      <p className="text-[#AEB9E1]">Completed</p>
                      <p className="text-2xl font-bold">
                        {brackets.filter(bracket => bracket.matches?.length > 0).length}
                      </p>
                    </div>
                  </div>
                </div>
              )}
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