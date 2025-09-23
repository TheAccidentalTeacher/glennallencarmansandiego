import React from 'react';

const Editor: React.FC = () => {
  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-bone mb-2">
            Content Editor
          </h1>
          <p className="text-camel text-lg">
            Create and manage villains, cases, and educational content
          </p>
        </header>

        {/* Editor Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-bone bg-opacity-10 backdrop-blur-sm rounded-lg p-6 border border-camel border-opacity-30">
            <h2 className="text-xl font-semibold text-goldenrod mb-4">Villain Editor</h2>
            <p className="text-bone mb-4">
              Create new villain characters with culturally sensitive representation
            </p>
            <button className="bg-goldenrod text-dark-slate-gray px-6 py-2 rounded-md font-medium hover:bg-opacity-90 transition-colors">
              Create New Villain
            </button>
          </div>

          <div className="bg-bone bg-opacity-10 backdrop-blur-sm rounded-lg p-6 border border-camel border-opacity-30">
            <h2 className="text-xl font-semibold text-goldenrod mb-4">Case Editor</h2>
            <p className="text-bone mb-4">
              Design new geography cases with progressive clue systems
            </p>
            <button className="bg-steel-blue text-bone px-6 py-2 rounded-md font-medium hover:bg-opacity-90 transition-colors">
              Create New Case
            </button>
          </div>
        </div>

        {/* Content Review Queue */}
        <div className="bg-bone bg-opacity-10 backdrop-blur-sm rounded-lg p-6 border border-camel border-opacity-30 mb-8">
          <h2 className="text-xl font-semibold text-goldenrod mb-4">Content Review Queue</h2>
          <div className="text-bone">
            <p className="mb-4">Items pending cultural sensitivity review:</p>
            <div className="space-y-3">
              <div className="bg-dark-slate-gray bg-opacity-40 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">No items pending review</h3>
                    <p className="text-sm text-camel">All content has been reviewed and approved</p>
                  </div>
                  <div className="text-sm text-goldenrod">
                    Status: All Clear
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Library */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Villain Library */}
          <div className="bg-bone bg-opacity-10 backdrop-blur-sm rounded-lg p-6 border border-camel border-opacity-30">
            <h2 className="text-xl font-semibold text-goldenrod mb-4">Villain Library</h2>
            <div className="space-y-3 text-bone">
              <div className="bg-dark-slate-gray bg-opacity-40 p-3 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Dr. Elena Fossat</h3>
                    <p className="text-sm text-camel">Alpine Ecosystem Research</p>
                    <p className="text-xs text-camel">Western Europe • Difficulty 3</p>
                  </div>
                  <span className="text-xs bg-goldenrod text-dark-slate-gray px-2 py-1 rounded">
                    Approved
                  </span>
                </div>
              </div>
              
              <div className="text-center text-camel">
                <p className="text-sm">More villains will be added during content creation phase</p>
              </div>
            </div>
          </div>

          {/* Case Library */}
          <div className="bg-bone bg-opacity-10 backdrop-blur-sm rounded-lg p-6 border border-camel border-opacity-30">
            <h2 className="text-xl font-semibold text-goldenrod mb-4">Case Library</h2>
            <div className="space-y-3 text-bone">
              <div className="bg-dark-slate-gray bg-opacity-40 p-3 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">The Vanished Alpine Climate Archive</h3>
                    <p className="text-sm text-camel">Climate monitoring data theft</p>
                    <p className="text-xs text-camel">Switzerland • Full Period Mode</p>
                  </div>
                  <span className="text-xs bg-goldenrod text-dark-slate-gray px-2 py-1 rounded">
                    Published
                  </span>
                </div>
              </div>
              
              <div className="text-center text-camel">
                <p className="text-sm">More cases will be added during content creation phase</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cultural Sensitivity Guidelines */}
        <div className="mt-8 bg-bone bg-opacity-10 backdrop-blur-sm rounded-lg p-6 border border-camel border-opacity-30">
          <h2 className="text-xl font-semibold text-goldenrod mb-4">Cultural Sensitivity Guidelines</h2>
          <div className="text-bone space-y-2">
            <p className="text-sm">Remember when creating content:</p>
            <ul className="text-sm space-y-1 ml-4">
              <li>• Focus on professional expertise, not cultural stereotypes</li>
              <li>• Use modern, respectful attire and representation</li>
              <li>• Emphasize educational value and cultural appreciation</li>
              <li>• All content undergoes mandatory cultural review</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;