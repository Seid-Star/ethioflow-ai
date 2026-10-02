import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import { useAuthStore } from "../store/authStore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setAuth(data.user, data.accessToken);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-50 px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-black/5 bg-white p-8 shadow-xl"
      >
        <h1 className="mb-1 text-2xl font-bold text-forest-950">
          Welcome back
        </h1>
        <p className="mb-6 text-sm text-ink-900/60">Log in to EthioFlow AI</p>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <label className="mb-1 block text-sm font-medium text-ink-900/80">
          Email
        </label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-forest-700"
          type="email"
          required
        />

        <label className="mb-1 block text-sm font-medium text-ink-900/80">
          Password
        </label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-forest-700"
          type="password"
          required
        />

        <button
          type="submit"
          className="mb-4 w-full rounded-full bg-gold-500 py-2.5 text-sm font-semibold text-forest-950 hover:bg-gold-600"
        >
          Log In
        </button>

        <p className="text-center text-sm text-ink-900/60">
          No account?{" "}
          <Link to="/register" className="font-medium text-forest-700">
            Start your free trial
          </Link>
        </p>
      </form>
    </div>
  );
}
