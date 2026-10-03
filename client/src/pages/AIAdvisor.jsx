import { useState } from "react";
import { Sparkles, Send } from "lucide-react";
import { api } from "../api/axios";

const suggestions = [
  "What were today's sales?",
  "Who owes me money?",
  "What should I restock?",
  "What were my biggest expenses?",
];

export default function AIAdvisor() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function ask(question) {
    if (!question.trim() || loading) return;
    setMessages((m) => [...m, { role: "owner", text: question }]);
    setInput("");
    setLoading(true);
    try {
      const { data } = await api.post("/ai/ask", { question });
      setMessages((m) => [...m, { role: "ai", text: data.reply }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "ai", text: "⚠ Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-2xl flex-col">
      <div className="mb-4">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-forest-950">
          <Sparkles className="text-gold-500" /> AI Business Advisor
        </h1>
        <p className="text-sm text-ink-900/60">
          Ask anything about your business, in plain language.
        </p>
      </div>

      <div className="mb-4 flex-1 overflow-y-auto rounded-2xl border border-black/5 bg-white p-5">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <Sparkles size={32} className="text-gold-500" />
            <p className="text-sm text-ink-900/50">Try asking one of these:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => ask(s)}
                  className="rounded-full border border-black/10 px-3 py-1.5 text-xs text-ink-900/70 hover:bg-forest-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "owner" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    m.role === "owner"
                      ? "bg-forest-900 text-white"
                      : "bg-forest-50 text-forest-950"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-forest-50 px-4 py-2.5 text-sm text-ink-900/40">
                  Thinking...
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
        className="flex items-center gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your business..."
          className="flex-1 rounded-full border border-black/10 px-4 py-3 text-sm outline-none focus:border-forest-700"
        />
        <button
          type="submit"
          disabled={loading}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-500 hover:bg-gold-600 disabled:opacity-40"
        >
          <Send size={16} className="text-forest-950" />
        </button>
      </form>
    </div>
  );
}
