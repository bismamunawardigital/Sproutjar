export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect x="7" y="12" width="18" height="17" rx="5" fill="#FDFCF8" stroke="#C8DACB" strokeWidth="1.6" />
        <path d="M7.4 22H24.6V25.5A3.5 3.5 0 0 1 21.1 29H10.9A3.5 3.5 0 0 1 7.4 25.5Z" fill="#B98F63" />
        <rect x="6" y="8.5" width="20" height="3.4" rx="1.7" fill="#C8DACB" />
        <path d="M16 22V14" stroke="#5FA877" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M17 16.6c0-2 1.6-3.4 3.8-3.6.2 2.2-1.6 3.8-3.8 3.6Z" fill="#6FBF88" />
        <path d="M15 18.4c0-2-1.6-3.4-3.8-3.6-.2 2.2 1.6 3.8 3.8 3.6Z" fill="#92D3A3" />
      </svg>
      <span className="font-logo text-[19px] font-bold tracking-[-0.02em] text-ink-900">Sproutjar</span>
    </span>
  );
}
