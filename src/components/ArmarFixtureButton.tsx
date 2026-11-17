import { useState } from "react";

interface Props {
  confirmedCount: number;
  alreadyGenerated: boolean;
  isPending: boolean;
  onClick: (gamesPerSet: 4 | 6) => void;
}

const VALID_COUNTS = [4, 6, 8];

export default function ArmarFixtureButton({
  confirmedCount,
  alreadyGenerated,
  isPending,
  onClick,
}: Props) {
  const [gamesPerSet, setGamesPerSet] = useState<4 | 6>(6);

  if (alreadyGenerated) return null;

  const isValid = VALID_COUNTS.includes(confirmedCount);

  return (
    <div className="armar-fixture">
      <div className="games-per-set-picker" role="group" aria-label="Games por set">
        <span className="picker-label">¿A cuántos games se juega hoy?</span>
        <div className="picker-options">
          <button
            type="button"
            className={"toggle-btn" + (gamesPerSet === 4 ? " selected" : "")}
            onClick={() => setGamesPerSet(4)}
          >
            4 games
          </button>
          <button
            type="button"
            className={"toggle-btn" + (gamesPerSet === 6 ? " selected" : "")}
            onClick={() => setGamesPerSet(6)}
          >
            6 games
          </button>
        </div>
      </div>
      <button
        type="button"
        className="btn-primary"
        disabled={!isValid || isPending}
        onClick={() => onClick(gamesPerSet)}
      >
        {isPending ? "Armando..." : "Armar fixture"}
      </button>
      {!isValid && (
        <p className="hint">
          Confirmados: {confirmedCount}. Necesitas 4, 6 u 8 para armar el fixture.
        </p>
      )}
    </div>
  );
}
