export type HourBeat = {
  hour: number;
  title: string;
  task: string;
};

export type Objection = {
  objection: string;
  reply: string;
};

export type SalesPage = {
  headline: string;
  subhead: string;
  problem: string;
  mechanism: string;
  whatYouGet: string[];
  forWhom: string;
  notFor: string;
  guarantee: string;
  cta: string;
};

export type SocialPost = {
  channel: string;
  copy: string;
};

export type DeliveryPage = {
  heading: string;
  body: string;
};

export type CashCow = {
  id: string;
  createdAt: string;
  source: "forge" | "ready";
  skill: string;
  buyer: string;
  seedDelivery: string;
  price: number;
  name: string;
  oneLiner: string;
  promise: string;
  who: string;
  outcome: string;
  gumroadTitle: string;
  gumroadTags: string[];
  coverPrompt: string;
  objections: Objection[];
  salesPage: SalesPage;
  hours: HourBeat[];
  posts: SocialPost[];
  deliveryDoc: {
    title: string;
    subtitle: string;
    pages: DeliveryPage[];
  };
};

export type ForgeInput = {
  skill: string;
  buyer: string;
  delivery: string;
  price: number;
};

export type Sale = {
  id: string;
  kitId: string;
  amount: number;
  at: string;
};
