import Stripe from "stripe";
import { getRequest } from "@tanstack/react-start/server";
import { inspectStripeEnv, type StripeSecretReport } from "./stripe-keys.ts";

export function stripeSecrets(): StripeSecretReport & { secret: string; webhook: string } {
  const secret = process.env.STRIPE_SECRET_KEY?.trim() ?? "";
  const webhook = process.env.STRIPE_WEBHOOK_SECRET?.trim() ?? "";
  const report = inspectStripeEnv({
    secret,
    webhook,
    viteSecret: process.env.VITE_STRIPE_SECRET_KEY,
    viteWebhook: process.env.VITE_STRIPE_WEBHOOK_SECRET,
  });
  return {
    ...report,
    secret: report.checkoutReady ? secret : "",
    webhook: report.webhookReady ? webhook : "",
  };
}

export function getStripe() {
  const { secret, checkoutReady } = stripeSecrets();
  if (!checkoutReady || !secret) return null;
  return new Stripe(secret);
}

function firstHeader(value: string | null | undefined) {
  return value?.split(",")[0]?.trim() ?? "";
}

/** Canonical http(s) origin. Empty string if the value is not a URL. */
export function cleanOrigin(value: string | null | undefined) {
  const raw = value?.trim() ?? "";
  if (!raw) return "";
  try {
    const url = new URL(raw.includes("://") ? raw : `https://${raw}`);
    if (url.protocol !== "https:" && url.protocol !== "http:") return "";
    return `${url.protocol}//${url.host}`;
  } catch {
    return "";
  }
}

export function resolvePublicOrigin(opts: {
  envOrigin?: string | null;
  originHeader?: string | null;
  forwardedProto?: string | null;
  forwardedHost?: string | null;
  host?: string | null;
  url?: string | null;
  passedOrigin?: string | null;
}) {
  const fromEnv = cleanOrigin(opts.envOrigin);
  if (fromEnv) return fromEnv;

  const fromHeader = cleanOrigin(opts.originHeader);
  if (fromHeader) return fromHeader;

  const fromPassed = cleanOrigin(opts.passedOrigin);
  if (fromPassed) return fromPassed;

  let parsed: URL | null = null;
  if (opts.url) {
    try {
      parsed = new URL(opts.url);
    } catch {
      parsed = null;
    }
  }

  const proto =
    firstHeader(opts.forwardedProto) || parsed?.protocol.replace(":", "") || "https";
  const host = firstHeader(opts.forwardedHost) || firstHeader(opts.host) || parsed?.host || "";
  return cleanOrigin(`${proto}://${host}`);
}

export function publicOrigin(passedOrigin?: string | null) {
  const envOrigin = process.env.PUBLIC_ORIGIN;
  const fromEnv = cleanOrigin(envOrigin);
  if (fromEnv) return fromEnv;

  let originHeader: string | null = null;
  let forwardedProto: string | null = null;
  let forwardedHost: string | null = null;
  let host: string | null = null;
  let url: string | null = null;
  try {
    const request = getRequest();
    originHeader = request.headers.get("origin");
    forwardedProto = request.headers.get("x-forwarded-proto");
    forwardedHost = request.headers.get("x-forwarded-host");
    host = request.headers.get("host");
    url = request.url;
  } catch {
    // Server fns without a request still accept a passed Origin.
  }

  const resolved = resolvePublicOrigin({
    envOrigin,
    originHeader,
    forwardedProto,
    forwardedHost,
    host,
    url,
    passedOrigin,
  });
  if (resolved) return resolved;
  throw new Error("Cannot resolve public origin. Set PUBLIC_ORIGIN.");
}

export function railsWebhookUrls(origin: string) {
  const base = cleanOrigin(origin);
  return {
    origin: base,
    stripeWebhook: `${base}/api/stripe/webhook`,
    nangoWebhook: `${base}/api/nango/webhook`,
  };
}

export function verifyWebhook(rawBody: string, signature: string | null) {
  const { webhook } = stripeSecrets();
  if (!webhook) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not set.");
  }
  if (!signature) {
    throw new Error("Missing Stripe-Signature header.");
  }
  const stripe = getStripe();
  if (!stripe) {
    throw new Error("STRIPE_SECRET_KEY is not set.");
  }
  return stripe.webhooks.constructEvent(rawBody, signature, webhook);
}
