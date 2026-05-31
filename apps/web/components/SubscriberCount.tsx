/**
 * SubscriberCount — brand invariant (CLAUDE.md §3 row 5 + §8).
 *
 * The subscriber count is HIDDEN until it reaches 2,500. Below the threshold
 * the component renders the qualitative audience line instead of a number;
 * at or above it, the formatted count is shown. Reveal milestones: 2.5k / 5k
 * / 10k / 25k.
 */

const REVEAL_THRESHOLD = 2_500;

const QUALITATIVE_COPY =
  "Built for radiation oncologists, physicists, dosimetrists, therapists, and oncology leaders.";

interface SubscriberCountProps {
  /** Current subscriber count (canonical source: Beehiiv). */
  count: number;
  className?: string;
}

export function SubscriberCount({ count, className }: SubscriberCountProps) {
  if (count < REVEAL_THRESHOLD) {
    return <p className={className}>{QUALITATIVE_COPY}</p>;
  }
  return (
    <p className={className}>
      <strong>{count.toLocaleString("en-US")}</strong> subscribers
    </p>
  );
}

export { REVEAL_THRESHOLD as SUBSCRIBER_REVEAL_THRESHOLD };
