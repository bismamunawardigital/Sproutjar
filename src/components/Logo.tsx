export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path
          d="M8 13h16v11a4 4 0 0 1-4 4h-8a4 4 0 0 1-4-4V13Z"
          fill="var(--color-sand)"
          stroke="var(--color-bark)"
          strokeWidth="1.6"
        />
        <path d="M7 10.5h18" stroke="var(--color-bark)" strokeWidth="1.6" strokeLinecap="round" />
        <path
          d="M16 24v-7"
          stroke="var(--color-moss)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M16 19c-2.6 0-4-1.6-4-4 2.7 0 4 1.4 4 4Z"
          fill="var(--color-moss-light)"
        />
        <path
          d="M16 20.5c2.6 0 4-1.6 4-4-2.7 0-4 1.4-4 4Z"
          fill="var(--color-sprout)"
        />
      </svg>
      <span className="font-display text-xl font-semibold tracking-tight">Sproutjar</span>
    </span>
  );
}
