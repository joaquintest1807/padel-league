import { useState } from "react";
import type { Match, Pair } from "../lib/types";
import { PAIR_LETTERS } from "../lib/types";
import { computeSetPoints } from "../utils/scoring";

interface Props {
  match: Match;
  pairsById: Map<number, Pair>;
  nameById: Map<number, string>;
  onSave: (gamesPair1: number, gamesPair2: number) => void;
  isSaving: boolean;
}

function pairLabel(pair: Pair | undefined, nameById: Map<number, string>): string {
  if (!pair) return "?";
  const n1 = nameById.get(pair.player_1_id) ?? "?";
  const n2 = nameById.get(pair.player_2_id) ?? "?";
  return `${n1} / ${n2}`;
}

export default function MatchCard({ match, pairsById, nameById, onSave, isSaving }: Props) {
  const pair1 = pairsById.get(match.pair_1_id);
  const pair2 = pairsById.get(match.pair_2_id);

  const [g1, setG1] = useState(match.games_pair_1?.toString() ?? "");
  const [g2, setG2] = useState(match.games_pair_2?.toString() ?? "");

  const parsedG1 = g1 === "" ? null : Number(g1);
  const parsedG2 = g2 === "" ? null : Number(g2);
  const previewPoints1 = computeSetPoints(parsedG1, parsedG2);
  const previewPoints2 = computeSetPoints(parsedG2, parsedG1);

  const hasSavedScore = match.games_pair_1 !== null && match.games_pair_2 !== null;
  const canSave =
    parsedG1 !== null &&
    parsedG2 !== null &&
    Number.isInteger(parsedG1) &&
    Number.isInteger(parsedG2) &&
    parsedG1 >= 0 &&
    parsedG2 >= 0 &&
    parsedG1 !== parsedG2; // un set no puede terminar empatado

  return (
    <div className="match-card">
      <div className="match-header">
        Ronda {match.round} · Cancha {match.court}
      </div>
      <div className="match-body">
        <div className="match-pair">
          <span className="pair-letter">{PAIR_LETTERS[pair1?.pair_order ?? 0]}</span>
          <span className="pair-names">{pairLabel(pair1, nameById)}</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            className="games-input"
            value={g1}
            onChange={(e) => setG1(e.target.value)}
          />
          {previewPoints1 !== null && (
            <span className="points-preview">{previewPoints1 >= 0 ? `+${previewPoints1}` : previewPoints1}</span>
          )}
        </div>
        <div className="match-vs">vs</div>
        <div className="match-pair">
          <span className="pair-letter">{PAIR_LETTERS[pair2?.pair_order ?? 0]}</span>
          <span className="pair-names">{pairLabel(pair2, nameById)}</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            className="games-input"
            value={g2}
            onChange={(e) => setG2(e.target.value)}
          />
          {previewPoints2 !== null && (
            <span className="points-preview">{previewPoints2 >= 0 ? `+${previewPoints2}` : previewPoints2}</span>
          )}
        </div>
      </div>
      <button
        type="button"
        className="btn-secondary"
        disabled={!canSave || isSaving}
        onClick={() => onSave(parsedG1 as number, parsedG2 as number)}
      >
        {isSaving ? "Guardando..." : hasSavedScore ? "Actualizar resultado" : "Guardar resultado"}
      </button>
    </div>
  );
}
