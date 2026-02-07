export function LeafLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor">
      <circle cx="50" cy="50" r="4" />
      <ellipse cx="50" cy="25" rx="6" ry="20" />
      <ellipse cx="50" cy="75" rx="6" ry="20" />
      <ellipse cx="25" cy="50" rx="20" ry="6" />
      <ellipse cx="75" cy="50" rx="20" ry="6" />
      <ellipse cx="32" cy="32" rx="6" ry="18" transform="rotate(-45 32 32)" />
      <ellipse cx="68" cy="32" rx="6" ry="18" transform="rotate(45 68 32)" />
      <ellipse cx="32" cy="68" rx="6" ry="18" transform="rotate(45 32 68)" />
      <ellipse cx="68" cy="68" rx="6" ry="18" transform="rotate(-45 68 68)" />
    </svg>
  )
}
