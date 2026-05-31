export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center">
        <p className="text-xs uppercase tracking-widest font-semibold text-[var(--rb-text-tertiary)]">
          404
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Not found</h1>
        <p className="mt-3 text-[var(--rb-text-secondary)]">
          The page you requested does not exist.
        </p>
      </div>
    </main>
  );
}
