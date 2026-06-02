"use client";
// =====================================================================
// Motion primitives — the reusable, CLS-safe, reduced-motion-aware motion
// building blocks for the reader. WEB-0. Use the `m` component (tree-shaken
// via LazyMotion in MotionProvider). All animate opacity/transform only —
// never width/height/top/left — so they never cause layout shift (CLS).
//
//   <FadeIn>      mount entrance (above-the-fold)
//   <Reveal>      scroll-into-view entrance (below-the-fold), once
//   <Stagger> + <StaggerItem>   sequenced reveal of a list/grid
//
// Reduced motion is handled globally by MotionConfig reducedMotion="user".
// =====================================================================
import * as m from "motion/react-m";
import type { Variants } from "motion/react";
import type { ReactNode } from "react";

/** Shared easing — matches --rb-ease-apple cubic-bezier(0.25,0.1,0.25,1). */
export const EASE = [0.25, 0.1, 0.25, 1] as const;

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
  className?: string;
}

/** Opacity + rise entrance on mount. For above-the-fold content. */
export function FadeIn({ children, delay = 0, y = 16, duration = 0.5, className }: FadeInProps) {
  return (
    <m.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, ease: EASE, delay }}
      className={className}
    >
      {children}
    </m.div>
  );
}

interface RevealProps extends FadeInProps {
  amount?: number;
}

/** Opacity + rise entrance when scrolled into view (fires once). Below-the-fold. */
export function Reveal({ children, delay = 0, y = 24, duration = 0.6, amount = 0.25, className }: RevealProps) {
  return (
    <m.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration, ease: EASE, delay }}
      className={className}
    >
      {children}
    </m.div>
  );
}

const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const staggerChild: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

interface StaggerProps {
  children: ReactNode;
  amount?: number;
  className?: string;
}

/** Parent that sequences its <StaggerItem> children into view, once. */
export function Stagger({ children, amount = 0.2, className }: StaggerProps) {
  return (
    <m.div
      variants={staggerParent}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      className={className}
    >
      {children}
    </m.div>
  );
}

/** A single staggered child. Must be rendered inside <Stagger>. */
export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <m.div variants={staggerChild} className={className}>
      {children}
    </m.div>
  );
}
