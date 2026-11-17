import { Link } from "react-router-dom";
import { useRanking } from "../hooks/useRanking";
import { compareRows } from "../components/RankingTable";

export default function Home() {
  const { data } = useRanking();
  const top3 = [...(data ?? [])].sort(compareRows).slice(0, 3);

  return (
    <div className="page">
      <h1>Liga de Pádel</h1>
      <p className="subtitle">Miércoles, 1:30hs</p>

      <section className="section">
        <h2>Top de la temporada</h2>
        {top3.length === 0 ? (
          <p className="empty-state">Todavía no hay resultados cargados.</p>
        ) : (
          <ol className="top-list">
            {top3.map((row) => (
              <li key={row.player_id}>
                <span className="player-name">{row.name}</span>
                <span className="points-cell">{row.total_points} pts</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <Link to="/esta-semana" className="btn-primary btn-link">
        Ir a Esta Semana
      </Link>
    </div>
  );
}
