import { useState } from "react";
import type { Availability, MatchDate } from "../lib/types";
import AvailabilityList from "./AvailabilityList";
import ArmarFixtureButton from "./ArmarFixtureButton";
import FixtureBoard from "./FixtureBoard";
import ResultsLockBanner from "./ResultsLockBanner";
import { useAvailability } from "../hooks/useAvailability";
import { useFixture } from "../hooks/useFixture";
import { usePlayers } from "../hooks/usePlayers";
import { useResultsLock } from "../hooks/useResultsLock";

interface Props {
  matchDate: MatchDate;
  /** Si es false (fecha pasada), la lista de disponibilidad queda oculta/solo lectura. */
  allowAvailabilityEdits?: boolean;
}

export default function DateFixtureView({
  matchDate,
  allowAvailabilityEdits = true,
}: Props) {
  const { data: players } = usePlayers();
  const { data: availability, setAvailability } = useAvailability(matchDate.id);
  const { pairs, matches, sets, generateFixture, saveSets } = useFixture(matchDate.id);
  const [savingMatchId, setSavingMatchId] = useState<number | null>(null);
  const { isUnlocked, tryUnlock } = useResultsLock();

  const confirmedCount = (availability ?? []).filter((a) => a.is_available).length;
  const fixtureExists = pairs.length > 0;

  async function handleSaveSets(
    matchId: number,
    updates: { setId: number; gamesPair1: number; gamesPair2: number }[]
  ) {
    setSavingMatchId(matchId);
    try {
      await saveSets.mutateAsync(updates);
    } finally {
      setSavingMatchId(null);
    }
  }

  return (
    <div className="date-fixture-view">
      {!fixtureExists && (
        <section className="section">
          <h2>¿Quién juega?</h2>
          <AvailabilityList
            players={players ?? []}
            availability={availability ?? ([] as Availability[])}
            disabled={!allowAvailabilityEdits}
            onToggle={(playerId, isAvailable) =>
              setAvailability.mutate({ playerId, isAvailable })
            }
          />
          <ArmarFixtureButton
            confirmedCount={confirmedCount}
            alreadyGenerated={fixtureExists}
            isPending={generateFixture.isPending}
            onClick={(gamesPerSet) => generateFixture.mutate(gamesPerSet)}
          />
          {generateFixture.isError && (
            <p className="error">
              {(generateFixture.error as Error)?.message ?? "Error al armar el fixture"}
            </p>
          )}
        </section>
      )}

      {fixtureExists && (
        <section className="section">
          <h2>
            Fixture
            {matchDate.games_per_set && (
              <span className="games-per-set-tag"> · sets a {matchDate.games_per_set} games</span>
            )}
          </h2>
          {!isUnlocked && <ResultsLockBanner onUnlock={tryUnlock} />}
          <FixtureBoard
            pairs={pairs}
            matches={matches}
            sets={sets}
            players={players ?? []}
            onSaveSets={handleSaveSets}
            savingMatchId={savingMatchId}
            canEdit={isUnlocked}
          />
        </section>
      )}
    </div>
  );
}
