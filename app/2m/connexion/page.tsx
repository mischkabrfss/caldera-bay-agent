import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string; cree?: string }>;
}) {
  const params = await searchParams;
  if (await getCurrentUser()) redirect('/2m/compte');

  return (
    <section className="section">
      <div className="wrap stack gap-14" style={{ maxWidth: 420 }}>
        <h1 className="disp page-title">CONNEXION</h1>

        {params.cree ? (
          <div className="notice notice-ok">Compte créé. Connectez-vous pour continuer.</div>
        ) : null}
        {params.erreur ? (
          <div className="notice notice-error">{decodeURIComponent(params.erreur)}</div>
        ) : null}

        <form method="post" action="/2m/api/auth/login" className="stack gap-14">
          <label className="field">
            <span>EMAIL</span>
            <input className="input" type="email" name="email" required autoComplete="email" />
          </label>
          <label className="field">
            <span>MOT DE PASSE</span>
            <input
              className="input"
              type="password"
              name="password"
              required
              autoComplete="current-password"
            />
          </label>
          <button type="submit" className="btn btn-block">
            Se connecter
          </button>
        </form>

        <p className="small center muted">
          Mot de passe oublié ? <Link href="/2m/contact">Contactez-nous</Link> pour une
          réinitialisation.
        </p>
        <p className="small center muted">
          Pas encore de compte ? <Link href="/2m/inscription">Créer un compte</Link>
        </p>
      </div>
    </section>
  );
}
