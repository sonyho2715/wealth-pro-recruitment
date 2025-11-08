import { useClientStore } from '../../store/clientStore';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

export default function RiskAssessment() {
  const { currentRisk } = useClientStore();

  if (!currentRisk) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'good':
        return <CheckCircle className="w-6 h-6 text-blue-600" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-yellow-600" />;
      case 'critical':
        return <AlertTriangle className="w-6 h-6 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'bg-green-50 border-green-200';
      case 'good':
        return 'bg-blue-50 border-blue-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Risk Assessment</h2>
        <p className="text-sm text-gray-600 mt-1">
          Comprehensive analysis of financial vulnerabilities
        </p>
      </div>

      {/* Overall Risk Score */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Overall Risk Level</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Low Risk</span>
              <span>High Risk</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full ${
                  currentRisk.overallRiskScore < 30
                    ? 'bg-green-600'
                    : currentRisk.overallRiskScore < 60
                    ? 'bg-yellow-600'
                    : 'bg-red-600'
                }`}
                style={{ width: `${currentRisk.overallRiskScore}%` }}
              />
            </div>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-gray-900">{currentRisk.overallRiskScore}</p>
            <p className="text-xs text-gray-600">Risk Score</p>
          </div>
        </div>
      </div>

      {/* Critical Gaps */}
      {currentRisk.criticalGaps.length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-bold text-red-900">
              Critical Gaps Identified ({currentRisk.criticalGaps.length})
            </h3>
          </div>
          <ul className="space-y-2">
            {currentRisk.criticalGaps.map((gap, index) => (
              <li key={index} className="flex items-center gap-2 text-red-800">
                <div className="w-2 h-2 bg-red-600 rounded-full" />
                {gap}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Risk Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(currentRisk.categories).map(([key, category]) => (
          <div key={key} className={`card border-2 ${getStatusColor(category.status)}`}>
            <div className="flex items-start gap-3">
              {getStatusIcon(category.status)}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                <p className="text-sm text-gray-700 mb-3">{category.message}</p>

                {/* Score Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Risk Level</span>
                    <span>{category.score}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        category.status === 'critical'
                          ? 'bg-red-600'
                          : category.status === 'warning'
                          ? 'bg-yellow-600'
                          : category.status === 'good'
                          ? 'bg-blue-600'
                          : 'bg-green-600'
                      }`}
                      style={{ width: `${category.score}%` }}
                    />
                  </div>
                </div>

                {/* Recommendations */}
                {category.recommendations.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-1">Recommendations:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {category.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span>•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
