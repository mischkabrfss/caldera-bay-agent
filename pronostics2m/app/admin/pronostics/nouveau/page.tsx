import { requireAdmin } from '@/lib/admin';
import { PredictionForm } from '@/components/p2m/PredictionForm';
import { AdminNav } from '@/components/p2m/AdminNav';

export const dynamic = 'force-dynamic';

export default async function NewPredictionPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;

  return (
    <section className="section">
      <div className="wrap stack gap-14" style={{ maxWidth: 560 }}>
        <h1 className="disp page-title">AJOUTER UN PRONOSTIC</h1>
        <AdminNav active="/admin/pronostics" />
        {params.erreur ? (
          <div className="notice notice-error">{decodeURIComponent(params.erreur)}</div>
        ) : null}
        <PredictionForm />
      </div>
    </section>
  );
}
