import { useBestPairs } from "../hooks/useBestPairs";
import BestPairsTable from "../components/BestPairsTable";

export default function MejoresParejas() {
  const { rows, isLoading, error } = useBestPairs();

  if (isLoading) return <p className="loading">Cargando...</p>;
  if (error) return <p className="error">No se pudo cargar las parejas.</p>;

  return (
    <div className="page">
      <h1>Mejores Parejas</h1>
      <BestPairsTable rows={rows} />
    </div>
  );
}
