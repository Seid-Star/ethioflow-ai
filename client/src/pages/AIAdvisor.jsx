import { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  Send,
  History,
  MessageSquare,
  Mic,
  Square,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { api } from "../api/axios";
import { useAuthStore } from "../store/authStore";
import {
  useVoice,
  voiceInputSupported,
  voiceOutputSupported,
} from "../lib/useVoice";

const suggestions = [
  "What were today's sales?",
  "Who owes me money?",
  "What should I restock?",
  "What were my biggest expenses?",
  "Why did my profit decrease this month?",
];

export default function AIAdvisor() {
  const { i18n } = useTranslation();
  const user = useAuthStore((s) => s.user);

  const [tab, setTab] = useState("chat");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [voiceLang, setVoiceLang] = useState(
    i18n.language === "am" ? "am" : "en",
  );
  const [speakAnswers, setSpeakAnswers] = useState(true);
  const [voiceNotice, setVoiceNotice] = useState("");

  const bottomRef = useRef(null);
  const askRef = useRef(null);

  const voice = useVoice({
    lang: voiceLang,
    onFinalTranscript: (text) => askRef.current?.(text, { viaVoice: true }),
  });

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

  async function ask(question, { viaVoice = false } = {}) {
    const text = question.trim();
    if (!text || loading) return;

    voice.stopSpeaking();
    setVoiceNotice("");
    setMessages((m) => [
      ...m,
      { role: "owner", text, time: new Date(), viaVoice },
    ]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await api.post("/ai/ask", { question: text });
      setMessages((m) => [
        ...m,
        { role: "ai", text: data.reply, time: new Date() },
      ]);

      if (viaVoice && speakAnswers) {
        const spoke = voice.speak(data.reply, voiceLang);
        if (!spoke)
          setVoiceNotice(
            "This device has no voice for that language, so the answer is shown as text only.",
          );
      }
    } catch (err) {
      const status = err?.response?.status;
      const serverMessage = err?.response?.data?.message;
      const friendly =
        [402, 429, 503].includes(status) && serverMessage
          ? serverMessage
          : "Something went wrong answering that. Please try again.";
      setMessages((m) => [
        ...m,
        { role: "ai", text: friendly, time: new Date(), isError: true },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // The voice callback always calls the latest version of ask()
  useEffect(() => {
    askRef.current = ask;
  });

  function toggleMic() {
    if (voice.listening) voice.stopListening();
    else voice.startListening();
  }

  function readAloud(text) {
    setVoiceNotice("");
    const spoke = voice.speak(text, voiceLang);
    if (!spoke)
      setVoiceNotice(
        "This device has no voice for that language. Switch the voice language to EN, or try Microsoft Edge.",
      );
  }

  const canSpeakHere = voiceOutputSupported;

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-2xl flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-forest-950">
            <Sparkles className="text-gold-500" /> AI Business Advisor
          </h1>
          <p className="text-sm text-ink-900/60">
            Ask anything about your business. Type it or say it.
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
          <div className="mb-3 flex-1 overflow-y-auto rounded-2xl border border-black/5 bg-white p-5">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                <Sparkles size={32} className="text-gold-500" />
                <p className="text-sm text-ink-900/50">
                  {voiceInputSupported
                    ? "Tap the mic and ask, or pick a question:"
                    : "Try asking one of these:"}
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
                    message={m}
                    ownerName={user?.name}
                    canSpeak={canSpeakHere}
                    onSpeak={readAloud}
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

          {voice.listening && (
            <div className="mb-3 flex items-center gap-3 rounded-xl bg-forest-900 px-4 py-3 text-white">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
              </span>
              <p className="min-w-0 flex-1 truncate text-sm">
                {voice.interim ||
                  (voiceLang === "am"
                    ? "እየሰማሁ ነው... ጥያቄዎን ይናገሩ"
                    : "Listening... say your question")}
              </p>
            </div>
          )}

          {voice.speaking && (
            <div className="mb-3 flex items-center justify-between rounded-xl bg-gold-500/15 px-4 py-2.5">
              <p className="flex items-center gap-2 text-sm text-forest-900">
                <Volume2 size={15} className="animate-pulse" /> Reading the
                answer aloud...
              </p>
              <button
                onClick={voice.stopSpeaking}
                className="flex items-center gap-1 rounded-full bg-forest-900 px-3 py-1 text-xs font-medium text-white"
              >
                <Square size={10} className="fill-white" /> Stop
              </button>
            </div>
          )}

          {(voice.error || voiceNotice) && (
            <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              {voice.error || voiceNotice}
            </p>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="flex items-center gap-2"
          >
            {voiceInputSupported && (
              <button
                type="button"
                onClick={toggleMic}
                disabled={loading}
                title={voice.listening ? "Stop listening" : "Ask by voice"}
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition disabled:opacity-40 ${
                  voice.listening
                    ? "bg-red-500 text-white"
                    : "bg-forest-900 text-white hover:bg-forest-800"
                }`}
              >
                {voice.listening ? (
                  <Square size={15} className="fill-white" />
                ) : (
                  <Mic size={18} />
                )}
              </button>
            )}
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

          {voiceInputSupported ? (
            <div className="mt-2.5 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-ink-900/45">
                  Voice language
                </span>
                <div className="flex rounded-full border border-black/10 p-0.5">
                  {[
                    { code: "en", label: "EN" },
                    { code: "am", label: "አማ" },
                  ].map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setVoiceLang(l.code);
                        voice.clearError();
                        setVoiceNotice("");
                      }}
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                        voiceLang === l.code
                          ? "bg-forest-900 text-white"
                          : "text-ink-900/50"
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {canSpeakHere && (
                <button
                  onClick={() => {
                    if (speakAnswers) voice.stopSpeaking();
                    setSpeakAnswers((v) => !v);
                  }}
                  className="flex items-center gap-1.5 text-[11px] text-ink-900/60 hover:text-forest-900"
                >
                  {speakAnswers ? <Volume2 size={13} /> : <VolumeX size={13} />}
                  Read voice answers aloud: {speakAnswers ? "On" : "Off"}
                </button>
              )}
            </div>
          ) : (
            <p className="mt-2.5 px-1 text-[11px] text-ink-900/40">
              Voice input works in Chrome, Edge, and Safari. You can still type
              your question.
            </p>
          )}
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
                  <div className="mb-1 flex items-center justify-between gap-3">
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

function ChatBubble({ message, ownerName, canSpeak, onSpeak }) {
  const isOwner = message.role === "owner";
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
              : message.isError
                ? "bg-amber-50 text-amber-900"
                : "bg-forest-50 text-forest-950"
          }`}
        >
          {message.text}
        </div>
        <div className="mt-1 flex items-center gap-2 text-[10px] text-ink-900/35">
          {message.viaVoice && <Mic size={10} />}
          <span>
            {message.time.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {!isOwner && canSpeak && !message.isError && (
            <button
              onClick={() => onSpeak(message.text)}
              className="flex items-center gap-1 text-forest-700 hover:underline"
            >
              <Volume2 size={11} /> Listen
            </button>
          )}
        </div>
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
