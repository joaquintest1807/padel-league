import type { BestPairDisplay } from "../hooks/useBestPairs";

export default function BestPairsTable({ rows }: { rows: BestPairDisplay[] }) {
  const sorted = [...rows]
    .filter((r) => r.sets_played > 0)
    .sort((a, b) => b.winPct - a.winPct || b.total_game_diff - a.total_game_diff);

  if (sorted.length === 0) {
    return <p className="empty-state">Todavía no hay parejas con sets jugados.</p>;
  }

  return (
    <table className="best-pairs-table">
      <thead>
        <tr>
          <th>Pareja</th>
          <th>Sets</th>
          <th>Ganados</th>
          <th>% Victoria</th>
          <th>Dif. Games</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((row) => (
          <tr key={`${row.player_a_id}-${row.player_b_id}`}>
            <td>
              {row.playerAName} / {row.playerBName}
            </td>
            <td>{row.sets_played}</td>
            <td>{row.sets_won}</td>
            <td>{Math.round(row.winPct * 100)}%</td>
            <td>{row.total_game_diff >= 0 ? `+${row.total_game_diff}` : row.total_game_diff}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
