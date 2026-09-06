export function CowMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <rect width="32" height="32" rx="8" className="fill-raised" />
      <path
        className="fill-accent"
        d="M8.5 13.2c0-2.4 1.2-4.4 2.7-4.4.7 0 1.2.4 1.8.4h6c.6 0 1.1-.4 1.8-.4 1.5 0 2.7 2 2.7 4.4 0 1.1-.3 2.1-.8 2.8 1.2.8 2 2.1 2 3.6 0 3.2-3.2 5.4-8.2 5.4s-8.2-2.2-8.2-5.4c0-1.5.8-2.8 2-3.6-.5-.7-.8-1.7-.8-2.8z"
      />
      <circle cx="13.2" cy="16.6" r="1.1" className="fill-bg" />
      <circle cx="18.8" cy="16.6" r="1.1" className="fill-bg" />
    </svg>
  );
}
