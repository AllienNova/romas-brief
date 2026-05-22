import type { Config } from "tailwindcss";
import { baseTailwindConfig } from "@romas-brief/config/tailwind";

const config: Config = {
  ...baseTailwindConfig,
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
};

export default config;
