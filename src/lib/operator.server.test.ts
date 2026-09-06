import assert from "node:assert/strict";
import { test } from "node:test";
import { operatorAllowed, operatorLocked } from "./operator.server.ts";

test("operator is open when no secret is set", () => {
  const prev = process.env.OPERATOR_SECRET;
  delete process.env.OPERATOR_SECRET;
  assert.equal(operatorLocked(), false);
  assert.equal(operatorAllowed(undefined), true);
  if (prev === undefined) delete process.env.OPERATOR_SECRET;
  else process.env.OPERATOR_SECRET = prev;
});

test("operator rejects a wrong key when locked", () => {
  const prev = process.env.OPERATOR_SECRET;
  process.env.OPERATOR_SECRET = "barn-key";
  assert.equal(operatorLocked(), true);
  assert.equal(operatorAllowed("barn-key"), true);
  assert.equal(operatorAllowed("nope"), false);
  assert.equal(operatorAllowed(""), false);
  if (prev === undefined) delete process.env.OPERATOR_SECRET;
  else process.env.OPERATOR_SECRET = prev;
});
