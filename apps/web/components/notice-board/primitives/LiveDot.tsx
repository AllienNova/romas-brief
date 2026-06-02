// =====================================================================
// LiveDot — header status dot. aria-hidden (decorative); reserves space so
// it can never cause CLS (§15/§18).
// =====================================================================
export function LiveDot() {
  return (
    <span
      className="notice-live-dot inline-block h-2 w-2 rounded-full"
      style={{ background: "var(--rb-accent)" }}
      aria-hidden
    />
  );
}
