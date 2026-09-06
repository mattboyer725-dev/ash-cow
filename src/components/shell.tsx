import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { CowMark } from "@/components/cow-mark";

export function Shell({ children, trailer }: { children: ReactNode; trailer?: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <header className="no-print sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 text-fg">
            <CowMark className="size-8" />
            <span className="font-display text-lg tracking-tight">Ash Cow</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <Link
              to="/"
              className="inline-flex h-11 items-center rounded-md px-3 text-muted hover:text-fg"
            >
              Barn
            </Link>
            <Link
              to="/truth"
              className="inline-flex h-11 items-center rounded-md px-3 text-muted hover:text-fg"
            >
              Truth
            </Link>
            <Link
              to="/forge"
              className="inline-flex h-11 items-center rounded-md px-3 text-muted hover:text-fg"
            >
              Forge
            </Link>
          </nav>
        </div>
      </header>
      <div className="flex-1">{children}</div>
      <footer className="no-print border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-8 text-sm text-subtle sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>A figurative cash cow. Built once. Sold in a day.</p>
          {trailer ?? <p className="font-mono text-xs tracking-wider">24:00:00</p>}
        </div>
      </footer>
    </div>
  );
}
