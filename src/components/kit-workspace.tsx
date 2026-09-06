import { useNavigate } from "@tanstack/react-router";
import { Printer, Trash2 } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { DeliveryPaper } from "@/components/delivery-paper";
import { LaunchClock } from "@/components/clock";
import { BarnSales } from "@/components/barn-sales";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { salesPageText } from "@/lib/copy";
import {
  coverPromptText,
  deliveryText,
  kitMarkdown,
  listingText,
  objectionsText,
  postsText,
} from "@/lib/kit-text";
import { useBarn } from "@/lib/store";
import type { CashCow } from "@/lib/types";
import { money } from "@/lib/utils";

export function KitWorkspace({ cow }: { cow: CashCow }) {
  const navigate = useNavigate();
  const launches = useBarn((s) => s.launches);
  const hourDone = useBarn((s) => s.hourDone);
  const startLaunch = useBarn((s) => s.startLaunch);
  const resetLaunch = useBarn((s) => s.resetLaunch);
  const toggleHour = useBarn((s) => s.toggleHour);
  const removeCow = useBarn((s) => s.removeCow);
  const startedAt = launches[cow.id];
  const done = hourDone[cow.id] ?? [];

  function retire() {
    removeCow(cow.id);
    void navigate({ to: "/" });
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="no-print flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-xl">
          <p className="font-mono text-xs tracking-[0.2em] text-subtle uppercase">Stall</p>
          <h1 className="mt-2 font-display text-4xl tracking-tight sm:text-5xl">{cow.name}</h1>
          <p className="mt-3 text-base leading-relaxed text-muted">{cow.oneLiner}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge className="font-mono tabular-nums text-fg">{money(cow.price)}</Badge>
            <Badge>{cow.source === "ready" ? "Ready stall" : "Forged"}</Badge>
          </div>
        </div>
        <div className="w-full max-w-sm rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
          <LaunchClock startedAt={startedAt} />
          <div className="mt-4 flex flex-wrap gap-2">
            {startedAt ? (
              <Button type="button" variant="secondary" onClick={() => resetLaunch(cow.id)}>
                Reset clock
              </Button>
            ) : (
              <Button type="button" onClick={() => startLaunch(cow.id)}>
                Start 24 hours
              </Button>
            )}
            <Button type="button" variant="secondary" onClick={() => window.print()}>
              <Printer />
              Print file
            </Button>
          </div>
        </div>
      </div>

      <div className="print-only">
        <DeliveryPaper cow={cow} />
      </div>

      <Tabs defaultValue="brief" className="no-print mt-10">
        <TabsList>
          <TabsTrigger value="brief">Brief</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="listing">Listing</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="hours">Hours</TabsTrigger>
          <TabsTrigger value="barn">Barn</TabsTrigger>
        </TabsList>

        <TabsContent value="brief">
          <Panel
            title="The object"
            action={<CopyButton text={kitMarkdown(cow)} label="Copy whole kit" />}
          >
            <dl className="grid gap-5 sm:grid-cols-2">
              <Fact label="Promise" value={cow.promise} />
              <Fact label="Who" value={cow.who} />
              <Fact label="Outcome" value={cow.outcome} />
              <Fact label="Skill" value={cow.skill} />
            </dl>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted">Objections</p>
              <ul className="mt-3 flex flex-col gap-4">
                {cow.objections.map((row) => (
                  <li key={row.objection}>
                    <p className="text-sm text-fg">{row.objection}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{row.reply}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-3">
                <CopyButton text={objectionsText(cow)} label="Copy objections" />
              </div>
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="sales">
          <Panel
            title="Sales page"
            action={<CopyButton text={salesPageText(cow.salesPage)} label="Copy page" />}
          >
            <h2 className="font-display text-3xl tracking-tight">{cow.salesPage.headline}</h2>
            <p className="text-base leading-relaxed text-muted">{cow.salesPage.subhead}</p>
            <p className="text-base leading-relaxed">{cow.salesPage.problem}</p>
            <p className="text-base leading-relaxed">{cow.salesPage.mechanism}</p>
            <div>
              <p className="text-sm font-medium text-muted">What you get</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-base leading-relaxed">
                {cow.salesPage.whatYouGet.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <p className="text-sm text-muted">For: {cow.salesPage.forWhom}</p>
            <p className="text-sm text-muted">Not for: {cow.salesPage.notFor}</p>
            <p className="text-sm">{cow.salesPage.guarantee}</p>
            <p className="font-medium">{cow.salesPage.cta}</p>
          </Panel>
        </TabsContent>

        <TabsContent value="listing">
          <Panel
            title="Where money already moves"
            action={<CopyButton text={listingText(cow)} label="Copy listing" />}
          >
            <Fact label="Title" value={cow.gumroadTitle} />
            <Fact label="Tags" value={cow.gumroadTags.join(" · ")} />
            <Fact label="Price" value={money(cow.price)} />
            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-muted">Cover prompt</p>
                <CopyButton text={coverPromptText(cow)} label="Copy prompt" />
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-fg">
                {cow.coverPrompt}
              </p>
            </div>
            <p className="text-sm leading-relaxed text-muted">
              Create a Gumroad or Lemon Squeezy product. Type: digital. Upload the delivery
              file from the next tab. Paste this listing. Publish. Put the URL in every post.
            </p>
          </Panel>
        </TabsContent>

        <TabsContent value="delivery">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted">
                This is the file they buy. Print to PDF. Fill examples with your names.
              </p>
              <CopyButton text={deliveryText(cow)} label="Copy file" />
            </div>
            <DeliveryPaper cow={cow} />
          </div>
        </TabsContent>

        <TabsContent value="posts">
          <Panel
            title="Say it where they already are"
            action={<CopyButton text={postsText(cow)} label="Copy all posts" />}
          >
            {cow.posts.map((post) => (
              <div key={post.channel} className="rounded-lg bg-raised p-4 shadow-[var(--shadow-border)]">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">{post.channel}</p>
                  <CopyButton text={post.copy} />
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted">
                  {post.copy}
                </p>
              </div>
            ))}
          </Panel>
        </TabsContent>

        <TabsContent value="hours">
          <Panel title="The 24-hour clock">
            <ol className="flex flex-col gap-3">
              {cow.hours.map((beat) => {
                const checked = done.includes(beat.hour);
                const id = `hour-${cow.id}-${beat.hour}`;
                return (
                  <li
                    key={beat.hour}
                    className="flex gap-3 rounded-lg bg-raised p-4 shadow-[var(--shadow-border)]"
                  >
                    <Checkbox
                      id={id}
                      checked={checked}
                      onCheckedChange={() => toggleHour(cow.id, beat.hour)}
                      className="mt-0.5"
                    />
                    <label htmlFor={id} className="flex-1 cursor-pointer">
                      <p className="font-mono text-xs tabular-nums text-subtle">
                        Hour {String(beat.hour).padStart(2, "0")}
                      </p>
                      <p className="mt-1 text-sm font-medium text-fg">{beat.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted">{beat.task}</p>
                    </label>
                  </li>
                );
              })}
            </ol>
          </Panel>
        </TabsContent>

        <TabsContent value="barn">
          <Panel title="Money in the barn">
            <BarnSales kitId={cow.id} defaultAmount={cow.price} />
            <Separator />
            <Button type="button" variant="ghost" onClick={retire}>
              <Trash2 />
              Retire this stall
            </Button>
          </Panel>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl tracking-tight">{title}</h2>
        {action}
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm font-medium text-muted">{label}</dt>
      <dd className="mt-1 text-base leading-relaxed text-fg">{value}</dd>
    </div>
  );
}
