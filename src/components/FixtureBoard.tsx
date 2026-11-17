import type { Match, MatchSet, Pair, Player } from "../lib/types";
import MatchCard from "./MatchCard";

interface Props {
  pairs: Pair[];
  matches: Match[];
  sets: MatchSet[];
  players: Player[];
  onSaveSets: (
    matchId: number,
    updates: { setId: number; gamesPair1: number; gamesPair2: number }[]
  ) => void;
  savingMatchId: number | null;
}

export default function FixtureBoard({
  pairs,
  matches,
  sets,
  players,
  onSaveSets,
  savingMatchId,
}: Props) {
  const pairsById = new Map(pairs.map((p) => [p.id, p]));
  const nameById = new Map(players.map((p) => [p.id, p.name]));

  const setsByMatch = new Map<number, MatchSet[]>();
  for (const s of sets) {
    const list = setsByMatch.get(s.match_id) ?? [];
    list.push(s);
    setsByMatch.set(s.match_id, list);
  }

  const rounds = Array.from(new Set(matches.map((m) => m.round))).sort((a, b) => a - b);

  return (
    <div className="fixture-board">
      {rounds.map((round) => (
        <div key={round} className="fixture-round">
          <h3>Ronda {round}</h3>
          <div className="fixture-round-matches">
            {matches
              .filter((m) => m.round === round)
              .sort((a, b) => a.court - b.court)
              .map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  sets={(setsByMatch.get(match.id) ?? []).sort(
                    (a, b) => a.set_number - b.set_number
                  )}
                  pairsById={pairsById}
                  nameById={nameById}
                  isSaving={savingMatchId === match.id}
                  onSave={(updates) => onSaveSets(match.id, updates)}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
