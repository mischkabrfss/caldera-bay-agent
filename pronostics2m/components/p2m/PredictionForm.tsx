import Link from 'next/link';
import type { PredictionWithLegs } from '@/lib/predictions';
import { today } from '@/lib/format';

const VIP_OPTIONS = [
  { value: 'safe', label: 'VIP Safe' },
  { value: 'premium', label: 'VIP Premium' },
  { value: 'grosse_cote', label: 'VIP Grosse Cote' },
];

const TYPE_OPTIONS = [
  { value: 'safe', label: 'Safe' },
  { value: 'montante', label: 'Montante' },
  { value: 'buteur', label: 'Buteur' },
  { value: 'combine', label: 'Combiné' },
  { value: 'grosse_cote', label: 'Grosse cote' },
];

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Brouillon' },
  { value: 'upcoming', label: 'À venir' },
  { value: 'won', label: 'Gagné' },
  { value: 'lost', label: 'Perdu' },
  { value: 'void', label: 'Annulé' },
];

const LEG_SLOTS = 8;

export function PredictionForm({ prediction }: { prediction?: PredictionWithLegs }) {
  const editing = Boolean(prediction);
  const legs = prediction?.legs ?? [];

  return (
    <form
      method="post"
      action={editing ? `/api/admin/predictions/${prediction!.id}` : '/api/admin/predictions'}
      className="stack gap-14"
    >
      <label className="field">
        <span>CATÉGORIE VIP</span>
        <select className="select" name="vip_type" defaultValue={prediction?.vip_type ?? 'safe'}>
          {VIP_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>TYPE DE PRONOSTIC</span>
        <select
          className="select"
          name="prediction_type"
          defaultValue={prediction?.prediction_type ?? 'safe'}
        >
          {TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <div className="grid-2">
        <label className="field">
          <span>DATE</span>
          <input
            className="input"
            type="date"
            name="match_date"
            required
            defaultValue={prediction?.match_date ?? today()}
          />
        </label>
        <label className="field">
          <span>HEURE</span>
          <input className="input" type="time" name="kick_off" defaultValue={prediction?.kick_off ?? ''} />
        </label>
        <label className="field">
          <span>SPORT</span>
          <input className="input" name="sport" defaultValue={prediction?.sport ?? 'Football'} />
        </label>
        <label className="field">
          <span>COMPÉTITION</span>
          <input className="input" name="competition" defaultValue={prediction?.competition ?? ''} />
        </label>
      </div>

      <label className="field">
        <span>MATCH</span>
        <input
          className="input"
          name="match_label"
          placeholder="Équipe A — Équipe B"
          defaultValue={prediction?.match_label ?? ''}
        />
      </label>

      <div className="grid-2">
        <label className="field">
          <span>PARI</span>
          <input className="input" name="bet" defaultValue={prediction?.bet ?? ''} />
        </label>
        <label className="field">
          <span>COTE</span>
          <input
            className="input"
            type="number"
            step="0.01"
            min="1"
            name="odds"
            defaultValue={prediction?.odds ? String(prediction.odds) : ''}
          />
        </label>
      </div>

      <label className="field">
        <span>JOUEUR (SI BUTEUR)</span>
        <input
          className="input"
          name="player"
          placeholder="Optionnel"
          defaultValue={prediction?.player ?? ''}
        />
      </label>

      <label className="field">
        <span>NIVEAU DE CONFIANCE (1 À 5)</span>
        <select className="select" name="confidence" defaultValue={String(prediction?.confidence ?? 3)}>
          {[1, 2, 3, 4, 5].map((level) => (
            <option key={level} value={level}>
              {level} / 5
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>ANALYSE</span>
        <textarea className="textarea" name="analysis" defaultValue={prediction?.analysis ?? ''} />
      </label>

      <div className="card-flat stack gap-12">
        <div>
          <b className="disp" style={{ fontSize: 18 }}>
            SÉLECTIONS
          </b>
          <p className="xs dim mt-8">
            À remplir pour une montante, un combiné ou une grosse cote. La cote totale est calculée
            automatiquement à partir des sélections non annulées. Laissez vide pour un pronostic
            simple.
          </p>
        </div>

        {Array.from({ length: LEG_SLOTS }).map((_, index) => {
          const leg = legs[index];
          return (
            <div key={index} className="stack gap-8" style={{ paddingTop: index ? 12 : 0, borderTop: index ? '1px solid var(--line)' : undefined }}>
              <span className="xs" style={{ color: 'var(--muted-2)', letterSpacing: '0.12em' }}>
                ÉTAPE {index + 1}
              </span>
              <input
                className="input"
                name={`leg_match_${index}`}
                placeholder="Match"
                defaultValue={leg?.match_label ?? ''}
              />
              <input
                className="input"
                name={`leg_bet_${index}`}
                placeholder="Pari"
                defaultValue={leg?.bet ?? ''}
              />
              <div className="grid-2">
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  min="1"
                  name={`leg_odds_${index}`}
                  placeholder="Cote"
                  defaultValue={leg?.odds ? String(leg.odds) : ''}
                />
                <select
                  className="select"
                  name={`leg_status_${index}`}
                  defaultValue={leg?.status ?? 'upcoming'}
                >
                  <option value="upcoming">À venir</option>
                  <option value="won">Gagné</option>
                  <option value="lost">Perdu</option>
                  <option value="void">Annulé</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>

      <label className="field">
        <span>STATUT</span>
        <select className="select" name="status" defaultValue={prediction?.status ?? 'upcoming'}>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <div className="grid-2">
        <button type="submit" name="action" value="draft" className="btn-ghost">
          Enregistrer comme brouillon
        </button>
        <button type="submit" name="action" value="publish" className="btn">
          {editing ? 'Enregistrer' : 'Publier'}
        </button>
      </div>

      <p className="xs dim center">
        Publié → visible immédiatement par les abonnés de la catégorie choisie.
      </p>

      <Link href="/admin/pronostics" className="small center">
        Retour à la liste
      </Link>
    </form>
  );
}
