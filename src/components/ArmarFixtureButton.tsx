interface Props {
  confirmedCount: number;
  alreadyGenerated: boolean;
  isPending: boolean;
  onClick: () => void;
}

const VALID_COUNTS = [4, 6, 8];

export default function ArmarFixtureButton({
  confirmedCount,
  alreadyGenerated,
  isPending,
  onClick,
}: Props) {
  if (alreadyGenerated) return null;

  const isValid = VALID_COUNTS.includes(confirmedCount);

  return (
    <div className="armar-fixture">
      <button
        type="button"
        className="btn-primary"
        disabled={!isValid || isPending}
        onClick={onClick}
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
