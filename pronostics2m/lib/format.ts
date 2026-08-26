export function euros(cents: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

export function odds(value: number): string {
  return value.toFixed(2);
}

export function frenchDate(value: string | null): string {
  if (!value) return '—';
  const iso = value.includes('T') ? value : `${value.replace(' ', 'T')}${value.length <= 10 ? '' : 'Z'}`;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

export function longFrenchDate(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value.includes('T') ? value : `${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}
