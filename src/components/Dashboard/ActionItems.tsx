import { useClientStore } from '../../store/clientStore';
import { AlertCircle, TrendingUp, CheckCircle2, Clock } from 'lucide-react';

export default function ActionItems() {
  const { currentMetrics } = useClientStore();

  if (!currentMetrics?.actionItems || currentMetrics.actionItems.length === 0) {
    return (
      <div className="card text-center py-12">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
        <p className="text-gray-600">
          No critical action items at this time. Keep up the great financial habits!
        </p>
      </div>
    );
  }

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'critical':
        return {
          badge: 'bg-red-100 text-red-700 border-red-300',
          card: 'border-red-200 bg-red-50',
          icon: <AlertCircle className="w-6 h-6 text-red-600" />,
          label: 'CRITICAL',
        };
      case 'high':
        return {
          badge: 'bg-orange-100 text-orange-700 border-orange-300',
          card: 'border-orange-200 bg-orange-50',
          icon: <TrendingUp className="w-6 h-6 text-orange-600" />,
          label: 'HIGH PRIORITY',
        };
      case 'medium':
        return {
          badge: 'bg-blue-100 text-blue-700 border-blue-300',
          card: 'border-blue-200 bg-blue-50',
          icon: <Clock className="w-6 h-6 text-blue-600" />,
          label: 'MEDIUM PRIORITY',
        };
      default:
        return {
          badge: 'bg-gray-100 text-gray-700 border-gray-300',
          card: 'border-gray-200 bg-gray-50',
          icon: <CheckCircle2 className="w-6 h-6 text-gray-600" />,
          label: 'LOW PRIORITY',
        };
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Priority Action Items</h2>
        <p className="text-gray-600">
          {currentMetrics.actionItems.length} action{currentMetrics.actionItems.length !== 1 ? 's' : ''} to improve your financial health
        </p>
      </div>

      <div className="space-y-4">
        {currentMetrics.actionItems.map((item, index) => {
          const styles = getPriorityStyles(item.priority);

          return (
            <div
              key={index}
              className={`card ${styles.card} border-2 hover:shadow-lg transition-all`}
            >
              <div className="flex items-start gap-4">
                {/* Priority Icon */}
                <div className="flex-shrink-0 mt-1">
                  {styles.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${styles.badge}`}>
                          {styles.label}
                        </span>
                        {item.deadline && (
                          <span className="text-xs text-gray-600 font-medium">
                            Deadline: {item.deadline}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm">{item.category}</h3>
                    </div>
                  </div>

                  <p className="text-gray-900 font-medium mb-2">{item.action}</p>

                  <div className="flex items-start gap-2 mt-2">
                    <span className="text-xs text-gray-600 font-medium">Impact:</span>
                    <p className="text-xs text-gray-700">{item.impact}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Card */}
      <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-8 h-8 text-blue-600" />
          <div>
            <h3 className="font-bold text-gray-900">Ready to Take Action?</h3>
            <p className="text-sm text-gray-700">
              Start with the highest priority items first. Even small steps make a big difference!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
