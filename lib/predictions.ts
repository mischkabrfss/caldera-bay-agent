import { getDb } from './db';
import type { VipType } from './access';

export type PredictionStatus = 'draft' | 'upcoming' | 'won' | 'lost' | 'void';

export const STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon',
  upcoming: 'À venir',
  won: 'Gagné',
  lost: 'Perdu',
  void: 'Annulé',
};

export const TYPE_LABELS: Record<string, string> = {
  safe: 'Safe',
  montante: 'Montante',
  buteur: 'Buteur',
  combine: 'Combiné',
  grosse_cote: 'Grosse cote',
};

/** Prediction types that are built from several selections. */
export const MULTI_TYPES = ['montante', 'combine', 'grosse_cote'];

export type Leg = {
  id: number;
  prediction_id: number;
  position: number;
  match_label: string;
  bet: string;
  odds: number;
  status: string;
};

export type Prediction = {
  id: number;
  vip_type: VipType;
  prediction_type: string;
  match_date: string;
  sport: string;
  competition: string;
  match_label: string;
  kick_off: string;
  bet: string;
  player: string;
  odds: number;
  confidence: number;
  analysis: string;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PredictionWithLegs = Prediction & { legs: Leg[]; total_odds: number };

function totalOdds(prediction: Prediction, legs: Leg[]): number {
  if (!MULTI_TYPES.includes(prediction.prediction_type) || legs.length === 0) {
    return prediction.odds;
  }
  return legs
    .filter((leg) => leg.status !== 'void')
    .reduce((product, leg) => product * (leg.odds || 1), 1);
}

async function withLegs(rows: Prediction[]): Promise<PredictionWithLegs[]> {
  if (rows.length === 0) return [];
  const db = await getDb();
  const ids = rows.map((row) => row.id);
  const placeholders = ids.map((_, index) => `?${index + 1}`).join(', ');
  const { results } = await db
    .prepare(
      `SELECT * FROM prediction_legs WHERE prediction_id IN (${placeholders}) ORDER BY position ASC`,
    )
    .bind(...ids)
    .all<Leg>();
  const legs = results ?? [];
  return rows.map((row) => {
    const own = legs.filter((leg) => leg.prediction_id === row.id);
    return { ...row, legs: own, total_odds: totalOdds(row, own) };
  });
}

/** Published predictions of a VIP area for one day (defaults to the latest published day). */
export async function dailyPredictions(
  vipType: VipType,
  date?: string,
): Promise<PredictionWithLegs[]> {
  const db = await getDb();
  let day = date;
  if (!day) {
    const latest = await db
      .prepare(
        `SELECT match_date FROM predictions
         WHERE vip_type = ?1 AND status <> 'draft'
         ORDER BY match_date DESC LIMIT 1`,
      )
      .bind(vipType)
      .first<{ match_date: string }>();
    day = latest?.match_date;
  }
  if (!day) return [];
  const { results } = await db
    .prepare(
      `SELECT * FROM predictions
       WHERE vip_type = ?1 AND status <> 'draft' AND match_date = ?2
       ORDER BY kick_off ASC, id ASC`,
    )
    .bind(vipType, day)
    .all<Prediction>();
  return withLegs(results ?? []);
}

export type HistoryFilters = {
  vipTypes: VipType[];
  vipType?: string;
  status?: string;
  month?: string;
  limit?: number;
};

export async function history(filters: HistoryFilters): Promise<PredictionWithLegs[]> {
  const db = await getDb();
  if (filters.vipTypes.length === 0) return [];
  const allowed =
    filters.vipType && filters.vipTypes.includes(filters.vipType as VipType)
      ? [filters.vipType as VipType]
      : filters.vipTypes;
  const binds: unknown[] = [...allowed];
  const placeholders = allowed.map((_, index) => `?${index + 1}`).join(', ');
  let sql = `SELECT * FROM predictions WHERE status <> 'draft' AND vip_type IN (${placeholders})`;
  if (filters.status && ['upcoming', 'won', 'lost', 'void'].includes(filters.status)) {
    binds.push(filters.status);
    sql += ` AND status = ?${binds.length}`;
  }
  if (filters.month && /^\d{4}-\d{2}$/.test(filters.month)) {
    binds.push(`${filters.month}%`);
    sql += ` AND match_date LIKE ?${binds.length}`;
  }
  sql += ` ORDER BY match_date DESC, id DESC LIMIT ${Math.min(filters.limit ?? 100, 200)}`;
  const { results } = await db
    .prepare(sql)
    .bind(...binds)
    .all<Prediction>();
  return withLegs(results ?? []);
}

export type Stats = {
  total: number;
  won: number;
  lost: number;
  void: number;
  upcoming: number;
  successRate: number | null;
  roi: number | null;
};

/** Statistics computed from recorded results only — never from estimates. */
export function computeStats(rows: PredictionWithLegs[]): Stats {
  const won = rows.filter((row) => row.status === 'won');
  const lost = rows.filter((row) => row.status === 'lost');
  const voided = rows.filter((row) => row.status === 'void');
  const upcoming = rows.filter((row) => row.status === 'upcoming');
  const settled = won.length + lost.length;
  const returned = won.reduce((sum, row) => sum + (row.total_odds || 0), 0);
  return {
    total: rows.length,
    won: won.length,
    lost: lost.length,
    void: voided.length,
    upcoming: upcoming.length,
    successRate: settled > 0 ? (won.length / settled) * 100 : null,
    roi: settled > 0 ? ((returned - settled) / settled) * 100 : null,
  };
}

export async function getPrediction(id: number): Promise<PredictionWithLegs | null> {
  const db = await getDb();
  const row = await db.prepare('SELECT * FROM predictions WHERE id = ?1').bind(id).first<Prediction>();
  if (!row) return null;
  return (await withLegs([row]))[0] ?? null;
}

export async function adminPredictions(limit = 60): Promise<PredictionWithLegs[]> {
  const db = await getDb();
  const { results } = await db
    .prepare(`SELECT * FROM predictions ORDER BY match_date DESC, id DESC LIMIT ${limit}`)
    .all<Prediction>();
  return withLegs(results ?? []);
}
