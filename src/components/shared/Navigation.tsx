import {
  FileText,
  BarChart3,
  Lock,
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
  hasData: boolean;
}

export default function Navigation({ activeTab, onTabChange, hasData }: NavigationProps) {
  const tabs = [
    { id: 'input', name: 'Client Input', icon: FileText, alwaysEnabled: true, step: 1, description: 'Enter financial data' },
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3, step: 2, description: 'Complete analysis & goals' },
  ];

  return (
    <nav className="bg-white shadow-soft border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Header */}
        <div className="pt-3 pb-1">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="font-semibold">Financial Analysis Workflow</span>
            <span>•</span>
            <span>Follow the steps below to complete your analysis</span>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isEnabled = tab.alwaysEnabled || hasData;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => isEnabled && onTabChange(tab.id)}
                disabled={!isEnabled}
                className={`
                  relative flex flex-col gap-1 px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap
                  transition-all duration-200 group min-w-[140px]
                  ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30'
                      : isEnabled
                      ? 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:shadow-soft'
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed opacity-60'
                  }
                `}
              >
                {/* Step number badge */}
                <div className="flex items-center gap-2">
                  <span className={`
                    flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold
                    ${isActive ? 'bg-white/20 text-white' : isEnabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-400'}
                  `}>
                    {tab.step}
                  </span>
                  <Icon className="w-4 h-4" />
                  {!isEnabled && !tab.alwaysEnabled && (
                    <Lock className="w-3 h-3 opacity-50 ml-auto" />
                  )}
                </div>

                {/* Tab name and description */}
                <div className="flex flex-col items-start">
                  <span className="font-semibold">{tab.name}</span>
                  <span className={`text-xs font-normal ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                    {tab.description}
                  </span>
                </div>

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-white/50 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom shadow effect */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
    </nav>
  );
}
