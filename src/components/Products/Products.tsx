import { useClientStore } from '../../store/clientStore';
import { generateInsuranceRecommendations } from '../../utils/insurance';
import { Shield, AlertCircle, Check, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/calculations';

export default function Products() {
  const { currentClient, currentMetrics } = useClientStore();

  if (!currentClient || !currentMetrics) {
    return null;
  }

  const products = generateInsuranceRecommendations(
    currentClient.age,
    currentMetrics.totalIncome,
    currentClient.hasLifeInsurance,
    currentClient.hasDisabilityInsurance,
    currentClient.hasUmbrellaPolicy,
    currentMetrics.lifeInsuranceGap
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Insurance Product Recommendations</h2>
        <p className="text-sm text-gray-600 mt-1">
          Personalized insurance solutions based on your financial profile
        </p>
      </div>

      {products.length === 0 ? (
        <div className="card text-center py-12">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Excellent Insurance Coverage!
          </h3>
          <p className="text-gray-600">
            You have adequate insurance protection in place. Continue to review annually.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product.id}
              className={`card border-2 ${
                product.recommended ? 'border-blue-300 bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(
                        product.priority
                      )}`}
                    >
                      {product.priority.toUpperCase()}
                    </span>
                  </div>

                  {product.reason && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3 flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-yellow-900">{product.reason}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Estimated Cost</p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(product.estimatedCost.min)} -{' '}
                        {formatCurrency(product.estimatedCost.max)}
                        <span className="text-sm font-normal text-gray-600">
                          /{product.estimatedCost.unit}
                        </span>
                      </p>
                    </div>
                    {product.coverageAmount && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Coverage Amount</p>
                        <p className="text-xl font-bold text-gray-900">
                          {formatCurrency(product.coverageAmount)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Key Features:</p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {product.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {product.recommended && (
                    <div className="flex gap-2">
                      <button className="btn btn-primary">Get Quote</button>
                      <button className="btn btn-secondary">Learn More</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
