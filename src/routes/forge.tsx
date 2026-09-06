import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { forgeCow } from "@/lib/forge-ai";
import { FORGE_PRESETS } from "@/lib/ready-cows";
import { useBarn } from "@/lib/store";

export const Route = createFileRoute("/forge")({ component: ForgePage });

function ForgePage() {
  const navigate = useNavigate();
  const addCow = useBarn((s) => s.addCow);
  const [skill, setSkill] = useState("");
  const [buyer, setBuyer] = useState("");
  const [delivery, setDelivery] = useState("");
  const [price, setPrice] = useState("29");
  const [busy, setBusy] = useState(false);

  function applyPreset(preset: (typeof FORGE_PRESETS)[number]) {
    setSkill(preset.skill);
    setBuyer(preset.buyer);
    setDelivery(preset.delivery);
    setPrice(String(preset.price));
  }

  async function onForge(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(price);
    if (!skill.trim() || !buyer.trim() || !delivery.trim()) {
      toast("Four facts. Fill the blanks.");
      return;
    }
    if (!Number.isFinite(n) || n < 9 || n > 99) {
      toast("Price lives between $9 and $99.");
      return;
    }
    setBusy(true);
    try {
      const result = await forgeCow({
        data: {
          skill: skill.trim(),
          buyer: buyer.trim(),
          delivery: delivery.trim(),
          price: Math.round(n),
        },
      });
      addCow(result.cow);
      toast(result.via === "grok" ? "Forged with Grok." : "Forged in the barn.");
      await navigate({ to: "/cow/$id", params: { id: result.cow.id } });
    } catch {
      toast("The forge failed. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell>
      <main className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="font-mono text-xs tracking-[0.2em] text-subtle uppercase">The forge</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight sm:text-5xl">
          Four facts. Then we name it.
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted">
          A skill you already have. A buyer who already has money. A file they can use
          tomorrow morning. A price you would not be embarrassed to charge.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {FORGE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset)}
              className="h-11 rounded-full bg-raised px-4 text-sm text-muted shadow-[var(--shadow-border)] hover:text-fg"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <form onSubmit={onForge} className="mt-10 flex flex-col gap-6">
          <Field label="Skill you already have" htmlFor="skill">
            <Input
              id="skill"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              placeholder="pricing freelance work, writing cold emails…"
            />
          </Field>
          <Field label="Who pays" htmlFor="buyer">
            <Input
              id="buyer"
              value={buyer}
              onChange={(e) => setBuyer(e.target.value)}
              placeholder="independent designers who undercharge"
            />
          </Field>
          <Field label="What they walk away with" htmlFor="delivery">
            <Textarea
              id="delivery"
              value={delivery}
              onChange={(e) => setDelivery(e.target.value)}
              placeholder="a one-page rate card and five scripts for saying the number"
            />
          </Field>
          <Field label="Price in dollars" htmlFor="price">
            <Input
              id="price"
              inputMode="numeric"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </Field>
          <Button type="submit" size="lg" disabled={busy}>
            {busy ? "Forging…" : "Forge this cow"}
          </Button>
          <p className="text-sm text-subtle">
            Uses Grok when it is available. Always returns a complete kit — sales page,
            delivery file, listing, posts, and a 24-hour clock.
          </p>
        </form>
      </main>
    </Shell>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={htmlFor}>{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
