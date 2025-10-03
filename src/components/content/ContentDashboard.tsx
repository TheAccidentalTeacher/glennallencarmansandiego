import React from 'react';
import { Users, BookOpen, Map, Crown, TrendingUp, Calendar, Plus, ArrowRight, Activity, Clock, Sparkles } from 'lucide-react';

interface ContentDashboardProps {
  className?: string;
}

const ContentDashboard: React.FC<ContentDashboardProps> = ({ className = '' }) => {
  // Mock data - in real app, this would come from API
  const stats = {
    totalCases: 12,
    activeCases: 8,
    totalClues: 156,
    totalLocations: 24,
    totalVillains: 18,
    recentActivity: [
      { type: 'case', action: 'created', item: 'The Missing Crown Jewels', time: '2 hours ago', user: 'Ms. Johnson' },
      { type: 'clue', action: 'updated', item: 'Tower of London historical clue', time: '4 hours ago', user: 'Mr. Smith' },
      { type: 'case', action: 'published', item: 'The Stolen Mona Lisa', time: '1 day ago', user: 'Ms. Johnson' },
      { type: 'villain', action: 'created', item: 'Dr. Arturo Thievius', time: '2 days ago', user: 'Content Team' },
    ]
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'case': return <BookOpen size={16} className="text-blue-600" />;
      case 'clue': return <Map size={16} className="text-green-600" />;
      case 'villain': return <Crown size={16} className="text-purple-600" />;
      default: return <Activity size={16} className="text-gray-600" />;
    }
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, gradient, iconBg, textColor }: any) => (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`}>
      <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 opacity-10">
        <Icon size={128} />
      </div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center backdrop-blur-sm`}>
            <Icon size={24} className="text-white" />
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{value}</div>
            <div className={`text-sm ${textColor} opacity-90`}>{subtitle}</div>
          </div>
        </div>
        <h3 className="text-lg font-semibold opacity-95">{title}</h3>
      </div>
    </div>
  );

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-amber-100 via-orange-100 to-red-100 rounded-2xl p-8 border border-amber-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Content Management Dashboard</h2>
            <p className="text-gray-600 text-lg">Create and manage your Sourdough Pete geography adventures</p>
            <div className="flex items-center space-x-2 mt-3 text-amber-700">
              <Sparkles size={18} />
              <span className="text-sm font-medium">Ready to inspire young detectives worldwide</span>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <BookOpen size={40} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - Redesigned with beautiful gradients */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Educational Cases"
          value={stats.totalCases}
          subtitle={`${stats.activeCases} active`}
          icon={BookOpen}
          gradient="from-blue-500 to-blue-700"
          iconBg="bg-white/20"
          textColor="text-blue-100"
        />

        <StatCard
          title="Learning Clues"
          value={stats.totalClues}
          subtitle="across all cases"
          icon={Map}
          gradient="from-green-500 to-emerald-600"
          iconBg="bg-white/20"
          textColor="text-green-100"
        />

        <StatCard
          title="Global Locations"
          value={stats.totalLocations}
          subtitle="worldwide"
          icon={Map}
          gradient="from-orange-500 to-red-500"
          iconBg="bg-white/20"
          textColor="text-orange-100"
        />

        <StatCard
          title="Unique Villains"
          value={stats.totalVillains}
          subtitle="characters"
          icon={Crown}
          gradient="from-purple-500 to-indigo-600"
          iconBg="bg-white/20"
          textColor="text-purple-100"
        />

        <StatCard
          title="Student Detectives"
          value="234"
          subtitle="registered"
          icon={Users}
          gradient="from-indigo-500 to-purple-600"
          iconBg="bg-white/20"
          textColor="text-indigo-100"
        />

        <StatCard
          title="Cases Solved"
          value="18"
          subtitle="this month"
          icon={TrendingUp}
          gradient="from-pink-500 to-rose-600"
          iconBg="bg-white/20"
          textColor="text-pink-100"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Activity - Takes 2 columns */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Calendar className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Recent Activity</h3>
                    <p className="text-gray-600 text-sm">Latest content updates and creations</p>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1">
                  <span>View All</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
            <div className="p-8">
              <div className="space-y-6">
                {stats.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-800 capitalize">{activity.action}</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-gray-600 text-sm">by {activity.user}</span>
                      </div>
                      <p className="text-gray-700 font-medium">"{activity.item}"</p>
                      <div className="flex items-center space-x-1 mt-1 text-xs text-gray-500">
                        <Clock size={12} />
                        <span>{activity.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Takes 1 column */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-6 border-b border-amber-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Plus className="text-amber-600" size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Quick Actions</h3>
                  <p className="text-gray-600 text-sm">Create new content</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[
                  { icon: BookOpen, title: 'Create Case', desc: 'Start a new mystery', color: 'blue', gradient: 'from-blue-50 to-blue-100' },
                  { icon: Map, title: 'Add Location', desc: 'Expand the world', color: 'green', gradient: 'from-green-50 to-green-100' },
                  { icon: Crown, title: 'New Villain', desc: 'Create a character', color: 'purple', gradient: 'from-purple-50 to-purple-100' },
                  { icon: Users, title: 'View Students', desc: 'Manage classrooms', color: 'indigo', gradient: 'from-indigo-50 to-indigo-100' },
                ].map((action, index) => (
                  <button 
                    key={index}
                    className={`w-full p-4 text-left border-2 border-gray-100 rounded-xl hover:border-${action.color}-200 bg-gradient-to-r ${action.gradient} hover:shadow-lg transition-all duration-200 group`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 bg-${action.color}-100 rounded-lg flex items-center justify-center group-hover:bg-${action.color}-200 transition-colors`}>
                        <action.icon className={`text-${action.color}-600`} size={20} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{action.title}</h4>
                        <p className="text-gray-600 text-sm">{action.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentDashboard;