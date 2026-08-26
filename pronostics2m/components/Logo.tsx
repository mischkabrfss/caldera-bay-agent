export function Logo({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path
        d="M20 3 L34 8 V20 C34 29 27.5 34.5 20 37 C12.5 34.5 6 29 6 20 V8 Z"
        fill="#0b2116"
        stroke="#f0c53c"
        strokeWidth="1.6"
      />
      <text
        x="20"
        y="25.5"
        textAnchor="middle"
        fontFamily="Bebas Neue, Impact, sans-serif"
        fontSize="15"
        fill="#f0c53c"
      >
        2M
      </text>
    </svg>
  );
}
