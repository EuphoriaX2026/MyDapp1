import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ExchangeErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    console.error('Exchange Error Boundary caught an error:', error)
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Exchange Error Boundary - Error details:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="section mt-4">
          <div className="card">
            <div className="card-body text-center">
              <h5 className="card-title text-danger">Exchange Error</h5>
              <p className="card-text">
                Something went wrong with the exchange component. Please refresh the page.
              </p>
              <button 
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </button>
              {this.state.error && (
                <details className="mt-3">
                  <summary>Error Details</summary>
                  <pre className="text-start mt-2" style={{ fontSize: '12px' }}>
                    {this.state.error.message}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
