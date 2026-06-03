// =====================================================================
// InventorySlotCard — renders the board's single inventory position from
// its resolved state (§11). unsold → "Advertise" CTA; internal → first-party
// editorial promo (editorial styling allowed); sold → SponsoredNoticeCard;
// empty → null (grid collapses, no dead box).
// =====================================================================
import { ADVERTISE_HREF, type InventorySlotState } from "@/lib/notice-board/types";
import { EditorialNoticeCard } from "./EditorialNoticeCard";
import { SponsoredNoticeCard } from "./SponsoredNoticeCard";
import { NoticeCTA } from "../primitives/NoticeCTA";

export function InventorySlotCard({ slot }: { slot: InventorySlotState }) {
  switch (slot.state) {
    case "empty":
      return null;
    case "sold":
      return <SponsoredNoticeCard notice={slot.notice} />;
    case "internal":
      return <EditorialNoticeCard notice={slot.notice} />;
    case "unsold":
    default:
      return (
        <article
          className="notice-card flex h-full flex-col justify-center overflow-hidden rounded-xl p-5"
          style={{ background: "var(--rb-sponsor-bg, var(--rb-bg-raised))", border: "1px dashed var(--rb-border-default)" }}
          data-slot-state="unsold"
        >
          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--rb-text-tertiary)", letterSpacing: "0.08em" }}>
            Advertise
          </span>
          <h3 className="mt-2 text-[15px] font-bold leading-snug" style={{ color: "var(--rb-text-primary)" }}>
            Your message on the Board
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--rb-text-secondary)" }}>
            Reach radiation oncologists, physicists, dosimetrists, and oncology leaders. Sponsored placements are clearly labeled and firewalled from editorial.
          </p>
          <div className="mt-3">
            <NoticeCTA href={ADVERTISE_HREF} label="Advertise on the Board" muted />
          </div>
        </article>
      );
  }
}
