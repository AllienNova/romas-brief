// =====================================================================
// packages/agent-tools/src/store-file.ts · ROMAS Wire · ADR-0020
// File-backed StagedStore. The MCP server process (spawned by OpenClaw)
// and the operator approval CLI are SEPARATE processes, so the staged-send
// store must be shared across them — an in-memory map cannot cross the
// process boundary. JSON file, mode 0600, read-modify-write.
//
// v1 is single-operator + low-volume (the quota caps daily sends), so a
// synchronous read-modify-write file is correct and simple. A concurrent
// multi-writer backend (Redis/Postgres) is a P-25 hardening item.
// =====================================================================

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

import type { StagedRecord, StagedSend, StagedStore } from "./approval.ts";

export class FileStagedStore implements StagedStore {
  // Explicit field (not a TS parameter property — node --experimental-strip-types
  // only erases types, it cannot synthesize parameter-property assignments).
  private readonly path: string;
  constructor(path: string) {
    this.path = path;
  }

  private readAll(): Record<string, StagedRecord> {
    if (!existsSync(this.path)) return {};
    try {
      return JSON.parse(readFileSync(this.path, "utf8")) as Record<string, StagedRecord>;
    } catch {
      return {};
    }
  }

  private writeAll(map: Record<string, StagedRecord>): void {
    mkdirSync(dirname(this.path), { recursive: true });
    writeFileSync(this.path, JSON.stringify(map, null, 2), { mode: 0o600 });
  }

  put(record: StagedRecord): void {
    const map = this.readAll();
    map[record.id] = record;
    this.writeAll(map);
  }

  get(id: string): StagedRecord | undefined {
    return this.readAll()[id];
  }

  delete(id: string): void {
    const map = this.readAll();
    delete map[id];
    this.writeAll(map);
  }

  list(): StagedSend[] {
    return Object.values(this.readAll()).map(({ payload: _payload, ...view }) => view);
  }
}
