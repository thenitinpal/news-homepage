import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { isSubscribed, subscribe } from "../lib/newsletterApi";

export function SubscribeButton() {
  const { session } = useAuth();
  const [subscribed, setSubscribed] = useState(false);
  const [pending, setPending] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (session) {
      isSubscribed(session.user.id).then(setSubscribed);
    } else {
      setSubscribed(false);
    }
  }, [session]);

  async function handleClick() {
    if (session) {
      setPending(true);
      try {
        await subscribe(session.user.email ?? "", session.user.id);
        setSubscribed(true);
      } finally {
        setPending(false);
      }
    } else {
      setPromptOpen((v) => !v);
    }
  }

  async function handleEmailSubmit(event: FormEvent) {
    event.preventDefault();
    if (!email.trim()) return;
    setPending(true);
    try {
      await subscribe(email.trim());
      setSubscribed(true);
      setPromptOpen(false);
    } finally {
      setPending(false);
    }
  }

  if (subscribed) {
    return (
      <span className="rounded-full bg-slate-800 px-3 py-1 font-semibold text-slate-300">
        Subscribed
      </span>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="rounded-full bg-red-600 px-3 py-1 font-semibold text-white hover:bg-red-500 disabled:opacity-60"
      >
        Subscribe
      </button>
      {promptOpen && (
        <form
          onSubmit={handleEmailSubmit}
          className="absolute right-0 top-full z-50 mt-2 flex w-64 gap-1 rounded-lg border border-slate-700 bg-slate-900 p-2 shadow-lg"
        >
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="min-w-0 flex-1 rounded-md border border-slate-600 bg-slate-800 px-2 py-1 text-xs text-white placeholder:text-slate-500 focus:border-red-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={pending}
            className="shrink-0 rounded-md bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-60"
          >
            Join
          </button>
        </form>
      )}
    </div>
  );
}
