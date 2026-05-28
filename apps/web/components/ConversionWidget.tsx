"use client";

import { useState } from "react";

interface ConversionWidgetProps {
  variant?: "hero" | "inline" | "sticky-bottom";
  headline?: string;
  subtext?: string;
  subline?: string;
  className?: string;
}

export default function ConversionWidget({
  variant = "inline",
  headline = "Radiation oncology, decoded daily.",
  subtext,
  subline,
  className = "",
}: ConversionWidgetProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // Placeholder — wire to Beehiiv subscribe API
    await new Promise((r) => setTimeout(r, 800));
    setSubmitted(true);
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className={`conversion-widget text-center ${className}`}>
        <div className="text-3xl mb-3">✅</div>
        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">You&apos;re in.</h3>
        <p className="text-sm text-[var(--text-secondary)]">
          Your first brief arrives tomorrow morning. Check your inbox.
        </p>
      </div>
    );
  }

  if (variant === "sticky-bottom") {
    return (
      <div className={`fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-surface)] border-t border-[var(--border-default)] shadow-apple-lg p-4 sm:hidden ${className}`}>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="flex-1 px-4 py-2.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-raised)] text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
          <button type="submit" disabled={loading} className="btn-primary text-sm px-5 py-2.5">
            {loading ? "…" : "Subscribe Free"}
          </button>
        </form>
      </div>
    );
  }

  if (variant === "hero") {
    return (
      <div className={`conversion-widget ${className}`}>
        <div className="max-w-xl">
          <div className="badge-insight mb-4">✦ Free Intelligence</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3 text-balance" style={{ letterSpacing: "-0.02em" }}>
            {headline}
          </h2>
          <p className="text-base text-[var(--text-secondary)] mb-6 leading-relaxed">
            {subtext}
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your work email"
              required
              className="flex-1 px-5 py-3 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)] text-base text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] transition-colors shadow-apple-sm"
            />
            <button type="submit" disabled={loading} className="btn-primary px-6 py-3 text-base">
              {loading ? "Subscribing…" : "Subscribe Free →"}
            </button>
          </form>
          <p className="text-xs text-[var(--text-tertiary)] mt-3">
            Free forever · No spam · Unsubscribe anytime · Privacy protected
          </p>
        </div>
      </div>
    );
  }

  // inline variant
  return (
    <div className={`conversion-widget ${className}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <div className="badge-insight mb-2">✦ Free Daily Brief</div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">{headline}</p>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{subline ?? subtext}</p>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2 w-full sm:w-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="flex-1 sm:w-52 px-4 py-2.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
          <button type="submit" disabled={loading} className="btn-primary text-sm">
            {loading ? "…" : "Subscribe"}
          </button>
        </form>
      </div>
      <p className="text-xs text-[var(--text-tertiary)] mt-2">Free · No spam · Unsubscribe anytime</p>
    </div>
  );
}
