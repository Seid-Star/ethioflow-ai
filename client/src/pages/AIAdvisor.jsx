import { useEffect, useRef, useState } from "react";
import { Sparkles, Send, History, MessageSquare } from "lucide-react";
import { api } from "../api/axios";
import { useAuthStore } from "../store/authStore";

const suggestions = [
  "What were today's sales?",
  "Who owes me money?",
  "What should I restock?",
  "What were my biggest expenses?",
  "Why did my profit decrease this month?",
];

export default function AIAdvisor() {
  const [tab, setTab] = useState("chat"); // 'chat' | 'history'
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const bottomRef = useRef(null);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (tab === "history") loadHistory();
  }, [tab]);

  async function loadHistory() {
    setHistoryLoading(true);
    const { data } = await api.get("/ai/history");
    setHistory(data);
    setHistoryLoading(false);
  }

  async function ask(question) {
    if (!question.trim() || loading) return;
    const timestamp = new Date();
    setMessages((m) => [
      ...m,
      { role: "owner", text: question, time: timestamp },
    ]);
    setInput("");
    setLoading(true);
    try {
      const { data } = await api.post("/ai/ask", { question });
      setMessages((m) => [
        ...m,
        { role: "ai", text: data.reply, time: new Date() },
      ]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          role: "ai",
          text: "⚠ Something went wrong answering that. Please try again.",
          time: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-2xl flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-forest-950">
            <Sparkles className="text-gold-500" /> AI Business Advisor
          </h1>
          <p className="text-sm text-ink-900/60">
            Ask anything about your business, in plain language.
          </p>
        </div>
        <div className="flex rounded-full border border-black/10 p-1">
          <button
            onClick={() => setTab("chat")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
              tab === "chat" ? "bg-forest-900 text-white" : "text-ink-900/60"
            }`}
          >
            <MessageSquare size={13} /> Chat
          </button>
          <button
            onClick={() => setTab("history")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
              tab === "history" ? "bg-forest-900 text-white" : "text-ink-900/60"
            }`}
          >
            <History size={13} /> History
          </button>
        </div>
      </div>

      {tab === "chat" ? (
        <>
          <div className="mb-4 flex-1 overflow-y-auto rounded-2xl border border-black/5 bg-white p-5">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                <Sparkles size={32} className="text-gold-500" />
                <p className="text-sm text-ink-900/50">
                  Try asking one of these:
                </p>
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
                  <ChatBubble
                    key={i}
                    role={m.role}
                    text={m.text}
                    time={m.time}
                    ownerName={user?.name}
                  />
                ))}
                {loading && <TypingIndicator />}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {messages.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => ask(s)}
                  className="rounded-full border border-black/10 px-3 py-1 text-xs text-ink-900/60 hover:bg-forest-50"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

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
              disabled={loading || !input.trim()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-500 hover:bg-gold-600 disabled:opacity-40"
            >
              <Send size={16} className="text-forest-950" />
            </button>
          </form>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto rounded-2xl border border-black/5 bg-white p-5">
          {historyLoading ? (
            <p className="text-sm text-ink-900/50">Loading...</p>
          ) : history.length === 0 ? (
            <p className="text-sm text-ink-900/50">No questions asked yet.</p>
          ) : (
            <div className="space-y-5">
              {history.map((h) => (
                <div
                  key={h._id}
                  className="border-b border-black/5 pb-5 last:border-0"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-sm font-semibold text-forest-950">
                      {h.question}
                    </p>
                    <span className="shrink-0 text-[11px] text-ink-900/40">
                      {new Date(h.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-ink-900/70">{h.reply}</p>
                  <p className="mt-1 text-[11px] text-ink-900/40">
                    Asked by {h.user?.name || "Unknown"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ChatBubble({ role, text, time, ownerName }) {
  const isOwner = role === "owner";
  return (
    <div
      className={`flex items-end gap-2 ${isOwner ? "flex-row-reverse" : "flex-row"}`}
    >
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
          isOwner ? "bg-forest-900 text-white" : "bg-gold-500 text-forest-950"
        }`}
      >
        {isOwner ? ownerName?.[0] || "O" : <Sparkles size={13} />}
      </div>
      <div
        className={`flex max-w-[78%] flex-col ${isOwner ? "items-end" : "items-start"}`}
      >
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isOwner
              ? "bg-forest-900 text-white"
              : "bg-forest-50 text-forest-950"
          }`}
        >
          {text}
        </div>
        <span className="mt-1 text-[10px] text-ink-900/35">
          {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-500 text-forest-950">
        <Sparkles size={13} />
      </div>
      <div className="flex items-center gap-1 rounded-2xl bg-forest-50 px-4 py-3">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-forest-700/50 [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-forest-700/50 [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-forest-700/50" />
      </div>
    </div>
  );
}
