// Shared config presets — consumed by apps + workers + packages.
//
// tsconfig: extend the workspace-root file directly via "../../tsconfig.base.json"
// (it is the single canonical source of truth — no re-export here).
//
// Tailwind: import { baseTailwindConfig } from "@romas-brief/config/tailwind".
//
// ESLint presets land in T-117. Prettier preset optional, T-117.

export const PACKAGE_NAME = "@romas-brief/config" as const;
export { baseTailwindConfig } from "./tailwind.js";
