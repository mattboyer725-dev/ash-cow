import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { test } from "node:test";
import { Nango } from "@nangohq/node";
import { saleFromCheckoutRecord } from "./stripe-events.ts";

test("saleFromCheckoutRecord maps a Nango CheckoutSession", () => {
  const sale = saleFromCheckoutRecord({
    id: "cs_nango_1",
    payment_status: "paid",
    status: "complete",
    amount_total: 2900,
    created: 1_700_000_000,
    metadata: { kitId: "ready-ash-cow", kitName: "Ash Cow" },
  });
  assert.equal(sale?.id, "cs_nango_1");
  assert.equal(sale?.amount, 29);
  assert.equal(sale?.kitId, "ready-ash-cow");
  assert.equal(saleFromCheckoutRecord({ id: "cs_open", payment_status: "unpaid" }), null);
});

test("Nango HMAC rejects a tampered body", () => {
  const signingKey = "nango-webhook-test-key";
  const nango = new Nango({ secretKey: "unused", webhookSigningKey: signingKey });
  const body = JSON.stringify({
    type: "sync",
    success: true,
    syncName: "checkout-sessions",
    model: "CheckoutSession",
  });
  const sig = createHmac("sha256", signingKey).update(body).digest("hex");
  assert.equal(
    nango.verifyIncomingWebhookRequest(body, { "x-nango-hmac-sha256": sig }),
    true,
  );
  assert.equal(
    nango.verifyIncomingWebhookRequest(body + " ", { "x-nango-hmac-sha256": sig }),
    false,
  );
  assert.equal(nango.verifyIncomingWebhookRequest(body, {}), false);
});
