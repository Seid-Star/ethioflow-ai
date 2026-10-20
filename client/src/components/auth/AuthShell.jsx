import { Link } from "react-router-dom";

export default function AuthShell({ children }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream-50 px-6 py-10">
      <Link to="/" className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gold-500 to-forest-700">
          <span className="font-bold text-white">E</span>
        </div>
        <p className="text-lg font-bold text-forest-950">
          EthioFlow <span className="text-gold-500">AI</span>
        </p>
      </Link>
      <div className="w-full max-w-sm rounded-2xl border border-black/5 bg-white p-8 shadow-xl">
        {children}
      </div>
    </div>
  );
}
