import { useQuery } from "@tanstack/react-query";
import { getOrCreateThisWeekMatchDate, formatDateDisplay } from "../utils/dateHelpers";
import DateFixtureView from "../components/DateFixtureView";

export default function EstaSemana() {
  const { data: matchDate, isLoading, error } = useQuery({
    queryKey: ["this-week-match-date"],
    queryFn: getOrCreateThisWeekMatchDate,
  });

  if (isLoading) return <p className="loading">Cargando...</p>;
  if (error || !matchDate) return <p className="error">No se pudo cargar la fecha.</p>;

  return (
    <div className="page">
      <h1>Esta semana</h1>
      <p className="subtitle">{formatDateDisplay(matchDate.date)}</p>
      <DateFixtureView matchDate={matchDate} />
    </div>
  );
}
