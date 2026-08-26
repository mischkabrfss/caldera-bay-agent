import { getDb } from '@/lib/db';
import { isAdminRequest } from '@/lib/admin';
import { redirectTo } from '@/lib/http';
import { readPredictionForm } from '@/lib/predictionInput';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  if (!(await isAdminRequest())) return redirectTo(request, '/connexion');

  const { id } = await params;
  const predictionId = Number(id);
  if (!Number.isInteger(predictionId)) return redirectTo(request, '/admin/pronostics');

  const form = await request.formData();
  const input = readPredictionForm(form);
  if ('error' in input) {
    return redirectTo(
      request,
      `/admin/pronostics/${predictionId}?erreur=${encodeURIComponent(input.error)}`,
    );
  }

  const db = await getDb();
  // published_at is kept once set, so the original publication date survives edits.
  await db
    .prepare(
      `UPDATE predictions SET
         vip_type = ?2, prediction_type = ?3, match_date = ?4, sport = ?5, competition = ?6,
         match_label = ?7, kick_off = ?8, bet = ?9, player = ?10, odds = ?11, confidence = ?12,
         analysis = ?13, status = ?14,
         published_at = CASE
           WHEN ?14 = 'draft' THEN published_at
           WHEN published_at IS NULL THEN datetime('now')
           ELSE published_at END,
         updated_at = datetime('now')
       WHERE id = ?1`,
    )
    .bind(
      predictionId,
      input.vip_type,
      input.prediction_type,
      input.match_date,
      input.sport,
      input.competition,
      input.match_label,
      input.kick_off,
      input.bet,
      input.player,
      input.odds,
      input.confidence,
      input.analysis,
      input.status,
    )
    .run();

  await db.prepare('DELETE FROM prediction_legs WHERE prediction_id = ?1').bind(predictionId).run();
  for (const [index, leg] of input.legs.entries()) {
    await db
      .prepare(
        `INSERT INTO prediction_legs (prediction_id, position, match_label, bet, odds, status)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)`,
      )
      .bind(predictionId, index + 1, leg.match_label, leg.bet, leg.odds, leg.status)
      .run();
  }

  return redirectTo(
    request,
    `/admin/pronostics?ok=${encodeURIComponent('Pronostic mis à jour.')}`,
  );
}
