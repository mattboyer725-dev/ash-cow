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
        d="M5.8 13.2C5.2 8.4 8.6 4.6 11.4 4.8c.2 2.4-1.4 5.2-3.4 7.4-.8.4-1.7.8-2.2 1z"
      />
      <path
        className="fill-accent"
        d="M26.2 13.2c-.5-.2-1.4-.6-2.2-1-2-2.2-3.6-5-3.4-7.4 2.8-.2 6.2 3.6 5.6 8.4z"
      />
      <ellipse cx="16" cy="18.2" rx="8.2" ry="7.4" className="fill-accent" />
      <path
        className="fill-accent"
        d="M8.8 14.2c2.2-4.4 4.8-6.4 7.2-6.4s5 2 7.2 6.4c-2.2-1.4-4.6-2.1-7.2-2.1s-5 .7-7.2 2.1z"
      />
      <path className="fill-bg" d="M12.6 16.4c.4 1.6 1.2 2.4 1.2 2.4s-.6-2-.4-2.6c.1-.3-.3-.3-.8.2z" />
      <path className="fill-bg" d="M19.4 16.4c-.4 1.6-1.2 2.4-1.2 2.4s.6-2 .4-2.6c-.1-.3.3-.3.8.2z" />
      <circle cx="13.1" cy="19.4" r="1" className="fill-bg" />
      <circle cx="18.9" cy="19.4" r="1" className="fill-bg" />
    </svg>
  );
}
