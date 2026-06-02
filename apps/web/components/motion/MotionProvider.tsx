"use client";
// =====================================================================
// MotionProvider — app-wide Motion (Framer Motion) provider. WEB-0.
//
// - LazyMotion with the `domAnimation` feature set (+15kb: animations,
//   variants, exit, hover/tap/focus gestures — NOT drag/layout, which we
//   don't need). `strict` enforces the tree-shakeable `m` component so the
//   full `motion` component can never sneak the bundle back up.
// - MotionConfig reducedMotion="user" — the a11y guarantee: when the OS
//   requests reduced motion, transform/layout animations are suppressed
//   automatically across every `m` component (opacity fades remain).
// - Motion only runs in client components; the SSR'd hero/content paints
//   first, so this never blocks LCP. domAnimation SSRs initial styles, so
//   entrances animate on hydrate with no flash + no layout shift (opacity/
//   transform only).
// =====================================================================
import { LazyMotion, domAnimation, MotionConfig } from "motion/react";
import type { ReactNode } from "react";

export default function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
