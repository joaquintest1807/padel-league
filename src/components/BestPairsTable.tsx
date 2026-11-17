import type { BestPairDisplay } from "../hooks/useBestPairs";

export default function BestPairsTable({ rows }: { rows: BestPairDisplay[] }) {
  const sorted = [...rows]
    .filter((r) => r.matches_played > 0)
    .sort((a, b) => b.winPct - a.winPct || b.total_points - a.total_points);

  if (sorted.length === 0) {
    return <p className="empty-state">Todavía no hay parejas con partidos jugados.</p>;
  }

  return (
    <table className="best-pairs-table">
      <thead>
        <tr>
          <th>Pareja</th>
          <th>Partidos</th>
          <th>Ganados</th>
          <th>% Victoria</th>
          <th>Puntos</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((row) => (
          <tr key={`${row.player_a_id}-${row.player_b_id}`}>
            <td>
              {row.playerAName} / {row.playerBName}
            </td>
            <td>{row.matches_played}</td>
            <td>{row.matches_won}</td>
            <td>{Math.round(row.winPct * 100)}%</td>
            <td>{row.total_points}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
