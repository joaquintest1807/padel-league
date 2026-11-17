import { useRanking } from "../hooks/useRanking";
import RankingTable from "../components/RankingTable";

export default function Tabla() {
  const { data, isLoading, error } = useRanking();

  if (isLoading) return <p className="loading">Cargando...</p>;
  if (error) return <p className="error">No se pudo cargar la tabla.</p>;

  return (
    <div className="page">
      <h1>Tabla General</h1>
      <RankingTable rows={data ?? []} />
    </div>
  );
}
