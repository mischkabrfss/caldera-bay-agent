import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/admin';
import { getPrediction } from '@/lib/predictions';
import { PredictionForm } from '@/components/p2m/PredictionForm';
import { AdminNav } from '@/components/p2m/AdminNav';
import { frenchDate } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function EditPredictionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erreur?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const query = await searchParams;
  const prediction = await getPrediction(Number(id));
  if (!prediction) notFound();

  return (
    <section className="section">
      <div className="wrap stack gap-14" style={{ maxWidth: 560 }}>
        <h1 className="disp page-title">MODIFIER LE PRONOSTIC</h1>
        <AdminNav active="/2m/admin/pronostics" />
        <p className="xs dim">
          Créé le {frenchDate(prediction.created_at)}
          {prediction.published_at ? ` · publié le ${frenchDate(prediction.published_at)}` : ''}
        </p>
        {query.erreur ? (
          <div className="notice notice-error">{decodeURIComponent(query.erreur)}</div>
        ) : null}

        <PredictionForm prediction={prediction} />

        <form method="post" action={`/2m/api/admin/predictions/${prediction.id}/supprimer`}>
          <button type="submit" className="btn-ghost btn-danger btn-block">
            Supprimer ce pronostic
          </button>
        </form>
      </div>
    </section>
  );
}
