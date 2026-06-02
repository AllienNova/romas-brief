// =====================================================================
// NewIndicator — dot-only pulse, EDITORIAL ONLY (§9). Never on sponsored.
// =====================================================================
export function NewIndicator() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--rb-accent)" }}>
      <span className="notice-new-dot inline-block h-1.5 w-1.5 rounded-full" style={{ background: "var(--rb-accent)" }} aria-hidden />
      New
    </span>
  );
}
