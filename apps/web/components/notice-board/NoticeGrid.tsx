// =====================================================================
// NoticeGrid — responsive asymmetric grid + stagger-reveal orchestration.
// Server component composing the WEB-0 client motion primitives with the
// (server) cards via the children pattern. Featured spans two columns.
// =====================================================================
import type { BoardPayload } from "@/lib/notice-board/types";
import { Stagger, StaggerItem } from "@/components/motion/primitives";
import { FeaturedNoticeCard } from "./cards/FeaturedNoticeCard";
import { ConferenceLeadCard } from "./cards/ConferenceLeadCard";
import { EditorialNoticeCard } from "./cards/EditorialNoticeCard";
import { SponsoredNoticeCard } from "./cards/SponsoredNoticeCard";
import { InventorySlotCard } from "./cards/InventorySlotCard";

export function NoticeGrid({ board }: { board: BoardPayload }) {
  return (
    <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {board.featured && (
        <StaggerItem className="sm:col-span-2">
          {board.conferenceMode ? (
            <ConferenceLeadCard notice={board.featured} conference={board.conferenceMode} />
          ) : (
            <FeaturedNoticeCard notice={board.featured} />
          )}
        </StaggerItem>
      )}
      {board.editorial.map((n) => (
        <StaggerItem key={n.id}>
          <EditorialNoticeCard notice={n} />
        </StaggerItem>
      ))}
      {board.sponsored.map((n) => (
        <StaggerItem key={n.id}>
          <SponsoredNoticeCard notice={n} />
        </StaggerItem>
      ))}
      {board.inventory.state !== "empty" && (
        <StaggerItem>
          <InventorySlotCard slot={board.inventory} />
        </StaggerItem>
      )}
    </Stagger>
  );
}
