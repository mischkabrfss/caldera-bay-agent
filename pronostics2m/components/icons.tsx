type P = { size?: number; color?: string };

const base = (size: number, color: string) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: color,
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
});

export const IconShield = ({ size = 20, color = 'currentColor' }: P) => (
  <svg {...base(size, color)}>
    <path d="M12 3l7 3v5.5c0 4.3-3 7.6-7 8.5-4-.9-7-4.2-7-8.5V6z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

export const IconBoot = ({ size = 20, color = 'currentColor' }: P) => (
  <svg {...base(size, color)}>
    <path d="M4 8l4 3 4-6 4 6 4-3-2 10H6z" />
  </svg>
);

export const IconChart = ({ size = 20, color = 'currentColor' }: P) => (
  <svg {...base(size, color)}>
    <path d="M3 17l5-6 4 4 5-8 4 5" />
    <path d="M3 21h18" />
  </svg>
);

export const IconLock = ({ size = 20, color = 'currentColor' }: P) => (
  <svg {...base(size, color)}>
    <rect x="4" y="10" width="16" height="10" rx="2" />
    <path d="M8 10V7a4 4 0 018 0v3" />
  </svg>
);

export const IconCheck = ({ size = 16, color = 'currentColor' }: P) => (
  <svg {...base(size, color)} strokeWidth={2.4}>
    <path d="M4 12l5 5L20 6" />
  </svg>
);

export const IconBall = ({ size = 20, color = 'currentColor' }: P) => (
  <svg {...base(size, color)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3l3 5-3 4-3-4z" />
  </svg>
);

export const IconUser = ({ size = 20, color = 'currentColor' }: P) => (
  <svg {...base(size, color)}>
    <circle cx="12" cy="8" r="3.4" />
    <path d="M5 20v-1a7 7 0 0114 0v1" />
  </svg>
);

export const IconHome = ({ size = 20, color = 'currentColor' }: P) => (
  <svg {...base(size, color)}>
    <path d="M4 11l8-7 8 7v8a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1z" />
  </svg>
);

export const IconList = ({ size = 20, color = 'currentColor' }: P) => (
  <svg {...base(size, color)}>
    <path d="M4 6h16M4 12h16M4 18h10" />
  </svg>
);

export const IconMail = ({ size = 20, color = 'currentColor' }: P) => (
  <svg {...base(size, color)}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </svg>
);

export const IconPlus = ({ size = 20, color = 'currentColor' }: P) => (
  <svg {...base(size, color)} strokeWidth={2.4}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
