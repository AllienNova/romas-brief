// =====================================================================
// mock-notices.ts — placeholder board data until NB-4 wires GET /api/notices/board.
// Conforms to the NB-1 Notice contracts so it flows through selectBoard()
// exactly like real DB rows will. Replaced by the API fetch in NB-4.
// =====================================================================
import type { InventorySlot, Notice } from "@/lib/notice-board/types";

const PUB = "2026-06-01T08:00:00.000Z";

export const MOCK_NOTICES: Notice[] = [
  {
    id: "cadence",
    type: "announcement",
    isSponsored: false,
    title: "ROMAS Wire is now twice weekly",
    summary: "Tuesday operational brief + Friday's ROMAS Read. Same signal, sharper rhythm — built around how the clinic actually reads.",
    ctaLabel: "What changed",
    ctaUrl: "/about/how-it-works",
    dateLabel: "Jun 2",
    publishAt: PUB,
    priority: "featured",
    status: "published",
    pinned: false,
    isNew: false,
  },
  {
    id: "astro",
    type: "event",
    isSponsored: false,
    title: "ASTRO 2026 — Conference Brief mode",
    summary: "Daily embargo-aware briefs during the meeting. Sessions tracked in conference local time.",
    ctaLabel: "Preview",
    ctaUrl: "/listen",
    startsAt: "2026-09-27T13:00:00.000Z",
    timezone: "America/Chicago",
    publishAt: PUB,
    priority: "normal",
    status: "published",
    pinned: false,
    isNew: false,
  },
  {
    id: "estro",
    type: "event",
    isSponsored: false,
    title: "ESTRO 2026 · Vienna",
    summary: "Live Conference Brief coverage. MR-Linac, FLASH, and adaptive RT tracks in focus.",
    startsAt: "2026-05-03T08:00:00.000Z",
    timezone: "Europe/Vienna",
    dateLabel: "May 3–7",
    publishAt: PUB,
    priority: "normal",
    status: "published",
    pinned: false,
    isNew: false,
  },
  {
    id: "trials",
    type: "news",
    isSponsored: false,
    title: "SABR-COMET-3 reaches Level I",
    summary: "Oligometastatic liver SBRT now carries OS-benefit evidence — the most practice-changing SBRT result in three years.",
    ctaLabel: "Read the brief",
    ctaUrl: "/article/sbrt-liver-metastases-phase-iii-results",
    publishAt: PUB,
    priority: "high",
    status: "published",
    pinned: false,
    isNew: false,
  },
  {
    id: "partner-1",
    type: "partner",
    isSponsored: true,
    title: "Adaptive planning, 40% faster contouring",
    summary: "A partner message on AI-assisted OAR delineation for head-and-neck.",
    ctaLabel: "Learn more",
    ctaUrl: "https://example.com",
    publishAt: PUB,
    priority: "normal",
    status: "published",
    pinned: false,
    isNew: false,
    sponsorName: "Partner",
    sponsorDisclosure: "Sponsored partner message — not ROMAS editorial.",
  },
];

// One unsold homepage partner slot → renders the "Advertise on the Board" CTA.
export const MOCK_SLOTS: InventorySlot[] = [
  { id: "slot-home-1", kind: "homepage_partner", noticeId: null },
];
