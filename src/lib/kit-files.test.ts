import assert from "node:assert/strict";
import { test } from "node:test";
import { kitFileBytes } from "./kit-files.server.ts";

test("Safe Build Kit zip decodes to a zip archive", async () => {
  const bytes = await kitFileBytes("ready-safe-build-kit");
  assert.ok(bytes, "expected bytes for the Safe Build Kit");
  assert.ok(bytes.length > 50_000, `zip looks too small: ${bytes.length} bytes`);
  // Local file header signature "PK\x03\x04"
  assert.deepEqual([...bytes.subarray(0, 4)], [0x50, 0x4b, 0x03, 0x04]);
});

test("products without a file get null", async () => {
  assert.equal(await kitFileBytes("ready-ash-cow"), null);
});
