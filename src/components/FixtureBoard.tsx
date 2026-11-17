import type { Match, Pair, Player } from "../lib/types";
import MatchCard from "./MatchCard";

interface Props {
  pairs: Pair[];
  matches: Match[];
  players: Player[];
  onSaveScore: (matchId: number, gamesPair1: number, gamesPair2: number) => void;
  savingMatchId: number | null;
}

export default function FixtureBoard({
  pairs,
  matches,
  players,
  onSaveScore,
  savingMatchId,
}: Props) {
  const pairsById = new Map(pairs.map((p) => [p.id, p]));
  const nameById = new Map(players.map((p) => [p.id, p.name]));

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
                  pairsById={pairsById}
                  nameById={nameById}
                  isSaving={savingMatchId === match.id}
                  onSave={(gamesPair1, gamesPair2) =>
                    onSaveScore(match.id, gamesPair1, gamesPair2)
                  }
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
