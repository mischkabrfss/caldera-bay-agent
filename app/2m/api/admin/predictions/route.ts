import { getDb } from '@/lib/db';
import { isAdminRequest } from '@/lib/admin';
import { redirectTo } from '@/lib/http';
import { readPredictionForm } from '@/lib/predictionInput';

export async function POST(request: Request): Promise<Response> {
  if (!(await isAdminRequest())) return redirectTo(request, '/2m/connexion');

  const form = await request.formData();
  const input = readPredictionForm(form);
  if ('error' in input) {
    return redirectTo(
      request,
      `/2m/admin/pronostics/nouveau?erreur=${encodeURIComponent(input.error)}`,
    );
  }

  const db = await getDb();
  const created = await db
    .prepare(
      `INSERT INTO predictions
        (vip_type, prediction_type, match_date, sport, competition, match_label, kick_off,
         bet, player, odds, confidence, analysis, status, published_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13,
         CASE WHEN ?13 = 'draft' THEN NULL ELSE datetime('now') END)
       RETURNING id`,
    )
    .bind(
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
    .first<{ id: number }>();

  if (created && input.legs.length > 0) {
    for (const [index, leg] of input.legs.entries()) {
      await db
        .prepare(
          `INSERT INTO prediction_legs (prediction_id, position, match_label, bet, odds, status)
           VALUES (?1, ?2, ?3, ?4, ?5, ?6)`,
        )
        .bind(created.id, index + 1, leg.match_label, leg.bet, leg.odds, leg.status)
        .run();
    }
  }

  const message =
    input.status === 'draft' ? 'Brouillon enregistré.' : 'Pronostic publié — il est visible par les abonnés concernés.';
  return redirectTo(request, `/2m/admin/pronostics?ok=${encodeURIComponent(message)}`);
}
