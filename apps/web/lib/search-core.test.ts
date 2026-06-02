// =====================================================================
// search-core.test.ts — pure search helpers. Run:
//   node --experimental-strip-types --test apps/web/lib/search-core.test.ts
// =====================================================================

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  EMBEDDING_MODEL,
  EMBEDDINGS_ENDPOINT,
  buildEmbeddingRequest,
  parseEmbedding,
  rankMock,
  sanitizeQuery,
  scoreMockArticle,
  type SearchableArticle,
} from "./search-core.ts";

test("sanitizeQuery: trims, collapses whitespace, bounds length", () => {
  assert.equal(sanitizeQuery("  proton   therapy  "), "proton therapy");
  assert.equal(sanitizeQuery(""), "");
  assert.equal(sanitizeQuery("a".repeat(500)).length, 200);
});

test("buildEmbeddingRequest: correct endpoint, model, bearer auth", () => {
  const req = buildEmbeddingRequest("flash rt", "sk-test");
  assert.equal(req.url, EMBEDDINGS_ENDPOINT);
  assert.equal(req.headers["Authorization"], "Bearer sk-test");
  const body = JSON.parse(req.body) as { model: string; input: string };
  assert.equal(body.model, EMBEDDING_MODEL);
  assert.equal(body.input, "flash rt");
});

test("parseEmbedding: extracts a finite number[]; rejects malformed", () => {
  assert.deepEqual(parseEmbedding({ data: [{ embedding: [0.1, 0.2, 0.3] }] }), [0.1, 0.2, 0.3]);
  assert.equal(parseEmbedding({ data: [] }), null);
  assert.equal(parseEmbedding({ data: [{ embedding: [] }] }), null);
  assert.equal(parseEmbedding({ data: [{ embedding: [1, "x", 3] }] }), null);
  assert.equal(parseEmbedding(null), null);
  assert.equal(parseEmbedding({}), null);
});

const ART = (title: string, standfirst: string, body: string): SearchableArticle => ({
  title,
  standfirst,
  body,
});

test("scoreMockArticle: weights title > standfirst > body; case-insensitive", () => {
  assert.equal(scoreMockArticle(ART("Proton", "x", "y"), "proton"), 3);
  assert.equal(scoreMockArticle(ART("x", "Proton", "y"), "proton"), 2);
  assert.equal(scoreMockArticle(ART("x", "y", "Proton"), "proton"), 1);
  assert.equal(scoreMockArticle(ART("x", "y", "z"), "proton"), 0);
  // multiple occurrences accumulate
  assert.equal(scoreMockArticle(ART("proton proton", "", ""), "proton"), 6);
  // single-char terms ignored
  assert.equal(scoreMockArticle(ART("a a a", "", ""), "a"), 0);
});

test("rankMock: orders by score desc, drops zero, caps at limit", () => {
  const arts = [
    ART("nothing here", "", ""),
    ART("proton", "proton", ""), // 3+2 = 5
    ART("proton therapy", "", ""), // title proton 3
  ];
  const ranked = rankMock(arts, "proton", 10);
  assert.equal(ranked.length, 2, "zero-score article dropped");
  assert.equal(ranked[0]!.title, "proton"); // highest score first
  assert.equal(ranked[1]!.title, "proton therapy");

  assert.equal(rankMock(arts, "proton", 1).length, 1, "respects limit");
  assert.equal(rankMock(arts, "absent", 10).length, 0, "no matches → empty");
});
