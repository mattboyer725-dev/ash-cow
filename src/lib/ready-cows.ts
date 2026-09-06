import { launchHours } from "./hours";
import type { CashCow } from "./types";

function stamp(cow: Omit<CashCow, "hours">): CashCow {
  return { ...cow, hours: launchHours(cow.name, cow.price) };
}

export const READY_COWS: CashCow[] = [
  stamp({
    id: "ready-ash-cow",
    createdAt: "2026-01-01T00:00:00.000Z",
    source: "ready",
    skill: "shipping a small digital product in one day",
    buyer: "people with a real skill who have never listed anything",
    seedDelivery:
      "a 10-page launch kit: name, sales page, listing copy, posts, and a 24-hour clock",
    price: 29,
    name: "Ash Cow",
    oneLiner:
      "A figurative cash cow: name a digital product, write the file, list it tonight, and run a 24-hour clock until someone pays — or until you still have a product.",
    promise: "Walk into tomorrow with a named product for sale, not another idea.",
    who: "people who can already do the work and keep waiting for a brand",
    outcome: "a listed digital product and a day of honest distribution",
    gumroadTitle: "Ash Cow — the 24-hour cash cow kit",
    gumroadTags: ["digital download", "solopreneur", "gumroad", "launch"],
    coverPrompt:
      "Square 1:1 listing cover. Dark timber barn, near-black, a single pale cow in dusty side light. Centered paper-white serif lettering: \"ASH COW\". Smaller line: \"A 24-hour cash cow kit\". Editorial still. No neon, no cartoon, no collage.",
    objections: [
      {
        objection: "This is just a pep talk.",
        reply:
          "It is a file: a named product, a sales page, listing copy, posts, and a clock. If you wanted motivation, this is the wrong stall.",
      },
      {
        objection: "I need an audience first.",
        reply:
          "You need ten people who already trust you. The kit assumes that. If you have zero, it still leaves you with a product. The audience problem is separate and slower.",
      },
      {
        objection: "Why would anyone pay $29 for this?",
        reply:
          "Because assembling a listing, a page, and a day-plan from scratch takes a Saturday. This is the Saturday, already spent.",
      },
      {
        objection: "Can I refund?",
        reply: "Seven days. No form. If the file is not useful, you should not keep it.",
      },
    ],
    salesPage: {
      headline: "A cash cow you can list tonight.",
      subhead:
        "Name a digital product. Write the file. Post the page. Keep a 24-hour clock running until someone pays, or until the day ends and you still own a product.",
      problem:
        "A cash cow, in the old sense, is a product you build once that keeps paying. Most people never get the first one out because they keep polishing a company. The hours disappear into names, decks, and almost-ready pages.",
      mechanism:
        "Ash Cow is a short kit that forces the object into existence: a name, a price, a sales page, a delivery document, listing copy, four posts, and a 24-hour sequence. You fill it with your skill. You list it where money already moves. You tell ten people. Then you count.",
      whatYouGet: [
        "The 10-page Ash Cow document (print or PDF)",
        "A fill-in sales page that is allowed to be one screen long",
        "Gumroad / Lemon Squeezy listing block and cover prompt",
        "Four posts and a 10-message script",
        "A 24-hour clock with one job per beat",
        "A barn log so a sale is a fact, not a feeling",
      ],
      forWhom:
        "People with a skill they have already been paid for — or could be — who have never listed a simple digital product.",
      notFor:
        "Anyone building a venture, a community, or a personal brand as the product.",
      guarantee:
        "7 days. If the kit does not leave you with a file you would send, the money comes back.",
      cta: "Get Ash Cow — $29.",
    },
    posts: [
      {
        channel: "X",
        copy: "Ash Cow is a $29 kit for shipping a digital product in 24 hours. Name, page, file, posts, clock. Not a course. Link in the reply.",
      },
      {
        channel: "Caption",
        copy: "A cash cow is a product you build once that keeps paying.\n\nAsh Cow is a figurative one: a named digital good, a sales page, and a 24-hour clock.\n\n$29. File, not a funnel.",
      },
      {
        channel: "Thread",
        copy: "1/ You do not have a company problem. You have a “never listed anything” problem.\n2/ Pick a skill you have already been paid for.\n3/ Name a $19–$49 file. Write it tonight.\n4/ Ash Cow is the kit for that day.\n5/ $29. Link below.",
      },
      {
        channel: "Honest DM",
        copy: "I listed a small kit called Ash Cow — it is a 24-hour plan for shipping a digital product. $29. If that is useful, here is the link. If not, ignore.",
      },
    ],
    deliveryDoc: {
      title: "Ash Cow",
      subtitle: "A 24-hour kit for a figurative cash cow.",
      pages: [
        {
          heading: "A cash cow is an object",
          body: "In the old business sense, a cash cow is a product that prints money after the building is done. This kit is figurative: it will not graze, and it will not guarantee a sale. It will force a named digital product into the world in one day. That is the only trick. Companies stall. Files ship.",
        },
        {
          heading: "The 24-hour rule",
          body: "You get one day. Hour 0 you name and price it. Hour 1–3 you write the file. Hour 4 you list it. Hour 6 you post. Hour 8 you message ten people who already know you. Hour 23 you count. You may not add a logo, a community, or a waitlist. If a task is not on the clock, it is vanity.",
        },
        {
          heading: "Pick a buyer who already has money",
          body: "Not “anyone who wants freedom.” A person who has paid for adjacent help in the last year. Freelance designer. Staff engineer who invoices on the side. Agency junior who undercharges. Write their job and their Tuesday. If you cannot picture the Tuesday, you do not have a buyer.",
        },
        {
          heading: "Name and price in one sitting",
          body: "Two words, maybe three. A name you can say on a call without explaining the myth. Price: $19, $27, $29, or $39. Not $7 (they will not trust it) and not $199 (you will not finish the file). Write one sentence: who it is for, what they walk away with. If you cannot say it in one breath, shorten it.",
        },
        {
          heading: "Write the file, not the brand",
          body: "Open a document. Ten pages is plenty. Page 1 is the situation. Pages 2–7 are the actual templates, scripts, or checklists. Page 8 is failure. Page 9 is the first morning. Page 10 is how they may use it. Fill every example with your names and numbers. Export PDF. That PDF is the product. The brand can wait until someone pays.",
        },
        {
          heading: "The sales page (one screen)",
          body: "Headline that names the buyer and the outcome. Two paragraphs: the problem as they would say it, then what the file is. A list of five things inside. For / not for. A 7-day refund in one line. One button. No founder story, no logos of companies you once consulted for, no FAQ that repeats the page.",
        },
        {
          heading: "List it where money already moves",
          body: "Gumroad or Lemon Squeezy. Type: digital. Price: the number you locked. Title and description from this kit. Upload the PDF. Publish. Copy the public URL into a note. Do not build a site. Do not connect a custom domain. The listing is the store.",
        },
        {
          heading: "Ten honest messages",
          body: "Send the product to ten people who already trust you: former coworkers, a group chat, two clients, a classmate. Plain text. “I made this last night. If it is useful, here is the link. If not, ignore.” No funnel, no scarcity, no “looping back.” Then stop. Two rooms you already belong to are enough for the first day. If a room bans links, offer to DM the URL.",
        },
        {
          heading: "When nobody buys",
          body: "The product still exists. That is already more than yesterday. Change the headline tomorrow, not the whole file. Ask one of the ten what they expected. If three people name the same missing page, add that page. Do not start a second product until this one has been seen by humans.",
        },
        {
          heading: "When somebody buys",
          body: "Send the file within an hour. One sentence. Log the sale in the barn with the amount and the time. Reply to questions; if the answer is reusable, put it in the next revision. A cash cow, even a figurative one, is a product that can be sold again without you rebuilding it. Protect that.",
        },
      ],
    },
  }),
  stamp({
    id: "ready-rate-lock",
    createdAt: "2026-01-01T00:00:00.000Z",
    source: "ready",
    skill: "pricing freelance work without shrinking the number",
    buyer: "independent designers and developers who undercharge",
    seedDelivery: "a one-page rate card, a floor, and five scripts for saying the number",
    price: 19,
    name: "Rate Lock",
    oneLiner:
      "A one-page pricing system for independents who already do the work and still send a smaller number than they meant to.",
    promise: "Say a number you can live with, on the next inquiry, without a pep talk.",
    who: "designers, developers, and writers who invoice as themselves",
    outcome: "a rate card, a floor, and the sentences to send",
    gumroadTitle: "Rate Lock — stop undercharging on the next inquiry",
    gumroadTags: ["freelance", "pricing", "templates", "digital download"],
    coverPrompt:
      "Square 1:1 cover. Dark oak desk, a single cream rate card in a pool of lamp light. Huge serif type: \"RATE LOCK\". Smaller: \"$19 — a floor and five scripts\". Quiet, still, no gold coins, no rockets.",
    objections: [
      {
        objection: "I already know I undercharge.",
        reply: "Knowing is not a card. This is the card, the floor, and the email. Use it on the next inquiry.",
      },
      {
        objection: "My market will not pay that.",
        reply:
          "Then you have a buyer problem, not a price problem. The kit still gives you a floor so you stop taking the work that teaches people you are cheap.",
      },
      {
        objection: "Is this just “charge more”?",
        reply: "No. It is a written number, a public-enough card, and scripts for the five moments the number usually dies.",
      },
    ],
    salesPage: {
      headline: "The number is a decision. Write it down before the inquiry arrives.",
      subhead:
        "Rate Lock is a one-page card, a floor you will not go under, and five scripts for saying the number without shrinking it.",
      problem:
        "You do the work. Then the email comes. You type a number, look at it, and cut it by a third because the silence feels expensive. That cut is now your brand.",
      mechanism:
        "Fill the card once. Three tiers, one floor, one sentence for what is not included. When the next inquiry hits, you send the card or you paste a script. You do not renegotiate with yourself in the compose window.",
      whatYouGet: [
        "A one-page three-tier rate card (fill-in)",
        "A floor formula that survives a slow month",
        "Five scripts: the ask, the flinch, the “budget,” the discount, the yes",
        "An email that states the number without a preface",
        "A 20-minute setup so it is live before the next lead",
      ],
      forWhom: "Independents who have already been paid and still undercharge.",
      notFor: "Agencies with a sales team, or people who have never invoiced.",
      guarantee: "7 days. If you would not send the card, say so.",
      cta: "Get Rate Lock — $19.",
    },
    posts: [
      {
        channel: "X",
        copy: "Rate Lock is a $19 page for independents who shrink the number in the compose window. Card, floor, five scripts. Link in the reply.",
      },
      {
        channel: "Caption",
        copy: "You do not have a confidence problem. You have an unwritten number.\n\nRate Lock is the card and the sentences.\n\n$19.",
      },
      {
        channel: "Thread",
        copy: "1/ Undercharging is usually a compose-window event.\n2/ Write the number when nobody is asking.\n3/ Rate Lock is a one-page card + five scripts.\n4/ $19. If you would not send it, you get the money back.",
      },
      {
        channel: "Honest DM",
        copy: "I put up a $19 file called Rate Lock — a rate card and scripts for saying the number. Thought of you because you freelance. Link if useful; ignore if not.",
      },
    ],
    deliveryDoc: {
      title: "Rate Lock",
      subtitle: "A floor, a card, and five scripts. $19.",
      pages: [
        {
          heading: "Why the number dies",
          body: "It dies in the five seconds between “what do you charge” and the send button. You are not confused about your skill. You are unprotected from your own manners. The fix is to write the number when you are not performing.",
        },
        {
          heading: "The floor",
          body: "Take last year’s real income (or a target you would not be ashamed of). Divide by 100 billable days, then by 5 hours of real focus. That is a day-floor. Anything below it trains the market. Raise 10% if you are booked more than two weeks out. Write the floor on the card. It is not a slogan. It is a refuse-the-work number.",
        },
        {
          heading: "Three tiers",
          body: "Good: the job as they asked, in writing, with one round of changes. Better: that, plus a working session or a faster turn. Best: that, plus you own the decisions they do not want to make. Price Better at 1.6× Good and Best at 2.2×. Most buyers pick Better if you stop apologizing for Best.",
        },
        {
          heading: "What is not included",
          body: "One short list: extra rounds, weekend turns, unused directions, their internal meetings, usage beyond the stated project. If it is not on the card, it is a new invoice. This list earns more than a clever name.",
        },
        {
          heading: "The email that states the number",
          body: "“Thanks for writing. I do this as [Good / Better / Best] at [n], [n], and [n]. For what you described I would start at [Better], which covers [scope]. If you want the card, here it is. If the budget is elsewhere I will say so quickly.” No life story. No “totally flexible.”",
        },
        {
          heading: "Five scripts",
          body: "The ask: send the email above. The flinch: “That is the number for this scope. I can cut scope, not the rate.” The budget: “What number did you set aside? I will tell you what that buys.” The discount: “I do not discount the rate. I can move the date.” The yes: “I will send a one-page agreement and a 40% start invoice today.”",
        },
        {
          heading: "The awkward hour",
          body: "They will pause. Do not fill the pause with a lower number. If they vanish, send one note on day three: “Closing the slot on Friday unless I hear otherwise.” Then actually close it. A floor you break once is not a floor.",
        },
        {
          heading: "Review once a year",
          body: "Every January, raise 10% if you were busy, or rewrite the tiers if the work changed. Send the new card to anyone who might hire you again. Do not wait until you are angry.",
        },
      ],
    },
  }),
  stamp({
    id: "ready-quiet-close",
    createdAt: "2026-01-01T00:00:00.000Z",
    source: "ready",
    skill: "closing freelance work over email without a sales call",
    buyer: "consultants and independents who hate hop-on-a-call culture",
    seedDelivery: "twelve emails that take a warm lead to a paid yes, without a meeting",
    price: 27,
    name: "Quiet Close",
    oneLiner:
      "Twelve emails that move a warm lead to a paid yes without a discovery call, a deck, or a personality transplant.",
    promise: "Close the next job in the inbox you already live in.",
    who: "independents who can do the work and stall on the call",
    outcome: "a yes, a no, or a clean stop — in writing",
    gumroadTitle: "Quiet Close — twelve emails that close without a call",
    gumroadTags: ["freelance", "email", "sales", "templates"],
    coverPrompt:
      "Square 1:1 cover. Dim study, a laptop with a short email on screen, warm lamp, no UI chrome readable. Serif title \"QUIET CLOSE\". Subline \"12 emails. No call. $27\". Photographic, still.",
    objections: [
      {
        objection: "Serious buyers want a call.",
        reply:
          "Some do. This kit is for the rest, and for you if calls make you discount. You can still hop on a call. You will not need one to start.",
      },
      {
        objection: "Templates sound like spam.",
        reply:
          "These are short and specific. You rewrite the bracketed facts. If a sentence could apply to anyone, cut it.",
      },
      {
        objection: "I already have a CRM.",
        reply: "Good. Paste these into it. The kit is the language, not the software.",
      },
    ],
    salesPage: {
      headline: "Close the work in writing. Keep the call for the work.",
      subhead:
        "Quiet Close is twelve emails — first reply through invoice — for independents who lose deals in the calendar, not in the craft.",
      problem:
        "The lead is warm. You offer a call. They delay. You follow up with “just checking in,” which is how grown work goes to sleep. Meanwhile people who write a clear next step get paid.",
      mechanism:
        "Each email has a job: name the work, offer two ways to buy, ask for a yes in a sentence, or close the file. No threading essays. No “circling back.” You copy, fill the brackets, send.",
      whatYouGet: [
        "Twelve emails from first reply to paid kickoff",
        "A two-option close so they are not inventing a third",
        "A silence sequence that ends (day 3, day 7, stop)",
        "The recap that becomes the agreement",
        "A 30-minute install: paste into your notes once",
      ],
      forWhom: "Consultants and independents who can do the work and dread the sales call.",
      notFor: "SDR teams, or anyone selling a $50k cycle with six stakeholders.",
      guarantee: "7 days. If you would not send the first email, refund.",
      cta: "Get Quiet Close — $27.",
    },
    posts: [
      {
        channel: "X",
        copy: "Quiet Close is $27 and twelve emails for independents who keep offering “a quick call” and then waiting. No CRM required. Link in the reply.",
      },
      {
        channel: "Caption",
        copy: "The call is where the number shrinks.\n\nQuiet Close keeps the sale in writing.\nTwelve emails. $27.",
      },
      {
        channel: "Thread",
        copy: "1/ You do not need a personality for freelance sales.\n2/ You need a next sentence.\n3/ Quiet Close is twelve of them.\n4/ $27. Refund if you would not send the first one.",
      },
      {
        channel: "Honest DM",
        copy: "I listed Quiet Close — twelve emails to close freelance work without a call. $27. Sending in case you still hate calendars. Ignore if not useful.",
      },
    ],
    deliveryDoc: {
      title: "Quiet Close",
      subtitle: "Twelve emails. No call. $27.",
      pages: [
        {
          heading: "Stop hopping on calls",
          body: "A call is a place where scope expands and price contracts. You can still take one. Default to writing. If they insist on a meeting, send the recap email first so the call has a document to fail against.",
        },
        {
          heading: "The map",
          body: "1 first reply. 2 clarifying question (one). 3 the offer with two options. 4 the recap. 5 the ask. 6 the invoice. 7 day-3 silence. 8 day-7 silence. 9 the close-the-file note. 10 the yes-kickoff. 11 the no-thank-you. 12 the six-month check-in. You will not send all twelve to one person.",
        },
        {
          heading: "First reply",
          body: "“Thanks for writing. I do [type of work] for [kind of buyer]. From what you said, the job is [one sentence]. Two questions: [deadline] and [what done looks like]. If that is right I will send two ways to start.” Short. You have named the job before they have performed.",
        },
        {
          heading: "The offer",
          body: "“Two ways to start. A: [narrower job] at [n], done by [date]. B: [the job they asked] at [n], done by [date]. Both include [what]. Not included: [list]. Reply with A or B and I will send a one-page recap.” Two options beat a menu. A menu is how they delay.",
        },
        {
          heading: "The recap and the ask",
          body: "Recap: restates A or B, date, price, what is not included, start invoice of 40%. Ask: “Reply ‘yes, proceed’ and I will send the invoice today.” That phrase is the whole close. If they write a novel, answer once, then repeat the phrase.",
        },
        {
          heading: "Silence",
          body: "Day 3: “Flagging this in case it moved down the pile. I can still start [date] if I have a yes by Friday.” Day 7: “I am closing this file on my side on [day] so I can take other work. If the timing is later, say when.” Then stop. “Just checking in” is how you teach them you wait.",
        },
        {
          heading: "After they say yes",
          body: "Kickoff email: invoice link, start date, the one channel you will use, and the first deliverable. Do not add a call unless the work needs one. The sale is over. The manners can return.",
        },
        {
          heading: "After they say no",
          body: "“Understood. I will leave this here if the job comes back. I am around in [month] if the timing changes.” Save it. Six months later, send email 12 with one line about what you are taking on, not a newsletter.",
        },
      ],
    },
  }),
];

export const FORGE_PRESETS: {
  label: string;
  skill: string;
  buyer: string;
  delivery: string;
  price: number;
}[] = [
  {
    label: "Ash Cow",
    skill: "shipping a small digital product in one day",
    buyer: "people with a real skill who have never listed anything",
    delivery: "a 10-page launch kit with a sales page, listing copy, and a 24-hour clock",
    price: 29,
  },
  {
    label: "Rate card",
    skill: "pricing freelance work without shrinking the number",
    buyer: "independent designers and developers who undercharge",
    delivery: "a one-page rate card, a floor, and five scripts for saying the number",
    price: 19,
  },
  {
    label: "Inbox close",
    skill: "closing freelance work over email",
    buyer: "consultants who hate hop-on-a-call culture",
    delivery: "twelve emails from first reply to invoice",
    price: 27,
  },
];
