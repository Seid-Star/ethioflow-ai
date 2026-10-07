import { Component } from "react";
import { AlertTriangle } from "lucide-react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Uncaught UI error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-cream-50 p-6 text-center">
          <AlertTriangle size={32} className="text-red-500" />
          <p className="font-semibold text-forest-950">Something went wrong</p>
          <p className="max-w-sm text-sm text-ink-900/60">
            This page hit an unexpected error. Try refreshing — if it keeps
            happening, let us know what you were doing.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 rounded-full bg-gold-500 px-5 py-2 text-sm font-semibold text-forest-950 hover:bg-gold-600"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
