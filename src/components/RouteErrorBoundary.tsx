import React, { type ReactNode } from 'react';

type Props = { children: ReactNode; label?: string };

type State = { error: Error | null };

export class RouteErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[${this.props.label ?? 'Route'}]`, error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto max-w-lg p-6 text-center text-[#1a1a2e]">
          <h2 className="text-lg font-bold mb-2">Something went wrong</h2>
          <p className="text-sm text-[#6b7280] mb-4">{this.state.error.message}</p>
          <button
            type="button"
            className="rounded-xl bg-[#4A25E1] px-5 py-2.5 text-sm font-bold text-white"
            onClick={() => this.setState({ error: null })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
