import { IconMail } from '@/components/icons';

export const dynamic = 'force-dynamic';

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; erreur?: string }>;
}) {
  const params = await searchParams;

  return (
    <section className="section">
      <div className="wrap stack gap-14" style={{ maxWidth: 520 }}>
        <h1 className="disp page-title">CONTACTEZ-NOUS</h1>
        <p className="lead">
          Une question sur une formule, un paiement ou votre accès VIP ? Écrivez-nous, réponse sous
          24 h.
        </p>

        {params.ok ? <div className="notice notice-ok">{decodeURIComponent(params.ok)}</div> : null}
        {params.erreur ? (
          <div className="notice notice-error">{decodeURIComponent(params.erreur)}</div>
        ) : null}

        <div className="card-flat row">
          <span className="vip-icon" style={{ background: 'rgba(240,197,60,0.12)' }}>
            <IconMail size={19} color="#f0c53c" />
          </span>
          <div className="grow">
            <div className="small" style={{ color: 'var(--muted-2)' }}>
              Email
            </div>
            <b className="mt-8" style={{ display: 'block' }}>
              [VOTRE EMAIL]
            </b>
          </div>
        </div>

        <form method="post" action="/api/contact" className="stack gap-14">
          <label className="field">
            <span>VOTRE NOM</span>
            <input className="input" name="name" required maxLength={60} />
          </label>
          <label className="field">
            <span>VOTRE EMAIL</span>
            <input className="input" type="email" name="email" required />
          </label>
          <label className="field">
            <span>SUJET</span>
            <select className="select" name="subject" defaultValue="Mon abonnement">
              <option>Mon abonnement</option>
              <option>Un paiement</option>
              <option>Mon accès VIP</option>
              <option>Mot de passe oublié</option>
              <option>Autre question</option>
            </select>
          </label>
          <label className="field">
            <span>MESSAGE</span>
            <textarea className="textarea" name="body" required maxLength={4000} />
          </label>
          <button type="submit" className="btn btn-block">
            Envoyer le message
          </button>
        </form>
      </div>
    </section>
  );
}
