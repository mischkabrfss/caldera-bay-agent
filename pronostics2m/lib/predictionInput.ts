export type LegInput = { match_label: string; bet: string; odds: number; status: string };

export type PredictionInput = {
  vip_type: string;
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
  legs: LegInput[];
};

const VIP_TYPES = ['safe', 'premium', 'grosse_cote'];
const PREDICTION_TYPES = ['safe', 'montante', 'buteur', 'combine', 'grosse_cote'];
const STATUSES = ['draft', 'upcoming', 'won', 'lost', 'void'];
const LEG_STATUSES = ['upcoming', 'won', 'lost', 'void'];
const LEG_SLOTS = 8;

function text(form: FormData, key: string): string {
  return String(form.get(key) ?? '').trim();
}

function decimal(form: FormData, key: string): number {
  const value = Number(String(form.get(key) ?? '').replace(',', '.'));
  return Number.isFinite(value) && value > 0 ? value : 0;
}

/** Reads and validates the admin prediction form. */
export function readPredictionForm(form: FormData): PredictionInput | { error: string } {
  const vip_type = text(form, 'vip_type');
  const prediction_type = text(form, 'prediction_type');
  const match_date = text(form, 'match_date');

  if (!VIP_TYPES.includes(vip_type)) return { error: 'Catégorie VIP invalide.' };
  if (!PREDICTION_TYPES.includes(prediction_type)) return { error: 'Type de pronostic invalide.' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(match_date)) return { error: 'Date invalide.' };

  const legs: LegInput[] = [];
  for (let index = 0; index < LEG_SLOTS; index += 1) {
    const match_label = text(form, `leg_match_${index}`);
    const bet = text(form, `leg_bet_${index}`);
    const odds = decimal(form, `leg_odds_${index}`);
    if (!match_label && !bet && !odds) continue;
    const status = text(form, `leg_status_${index}`);
    legs.push({
      match_label,
      bet,
      odds,
      status: LEG_STATUSES.includes(status) ? status : 'upcoming',
    });
  }

  const action = text(form, 'action');
  let status = text(form, 'status');
  if (!STATUSES.includes(status)) status = 'upcoming';
  if (action === 'draft') status = 'draft';
  if (action === 'publish' && status === 'draft') status = 'upcoming';

  const confidence = Math.min(5, Math.max(1, Number(text(form, 'confidence')) || 3));

  const input: PredictionInput = {
    vip_type,
    prediction_type,
    match_date,
    sport: text(form, 'sport') || 'Football',
    competition: text(form, 'competition'),
    match_label: text(form, 'match_label'),
    kick_off: text(form, 'kick_off'),
    bet: text(form, 'bet'),
    player: text(form, 'player'),
    odds: decimal(form, 'odds'),
    confidence,
    analysis: text(form, 'analysis'),
    status,
    legs,
  };

  if (legs.length === 0 && !input.match_label) {
    return { error: 'Renseignez au moins un match ou une sélection.' };
  }
  if (legs.length === 0 && input.odds === 0) {
    return { error: 'Renseignez une cote.' };
  }

  return input;
}
