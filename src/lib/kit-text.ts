import type { CashCow } from "./types";
import { money } from "./utils";
import { salesPageText } from "./copy";

export function listingText(cow: CashCow) {
  return [
    cow.gumroadTitle,
    "",
    cow.salesPage.subhead,
    "",
    cow.salesPage.problem,
    "",
    cow.salesPage.mechanism,
    "",
    "What you get",
    ...cow.salesPage.whatYouGet.map((item) => `• ${item}`),
    "",
    `Price: ${money(cow.price)}`,
    `Tags: ${cow.gumroadTags.join(", ")}`,
  ].join("\n");
}

export function postsText(cow: CashCow) {
  return cow.posts.map((post) => `— ${post.channel} —\n${post.copy}`).join("\n\n");
}

export function deliveryText(cow: CashCow) {
  return [
    cow.deliveryDoc.title,
    cow.deliveryDoc.subtitle,
    "",
    ...cow.deliveryDoc.pages.flatMap((page, i) => [
      `${i + 1}. ${page.heading}`,
      page.body,
      "",
    ]),
  ].join("\n");
}

export function objectionsText(cow: CashCow) {
  return cow.objections
    .map((row) => `Q: ${row.objection}\nA: ${row.reply}`)
    .join("\n\n");
}

export function coverPromptText(cow: CashCow) {
  return cow.coverPrompt;
}

export function kitMarkdown(cow: CashCow) {
  return [
    `# ${cow.name}`,
    cow.oneLiner,
    "",
    `Price: ${money(cow.price)}`,
    `For: ${cow.who}`,
    `Promise: ${cow.promise}`,
    "",
    "## Sales page",
    salesPageText(cow.salesPage),
    "",
    "## Listing",
    listingText(cow),
    "",
    "## Cover prompt",
    cow.coverPrompt,
    "",
    "## Objections",
    objectionsText(cow),
    "",
    "## Posts",
    postsText(cow),
    "",
    "## Delivery",
    deliveryText(cow),
    "",
    "## 24-hour clock",
    ...cow.hours.map((beat) => `Hour ${beat.hour} — ${beat.title}\n${beat.task}`),
  ].join("\n");
}
