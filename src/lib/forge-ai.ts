import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { forgeLocal } from "./forge-local";
import { launchHours } from "./hours";
import type { CashCow, ForgeInput } from "./types";
import { uid } from "./utils";

const pageSchema = z.object({
  heading: z.string(),
  body: z.string(),
});

const aiKitSchema = z.object({
  name: z.string().min(2).max(40),
  oneLiner: z.string().min(8),
  promise: z.string().min(8),
  who: z.string().min(4),
  outcome: z.string().min(4),
  gumroadTitle: z.string().min(4),
  gumroadTags: z.array(z.string()).min(2).max(8),
  coverPrompt: z.string().min(20),
  objections: z
    .array(z.object({ objection: z.string(), reply: z.string() }))
    .min(3)
    .max(6),
  salesPage: z.object({
    headline: z.string(),
    subhead: z.string(),
    problem: z.string(),
    mechanism: z.string(),
    whatYouGet: z.array(z.string()).min(3).max(8),
    forWhom: z.string(),
    notFor: z.string(),
    guarantee: z.string(),
    cta: z.string(),
  }),
  posts: z.array(z.object({ channel: z.string(), copy: z.string() })).min(3).max(6),
  deliveryDoc: z.object({
    title: z.string(),
    subtitle: z.string(),
    pages: z.array(pageSchema).min(6).max(12),
  }),
});

const inputSchema = z.object({
  skill: z.string().min(2).max(200),
  buyer: z.string().min(2).max(200),
  delivery: z.string().min(2).max(400),
  price: z.number().min(9).max(99),
});

function stripFence(text: string) {
  return text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
}

function mergeAi(input: ForgeInput, parsed: z.infer<typeof aiKitSchema>): CashCow {
  const local = forgeLocal(input);
  const name = parsed.name.trim();
  return {
    ...local,
    id: uid("cow"),
    createdAt: new Date().toISOString(),
    source: "forge",
    name,
    oneLiner: parsed.oneLiner.trim(),
    promise: parsed.promise.trim(),
    who: parsed.who.trim(),
    outcome: parsed.outcome.trim(),
    gumroadTitle: parsed.gumroadTitle.trim(),
    gumroadTags: parsed.gumroadTags.map((t) => t.trim()).filter(Boolean),
    coverPrompt: parsed.coverPrompt.trim(),
    objections: parsed.objections,
    salesPage: parsed.salesPage,
    posts: parsed.posts,
    deliveryDoc: parsed.deliveryDoc,
    hours: launchHours(name, input.price),
  };
}

export const forgeCow = createServerFn({ method: "POST" })
  .validator((raw: ForgeInput) => inputSchema.parse(raw))
  .handler(async ({ data }) => {
    const fallback = forgeLocal(data);
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return { ok: true as const, cow: fallback, via: "local" as const };
    }

    const system = `You are a product editor. Package a small digital product that can be written in an afternoon and sold in 24 hours.

Rules:
- Name: 1–3 words, title case, memorable, no puns that need explaining, no "AI" in the name.
- Voice: dry, specific, adult. No hype, no emoji, no "unlock", no "journey", no "game-changer".
- Price is given. Do not change it.
- Delivery pages must be actually usable instruction (templates, scripts, steps), not motivational filler. 8–10 pages. Each body 80–160 words.
- Sales page: one headline that names the buyer and the outcome. Guarantee is 7 days.
- Posts: X, Caption, Thread, Honest DM — ready to paste, with a placeholder for the link.
- Cover prompt: square listing thumbnail, dark still photography, huge serif title matching the product name.
- Return ONLY valid JSON matching the schema. No markdown.`;

    const user = JSON.stringify({
      skill: data.skill,
      buyer: data.buyer,
      delivery: data.delivery,
      price: data.price,
      schema: {
        name: "string",
        oneLiner: "string",
        promise: "string",
        who: "string",
        outcome: "string",
        gumroadTitle: "string",
        gumroadTags: ["string"],
        coverPrompt: "string",
        objections: [{ objection: "string", reply: "string" }],
        salesPage: {
          headline: "string",
          subhead: "string",
          problem: "string",
          mechanism: "string",
          whatYouGet: ["string"],
          forWhom: "string",
          notFor: "string",
          guarantee: "string",
          cta: "string",
        },
        posts: [{ channel: "string", copy: "string" }],
        deliveryDoc: {
          title: "string",
          subtitle: "string",
          pages: [{ heading: "string", body: "string" }],
        },
      },
    });

    try {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-4.5",
          temperature: 0.7,
          max_tokens: 3500,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
      });
      if (!res.ok) {
        return { ok: true as const, cow: fallback, via: "local" as const };
      }
      const body = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const text = stripFence(body.choices?.[0]?.message?.content ?? "");
      const parsed = aiKitSchema.safeParse(JSON.parse(text));
      if (!parsed.success) {
        return { ok: true as const, cow: fallback, via: "local" as const };
      }
      return { ok: true as const, cow: mergeAi(data, parsed.data), via: "grok" as const };
    } catch {
      return { ok: true as const, cow: fallback, via: "local" as const };
    }
  });
