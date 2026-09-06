import assert from "node:assert/strict";
import { test } from "node:test";
import { classifyStripeValue, inspectStripeEnv } from "./stripe-keys.ts";

test("classifies secret, restricted, publishable, and webhook material", () => {
  assert.equal(classifyStripeValue(""), "empty");
  assert.equal(classifyStripeValue("sk_test_abc"), "secret_test");
  assert.equal(classifyStripeValue("sk_live_abc"), "secret_live");
  assert.equal(classifyStripeValue("rk_test_abc"), "restricted_test");
  assert.equal(classifyStripeValue("rk_live_abc"), "restricted_live");
  assert.equal(classifyStripeValue("pk_live_abc"), "publishable");
  assert.equal(classifyStripeValue("whsec_abc"), "webhook");
  assert.equal(classifyStripeValue("not-a-key"), "invalid");
});

test("checkout rejects publishable keys and VITE_ leaks", () => {
  const leaked = inspectStripeEnv({
    secret: "sk_test_abc",
    webhook: "whsec_abc",
    viteSecret: "sk_test_abc",
  });
  assert.equal(leaked.checkoutReady, false);
  assert.equal(leaked.leakedToClient, true);
  assert.equal(leaked.mode, "invalid");

  const pk = inspectStripeEnv({ secret: "pk_live_abc", webhook: "whsec_abc" });
  assert.equal(pk.checkoutReady, false);
  assert.equal(pk.mode, "invalid");

  const ok = inspectStripeEnv({ secret: "rk_live_abc", webhook: "whsec_abc" });
  assert.equal(ok.checkoutReady, true);
  assert.equal(ok.webhookReady, true);
  assert.equal(ok.mode, "live");
});

test("webhook secret must be a whsec_ signing secret", () => {
  const mixed = inspectStripeEnv({ secret: "sk_test_abc", webhook: "sk_test_abc" });
  assert.equal(mixed.webhookReady, false);
  assert.equal(mixed.checkoutReady, true);
  assert.equal(mixed.mode, "test");
});
