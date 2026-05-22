// T-101 stub: force-dynamic to bypass Next 14 + Node 24 + Windows
// static-prerender bug. CMS will be dynamic in production anyway
// (Cloudflare Access-gated, server-rendered editorial console).
export const dynamic = "force-dynamic";

export default function CmsHome() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center max-w-prose">
        <p className="text-xs uppercase tracking-widest font-semibold text-neutral-500">
          T-101 monorepo scaffold
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">ROMAS Brief CMS</h1>
        <p className="mt-3 text-neutral-600">
          Internal editorial console (stub). Cloudflare Access-gated in production.
        </p>
        <p className="mt-6 text-sm text-neutral-500">
          Implementation lands across M2–M4 alongside the article + audio_jobs schema.
        </p>
      </div>
    </main>
  );
}
