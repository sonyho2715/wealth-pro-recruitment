/**
 * Error Boundary Component
 * Catches React errors and displays fallback UI
 */

import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { handleError, ErrorCategory } from '../../utils/error-handler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to monitoring service
    handleError(error, {
      category: ErrorCategory.UI,
      severity: 'error',
      extra: {
        componentStack: errorInfo.componentStack,
      },
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <div className="card bg-white border-2 border-red-300 shadow-lg">
              <div className="text-center">
                {/* Error Icon */}
                <div className="flex justify-center mb-6">
                  <div className="p-4 rounded-full bg-red-100">
                    <AlertCircle className="w-12 h-12 text-red-600" />
                  </div>
                </div>

                {/* Error Message */}
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Oops! Something went wrong
                </h1>
                <p className="text-lg text-gray-700 mb-8">
                  We apologize for the inconvenience. Our team has been notified and is working on a fix.
                </p>

                {/* Error Details (Development Only) */}
                {import.meta.env.DEV && this.state.error && (
                  <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                    <p className="font-semibold text-red-900 mb-2">Error Details:</p>
                    <p className="text-sm text-red-800 font-mono mb-2">{this.state.error.message}</p>
                    {this.state.errorInfo && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm font-semibold text-red-900">
                          Component Stack
                        </summary>
                        <pre className="mt-2 text-xs text-red-700 overflow-x-auto">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </details>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={this.handleReset}
                    className="btn bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Try Again
                  </button>
                  <button
                    onClick={this.handleGoHome}
                    className="btn bg-gray-600 hover:bg-gray-700 text-white inline-flex items-center justify-center gap-2"
                  >
                    <Home className="w-5 h-5" />
                    Go Home
                  </button>
                </div>

                {/* Support Info */}
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Need help? Contact our support team at{' '}
                    <a
                      href="mailto:support@example.com"
                      className="text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      support@example.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-Order Component to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
): React.ComponentType<P> {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

export default ErrorBoundary;
