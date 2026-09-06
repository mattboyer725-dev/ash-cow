import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { formatRemain, remainingMs } from "@/lib/utils";

export function LaunchClock({ startedAt }: { startedAt: number | undefined }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!startedAt) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [startedAt]);

  if (!startedAt) {
    return (
      <div className="flex flex-col gap-2">
        <p className="font-mono text-3xl tabular-nums tracking-tight text-muted sm:text-4xl">
          24:00:00
        </p>
        <p className="text-sm text-subtle">Clock not started.</p>
      </div>
    );
  }

  const left = remainingMs(startedAt);
  const elapsed = Math.min(100, ((24 * 60 * 60 * 1000 - left) / (24 * 60 * 60 * 1000)) * 100);

  return (
    <div className="flex flex-col gap-3">
      <p className="font-mono text-3xl tabular-nums tracking-tight text-fg sm:text-4xl">
        {left === 0 ? "00:00:00" : formatRemain(left)}
      </p>
      <Progress value={elapsed} />
      <p className="text-sm text-subtle">
        {left === 0
          ? "The day is over. Count the barn."
          : "Hours left on the 24-hour clock."}
      </p>
    </div>
  );
}
