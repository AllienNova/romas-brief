// =====================================================================
// packages/agent-tools/src/approve-cli.ts · ROMAS Wire · ADR-0020 (S3)
// OPERATOR-ONLY approval entry. This is NOT an MCP tool — the agent cannot
// invoke it. A human runs it to approve a staged send:
//
//   ROMAS_APPROVAL_TOKEN=<secret> \
//   RESEND_API_KEY=... TWILIO_ACCOUNT_SID=... TWILIO_AUTH_TOKEN=... \
//   TWILIO_FROM=+1... BEEHIIV_API_KEY=... BEEHIIV_PUBLICATION_ID=... \
//   node --experimental-strip-types src/approve-cli.ts <staged-id> <token>
//
// Provider secrets are read from the OPERATOR'S env here, at approval time —
// they are never stored in the staged record (S4). The double-entry (env
// secret vs typed <token>) confirms human intent (T-2).
// =====================================================================

import { executeApproved, type Executor } from "./approval.ts";
import { createSubscription } from "./beehiiv.ts";
import { buildEmail, sendEmail } from "./resend.ts";
import { FileStagedStore } from "./store-file.ts";
import { sendSms } from "./twilio.ts";
import type { SendJob } from "./tools.ts";

function fail(msg: string): never {
  process.stderr.write(`approve: ${msg}\n`);
  process.exit(1);
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) fail(`missing required env ${name}`);
  return v;
}

const id = process.argv[2];
const providedToken = process.argv[3];
if (!id || !providedToken) fail("usage: approve-cli.ts <staged-id> <token>");

const expectedToken = requireEnv("ROMAS_APPROVAL_TOKEN");
const statePath = process.env["ROMAS_AGENT_STATE"] ?? "./.romas-agent/staged.json";
const store = new FileStagedStore(statePath);

const exec: Executor<SendJob> = async (job) => {
  switch (job.kind) {
    case "email": {
      const r = await sendEmail(requireEnv("RESEND_API_KEY"), buildEmail(job), `oc:${id}`);
      return { ok: r.ok, status: r.status };
    }
    case "sms": {
      const r = await sendSms(
        requireEnv("TWILIO_ACCOUNT_SID"),
        requireEnv("TWILIO_AUTH_TOKEN"),
        { to: job.to, from: requireEnv("TWILIO_FROM"), body: job.body },
      );
      return r.sid !== undefined ? { ok: r.ok, status: r.status, ref: r.sid } : { ok: r.ok, status: r.status };
    }
    case "beehiiv": {
      const r = await createSubscription(
        requireEnv("BEEHIIV_API_KEY"),
        requireEnv("BEEHIIV_PUBLICATION_ID"),
        job.input,
      );
      return r.id !== undefined ? { ok: r.ok, status: r.status, ref: r.id } : { ok: r.ok, status: r.status };
    }
  }
};

const result = await executeApproved<SendJob>(store, id, providedToken, expectedToken, exec);

if (result.ok) {
  process.stdout.write(`APPROVED + SENT ${id} (status ${result.status ?? "?"}${result.ref ? `, ref ${result.ref}` : ""})\n`);
  process.exit(0);
}
process.stderr.write(`NOT SENT ${id}: ${result.reason}${result.status ? ` (status ${result.status})` : ""}\n`);
process.exit(result.reason === "unauthorized" ? 3 : 2);
