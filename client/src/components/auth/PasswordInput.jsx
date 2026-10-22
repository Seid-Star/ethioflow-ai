import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordInput({ value, onChange, autoComplete }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required
        className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 pr-12 text-sm text-white placeholder:text-white/30 outline-none transition duration-300 focus:border-yellow-400/70 focus:bg-black/40 focus:ring-2 focus:ring-yellow-400/10"
      />

      <button
        type="button"
        onClick={() => setShow((current) => !current)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-white/40 transition-colors duration-200 hover:text-yellow-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
      >
        {show ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  );
}
