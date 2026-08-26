import { getDb } from '@/lib/db';
import { isAdminRequest } from '@/lib/admin';
import { redirectTo } from '@/lib/http';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  if (!(await isAdminRequest())) return redirectTo(request, '/2m/connexion');

  const { id } = await params;
  const predictionId = Number(id);
  if (Number.isInteger(predictionId)) {
    const db = await getDb();
    await db.prepare('DELETE FROM prediction_legs WHERE prediction_id = ?1').bind(predictionId).run();
    await db.prepare('DELETE FROM predictions WHERE id = ?1').bind(predictionId).run();
  }

  return redirectTo(request, `/2m/admin/pronostics?ok=${encodeURIComponent('Pronostic supprimé.')}`);
}
