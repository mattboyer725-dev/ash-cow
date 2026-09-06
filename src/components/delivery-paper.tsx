import type { CashCow } from "@/lib/types";

export function DeliveryPaper({ cow }: { cow: CashCow }) {
  return (
    <article className="paper mx-auto max-w-2xl rounded-lg px-6 py-10 text-ink shadow-[var(--shadow-border)] sm:px-10 sm:py-14">
      <p className="font-mono text-xs tracking-[0.2em] text-ink-muted uppercase">
        Delivery file
      </p>
      <h1 className="mt-4 font-display text-4xl tracking-tight text-ink sm:text-5xl">
        {cow.deliveryDoc.title}
      </h1>
      <p className="mt-3 max-w-prose text-base leading-relaxed text-ink-muted">
        {cow.deliveryDoc.subtitle}
      </p>
      <div className="mt-10 flex flex-col gap-10">
        {cow.deliveryDoc.pages.map((page, i) => (
          <section key={page.heading} className="flex flex-col gap-3">
            <h2 className="font-display text-xl tracking-tight text-ink">
              <span className="font-mono text-sm text-ink-muted">{String(i + 1).padStart(2, "0")} </span>
              {page.heading}
            </h2>
            <p className="text-base leading-relaxed text-ink">{page.body}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
