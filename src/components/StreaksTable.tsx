import type { StreakDisplay } from "../hooks/useStreaks";

export default function StreaksTable({ rows }: { rows: StreakDisplay[] }) {
  const sorted = [...rows].sort((a, b) => b.current - a.current || b.best - a.best);

  return (
    <table className="streaks-table">
      <thead>
        <tr>
          <th>Jugador</th>
          <th>Racha actual</th>
          <th>Mejor racha</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((row) => (
          <tr key={row.playerId}>
            <td>{row.name}</td>
            <td>{row.current}</td>
            <td>{row.best}</td>
            <td>
              {row.current >= 3 ? "🔥 En racha" : row.current >= 1 ? "Positivo" : "-"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
