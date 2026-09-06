import { Toaster as Sonner, type ToasterProps } from "sonner";

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast bg-raised text-fg shadow-[var(--shadow-border)] border-0",
          description: "text-muted",
          actionButton: "bg-accent text-accent-fg",
          cancelButton: "bg-surface text-fg",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
