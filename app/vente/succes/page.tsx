import Link from 'next/link';
import styles from '../vente.module.css';

export default function CheckoutSuccessPage() {
  return (
    <main className={styles.successPage}>
      <div className={styles.successCard}>
        <div className={styles.successIcon}>✓</div>
        <p className={styles.eyebrow}>PAIEMENT CONFIRMÉ</p>
        <h1>Bienvenue dans NEXORA.</h1>
        <p>
          Conserve l&apos;e-mail de confirmation Stripe. L&apos;accès à la formation sera envoyé à
          l&apos;adresse utilisée pendant le paiement dès que la livraison automatique sera activée.
        </p>
        <Link href="/vente">Retourner à la page</Link>
      </div>
    </main>
  );
}
