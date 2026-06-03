// node --experimental-strip-types --test rbac.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { hasRole, isRole, canEditNotices, canApproveSponsored, canManageFlags } from "./rbac.ts";

test("hasRole respects the hierarchy", () => {
  assert.equal(hasRole("admin", "viewer"), true);
  assert.equal(hasRole("editor", "editor"), true);
  assert.equal(hasRole("editor", "sponsor_manager"), false);
  assert.equal(hasRole("sponsor_manager", "editor"), true);
  assert.equal(hasRole("viewer", "editor"), false);
});

test("hasRole rejects null/undefined", () => {
  assert.equal(hasRole(null, "viewer"), false);
  assert.equal(hasRole(undefined, "viewer"), false);
});

test("isRole guards untrusted claims", () => {
  assert.equal(isRole("admin"), true);
  assert.equal(isRole("superuser"), false);
  assert.equal(isRole(42), false);
  assert.equal(isRole(undefined), false);
});

test("capability gates map to the right floor", () => {
  // editor can edit editorial but not approve sponsored or manage flags
  assert.equal(canEditNotices("editor"), true);
  assert.equal(canApproveSponsored("editor"), false);
  assert.equal(canManageFlags("editor"), false);
  // sponsor_manager can approve sponsored, still not flags
  assert.equal(canApproveSponsored("sponsor_manager"), true);
  assert.equal(canManageFlags("sponsor_manager"), false);
  // admin can do everything
  assert.equal(canEditNotices("admin"), true);
  assert.equal(canApproveSponsored("admin"), true);
  assert.equal(canManageFlags("admin"), true);
  // viewer can do nothing
  assert.equal(canEditNotices("viewer"), false);
});
