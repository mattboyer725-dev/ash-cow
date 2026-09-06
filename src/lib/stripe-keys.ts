export type StripeKeyKind =
  | "empty"
  | "secret_test"
  | "secret_live"
  | "restricted_test"
  | "restricted_live"
  | "publishable"
  | "webhook"
  | "invalid";

export type StripeMode = "off" | "test" | "live" | "invalid";

export function classifyStripeValue(raw: string | undefined | null): StripeKeyKind {
  const value = raw?.trim() ?? "";
  if (!value) return "empty";
  if (value.startsWith("whsec_")) return "webhook";
  if (value.startsWith("pk_test_") || value.startsWith("pk_live_")) return "publishable";
  if (value.startsWith("sk_test_")) return "secret_test";
  if (value.startsWith("sk_live_")) return "secret_live";
  if (value.startsWith("rk_test_")) return "restricted_test";
  if (value.startsWith("rk_live_")) return "restricted_live";
  return "invalid";
}

export function isCheckoutSecret(kind: StripeKeyKind) {
  return (
    kind === "secret_test" ||
    kind === "secret_live" ||
    kind === "restricted_test" ||
    kind === "restricted_live"
  );
}

export function stripeModeFromKind(kind: StripeKeyKind): StripeMode {
  if (kind === "empty") return "off";
  if (kind === "secret_test" || kind === "restricted_test") return "test";
  if (kind === "secret_live" || kind === "restricted_live") return "live";
  return "invalid";
}

export type StripeSecretReport = {
  checkoutReady: boolean;
  webhookReady: boolean;
  mode: StripeMode;
  secretKind: StripeKeyKind;
  webhookKind: StripeKeyKind;
  leakedToClient: boolean;
};

/** Classify env without returning the secret material. */
export function inspectStripeEnv(env: {
  secret?: string;
  webhook?: string;
  viteSecret?: string;
  viteWebhook?: string;
}): StripeSecretReport {
  const leakedToClient = Boolean(env.viteSecret?.trim() || env.viteWebhook?.trim());
  const secretKind = classifyStripeValue(env.secret);
  const webhookKind = classifyStripeValue(env.webhook);
  return {
    checkoutReady: !leakedToClient && isCheckoutSecret(secretKind),
    webhookReady: !leakedToClient && webhookKind === "webhook",
    mode: leakedToClient ? "invalid" : stripeModeFromKind(secretKind),
    secretKind,
    webhookKind,
    leakedToClient,
  };
}
