import React from 'react';

const LiveCase: React.FC = () => {
  return (
    <div className="tv-display">
      {/* Smart TV/Projector optimized layout */}
      <div className="h-screen flex">
        {/* Left Column - Clue Panel (60% width) */}
        <div className="w-3/5 p-tv-lg">
          <div className="bg-bone bg-opacity-10 backdrop-blur-sm rounded-lg p-tv-lg h-full border border-camel border-opacity-30">
            <h1 className="tv-heading text-goldenrod mb-tv-md">
              Investigation in Progress
            </h1>
            
            {/* Round Indicator */}
            <div className="mb-tv-md">
              <div className="flex items-center space-x-4">
                <span className="text-bone tv-lg font-medium">Round 1:</span>
                <span className="text-camel tv-lg">Geographic Foundation</span>
              </div>
              <div className="w-full bg-dark-slate-gray bg-opacity-50 rounded-full h-3 mt-2">
                <div className="bg-goldenrod h-3 rounded-full w-1/4"></div>
              </div>
            </div>

            {/* Clues Section */}
            <div className="space-y-tv-md">
              <div className="bg-dark-slate-gray bg-opacity-30 p-tv-md rounded-lg">
                <h2 className="text-goldenrod tv-lg font-semibold mb-tv-sm">Geographic Clues</h2>
                <div className="space-y-tv-sm text-bone">
                  <div className="tv-base leading-relaxed">
                    • Evidence suggests a landlocked mountainous region with significant elevation changes
                  </div>
                  <div className="tv-base leading-relaxed">
                    • Geological samples indicate limestone formations common to central European mountain ranges
                  </div>
                </div>
              </div>

              <div className="bg-dark-slate-gray bg-opacity-30 p-tv-md rounded-lg">
                <h2 className="text-goldenrod tv-lg font-semibold mb-tv-sm">Suspect Profile</h2>
                <div className="space-y-tv-sm text-bone">
                  <div className="tv-base leading-relaxed">
                    • Methodical environmental scientist with expertise in high-altitude ecosystems
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Scoreboard & Timer (40% width) */}
        <div className="w-2/5 p-tv-lg">
          <div className="space-y-tv-md h-full">
            {/* Timer Section */}
            <div className="bg-bone bg-opacity-10 backdrop-blur-sm rounded-lg p-tv-md border border-camel border-opacity-30">
              <h2 className="text-goldenrod tv-lg font-semibold mb-tv-sm text-center">Round Timer</h2>
              <div className="text-center">
                <div className="tv-2xl font-bold text-bone mb-2">
                  06:45
                </div>
                <div className="text-camel tv-base">
                  Time Remaining
                </div>
              </div>
            </div>

            {/* Scoreboard Section */}
            <div className="bg-bone bg-opacity-10 backdrop-blur-sm rounded-lg p-tv-md border border-camel border-opacity-30 flex-1">
              <h2 className="text-goldenrod tv-lg font-semibold mb-tv-sm">Team Standings</h2>
              
              <div className="space-y-tv-sm">
                {/* Sample teams - these will be dynamic later */}
                <div className="bg-dark-slate-gray bg-opacity-40 p-tv-sm rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-bone tv-base font-medium">Team Alpha</span>
                      <div className="text-camel text-sm">4 members</div>
                    </div>
                    <div className="text-right">
                      <div className="text-goldenrod tv-base font-bold">23 pts</div>
                      <div className="text-camel text-sm">Rank 1</div>
                    </div>
                  </div>
                </div>

                <div className="bg-dark-slate-gray bg-opacity-40 p-tv-sm rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-bone tv-base font-medium">Team Beta</span>
                      <div className="text-camel text-sm">3 members</div>
                    </div>
                    <div className="text-right">
                      <div className="text-goldenrod tv-base font-bold">18 pts</div>
                      <div className="text-camel text-sm">Rank 2</div>
                    </div>
                  </div>
                </div>

                <div className="bg-dark-slate-gray bg-opacity-40 p-tv-sm rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-bone tv-base font-medium">Team Gamma</span>
                      <div className="text-camel text-sm">4 members</div>
                    </div>
                    <div className="text-right">
                      <div className="text-goldenrod tv-base font-bold">15 pts</div>
                      <div className="text-camel text-sm">Rank 3</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Game Status */}
              <div className="mt-tv-md pt-tv-sm border-t border-camel border-opacity-30">
                <div className="text-center text-bone tv-base">
                  <div className="font-medium">Case: The Vanished Alpine Climate Archive</div>
                  <div className="text-camel text-sm mt-1">Round 1 of 4 • Full Period Mode</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveCase;