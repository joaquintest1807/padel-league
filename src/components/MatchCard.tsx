import { useState } from "react";
import type { Match, MatchSet, Pair } from "../lib/types";
import { PAIR_LETTERS } from "../lib/types";
import { computeMatchPoints } from "../utils/scoring";

interface Props {
  match: Match;
  sets: MatchSet[]; // hasta 3, ordenados por set_number
  pairsById: Map<number, Pair>;
  nameById: Map<number, string>;
  onSave: (updates: { setId: number; gamesPair1: number; gamesPair2: number }[]) => void;
  isSaving: boolean;
  canEdit: boolean;
}

function pairLabel(pair: Pair | undefined, nameById: Map<number, string>): string {
  if (!pair) return "?";
  const n1 = nameById.get(pair.player_1_id) ?? "?";
  const n2 = nameById.get(pair.player_2_id) ?? "?";
  return `${n1} / ${n2}`;
}

interface SetInputState {
  g1: string;
  g2: string;
}

export default function MatchCard({
  match,
  sets,
  pairsById,
  nameById,
  onSave,
  isSaving,
  canEdit,
}: Props) {
  const pair1 = pairsById.get(match.pair_1_id);
  const pair2 = pairsById.get(match.pair_2_id);

  const [inputs, setInputs] = useState<Record<number, SetInputState>>(() => {
    const initial: Record<number, SetInputState> = {};
    for (const s of sets) {
      initial[s.id] = {
        g1: s.games_pair_1?.toString() ?? "",
        g2: s.games_pair_2?.toString() ?? "",
      };
    }
    return initial;
  });

  function updateInput(setId: number, field: "g1" | "g2", value: string) {
    setInputs((prev) => ({
      ...prev,
      [setId]: { ...prev[setId], [field]: value },
    }));
  }

  // Un set solo cuenta como "listo para guardar" si tiene ambos valores,
  // son numeros validos y no estan empatados (un set de padel no empata).
  const readySets = sets.map((s) => {
    const input = inputs[s.id] ?? { g1: "", g2: "" };
    const g1 = input.g1 === "" ? null : Number(input.g1);
    const g2 = input.g2 === "" ? null : Number(input.g2);
    const valid =
      g1 !== null &&
      g2 !== null &&
      Number.isInteger(g1) &&
      Number.isInteger(g2) &&
      g1 >= 0 &&
      g2 >= 0 &&
      g1 !== g2;
    return { set: s, g1, g2, valid };
  });

  const canSave = readySets.some((r) => r.valid);

  const matchPoints = computeMatchPoints(
    readySets.map((r) => ({
      gamesPair1: r.valid ? r.g1 : null,
      gamesPair2: r.valid ? r.g2 : null,
    }))
  );

  function handleSave() {
    const updates = readySets
      .filter((r) => r.valid)
      .map((r) => ({ setId: r.set.id, gamesPair1: r.g1 as number, gamesPair2: r.g2 as number }));
    onSave(updates);
  }

  const hasAnySavedSet = sets.some((s) => s.games_pair_1 !== null && s.games_pair_2 !== null);

  return (
    <div className="match-card">
      <div className="match-header">
        Ronda {match.round} · Cancha {match.court}
      </div>

      <div className="match-sets">
        {sets.map((s) => {
          const input = inputs[s.id] ?? { g1: "", g2: "" };
          return (
            <div key={s.id} className="set-row">
              <span className="set-label">Set {s.set_number}</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                className="games-input"
                value={input.g1}
                disabled={!canEdit}
                onChange={(e) => updateInput(s.id, "g1", e.target.value)}
              />
              <span className="set-dash">-</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                className="games-input"
                value={input.g2}
                disabled={!canEdit}
                onChange={(e) => updateInput(s.id, "g2", e.target.value)}
              />
            </div>
          );
        })}
      </div>

      <div className="match-body">
        <div className="match-pair">
          <span className="pair-letter">{PAIR_LETTERS[pair1?.pair_order ?? 0]}</span>
          <span className="pair-names">{pairLabel(pair1, nameById)}</span>
          {matchPoints.isStarted && (
            <span className="points-preview total">{matchPoints.pointsPair1}</span>
          )}
        </div>
        <div className="match-vs">vs</div>
        <div className="match-pair">
          <span className="pair-letter">{PAIR_LETTERS[pair2?.pair_order ?? 0]}</span>
          <span className="pair-names">{pairLabel(pair2, nameById)}</span>
          {matchPoints.isStarted && (
            <span className="points-preview total">{matchPoints.pointsPair2}</span>
          )}
        </div>
      </div>

      {canEdit && (
        <button
          type="button"
          className="btn-secondary"
          disabled={!canSave || isSaving}
          onClick={handleSave}
        >
          {isSaving ? "Guardando..." : hasAnySavedSet ? "Actualizar resultado" : "Guardar resultado"}
        </button>
      )}
    </div>
  );
}
