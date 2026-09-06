import { cn } from "@/lib/utils";

function Badge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-raised px-2.5 py-1 text-xs font-medium tracking-wide text-muted",
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
