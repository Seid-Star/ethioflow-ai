import { useCallback, useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  MessageCircle,
  Send,
  Archive,
  CheckCheck,
  RotateCcw,
  Inbox,
} from "lucide-react";
import { api } from "../../api/axios";
import { normalizePhone, formatPhone } from "../../lib/phone";
import { notifyAdminMessagesChanged } from "../../lib/useAdminUnread";

const VIEWS = [
  { key: "open", label: "Open", count: (c) => c.new + c.read },
  { key: "new", label: "New", count: (c) => c.new },
  { key: "replied", label: "Replied", count: (c) => c.replied },
  { key: "archived", label: "Archived", count: (c) => c.archived },
];

const TOPIC_STYLE = {
  general: "bg-gray-100 text-gray-700",
  demo: "bg-emerald-100 text-emerald-700",
  pricing: "bg-amber-100 text-amber-800",
  support: "bg-sky-100 text-sky-700",
  partnership: "bg-violet-100 text-violet-700",
};

export default function MessagesTab() {
  const [view, setView] = useState("open");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({
    items: [],
    total: 0,
    pages: 1,
    counts: { new: 0, read: 0, replied: 0, archived: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState(null);

  const load = useCallback(async () => {
    setError("");
    try {
      const { data: result } = await api.get("/admin/messages", {
        params: { status: view, page },
      });
      setData(result);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not load messages");
    } finally {
      setLoading(false);
    }
  }, [view, page]);

  useEffect(() => {
    load();
  }, [load]);

  function changed() {
    load();
    notifyAdminMessagesChanged();
  }

  async function toggle(message) {
    const closing = openId === message.id;
    setOpenId(closing ? null : message.id);
    if (!closing && message.status === "new") {
      try {
        await api.patch(`/admin/messages/${message.id}`, { status: "read" });
        changed();
      } catch {
        return;
      }
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            onClick={() => {
              setView(v.key);
              setPage(1);
              setOpenId(null);
              setLoading(true);
            }}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium ${
              view === v.key
                ? "bg-forest-900 text-white"
                : "border border-black/10 text-ink-900/60 hover:bg-black/5"
            }`}
          >
            {v.label}
            <span
              className={`rounded-full px-1.5 text-[11px] ${view === v.key ? "bg-white/15" : "bg-black/5"}`}
            >
              {v.count(data.counts)}
            </span>
          </button>
        ))}
      </div>

      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-ink-900/50">Loading...</p>
      ) : data.items.length === 0 ? (
        <div className="rounded-2xl border border-black/5 bg-white p-10 text-center">
          <Inbox size={30} className="mx-auto mb-2 text-ink-900/25" />
          <p className="text-sm text-ink-900/50">
            {view === "open"
              ? "Nothing waiting. You are all caught up."
              : "No messages here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.items.map((message) => (
            <MessageCard
              key={message.id}
              message={message}
              open={openId === message.id}
              onToggle={() => toggle(message)}
              onChanged={changed}
            />
          ))}
        </div>
      )}

      {data.pages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="flex items-center gap-1 rounded-full border border-black/10 px-4 py-2 text-sm hover:bg-black/5 disabled:opacity-40"
          >
            <ChevronLeft size={14} /> Previous
          </button>
          <span className="text-xs text-ink-900/55">
            Page {page} of {data.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
            disabled={page >= data.pages}
            className="flex items-center gap-1 rounded-full border border-black/10 px-4 py-2 text-sm hover:bg-black/5 disabled:opacity-40"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

function MessageCard({ message, open, onToggle, onChanged }) {
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const phone = message.phone ? normalizePhone(message.phone) : null;

  async function setStatus(status) {
    setError("");
    try {
      await api.patch(`/admin/messages/${message.id}`, { status });
      onChanged();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not update this message");
    }
  }

  async function sendReply() {
    if (reply.trim().length < 2) return;
    setSending(true);
    setError("");
    setNotice("");
    try {
      await api.post(`/admin/messages/${message.id}/reply`, {
        body: reply.trim(),
      });
      setReply("");
      setNotice(`Reply sent to ${message.email}`);
      onChanged();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not send the reply");
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-white ${message.status === "new" ? "border-gold-500/60" : "border-black/5"}`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-3 px-5 py-4 text-left hover:bg-forest-50/40"
      >
        <span
          className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${message.status === "new" ? "bg-gold-500" : "bg-transparent"}`}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p
              className={`text-sm text-forest-950 ${message.status === "new" ? "font-bold" : "font-medium"}`}
            >
              {message.name}
            </p>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${TOPIC_STYLE[message.topic] || TOPIC_STYLE.general}`}
            >
              {message.topicLabel}
            </span>
            {message.status === "replied" && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                Replied
              </span>
            )}
            {message.status === "archived" && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                Archived
              </span>
            )}
          </div>
          {!open && (
            <p className="mt-1 truncate text-sm text-ink-900/55">
              {message.message}
            </p>
          )}
        </div>
        <span className="shrink-0 text-[11px] text-ink-900/40">
          {new Date(message.createdAt).toLocaleString()}
        </span>
      </button>

      {open && (
        <div className="border-t border-black/5 bg-forest-50/30 px-5 py-5">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
            {message.email && (
              <a
                href={`mailto:${message.email}`}
                className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-forest-900 ring-1 ring-black/10 hover:bg-forest-50"
              >
                <Mail size={12} /> {message.email}
              </a>
            )}
            {phone && (
              <>
                <a
                  href={`tel:${phone}`}
                  className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-forest-900 ring-1 ring-black/10 hover:bg-forest-50"
                >
                  <Phone size={12} /> {formatPhone(phone)}
                </a>
                <a
                  href={`https://wa.me/${phone.slice(1)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-forest-900 ring-1 ring-black/10 hover:bg-forest-50"
                >
                  <MessageCircle size={12} /> WhatsApp
                </a>
              </>
            )}
            <span className="font-mono text-[11px] text-ink-900/40">
              {message.reference}
            </span>
            {message.acknowledgedAt && (
              <span className="text-[11px] text-ink-900/40">
                Confirmation sent
              </span>
            )}
          </div>

          <div className="mb-5 whitespace-pre-wrap rounded-xl bg-white px-4 py-3.5 text-sm leading-relaxed text-forest-950 ring-1 ring-black/5">
            {message.message}
          </div>

          {message.replies.length > 0 && (
            <div className="mb-5 space-y-2">
              {message.replies.map((r, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-100"
                >
                  <p className="mb-1 text-[11px] text-emerald-800/70">
                    {r.by} replied to {r.sentTo} ·{" "}
                    {new Date(r.sentAt).toLocaleString()}
                  </p>
                  <p className="whitespace-pre-wrap text-sm text-emerald-950">
                    {r.body}
                  </p>
                </div>
              ))}
            </div>
          )}

          {error && (
            <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}
          {notice && (
            <p className="mb-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {notice}
            </p>
          )}

          {message.email ? (
            <div className="mb-4">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value.slice(0, 4000))}
                rows={4}
                placeholder={`Write your reply to ${message.name}...`}
                className="mb-2 w-full resize-none rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-forest-700"
              />
              <button
                type="button"
                onClick={sendReply}
                disabled={sending || reply.trim().length < 2}
                className="flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-forest-950 hover:bg-gold-600 disabled:opacity-50"
              >
                <Send size={14} />{" "}
                {sending ? "Sending..." : "Send reply by email"}
              </button>
            </div>
          ) : (
            <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-amber-900">
              This person left a phone number only. Call or message them, then
              press "Mark as replied".
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {message.status !== "replied" && (
              <button
                onClick={() => setStatus("replied")}
                className="flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-medium hover:bg-forest-50"
              >
                <CheckCheck size={13} /> Mark as replied
              </button>
            )}
            {message.status !== "archived" ? (
              <button
                onClick={() => setStatus("archived")}
                className="flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-medium hover:bg-forest-50"
              >
                <Archive size={13} /> Archive
              </button>
            ) : (
              <button
                onClick={() => setStatus("read")}
                className="flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-medium hover:bg-forest-50"
              >
                <RotateCcw size={13} /> Restore
              </button>
            )}
            {message.status === "read" && (
              <button
                onClick={() => setStatus("new")}
                className="flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-medium hover:bg-forest-50"
              >
                Mark as unread
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
