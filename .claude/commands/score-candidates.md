---
description: Score a candidate pool on the six-axis rubric and return top-5 + quick-hits backlog.
---

Score candidates in `$ARGUMENTS` (path to a candidate_pool.json file).

1. Invoke `signal-scorer`.
2. For each item: assign Clinical / AI / Physics / Operational / Novelty / Confidence (0–100 each) per rubric anchors.
3. Compute composite = 0.30C + 0.25A + 0.15P + 0.15O + 0.10N + 0.05Conf.
4. Sort descending, **exclude embargoed**.
5. Top-5 = top items with composite ≥ 55 (ship fewer if not enough qualify — never pad).
6. Quick-hits backlog = next 10 by composite.
7. Persist scores to `articles.signal_scores` and `articles.composite_score`.
8. Output JSON with `top_5`, `quick_hits`, `below_threshold`, `embargoed_held`.
