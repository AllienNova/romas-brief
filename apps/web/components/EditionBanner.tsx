"use client";

import { useState } from "react";

export type Edition = "americas" | "europe" | "apac";

interface EditionBannerProps {
  current: Edition;
  onChange: (edition: Edition) => void;
}

const EDITIONS: { id: Edition; label: string; flag: string; tz: string }[] = [
  { id: "americas", label: "Americas", flag: "🌎", tz: "ET" },
  { id: "europe",   label: "Europe",   flag: "🌍", tz: "CET" },
  { id: "apac",     label: "Asia-Pacific", flag: "🌏", tz: "SGT" },
];

export default function EditionBanner({ current, onChange }: EditionBannerProps) {
  return (
    <div className="w-full bg-[var(--rb-bg-raised)] border-b border-[var(--rb-border-subtle)]">
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-9">
          <div className="flex items-center gap-1">
            {EDITIONS.map((ed) => (
              <button
                key={ed.id}
                onClick={() => onChange(ed.id)}
                className={`
                  flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200
                  ${current === ed.id
                    ? "bg-[var(--rb-accent)] text-white shadow-sm"
                    : "text-[var(--rb-text-secondary)] hover:text-[var(--rb-text-primary)] hover:bg-[var(--rb-bg-sunken)]"
                  }
                `}
              >
                <span>{ed.flag}</span>
                <span>{ed.label}</span>
              </button>
            ))}
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-signal-green animate-pulse" />
            <span className="kicker text-[var(--rb-text-tertiary)]">Live Intelligence</span>
          </div>
        </div>
      </div>
    </div>
  );
}
