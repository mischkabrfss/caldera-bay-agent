'use client';

import { useEffect, useState } from 'react';
import styles from './vente.module.css';

const PROMO_END = Date.parse('2026-08-29T21:59:59.000Z');

type Countdown = { days: number; hours: number; minutes: number; seconds: number };

function remaining(): Countdown {
  const difference = Math.max(0, PROMO_END - Date.now());
  return {
    days: Math.floor(difference / 86_400_000),
    hours: Math.floor((difference / 3_600_000) % 24),
    minutes: Math.floor((difference / 60_000) % 60),
    seconds: Math.floor((difference / 1_000) % 60),
  };
}

export function PromoBar() {
  const [time, setTime] = useState<Countdown | null>(null);

  useEffect(() => {
    const update = () => setTime(remaining());
    update();
    const timer = window.setInterval(update, 1_000);
    return () => window.clearInterval(timer);
  }, []);

  const parts = time
    ? [
        [time.days, 'J'],
        [time.hours, 'H'],
        [time.minutes, 'M'],
        [time.seconds, 'S'],
      ]
    : [[null, 'J'], [null, 'H'], [null, 'M'], [null, 'S']];

  return (
    <aside className={styles.promoBar} aria-label="Offre de lancement">
      <strong>34,99 € jusqu&apos;au 29 août</strong>
      <span>puis 50 €</span>
      <div className={styles.countdown} aria-live="polite">
        {parts.map(([value, label]) => (
          <span key={String(label)}><b>{value === null ? '--' : String(value).padStart(2, '0')}</b><small>{label}</small></span>
        ))}
      </div>
    </aside>
  );
}

export function CheckoutButton({ compact = false }: { compact?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [price, setPrice] = useState('34,99 €');

  useEffect(() => {
    const updatePrice = () => setPrice(Date.now() >= PROMO_END ? '50 €' : '34,99 €');
    updatePrice();
    const timer = window.setInterval(updatePrice, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  async function startCheckout() {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/checkout', { method: 'POST' });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) throw new Error(data.error || 'Paiement indisponible');
      window.location.assign(data.url);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Paiement momentanément indisponible');
      setLoading(false);
    }
  }

  return (
    <div className={compact ? styles.checkoutCompact : styles.checkoutAction}>
      <button type="button" onClick={startCheckout} disabled={loading}>
        {loading ? 'Ouverture du paiement…' : `Accéder à NEXORA — ${price}`} <span>→</span>
      </button>
      {message && <small role="status">{message}</small>}
    </div>
  );
}
