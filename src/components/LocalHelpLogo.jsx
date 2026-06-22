export default function LocalHelpLogo({ size = 32, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="lh-gradient" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ea580c" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
      </defs>

      {/* Pin body */}
      <path
        d="M32 4
           C19 4 9 14 9 26.5
           C9 39 26 56 30.3 60.1
           a2.4 2.4 0 0 0 3.4 0
           C38 56 55 39 55 26.5
           C55 14 45 4 32 4 Z"
        fill="url(#lh-gradient)"
      />

      {/* Inner circle */}
      <circle cx="32" cy="25.5" r="14.5" fill="white" fillOpacity="0.97" />

      {/* Checkmark */}
      <path
        d="M24.5 26.2 L29.5 31.2 L40 19.8"
        fill="none"
        stroke="url(#lh-gradient)"
        strokeWidth="4.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}