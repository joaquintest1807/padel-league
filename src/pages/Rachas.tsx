import { useStreaks } from "../hooks/useStreaks";
import StreaksTable from "../components/StreaksTable";

export default function Rachas() {
  const { streaks, isLoading, error } = useStreaks();

  if (isLoading) return <p className="loading">Cargando...</p>;
  if (error) return <p className="error">No se pudo cargar las rachas.</p>;

  return (
    <div className="page">
      <h1>Rachas</h1>
      <StreaksTable rows={streaks} />
    </div>
  );
}
