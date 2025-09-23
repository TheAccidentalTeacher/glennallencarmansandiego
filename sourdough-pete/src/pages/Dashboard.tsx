import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-bone mb-2">
            Where in the World is Sourdough Pete?
          </h1>
          <p className="text-camel text-lg">
            Teacher Dashboard - Geography Deduction Game
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="bg-bone bg-opacity-10 backdrop-blur-sm rounded-lg p-6 border border-camel border-opacity-30">
            <h2 className="text-xl font-semibold text-goldenrod mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full bg-goldenrod text-dark-slate-gray px-4 py-2 rounded-md font-medium hover:bg-opacity-90 transition-colors">
                Launch New Game
              </button>
              <button className="w-full bg-steel-blue text-bone px-4 py-2 rounded-md font-medium hover:bg-opacity-90 transition-colors">
                Resume Session
              </button>
              <button className="w-full bg-camel text-dark-slate-gray px-4 py-2 rounded-md font-medium hover:bg-opacity-90 transition-colors">
                Create Content
              </button>
            </div>
          </div>

          {/* Recent Cases */}
          <div className="bg-bone bg-opacity-10 backdrop-blur-sm rounded-lg p-6 border border-camel border-opacity-30">
            <h2 className="text-xl font-semibold text-goldenrod mb-4">Recent Cases</h2>
            <div className="space-y-2 text-bone">
              <div className="p-2 bg-dark-slate-gray bg-opacity-30 rounded">
                <p className="font-medium">The Vanished Alpine Climate Archive</p>
                <p className="text-sm text-camel">Difficulty: 3 • Europe</p>
              </div>
              <div className="p-2 bg-dark-slate-gray bg-opacity-30 rounded">
                <p className="font-medium">The Missing Maritime Charts</p>
                <p className="text-sm text-camel">Difficulty: 2 • Mediterranean</p>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-bone bg-opacity-10 backdrop-blur-sm rounded-lg p-6 border border-camel border-opacity-30">
            <h2 className="text-xl font-semibold text-goldenrod mb-4">System Status</h2>
            <div className="space-y-2 text-bone">
              <div className="flex justify-between">
                <span>Active Sessions:</span>
                <span className="text-goldenrod">0</span>
              </div>
              <div className="flex justify-between">
                <span>Available Cases:</span>
                <span className="text-goldenrod">3</span>
              </div>
              <div className="flex justify-between">
                <span>Content Pending Review:</span>
                <span className="text-goldenrod">0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Case Library Preview */}
        <div className="mt-8 bg-bone bg-opacity-10 backdrop-blur-sm rounded-lg p-6 border border-camel border-opacity-30">
          <h2 className="text-xl font-semibold text-goldenrod mb-4">Case Library</h2>
          <div className="text-bone">
            <p className="mb-4">Select a case to begin your geography adventure...</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Sample case cards - these will be dynamic later */}
              <div className="bg-dark-slate-gray bg-opacity-50 p-4 rounded-lg border border-steel-blue">
                <h3 className="font-semibold text-goldenrod mb-2">Coming Soon</h3>
                <p className="text-sm text-camel mb-2">Cases will appear here once the content system is implemented</p>
                <div className="flex justify-between text-xs">
                  <span>Difficulty: TBD</span>
                  <span>Region: TBD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;