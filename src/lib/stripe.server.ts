import Stripe from "stripe";
import { getRequest } from "@tanstack/react-start/server";

export function stripeSecrets() {
  const secret = process.env.STRIPE_SECRET_KEY?.trim() ?? "";
  const webhook = process.env.STRIPE_WEBHOOK_SECRET?.trim() ?? "";
  return {
    secret,
    webhook,
    checkoutReady: secret.length > 0,
    webhookReady: webhook.length > 0,
  };
}

export function getStripe() {
  const { secret } = stripeSecrets();
  if (!secret) return null;
  return new Stripe(secret);
}

export function publicOrigin() {
  const request = getRequest();
  const url = new URL(request.url);
  const proto = request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? url.host;
  return `${proto}://${host}`;
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
