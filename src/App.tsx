import { useState } from 'react';
import { agentConfig } from './config/agent.config';
import { useClientStore } from './store/clientStore';
import Header from './components/shared/Header';
import Navigation from './components/shared/Navigation';
import Dashboard from './components/Dashboard/Dashboard';
import ClientInput from './components/ClientInput/ClientInput';

type TabName = 'input' | 'dashboard';

function App() {
  const [activeTab, setActiveTab] = useState<TabName>('input');
  const { currentClient, currentMetrics } = useClientStore();

  const hasData = currentClient !== null && currentMetrics !== null;

  return (
    <div className="min-h-screen">
      <Header
        agentName={agentConfig.agentName}
        platformName={agentConfig.platformName}
        platformTagline={agentConfig.platformTagline}
      />

      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasData={hasData}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="space-y-6">
          {activeTab === 'input' && <ClientInput />}
          {activeTab === 'dashboard' && hasData && <Dashboard />}

          {activeTab !== 'input' && !hasData && (
            <div className="card-highlight text-center py-16 animate-scale-in">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
                  No Data Available
                </h2>
                <p className="text-gray-600 mb-8 text-lg">
                  Please enter client data first to view comprehensive financial analysis.
                </p>
                <button
                  onClick={() => setActiveTab('input')}
                  className="btn btn-primary text-lg px-8 py-4"
                >
                  <svg
                    className="w-5 h-5 mr-2 inline-block"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Start Analysis
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-t border-gray-700 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-300 font-medium">
              {agentConfig.platformName} &copy; {new Date().getFullYear()}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {agentConfig.agentName} - {agentConfig.agentTitle}
            </p>
            <p className="mt-4 text-xs text-gray-500 max-w-2xl mx-auto">
              This platform is designed as an educational and analysis tool. All
              calculations and recommendations are general in nature and should
              not be considered personalized financial advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
