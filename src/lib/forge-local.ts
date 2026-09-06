import { launchHours } from "./hours";
import type { CashCow, DeliveryPage, ForgeInput } from "./types";
import { uid } from "./utils";

const STOP = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "from",
  "your",
  "you",
  "are",
  "who",
  "how",
  "into",
  "about",
  "their",
  "them",
  "then",
  "than",
  "just",
  "have",
  "has",
  "been",
  "will",
  "can",
  "not",
  "but",
  "use",
  "using",
  "make",
  "making",
]);

const OBJECTS = [
  "Kit",
  "Card",
  "Lock",
  "Note",
  "Draft",
  "Close",
  "Offer",
  "Page",
  "Ledger",
  "Brief",
  "Gate",
  "Mark",
];

function hash(s: string) {
  let n = 0;
  for (let i = 0; i < s.length; i++) n = (n * 31 + s.charCodeAt(i)) >>> 0;
  return n;
}

function wordsOf(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
}

function cap(w: string) {
  return w.charAt(0).toUpperCase() + w.slice(1);
}

function nameFrom(skill: string, buyer: string) {
  const hay = `${skill} ${buyer}`.toLowerCase();
  if (/price|rate|charg|fee|invoice/.test(hay)) return "Rate Lock";
  if (/email|inbox|cold|outreach/.test(hay)) return "Quiet Close";
  if (/resume|cv|linkedin|job search/.test(hay)) return "One Page";
  if (/offer|sales page|landing/.test(hay)) return "Offer Page";
  if (/habit|morning|routine/.test(hay)) return "Dawn List";
  if (/portfolio|case study/.test(hay)) return "Field Book";
  if (/notion|template/.test(hay)) return "Stall File";
  if (/copy|headline/.test(hay)) return "Soft Gate";
  const words = wordsOf(skill);
  const first = cap(words[0] ?? "field");
  const obj = OBJECTS[hash(skill + buyer) % OBJECTS.length];
  return `${first} ${obj}`;
}

function clampPrice(n: number) {
  if (!Number.isFinite(n)) return 29;
  return Math.min(99, Math.max(9, Math.round(n)));
}

function pagesFor(input: ForgeInput, name: string, price: number): DeliveryPage[] {
  const skill = input.skill.trim();
  const buyer = input.buyer.trim();
  const delivery = input.delivery.trim();
  const p = `$${price}`;

  return [
    {
      heading: "What this is",
      body: `${name} is a short digital product for ${buyer}. It exists so you can stop explaining ${skill} in custom calls and start handing people a file. The file is ${delivery}. The price is ${p}. You write it once. You sell the same object for as long as the problem exists.`,
    },
    {
      heading: "Who it is for",
      body: `A person who already does the work, or is about to, and is tired of assembling the method from tweets and memory. ${buyer} will buy this if the first page names their situation without flattery. Do not write for “anyone who wants to get better.” Write for the person who would pay ${p} tonight to skip a week of wandering.`,
    },
    {
      heading: "The promise, in one sentence",
      body: `After they read this file they can do the next ${skill} task without inventing the structure. That is the whole product. If a page does not move them toward that, cut it. Examples beat theory. Names and numbers beat adjectives.`,
    },
    {
      heading: "How to fill the file",
      body: `Open a document. Paste these headings. Under each one, write the version you would actually send a client or a friend — not the version that would impress a conference. Replace every “example” with a real name from your world. Target length: short enough to finish in an evening, long enough that a buyer would not call it a tweet thread.`,
    },
    {
      heading: "The working pages",
      body: `Page 1: the situation, in their words. Page 2: the rule you want them to follow. Page 3–6: the actual ${delivery}, with blanks they can copy. Page 7: what to do when it fails the first time. Page 8: a one-week plan so the file does not die in downloads. Keep the language they already use. If you would not say it out loud, do not print it.`,
    },
    {
      heading: "A worked example",
      body: `Take one real case of ${skill}. Write what they started with, what you told them, and what changed. Then strip the story until a stranger can reuse the moves. This example is the product. The rest of the file is packaging around it. If you do not have a case, invent one from a composite — but mark the numbers as illustrative and keep them plausible.`,
    },
    {
      heading: "How they use it tomorrow morning",
      body: `Tell them the first 25 minutes. Open the file. Copy the first template. Send or ship it before lunch. ${name} is not a course and not a community. It is a thing they finish. If they need a tool, name a free one. If they need courage, give them the sentence to send, not a pep talk.`,
    },
    {
      heading: "When nobody buys",
      body: `The product is still finished. Change the headline, not the file. Send it to ten people who already trust you, once. Ask what they would have paid for. If three of them say the same missing page, add that page. Do not rebuild the brand. Do not add a module. ${p} is cheap enough that a clear page beats a funnel.`,
    },
    {
      heading: "When somebody buys",
      body: `Send the file within an hour. One sentence: here it is, start on page 1. If they write back with a question, answer it and, if the answer is reusable, add it to page 7 in the next revision. Log the sale. That log is how you know the cow is a cow and not a hobby.`,
    },
    {
      heading: "License of use",
      body: `The buyer may use ${name} in their own work. They may not resell the file, rebrand it, or run it as a workshop without a separate deal. You may update the file and send the new version to anyone who already paid. Keep the promise stable even if the examples change.`,
    },
  ];
}

export function forgeLocal(input: ForgeInput, source: "forge" | "ready" = "forge"): CashCow {
  const skill = input.skill.trim() || "a skill you already have";
  const buyer = input.buyer.trim() || "people who will pay to skip the wandering";
  const delivery = input.delivery.trim() || "a short file they can use tomorrow morning";
  const price = clampPrice(input.price);
  const name = nameFrom(skill, buyer);
  const who = buyer;
  const outcome = `a finished way to handle ${skill} without starting from zero`;
  const oneLiner = `${name} is a ${price}-dollar file that gives ${who} ${delivery}.`;
  const promise = `Finish the next ${skill} job with a structure you did not have to invent.`;
  const pages = pagesFor({ skill, buyer, delivery, price }, name, price);

  return {
    id: uid("cow"),
    createdAt: new Date().toISOString(),
    source,
    skill,
    buyer,
    seedDelivery: delivery,
    price,
    name,
    oneLiner,
    promise,
    who,
    outcome,
    gumroadTitle: `${name} — ${delivery.replace(/\.$/, "")}`,
    gumroadTags: ["digital download", "templates", "indie", skill.split(" ")[0] ?? "work"],
    coverPrompt: `Square listing cover, 1:1. Dark timber barn interior, near-black field #0c0b0a, a single pale subject in dusty side light. Huge paper-white serif lettering in the center reading "${name}", smaller line underneath "${price} digital file". No neon, no purple, no collage, no cartoon cow unless the name demands it. Editorial, still, like a gallery card.`,
    objections: [
      {
        objection: "I could just Google this.",
        reply: `You could. This is the version already assembled for ${buyer}, with the blanks filled and the order decided. You are paying to skip the tab pile.`,
      },
      {
        objection: "Why isn't this a course?",
        reply: "Because a course is a place to stall. This is a file you finish. If you need a lecture, this is the wrong stall.",
      },
      {
        objection: "Can I get a refund?",
        reply: `Yes, for 7 days, no form. If the file is not useful, you should not keep it. If you used it, keep it.`,
      },
      {
        objection: "Is this just ChatGPT output?",
        reply: "The kit was drafted fast on purpose. You replace every example with your names and numbers before you list it. If you ship it raw, that is on you.",
      },
    ],
    salesPage: {
      headline: `A ${price}-dollar file for ${buyer} who are done assembling ${skill} from memory.`,
      subhead: oneLiner,
      problem: `The work is not mysterious. The structure is. ${buyer} keep rebuilding ${skill} in half-finished notes, then charging too little or stalling. That is expensive in hours, which is the only inventory you have.`,
      mechanism: `${name} is ${delivery}. You download it, copy the first page, and use it on a live piece of work before the day is over. No community. No modules. A file.`,
      whatYouGet: [
        `The ${name} document (the thing they paid for)`,
        "Worked examples with blanks you fill from your world",
        "A first-25-minutes plan so it does not sit in downloads",
        "The sentences to send when the work gets awkward",
        "A one-week loop for when the first attempt is messy",
      ],
      forWhom: who,
      notFor: "People hunting a guru, a community, or a 12-week transformation.",
      guarantee: "7 days. If the file is not useful, say so and the money comes back.",
      cta: `Get ${name} — ${price} dollars.`,
    },
    hours: launchHours(name, price),
    posts: [
      {
        channel: "X",
        copy: `I made ${name}: ${delivery} for ${buyer}. ${price} dollars. Listed tonight. If you are the person it is for, the link is in the reply.`,
      },
      {
        channel: "Caption",
        copy: `${name} is a small digital file for ${buyer}.\n\nWhat you get: ${delivery}.\nWhat you do not get: a community, a call, a brand.\n\n${price}. Link in bio / first comment.`,
      },
      {
        channel: "Thread",
        copy: `1/ Most of ${skill} advice is a pile of tabs.\n2/ ${buyer} do not need more tabs. They need a file they can copy tomorrow morning.\n3/ ${name} is that file. ${delivery}.\n4/ ${price}. If it is not useful, you get the money back in 7 days.\n5/ Link below. If you are not the buyer, ignore this.`,
      },
      {
        channel: "Honest DM",
        copy: `I made a small paid file last night called ${name}. It is ${delivery} for ${buyer}. If that is useful, here is the link. If not, ignore — no follow-up.`,
      },
    ],
    deliveryDoc: {
      title: name,
      subtitle: `${delivery} for ${buyer}. ${price} dollars.`,
      pages,
    },
  };
}
