"use client";
const TournamentBracket = ({ eventId, competitorsData, events }) => {
  const competitors = competitorsData[eventId] || [];
  const event = events.find((e) => e.id === eventId);

  // Group competitors by bracket
  const bracketGroups = competitors.reduce((groups, competitor) => {
    if (!groups[competitor.bracket]) {
      groups[competitor.bracket] = [];
    }
    groups[competitor.bracket].push(competitor);
    return groups;
  }, {});

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">{event.name}</h2>
        <button
          className="text-blue-400 hover:text-blue-300"
          onClick={handleBackToEvents}
        >
          ← Back to event details
        </button>
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-semibold mb-4">COMPETITORS</h2>

        {/* Brackets */}
        <div className="p-4 border border-gray-700 rounded-lg">
          {Object.keys(bracketGroups).map((bracketNum) => (
            <div key={bracketNum} className="mb-8">
              {/* Bracket header */}
              <div className="flex justify-center mb-6">
                <div className="bg-gray-800 border border-gray-700 rounded px-6 py-2 text-center">
                  <div className="text-sm">Bracket</div>
                  <div className="text-xl font-bold">{bracketNum}</div>
                </div>
              </div>

              {/* Competitors grid */}
              <div className="grid grid-cols-4 gap-2">
                {/* Connection lines */}
                <div className="col-span-4 flex justify-center relative h-8">
                  <div className="absolute top-0 left-1/4 w-1/2 h-4 border-t-2 border-gray-600"></div>
                  <div className="absolute top-0 left-1/4 h-4 border-l-2 border-gray-600"></div>
                  <div className="absolute top-0 right-1/4 h-4 border-r-2 border-gray-600"></div>
                  <div className="absolute top-0 left-1/8 w-1/4 h-4 border-t-2 border-gray-600"></div>
                  <div className="absolute top-0 right-1/8 w-1/4 h-4 border-t-2 border-gray-600"></div>
                  <div className="absolute top-0 left-1/8 h-4 border-l-2 border-gray-600"></div>
                  <div className="absolute top-0 left-3/8 h-4 border-r-2 border-gray-600"></div>
                  <div className="absolute top-0 right-3/8 h-4 border-l-2 border-gray-600"></div>
                  <div className="absolute top-0 right-1/8 h-4 border-r-2 border-gray-600"></div>
                </div>

                {/* Competitor cards */}
                {bracketGroups[bracketNum].map((competitor) => (
                  <div
                    key={competitor.id}
                    className="flex flex-col items-center"
                  >
                    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden w-full max-w-xs">
                      <div className="w-full h-32 bg-gray-700 overflow-hidden">
                        <img
                          src={competitor.image}
                          alt={competitor.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-center p-2 text-sm">
                        {competitor.name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TournamentBracket;
