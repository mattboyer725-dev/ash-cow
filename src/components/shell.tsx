import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { CowMark } from "@/components/cow-mark";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Barn" as const },
  { to: "/till", label: "Live" as const },
  { to: "/shop", label: "Shop" as const },
  { to: "/forge", label: "Forge" as const },
] as const;

function NavLink({
  to,
  label,
  compact,
}: {
  to: (typeof NAV)[number]["to"];
  label: string;
  compact?: boolean;
}) {
  return (
    <Link
      to={to}
      activeOptions={to === "/" ? { exact: true } : undefined}
      className={cn(
        "inline-flex items-center justify-center text-muted transition-colors duration-150 hover:text-fg",
        compact
          ? "h-12 flex-col gap-0.5 text-xs tracking-wide"
          : "h-11 rounded-md px-3 text-sm",
      )}
      activeProps={{ className: "text-fg" }}
    >
      {label}
    </Link>
  );
}

export function Shell({ children, trailer }: { children: ReactNode; trailer?: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg pb-[calc(3.5rem+env(safe-area-inset-bottom))] text-fg md:pb-0">
      <header className="no-print sticky top-0 z-30 border-b border-border bg-bg/92 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-2.5 text-fg">
            <CowMark className="size-8 shrink-0" />
            <span className="font-display text-lg tracking-tight">Ash Cow</span>
          </Link>
          <nav className="hidden items-center md:flex">
            {NAV.map((item) => (
              <NavLink key={item.to} {...item} />
            ))}
          </nav>
        </div>
      </header>
      <div className="min-w-0 flex-1">{children}</div>
      <footer className="no-print border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-subtle sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>A Highland cash cow. Built once. Sold in a day.</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {trailer ?? <p className="font-mono text-xs tracking-wider">24:00:00</p>}
            <Link to="/truth" className="text-subtle hover:text-fg">
              Truth
            </Link>
          </div>
        </div>
      </footer>
      <nav
        className="no-print fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border bg-bg/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
        aria-label="Primary"
      >
        {NAV.map((item) => (
          <NavLink key={item.to} {...item} compact />
        ))}
      </nav>
    </div>
  );
}
