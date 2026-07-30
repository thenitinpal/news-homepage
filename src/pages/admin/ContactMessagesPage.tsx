import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  deleteContactMessage,
  fetchContactMessages,
  markMessageRead,
  type ContactMessage,
} from "../../lib/contactApi";
import { SEO } from "../../components/SEO";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setMessages(await fetchContactMessages());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages.");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleRead(msg: ContactMessage) {
    setBusyId(msg.id);
    try {
      await markMessageRead(msg.id, !msg.read);
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, read: !msg.read } : m)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update message.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this message? This cannot be undone.")) return;
    setBusyId(id);
    try {
      await deleteContactMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete message.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <SEO title="Contact Messages" description="Manage Pal News contact form submissions." noindex />
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="text-xl font-black tracking-tight text-slate-900">
            Pal<span className="text-red-600">News</span>{" "}
            <span className="text-sm font-semibold text-slate-400">Admin</span>
          </Link>
          <Link to="/admin" className="text-sm font-semibold text-slate-600 hover:text-red-600">
            Back to articles
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <h1 className="mb-6 text-2xl font-extrabold text-slate-900">Contact Messages</h1>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        {loading ? (
          <p className="text-slate-500">Loading messages…</p>
        ) : messages.length === 0 ? (
          <p className="text-slate-500">No messages yet.</p>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`rounded-lg border p-5 ${
                  msg.read ? "border-slate-200 bg-white" : "border-red-200 bg-red-50"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">{msg.name}</p>
                    <p className="text-sm text-slate-500">{msg.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">{formatDate(msg.createdAt)}</span>
                    {!msg.read && (
                      <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
                        New
                      </span>
                    )}
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{msg.message}</p>
                <div className="mt-4 flex gap-4">
                  <button
                    type="button"
                    onClick={() => handleToggleRead(msg)}
                    disabled={busyId === msg.id}
                    className="text-sm font-semibold text-blue-600 hover:underline disabled:opacity-50"
                  >
                    Mark as {msg.read ? "unread" : "read"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(msg.id)}
                    disabled={busyId === msg.id}
                    className="text-sm font-semibold text-red-600 hover:underline disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
