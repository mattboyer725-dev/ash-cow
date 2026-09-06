import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function CopyButton({
  text,
  label = "Copy",
  className,
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [done, setDone] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      toast("Copied");
      window.setTimeout(() => setDone(false), 1400);
    } catch {
      toast("Could not copy");
    }
  }

  return (
    <Button type="button" variant="secondary" size="sm" className={className} onClick={onCopy}>
      {done ? <Check /> : <Copy />}
      {done ? "Copied" : label}
    </Button>
  );
}
