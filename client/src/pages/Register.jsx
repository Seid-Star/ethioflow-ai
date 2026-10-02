import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import { useAuthStore } from "../store/authStore";

export default function Register() {
  const [form, setForm] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/register", form);
      setAuth(data.user, data.accessToken);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed");
    }
  }

  const fields = [
    { key: "businessName", label: "Business name", type: "text" },
    { key: "ownerName", label: "Owner name", type: "text" },
    { key: "email", label: "Email", type: "email" },
    { key: "phone", label: "Phone", type: "tel" },
    { key: "password", label: "Password", type: "password" },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-50 px-6 py-12">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-black/5 bg-white p-8 shadow-xl"
      >
        <h1 className="mb-1 text-2xl font-bold text-forest-950">
          Start your free trial
        </h1>
        <p className="mb-6 text-sm text-ink-900/60">
          Set up your business on EthioFlow AI
        </p>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        {fields.map((f) => (
          <div key={f.key} className="mb-4">
            <label className="mb-1 block text-sm font-medium text-ink-900/80">
              {f.label}
            </label>
            <input
              value={form[f.key]}
              onChange={(e) => update(f.key, e.target.value)}
              type={f.type}
              required
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-forest-700"
            />
          </div>
        ))}

        <button
          type="submit"
          className="mb-4 w-full rounded-full bg-gold-500 py-2.5 text-sm font-semibold text-forest-950 hover:bg-gold-600"
        >
          Create Account
        </button>

        <p className="text-center text-sm text-ink-900/60">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-forest-700">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
