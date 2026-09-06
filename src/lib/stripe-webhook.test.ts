import assert from "node:assert/strict";
import { test } from "node:test";
import Stripe from "stripe";
import { handleStripeEvent, saleFromSession } from "./stripe-events.ts";

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
