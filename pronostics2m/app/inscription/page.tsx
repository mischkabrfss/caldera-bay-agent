import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { offerBySlug } from '@/lib/offers';
import { euros } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string; offre?: string; formule?: string }>;
}) {
  const params = await searchParams;
  if (await getCurrentUser()) redirect('/compte');

  const offer = params.offre ? offerBySlug(params.offre) : undefined;
  const plan = params.formule === 'lifetime' ? 'lifetime' : 'monthly';

  return (
    <section className="section">
      <div className="wrap stack gap-14" style={{ maxWidth: 460 }}>
        <h1 className="disp page-title">CRÉER MON COMPTE</h1>

        {offer ? (
          <div className="card card-gold between">
            <div>
              <span className="xs" style={{ color: 'var(--muted-2)' }}>
                Formule choisie
              </span>
              <div className="disp" style={{ fontSize: 22, lineHeight: 1.15 }}>
                {offer.name} · {plan === 'monthly' ? 'MENSUEL' : 'À VIE'}
              </div>
            </div>
            <span className="odds odds-md">
              {euros(plan === 'monthly' ? offer.monthly : offer.lifetime)}
            </span>
          </div>
        ) : null}

        {params.erreur ? (
          <div className="notice notice-error">{decodeURIComponent(params.erreur)}</div>
        ) : null}

        <form method="post" action="/api/auth/register" className="stack gap-14">
          {offer ? <input type="hidden" name="slug" value={offer.slug} /> : null}
          <input type="hidden" name="plan" value={plan} />

          <label className="field">
            <span>PRÉNOM OU PSEUDO</span>
            <input className="input" name="name" required maxLength={40} autoComplete="nickname" />
          </label>
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
              minLength={8}
              autoComplete="new-password"
            />
          </label>
          <label className="field">
            <span>CONFIRMATION DU MOT DE PASSE</span>
            <input
              className="input"
              type="password"
              name="confirm"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </label>

          <label className="check">
            <input type="checkbox" name="terms" value="1" required />
            <span>
              J’accepte les <a href="/conditions">conditions générales</a> et je confirme
              être majeur.
            </span>
          </label>

          <button type="submit" className="btn btn-block">
            {offer ? 'Créer mon compte et payer' : 'Créer mon compte'}
          </button>
        </form>

        <p className="small center muted">
          Déjà inscrit ? <a href="/connexion">Se connecter</a>
        </p>
      </div>
    </section>
  );
}
