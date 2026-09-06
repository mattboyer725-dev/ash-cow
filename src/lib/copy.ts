import { toast } from "sonner";

export async function copyText(text: string, ok = "Copied") {
  try {
    await navigator.clipboard.writeText(text);
    toast(ok);
  } catch {
    toast("Could not copy");
  }
}

export function salesPageText(page: {
  headline: string;
  subhead: string;
  problem: string;
  mechanism: string;
  whatYouGet: string[];
  forWhom: string;
  notFor: string;
  guarantee: string;
  cta: string;
}) {
  return [
    page.headline,
    page.subhead,
    "",
    page.problem,
    "",
    page.mechanism,
    "",
    "What you get",
    ...page.whatYouGet.map((item) => `- ${item}`),
    "",
    `For: ${page.forWhom}`,
    `Not for: ${page.notFor}`,
    "",
    page.guarantee,
    "",
    page.cta,
  ].join("\n");
}
