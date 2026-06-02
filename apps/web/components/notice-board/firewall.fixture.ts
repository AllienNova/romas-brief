// =====================================================================
// firewall.fixture.ts — COMPILE-TIME proof of the frontend sponsor firewall
// (spec §6 / §20). This file ships no runtime behavior; tsc fails the build
// if a SponsoredNotice can ever be passed to an editorial card (or vice
// versa). The @ts-expect-error lines are the assertions — if the firewall
// regresses, the "unused @ts-expect-error" becomes a hard tsc error.
// =====================================================================
import type { ComponentProps } from "react";
import type { EditorialNotice, SponsoredNotice } from "@/lib/notice-board/types";
import { EditorialNoticeCard } from "./cards/EditorialNoticeCard";
import { SponsoredNoticeCard } from "./cards/SponsoredNoticeCard";

declare const sponsored: SponsoredNotice;
declare const editorial: EditorialNotice;

// @ts-expect-error — FIREWALL: an editorial card must REJECT a sponsored notice.
const _f1: ComponentProps<typeof EditorialNoticeCard> = { notice: sponsored };
// @ts-expect-error — FIREWALL: the sponsored card must REJECT an editorial notice.
const _f2: ComponentProps<typeof SponsoredNoticeCard> = { notice: editorial };

void _f1;
void _f2;
