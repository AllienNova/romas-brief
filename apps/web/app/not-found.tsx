export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center">
        <p className="text-xs uppercase tracking-widest font-semibold text-neutral-500">
          404
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Not found</h1>
        <p className="mt-3 text-neutral-600">
          The page you requested does not exist.
        </p>
      </div>
    </main>
  );
}
