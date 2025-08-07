"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, Download, ChevronDown, ChevronUp, Trophy, Award, User, Shield, Scale, Search, X, FileText, Users, MapPin } from "lucide-react";
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
  
  // Competitor management state
  const [competitors, setCompetitors] = useState([]);
  const [filteredCompetitors, setFilteredCompetitors] = useState([]);
  const [competitorFilters, setCompetitorFilters] = useState({
    name: '', ageMin: '', ageMax: '', phone: '', email: '', type: 'all', eventParticipation: false
  });
  const [showCompetitorList, setShowCompetitorList] = useState(false);
  const [selectedCompetitor, setSelectedCompetitor] = useState(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  
  const params = useParams();
  const eventId = params.id;
  const user = useStore((state) => state.user);

  useEffect(() => {
    if (eventId && user?.token) {
      fetchEventData();
      fetchTournamentResults();
    }
  }, [eventId, user?.token]);

  // Fetch competitors data
  const fetchCompetitors = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/registrations?event=${eventId}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && data.data.items) {
          const competitorsData = data.data.items;
          
          const processedCompetitors = competitorsData.map((competitor, index) => {
            // Calculate age from dateOfBirth
            let age = 'N/A';
            if (competitor.dateOfBirth) {
              const birthDate = new Date(competitor.dateOfBirth);
              const today = new Date();
              age = today.getFullYear() - birthDate.getFullYear();
              const monthDiff = today.getMonth() - birthDate.getMonth();
              if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
              }
            }

            return {
              id: competitor._id || index,
              firstName: competitor.firstName || '',
              lastName: competitor.lastName || '',
              name: `${competitor.firstName || ''} ${competitor.lastName || ''}`.trim(),
              email: competitor.email || 'N/A',
              phone: competitor.phoneNumber || 'N/A',
              age: age,
              type: competitor.registrationType ? 
                competitor.registrationType.charAt(0).toUpperCase() + competitor.registrationType.slice(1) : 'Fighter',
              registrationDate: competitor.createdAt,
              status: competitor.status || 'Pending',
              checkInStatus: competitor.checkInStatus || 'Not Checked',
              paymentStatus: competitor.paymentStatus || 'Pending',
              registrationId: competitor._id,
              // Event participation - check if they have checkInStatus as "Checked In"
              hasEventParticipation: competitor.checkInStatus === 'Checked In',
              // Store full registration data for modal
              registrationDetails: competitor
            };
          });
          
          setCompetitors(processedCompetitors);
          setFilteredCompetitors(processedCompetitors);
        }
      }
    } catch (error) {
      console.error('Error fetching competitors:', error);
    }
  };

  // Filter competitors based on current filters
  useEffect(() => {
    let filtered = competitors.filter(competitor => {
      const nameMatch = !competitorFilters.name || 
        competitor.name.toLowerCase().includes(competitorFilters.name.toLowerCase());
      
      const emailMatch = !competitorFilters.email || 
        competitor.email.toLowerCase().includes(competitorFilters.email.toLowerCase());
        
      const phoneMatch = !competitorFilters.phone || 
        competitor.phone.includes(competitorFilters.phone);
        
      const typeMatch = competitorFilters.type === 'all' || 
        competitor.type.toLowerCase() === competitorFilters.type.toLowerCase();
        
      let ageMatch = true;
      if (competitorFilters.ageMin || competitorFilters.ageMax) {
        const age = parseInt(competitor.age);
        if (!isNaN(age)) {
          if (competitorFilters.ageMin) {
            ageMatch = ageMatch && age >= parseInt(competitorFilters.ageMin);
          }
          if (competitorFilters.ageMax) {
            ageMatch = ageMatch && age <= parseInt(competitorFilters.ageMax);
          }
        }
      }

      // Event participation filter
      const participationMatch = !competitorFilters.eventParticipation || 
        competitor.hasEventParticipation;
      
      return nameMatch && emailMatch && phoneMatch && typeMatch && ageMatch && participationMatch;
    });
    
    setFilteredCompetitors(filtered);
  }, [competitors, competitorFilters]);

  // Load competitors when tab is switched
  useEffect(() => {
    if (activeTab === "competitors" && competitors.length === 0 && user?.token) {
      fetchCompetitors();
    }
  }, [activeTab, user?.token]);

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
            <Link href={`/admin/events/view/${eventId}`}>
              <button className="flex items-center px-4 py-2 bg-[#1E3A8A] hover:bg-[#2D4AB2] rounded-lg transition-all">
                <ChevronLeft size={20} />
                <span className="ml-2">Back to Event Page</span>
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
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold flex items-center">
                  <User className="mr-3 text-blue-400" size={28} />
                  Competitors List
                </h2>
                <button 
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all flex items-center"
                  onClick={() => fetchCompetitors()}
                >
                  <RefreshCw className="mr-2" size={18} />
                  Refresh List
                </button>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <div className="bg-[#122046] rounded-lg p-4 text-center">
                  <p className="text-[#AEB9E1] text-sm">Total Registrations</p>
                  <p className="text-2xl font-bold mt-1">{competitors.length}</p>
                </div>
                <div className="bg-[#122046] rounded-lg p-4 text-center">
                  <p className="text-[#AEB9E1] text-sm">Fighters</p>
                  <p className="text-2xl font-bold mt-1">{competitors.filter(c => c.type === 'Fighter').length}</p>
                </div>
                <div className="bg-[#122046] rounded-lg p-4 text-center">
                  <p className="text-[#AEB9E1] text-sm">Trainers</p>
                  <p className="text-2xl font-bold mt-1">{competitors.filter(c => c.type === 'Trainer').length}</p>
                </div>
                <div className="bg-[#122046] rounded-lg p-4 text-center">
                  <p className="text-[#AEB9E1] text-sm">Event Participants</p>
                  <p className="text-2xl font-bold mt-1">{competitors.filter(c => c.hasEventParticipation).length}</p>
                </div>
                <div className="bg-[#122046] rounded-lg p-4 text-center">
                  <p className="text-[#AEB9E1] text-sm">Filtered Results</p>
                  <p className="text-2xl font-bold mt-1">{filteredCompetitors.length}</p>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="bg-[#122046] rounded-xl p-6 mb-6">
                <h3 className="text-lg font-bold mb-4">Search & Filter</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm text-[#AEB9E1] mb-1">Name (First/Last)</label>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full bg-[#0F1A3F] border border-[#2D3A6D] rounded-lg px-4 py-2 pl-10 text-white"
                        placeholder="Search by first or last name..."
                        value={competitorFilters.name}
                        onChange={(e) => setCompetitorFilters({...competitorFilters, name: e.target.value})}
                      />
                      <Search size={16} className="absolute left-3 top-3 text-[#AEB9E1]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-[#AEB9E1] mb-1">Phone</label>
                    <input
                      type="text"
                      className="w-full bg-[#0F1A3F] border border-[#2D3A6D] rounded-lg px-4 py-2 text-white"
                      placeholder="Exact match"
                      value={competitorFilters.phone}
                      onChange={(e) => setCompetitorFilters({...competitorFilters, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#AEB9E1] mb-1">Email</label>
                    <input
                      type="text"
                      className="w-full bg-[#0F1A3F] border border-[#2D3A6D] rounded-lg px-4 py-2 text-white"
                      placeholder="Partial/Exact"
                      value={competitorFilters.email}
                      onChange={(e) => setCompetitorFilters({...competitorFilters, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#AEB9E1] mb-1">Type</label>
                    <select
                      className="w-full bg-[#0F1A3F] border border-[#2D3A6D] rounded-lg px-4 py-2 text-white"
                      value={competitorFilters.type}
                      onChange={(e) => setCompetitorFilters({...competitorFilters, type: e.target.value})}
                    >
                      <option value="all">All Types</option>
                      <option value="fighter">Fighter</option>
                      <option value="trainer">Trainer</option>
                      <option value="coach">Coach</option>
                      <option value="official">Official</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-[#AEB9E1] mb-1">Age Min</label>
                    <input
                      type="number"
                      className="w-full bg-[#0F1A3F] border border-[#2D3A6D] rounded-lg px-4 py-2 text-white"
                      placeholder="Min"
                      value={competitorFilters.ageMin}
                      onChange={(e) => setCompetitorFilters({...competitorFilters, ageMin: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#AEB9E1] mb-1">Event Participation</label>
                    <label className="flex items-center mt-2">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={competitorFilters.eventParticipation}
                        onChange={(e) => setCompetitorFilters({...competitorFilters, eventParticipation: e.target.checked})}
                      />
                      <span className="text-sm text-[#AEB9E1]">In Bouts Only</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Competitors Table */}
              <div className="bg-[#122046] rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#1E3A8A]">
                      <tr>
                        <th className="px-4 py-4 text-left text-sm font-medium text-white">First Name</th>
                        <th className="px-4 py-4 text-left text-sm font-medium text-white">Last Name</th>
                        <th className="px-4 py-4 text-left text-sm font-medium text-white">Age</th>
                        <th className="px-4 py-4 text-left text-sm font-medium text-white">Phone</th>
                        <th className="px-4 py-4 text-left text-sm font-medium text-white">Email</th>
                        <th className="px-4 py-4 text-left text-sm font-medium text-white">Type</th>
                        <th className="px-4 py-4 text-left text-sm font-medium text-white">Reg Form</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2D3A6D]">
                      {filteredCompetitors.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center">
                              <User size={48} className="text-gray-400 mb-4" />
                              <p className="text-[#AEB9E1] text-lg">No competitors found</p>
                              <p className="text-[#AEB9E1] text-sm mt-1">
                                {competitors.length === 0 
                                  ? "No registrations for this event yet"
                                  : "Try adjusting your search filters"}
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredCompetitors.map((competitor) => (
                          <tr key={competitor.id} className="hover:bg-[#1A2A5F] transition-colors">
                            <td className="px-4 py-4 text-white font-medium">{competitor.firstName}</td>
                            <td className="px-4 py-4 text-white font-medium">{competitor.lastName}</td>
                            <td className="px-4 py-4 text-[#AEB9E1]">{competitor.age}</td>
                            <td className="px-4 py-4 text-[#AEB9E1]">{competitor.phone}</td>
                            <td className="px-4 py-4 text-[#AEB9E1]">{competitor.email}</td>
                            <td className="px-4 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                competitor.type === 'Fighter' 
                                  ? 'bg-red-900/30 text-red-300 border border-red-500/30'
                                  : competitor.type === 'Trainer'
                                  ? 'bg-blue-900/30 text-blue-300 border border-blue-500/30'
                                  : competitor.type === 'Coach'
                                  ? 'bg-green-900/30 text-green-300 border border-green-500/30'
                                  : competitor.type === 'Official'
                                  ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-500/30'
                                  : 'bg-purple-900/30 text-purple-300 border border-purple-500/30'
                              }`}>
                                {competitor.type}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <button
                                onClick={() => {
                                  setSelectedCompetitor(competitor);
                                  setShowRegistrationModal(true);
                                }}
                                className="text-blue-400 hover:text-blue-300 underline text-sm font-medium"
                                title="View full registration form"
                              >
                                Registration
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Results Summary */}
              {filteredCompetitors.length > 0 && (
                <div className="mt-6 text-center text-[#AEB9E1] text-sm">
                  Showing {filteredCompetitors.length} of {competitors.length} competitors
                </div>
              )}

              {/* Registration Details Modal */}
              {showRegistrationModal && selectedCompetitor && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-[#0B1739] rounded-xl p-6 max-w-4xl max-h-[90vh] overflow-y-auto m-4 border border-[#2D3A6D]">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-bold text-white">Registration Details</h3>
                      <button
                        onClick={() => {
                          setShowRegistrationModal(false);
                          setSelectedCompetitor(null);
                        }}
                        className="text-gray-400 hover:text-white"
                      >
                        <X size={24} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Personal Information */}
                      <div className="bg-[#122046] rounded-lg p-6">
                        <h4 className="text-lg font-bold text-white mb-4 flex items-center">
                          <User className="mr-2 text-blue-400" size={20} />
                          Personal Information
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm text-[#AEB9E1]">Name:</label>
                            <p className="text-white font-medium">
                              {selectedCompetitor.firstName} {selectedCompetitor.lastName}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm text-[#AEB9E1]">Email:</label>
                            <p className="text-white">{selectedCompetitor.email}</p>
                          </div>
                          <div>
                            <label className="text-sm text-[#AEB9E1]">Phone:</label>
                            <p className="text-white">{selectedCompetitor.phone}</p>
                          </div>
                          <div>
                            <label className="text-sm text-[#AEB9E1]">Age:</label>
                            <p className="text-white">{selectedCompetitor.age}</p>
                          </div>
                          <div>
                            <label className="text-sm text-[#AEB9E1]">Gender:</label>
                            <p className="text-white">{selectedCompetitor.registrationDetails.gender || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-sm text-[#AEB9E1]">Date of Birth:</label>
                            <p className="text-white">
                              {selectedCompetitor.registrationDetails.dateOfBirth 
                                ? new Date(selectedCompetitor.registrationDetails.dateOfBirth).toLocaleDateString()
                                : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Registration Information */}
                      <div className="bg-[#122046] rounded-lg p-6">
                        <h4 className="text-lg font-bold text-white mb-4 flex items-center">
                          <FileText className="mr-2 text-green-400" size={20} />
                          Registration Information
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm text-[#AEB9E1]">Registration Type:</label>
                            <p className="text-white font-medium">{selectedCompetitor.type}</p>
                          </div>
                          <div>
                            <label className="text-sm text-[#AEB9E1]">Status:</label>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              selectedCompetitor.status === 'Verified' || selectedCompetitor.status === 'Active'
                                ? 'bg-green-900/30 text-green-300 border border-green-500/30'
                                : selectedCompetitor.status === 'Pending'
                                ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-500/30'
                                : 'bg-red-900/30 text-red-300 border border-red-500/30'
                            }`}>
                              {selectedCompetitor.status}
                            </span>
                          </div>
                          <div>
                            <label className="text-sm text-[#AEB9E1]">Payment Status:</label>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              selectedCompetitor.paymentStatus === 'Paid'
                                ? 'bg-green-900/30 text-green-300 border border-green-500/30'
                                : 'bg-yellow-900/30 text-yellow-300 border border-yellow-500/30'
                            }`}>
                              {selectedCompetitor.paymentStatus}
                            </span>
                          </div>
                          <div>
                            <label className="text-sm text-[#AEB9E1]">Check-in Status:</label>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              selectedCompetitor.checkInStatus === 'Checked In'
                                ? 'bg-green-900/30 text-green-300 border border-green-500/30'
                                : 'bg-gray-900/30 text-gray-300 border border-gray-500/30'
                            }`}>
                              {selectedCompetitor.checkInStatus}
                            </span>
                          </div>
                          <div>
                            <label className="text-sm text-[#AEB9E1]">Registration Date:</label>
                            <p className="text-white">
                              {new Date(selectedCompetitor.registrationDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Fighter Specific Information */}
                      {selectedCompetitor.type === 'Fighter' && selectedCompetitor.registrationDetails && (
                        <>
                          <div className="bg-[#122046] rounded-lg p-6">
                            <h4 className="text-lg font-bold text-white mb-4 flex items-center">
                              <Trophy className="mr-2 text-yellow-400" size={20} />
                              Fighter Details
                            </h4>
                            <div className="space-y-3">
                              <div>
                                <label className="text-sm text-[#AEB9E1]">Weight Class:</label>
                                <p className="text-white">{selectedCompetitor.registrationDetails.weightClass || 'N/A'}</p>
                              </div>
                              <div>
                                <label className="text-sm text-[#AEB9E1]">Rule Style:</label>
                                <p className="text-white">{selectedCompetitor.registrationDetails.ruleStyle || 'N/A'}</p>
                              </div>
                              <div>
                                <label className="text-sm text-[#AEB9E1]">Skill Level:</label>
                                <p className="text-white">{selectedCompetitor.registrationDetails.skillLevel || 'N/A'}</p>
                              </div>
                              <div>
                                <label className="text-sm text-[#AEB9E1]">Walk Around Weight:</label>
                                <p className="text-white">
                                  {selectedCompetitor.registrationDetails.walkAroundWeight ? 
                                    `${selectedCompetitor.registrationDetails.walkAroundWeight} ${selectedCompetitor.registrationDetails.weightUnit || 'lbs'}` 
                                    : 'N/A'}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm text-[#AEB9E1]">Height:</label>
                                <p className="text-white">
                                  {selectedCompetitor.registrationDetails.height ? 
                                    `${selectedCompetitor.registrationDetails.height} ${selectedCompetitor.registrationDetails.heightUnit || 'inches'}` 
                                    : 'N/A'}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm text-[#AEB9E1]">Pro Fighter:</label>
                                <p className="text-white">{selectedCompetitor.registrationDetails.proFighter ? 'Yes' : 'No'}</p>
                              </div>
                              <div>
                                <label className="text-sm text-[#AEB9E1]">Fight Record:</label>
                                <p className="text-white">{selectedCompetitor.registrationDetails.systemRecord || 'N/A'}</p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-[#122046] rounded-lg p-6">
                            <h4 className="text-lg font-bold text-white mb-4 flex items-center">
                              <Users className="mr-2 text-purple-400" size={20} />
                              Trainer & Gym
                            </h4>
                            <div className="space-y-3">
                              <div>
                                <label className="text-sm text-[#AEB9E1]">Trainer Name:</label>
                                <p className="text-white">{selectedCompetitor.registrationDetails.trainerName || 'N/A'}</p>
                              </div>
                              <div>
                                <label className="text-sm text-[#AEB9E1]">Trainer Email:</label>
                                <p className="text-white">{selectedCompetitor.registrationDetails.trainerEmail || 'N/A'}</p>
                              </div>
                              <div>
                                <label className="text-sm text-[#AEB9E1]">Trainer Phone:</label>
                                <p className="text-white">{selectedCompetitor.registrationDetails.trainerPhone || 'N/A'}</p>
                              </div>
                              <div>
                                <label className="text-sm text-[#AEB9E1]">Gym Name:</label>
                                <p className="text-white">{selectedCompetitor.registrationDetails.gymName || 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Address Information */}
                      <div className="bg-[#122046] rounded-lg p-6">
                        <h4 className="text-lg font-bold text-white mb-4 flex items-center">
                          <MapPin className="mr-2 text-red-400" size={20} />
                          Address
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm text-[#AEB9E1]">Street Address:</label>
                            <p className="text-white">
                              {selectedCompetitor.registrationDetails.street1 || 'N/A'}
                              {selectedCompetitor.registrationDetails.street2 && (
                                <>
                                  <br />
                                  {selectedCompetitor.registrationDetails.street2}
                                </>
                              )}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm text-[#AEB9E1]">City:</label>
                            <p className="text-white">{selectedCompetitor.registrationDetails.city || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-sm text-[#AEB9E1]">State:</label>
                            <p className="text-white">{selectedCompetitor.registrationDetails.state || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-sm text-[#AEB9E1]">Postal Code:</label>
                            <p className="text-white">{selectedCompetitor.registrationDetails.postalCode || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-sm text-[#AEB9E1]">Country:</label>
                            <p className="text-white">{selectedCompetitor.registrationDetails.country || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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