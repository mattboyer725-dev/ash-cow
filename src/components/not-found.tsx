import { Link } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";

export function NotFound() {
  return (
    <Shell>
      <main className="mx-auto flex w-full max-w-lg flex-col px-4 py-20 sm:px-6">
        <p className="font-mono text-xs tracking-[0.2em] text-subtle uppercase">Empty stall</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight">Nothing here.</h1>
        <p className="mt-3 text-muted">That path is not a product, a clock, or a shop.</p>
        <div className="mt-8 flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/shop">Shop</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/">Barn</Link>
          </Button>
        </div>
      </main>
    </Shell>
  );
}
