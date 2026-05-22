// Shared Tailwind base — keeps apps/{web,cms}/tailwind.config.ts in lockstep
// when T-122 lands design tokens (SSOT §5 / Design Spec v1.1). Apps spread this
// base and add their own `content` globs.

import type { Config } from "tailwindcss";

export const baseTailwindConfig: Pick<Config, "theme" | "plugins"> = {
  theme: { extend: {} },
  plugins: [],
};
