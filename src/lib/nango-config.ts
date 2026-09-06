export const CHECKOUT_SESSIONS_SYNC = {
  name: "checkout-sessions",
  model: "CheckoutSession",
  frequency: "every hour",
  autoStart: true,
  endpoint: "POST /syncs/checkout-sessions",
} as const;

export const STRIPE_SYNC_CATALOG = [
  CHECKOUT_SESSIONS_SYNC,
  { name: "customers", model: "Customer", frequency: "every hour", autoStart: true },
  { name: "invoices", model: "Invoice", frequency: "every hour", autoStart: true },
  { name: "payment-intents", model: "PaymentIntent", frequency: "every hour", autoStart: true },
  { name: "refunds", model: "Refund", frequency: "every hour", autoStart: true },
  { name: "subscriptions", model: "Subscription", frequency: "every hour", autoStart: true },
] as const;
