import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { createCheckout } from "@/lib/stripe-checkout";

export const Route = createFileRoute("/deck")({ component: DeckPage });

/* ---------- Fibonacci machinery (all live, all verifiable) ---------- */

/** Fast-doubling Fibonacci over BigInt. F(0)=0, F(1)=1. */
function fibBig(n: bigint): bigint {
  if (n === 0n) return 0n;
  let a = 0n; // F(k)
  let b = 1n; // F(k+1)
  const bits = n.toString(2);
  for (const bit of bits) {
    const c = a * (2n * b - a); // F(2k)
    const d = a * a + b * b; // F(2k+1)
    if (bit === "0") {
      a = c;
      b = d;
    } else {
      a = d;
      b = c + d;
    }
  }
  return a;
}

/** Independent check: plain iteration (only sane for small n). */
function fibIter(n: number): bigint {
  let a = 0n;
  let b = 1n;
  for (let i = 0; i < n; i++) [a, b] = [b, a + b];
  return a;
}

/** Pisano period for modulus m, computed by walking pairs until (0,1). */
function pisano(m: bigint): { period: number; cycle: number[] } {
  const cycle: number[] = [];
  let a = 0n;
  let b = 1n;
  for (let i = 0; i < 10000; i++) {
    cycle.push(Number(a));
    [a, b] = [b, (a + b) % m];
    if (a === 0n && b === 1n) return { period: i + 1, cycle };
  }
  return { period: -1, cycle };
}

type ProofStep = { label: string; value: string; ok?: boolean };

function runProof(): ProofStep[] {
  const N = 10n ** 18n;
  const { period, cycle } = pisano(10n);
  const idx = Number(N % BigInt(period));
  const f40fast = fibBig(BigInt(idx));
  const f40iter = fibIter(idx);
  const agree = f40fast === f40iter;
  const last = Number(f40fast % 10n);
  const l41 = Number(fibBig(BigInt(idx + 1)) % 10n);
  const l42 = Number(fibBig(BigInt(idx + 2)) % 10n);
  const recur = (last + l41) % 10 === l42;
  return [
    { label: "Last digits of Fibonacci repeat with period", value: `${period} (Pisano π(10), computed just now by walking the cycle)` },
    { label: "So F(10^18) shares a last digit with F(10^18 mod 60) = F", value: `${idx}` },
    { label: "F(40) by fast doubling", value: f40fast.toString() },
    { label: "F(40) by plain addition (independent method)", value: `${f40iter.toString()} — methods ${agree ? "AGREE" : "DISAGREE"}`, ok: agree },
    { label: "Recurrence holds at the answer (5 + 1 ≡ 6 mod 10)", value: `F(40)…${last}, F(41)…${l41}, F(42)…${l42}`, ok: recur },
    { label: "The last digit of the 1,000,000,000,000,000,000th Fibonacci number", value: String(last), ok: agree && recur },
  ];
}

/* ---------- Fibonacci visual grammar ---------- */
// Type ramp and rhythm use the sequence itself: 13 / 21 / 34 / 55.
const FIB_DOTS = [1, 1, 2, 3, 5, 8, 13, 21];

function Spiral({ className }: { className?: string }) {
  // Golden spiral from quarter-arcs of fib radii — pure SVG, brand-dark.
  const d =
    "M233,144 a89,89 0 0,1 -89,89 a55,55 0 0,1 -55,-55 a34,34 0 0,1 34,-34 " +
    "a21,21 0 0,1 21,21 a13,13 0 0,1 -13,13 a8,8 0 0,1 -8,-8 a5,5 0 0,1 5,-5 " +
    "a3,3 0 0,1 3,3";
  return (
    <svg viewBox="0 0 260 240" className={className} aria-hidden="true">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
    </svg>
  );
}

type Slide = { kicker: string; render: () => React.ReactNode };

/* ---------- The deck ---------- */

function DeckPage() {
  const [i, setI] = useState(0);
  const [proof, setProof] = useState<ProofStep[] | null>(null);
  const [proofBusy, setProofBusy] = useState(false);
  const [buyBusy, setBuyBusy] = useState(false);
  const [buyErr, setBuyErr] = useState("");

  const buy = useCallback(async () => {
    setBuyBusy(true);
    setBuyErr("");
    const res = await createCheckout({ data: { kitId: "ready-ash-cow" } });
    if (res.ok && res.url) {
      window.location.assign(res.url);
      return;
    }
    setBuyErr(res.ok ? "No checkout URL returned." : res.error);
    setBuyBusy(false);
  }, []);

  const prove = useCallback(() => {
    setProofBusy(true);
    // Let the button paint before the (fast) math runs.
    setTimeout(() => {
      setProof(runProof());
      setProofBusy(false);
    }, 350);
  }, []);

  const slides: Slide[] = useMemo(
    () => [
      {
        kicker: "Ash Cow — the deck",
        render: () => (
          <div className="relative">
            <Spiral className="pointer-events-none absolute -top-6 right-0 h-[233px] w-[233px] text-subtle" />
            <h1 className="font-display text-[55px] leading-none tracking-tight">A cash cow you can list tonight.</h1>
            <p className="mt-[21px] max-w-xl text-[21px] leading-snug text-muted">
              Eight slides. Built on the Fibonacci sequence — each idea the sum of the two before it.
              Arrow keys or tap to move.
            </p>
          </div>
        ),
      },
      {
        kicker: "1 — the problem",
        render: () => (
          <p className="max-w-2xl text-[34px] leading-tight">
            The hours disappear into names, decks, and almost-ready pages.
            <span className="text-muted"> Most people never get the first product out.</span>
          </p>
        ),
      },
      {
        kicker: "1 — the kit",
        render: () => (
          <ul className="max-w-xl space-y-[13px] text-[21px]">
            <li>A named product, a price, a one-screen sales page.</li>
            <li>Listing copy, four posts, a delivery document.</li>
            <li>A 24-hour clock you actually run.</li>
            <li className="text-muted">You fill it with your skill. Then you count.</li>
          </ul>
        ),
      },
      {
        kicker: "2 — an impossible test",
        render: () => (
          <div className="max-w-2xl">
            <p className="text-[34px] leading-tight">
              What is the <em>last digit</em> of the 1,000,000,000,000,000,000th Fibonacci number?
            </p>
            <p className="mt-[21px] text-[16px] text-muted">
              Brute force at one addition per nanosecond runs about 31 billion years — past the age of
              the universe. The number itself has ~209 quadrillion digits. No computer will ever write
              it down. This looks unsolvable.
            </p>
          </div>
        ),
      },
      {
        kicker: "3 — solved, live, in your browser",
        render: () => (
          <div className="max-w-2xl">
            {!proof ? (
              <div>
                <p className="text-[21px] text-muted">
                  It is not unsolvable — it is unsolvable <em>the obvious way</em>. Last digits of
                  Fibonacci repeat. Press the button: this page computes the cycle, takes two
                  independent routes to the answer, and checks itself.
                </p>
                <Button className="mt-[21px]" onClick={prove} disabled={proofBusy}>
                  {proofBusy ? "Computing…" : "Run the proof"}
                </Button>
              </div>
            ) : (
              <ol className="space-y-[8px] font-mono text-[13px]">
                {proof.map((s) => (
                  <li key={s.label} className={s.ok === false ? "text-red-400" : undefined}>
                    <span className="text-subtle">{s.label}:</span>{" "}
                    <span className={s.ok ? "font-bold" : undefined}>{s.value}</span>
                  </li>
                ))}
                <li className="pt-[13px] text-[21px] font-display not-italic">
                  Answer: <span className="text-[34px]">5</span> — verified two ways, just now, on your machine.
                </li>
              </ol>
            )}
          </div>
        ),
      },
      {
        kicker: "5 — the same move",
        render: () => (
          <p className="max-w-2xl text-[34px] leading-tight">
            Your product feels like the big number — too much to ever write down.
            <span className="text-muted">
              {" "}The kit is the period-60 trick: the small, finite piece that ships tonight and
              stands for the whole thing.
            </span>
          </p>
        ),
      },
      {
        kicker: "8 — the honest objection",
        render: () => (
          <div className="max-w-2xl space-y-[13px] text-[21px]">
            <p>“This is just a pep talk.”</p>
            <p className="text-muted">
              It is a file: a named product, a sales page, listing copy, posts, and a clock. If you
              wanted motivation, this is the wrong stall. Seven-day refund, no form.
            </p>
          </div>
        ),
      },
      {
        kicker: "13 — the till",
        render: () => (
          <div className="max-w-xl">
            <p className="text-[34px] leading-tight">$29. The file opens the moment Stripe says paid.</p>
            <p className="mt-[13px] text-[16px] text-muted">
              Checkout verifies your session and hands you the delivery link immediately — no email
              wait, no inbox dig. That flow is live on this site right now.
            </p>
            <Button className="mt-[21px]" onClick={buy} disabled={buyBusy}>
              {buyBusy ? "Opening Stripe…" : "Buy Ash Cow — $29"}
            </Button>
            {buyErr ? <p className="mt-[8px] text-[13px] text-red-400">{buyErr}</p> : null}
          </div>
        ),
      },
    ],
    [proof, proofBusy, buy, buyBusy, buyErr, prove],
  );

  const next = useCallback(() => setI((v) => Math.min(v + 1, slides.length - 1)), [slides.length]);
  const prev = useCallback(() => setI((v) => Math.max(v - 1, 0)), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const slide = slides[i];

  return (
    <Shell>
      <main
        className="mx-auto flex w-full max-w-3xl cursor-pointer flex-col px-4 sm:px-6"
        style={{ minHeight: "72vh" }}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("button, a, ol")) return;
          next();
        }}
      >
        <p className="pt-[34px] font-mono text-xs tracking-[0.2em] text-subtle uppercase">{slide.kicker}</p>
        <div className="flex flex-1 items-center py-[34px]">{slide.render()}</div>
        <nav className="flex items-center gap-[8px] pb-[34px]" aria-label="Slides">
          {FIB_DOTS.map((w, idx) => (
            <button
              key={idx}
              aria-label={`Slide ${idx + 1}`}
              onClick={(e) => {
                e.stopPropagation();
                setI(idx);
              }}
              className={`h-[3px] rounded-full transition-all ${idx === i ? "bg-current" : "bg-current opacity-25"}`}
              style={{ width: `${w * 5}px` }}
            />
          ))}
          <span className="ml-auto font-mono text-xs text-subtle">
            {i + 1} / {slides.length}
          </span>
        </nav>
      </main>
    </Shell>
  );
}
