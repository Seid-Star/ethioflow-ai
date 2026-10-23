import { Component } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

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
        <div className="flex min-h-screen items-center justify-center bg-cream-50 px-5 py-12">
          <div className="w-full max-w-md rounded-3xl border border-forest-950/10 bg-white p-8 text-center shadow-xl shadow-forest-950/5 sm:p-10">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-red-200 bg-red-50">
              <AlertTriangle
                size={36}
                strokeWidth={1.8}
                className="text-red-500"
              />
            </div>

            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-gold-600">
              Unexpected error
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-forest-950 sm:text-3xl">
              Something went wrong
            </h1>

            <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-ink-900/60">
              This page encountered an unexpected problem. You can try
              refreshing the page to get back on track.
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold-500 px-6 py-3.5 text-sm font-bold text-forest-950 shadow-md shadow-gold-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-gold-600 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 sm:w-auto"
            >
              <RefreshCw size={17} />
              Refresh Page
            </button>

            <p className="mt-6 text-xs text-ink-900/40">
              EthioFlow AI · We're here to help
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
