// T-101 stub: force-dynamic to bypass Next 14 + Node 24 + Windows
// static-prerender bug (`useContext` on null). M3 (T-301..) ships
// the real ISR-friendly reader pages.
export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center max-w-prose">
        <p className="text-xs uppercase tracking-widest font-semibold text-neutral-500">
          T-101 monorepo scaffold
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">ROMAS Brief</h1>
        <p className="mt-3 italic text-neutral-600">Radiation oncology, decoded daily.</p>
        <p className="mt-6 text-sm text-neutral-500">
          Public reader stub. Implementation lands in M3 (T-301..T-318).
        </p>
      </div>
    </main>
  );
}
