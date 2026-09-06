import assert from "node:assert/strict";
import { test } from "node:test";
import Stripe from "stripe";
import { handleStripeEvent, refundRefOf, saleFromSession } from "./stripe-events.ts";
import { cleanOrigin, railsWebhookUrls, resolvePublicOrigin } from "./stripe.server.ts";

test("saleFromSession only accepts paid sessions with kitId", () => {
  const paid = saleFromSession({
    id: "cs_test_1",
    payment_status: "paid",
    status: "complete",
    amount_total: 2900,
    created: 1_700_000_000,
    metadata: { kitId: "ready-ash-cow" },
  });
  assert.deepEqual(paid, {
    id: "cs_test_1",
    kitId: "ready-ash-cow",
    amount: 29,
    at: new Date(1_700_000_000 * 1000).toISOString(),
    source: "stripe",
  });

  assert.equal(
    saleFromSession({
      id: "cs_unpaid",
      payment_status: "unpaid",
      status: "open",
      amount_total: 2900,
      metadata: { kitId: "ready-ash-cow" },
    }),
    null,
  );
});

test("constructEvent rejects a tampered payload", () => {
  const secret = "whsec_test_secret";
  const payload = JSON.stringify({
    id: "evt_1",
    object: "event",
    type: "checkout.session.completed",
    created: 1_700_000_000,
    data: { object: { id: "cs_test_1" } },
  });
  const header = Stripe.webhooks.generateTestHeaderString({ payload, secret });
  const event = Stripe.webhooks.constructEvent(payload, header, secret);
  assert.equal(event.id, "evt_1");
  assert.throws(() => Stripe.webhooks.constructEvent(payload + " ", header, secret));
});

test("checkout.session.completed yields a paid notice", () => {
  const notice = handleStripeEvent({
    id: "evt_paid",
    type: "checkout.session.completed",
    created: 1_700_000_000,
    data: {
      object: {
        id: "cs_test_1",
        payment_status: "paid",
        status: "complete",
        amount_total: 2900,
        created: 1_700_000_000,
        metadata: { kitId: "ready-ash-cow" },
      },
    },
  });
  assert.equal(notice.ok, true);
  assert.equal(notice.amount, 29);
  assert.equal(notice.kitId, "ready-ash-cow");
});

test("charge.refunded yields a refund notice", () => {
  const notice = handleStripeEvent({
    id: "evt_ref",
    type: "charge.refunded",
    created: 1_700_000_100,
    data: { object: { id: "ch_1", payment_intent: "pi_1" } },
  });
  assert.equal(notice.ok, true);
  assert.match(notice.detail, /pi_1/);
  assert.equal(refundRefOf({ payment_intent: "pi_1" }), "pi_1");
});

test("cleanOrigin strips path and trailing slash", () => {
  assert.equal(cleanOrigin("https://ash.example.com/till/"), "https://ash.example.com");
  assert.equal(cleanOrigin("ash.example.com"), "https://ash.example.com");
  assert.equal(cleanOrigin("javascript:alert(1)"), "");
  assert.equal(cleanOrigin(""), "");
});

test("resolvePublicOrigin prefers PUBLIC_ORIGIN then Origin header", () => {
  assert.equal(
    resolvePublicOrigin({
      envOrigin: "https://barn.example.com/",
      originHeader: "https://preview.example.com",
      host: "internal:8080",
      url: "http://internal:8080/till",
      passedOrigin: "http://localhost:8080",
    }),
    "https://barn.example.com",
  );

  assert.equal(
    resolvePublicOrigin({
      originHeader: "https://preview.example.com",
      host: "internal:8080",
      url: "http://internal:8080/till",
      passedOrigin: "http://localhost:8080",
    }),
    "https://preview.example.com",
  );

  assert.equal(
    resolvePublicOrigin({
      host: "internal:8080",
      forwardedProto: "https, http",
      forwardedHost: "ash.example.com, localhost",
      url: "http://internal:8080/till",
    }),
    "https://ash.example.com",
  );

  assert.equal(
    resolvePublicOrigin({
      passedOrigin: "http://localhost:8080",
      url: "http://127.0.0.1:8080/",
    }),
    "http://localhost:8080",
  );
});

test("railsWebhookUrls uses this deploy origin", () => {
  assert.deepEqual(railsWebhookUrls("https://ash.example.com/"), {
    origin: "https://ash.example.com",
    stripeWebhook: "https://ash.example.com/api/stripe/webhook",
    nangoWebhook: "https://ash.example.com/api/nango/webhook",
  });
});
