import type { SeasonRankingRow } from "../lib/types";

export default function RankingTable({ rows }: { rows: SeasonRankingRow[] }) {
  const sorted = [...rows].sort((a, b) => b.total_points - a.total_points);

  return (
    <table className="ranking-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Jugador</th>
          <th>Puntos</th>
          <th>Fechas</th>
          <th>Partidos</th>
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
          </tr>
        ))}
      </tbody>
    </table>
  );
}
