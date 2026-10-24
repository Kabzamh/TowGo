type LogoProps = {
  light?: boolean
  compact?: boolean
}

export default function Logo({ light = false, compact = false }: LogoProps) {
  return (
    <span className={`logo ${light ? 'logo--light' : ''}`} aria-label="TowGo home">
      <span className="logo__mark" aria-hidden="true">
        <svg viewBox="0 0 40 40" fill="none">
          <path d="M10 9.5h20v7.2h-6.3v14H16.4v-14H10V9.5Z" fill="currentColor" />
          <path d="M17.1 19.8h5.8" stroke="#FF7147" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </span>
      {!compact && <span className="logo__word">towgo<span>.</span></span>}
    </span>
  )
}
