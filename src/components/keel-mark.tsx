export function KeelMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-6 w-6 shrink-0 ${className}`}
      fill="none"
      aria-hidden="true"
    >
      <rect width="24" height="24" rx="6" className="fill-current opacity-10" />
      <path
        d="M5 14.5c2.5 3 11.5 3 14 0M7 10l5-5 5 5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
