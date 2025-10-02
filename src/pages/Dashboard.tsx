import React from 'react';
import { Link } from 'react-router-dom';
import { Monitor, Users, Play, Settings } from 'lucide-react';

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

        {/* Prominent Game Launch Section */}
        <div className="mb-8 bg-gradient-to-r from-red-600 via-red-700 to-red-800 rounded-2xl p-8 shadow-2xl border-2 border-red-500/30">
          <div className="text-center mb-6">
            <h2 className="text-4xl font-bold text-white mb-3 flex items-center justify-center">
              <Play className="mr-3" size={40} />
              Ready to Present?
            </h2>
            <p className="text-red-100 text-2xl">
              Launch the full-screen Carmen Sandiego game for your classroom!
            </p>
          </div>
          
          <div className="text-center">
            <a 
              href="/present" 
              className="inline-block bg-white hover:bg-gray-100 text-red-700 px-12 py-8 rounded-2xl font-bold text-3xl shadow-lg transition-all duration-200 transform hover:scale-105 mx-auto"
            >
              <Play className="inline mr-4" size={36} />
              PRESENT GAME
            </a>
          </div>
          
          <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
            <h3 className="text-white font-bold text-xl mb-3">🎯 PowerPoint-Style Presentation Mode</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white/90">
              <div>
                <div className="font-semibold">📋 Setup Screen</div>
                <div className="text-sm">Choose case & settings</div>
              </div>
              <div>
                <div className="font-semibold">🖥️ Full Screen</div>
                <div className="text-sm">Perfect for HDMI projection</div>
              </div>
              <div>
                <div className="font-semibold">🎮 Mouse Control</div>
                <div className="text-sm">Control from your computer</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="bg-bone bg-opacity-10 backdrop-blur-sm rounded-lg p-6 border border-camel border-opacity-30">
            <h2 className="text-xl font-semibold text-goldenrod mb-4 flex items-center">
              <Settings className="mr-2" />
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button className="w-full bg-goldenrod text-dark-slate-gray px-4 py-2 rounded-md font-medium hover:bg-opacity-90 transition-colors">
                Launch New Game
              </button>
              <button className="w-full bg-steel-blue text-bone px-4 py-2 rounded-md font-medium hover:bg-opacity-90 transition-colors">
                Resume Session
              </button>
              <Link 
                to="/content"
                className="block w-full bg-camel text-dark-slate-gray px-4 py-2 rounded-md font-medium hover:bg-opacity-90 transition-colors text-center"
              >
                <Settings className="inline mr-2" />
                Manage Content
              </Link>
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