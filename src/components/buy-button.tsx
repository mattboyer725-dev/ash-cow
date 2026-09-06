import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTill } from "@/lib/till";
import type { CashCow } from "@/lib/types";
import { money } from "@/lib/utils";

export function BuyButton({ cow, size = "lg" }: { cow: CashCow; size?: "default" | "lg" }) {
  const payUrl = useTill((s) => s.payUrl);
  const contact = useTill((s) => s.contact);
  const href = payUrl.trim() || String(import.meta.env.VITE_PAY_URL ?? "").trim();

  if (href) {
    return (
      <Button asChild size={size}>
        <a href={href} target="_blank" rel="noreferrer">
          Buy {money(cow.price)}
          <ExternalLink />
        </a>
      </Button>
    );
  }

  if (contact.trim()) {
    const mail = `mailto:${contact.trim()}?subject=${encodeURIComponent(`Buy ${cow.name}`)}&body=${encodeURIComponent(`I want ${cow.name} for ${money(cow.price)}. Send the file and your payment link.`)}`;
    return (
      <Button asChild size={size}>
        <a href={mail}>Request {money(cow.price)}</a>
      </Button>
    );
  }

  return (
    <Button size={size} variant="secondary" disabled>
      Not listed yet
    </Button>
  );
}
