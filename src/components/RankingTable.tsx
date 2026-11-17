import type { SeasonRankingRow } from "../lib/types";

// Orden: 1ro puntos, 2do sets ganados, 3ro menos sets perdidos (criterios de desempate).
export function compareRows(a: SeasonRankingRow, b: SeasonRankingRow): number {
  if (b.total_points !== a.total_points) return b.total_points - a.total_points;
  if (b.sets_won !== a.sets_won) return b.sets_won - a.sets_won;
  return a.sets_lost - b.sets_lost;
}

export default function RankingTable({ rows }: { rows: SeasonRankingRow[] }) {
  const sorted = [...rows].sort(compareRows);

  return (
    <table className="ranking-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Jugador</th>
          <th>Puntos</th>
          <th>Fechas</th>
          <th>Partidos</th>
          <th>Sets G.</th>
          <th>Sets P.</th>
          <th>Games G.</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((row, i) => (
          <tr key={row.player_id}>
            <td>{i + 1}</td>
            <td>{row.name}</td>
            <td className="points-cell">{row.total_points}</td>
            <td>{row.dates_played}</td>
            <td>{row.matches_played}</td>
            <td>{row.sets_won}</td>
            <td>{row.sets_lost}</td>
            <td>{row.games_won}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
