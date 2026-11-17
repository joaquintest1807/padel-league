import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import { formatDateDisplay } from "../utils/dateHelpers";
import DateFixtureView from "../components/DateFixtureView";
import type { MatchDate } from "../lib/types";

export default function Historial() {
  const [selected, setSelected] = useState<MatchDate | null>(null);

  const { data: dates, isLoading } = useQuery({
    queryKey: ["match_dates"],
    queryFn: async (): Promise<MatchDate[]> => {
      const { data, error } = await supabase
        .from("match_dates")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return data as MatchDate[];
    },
  });

  if (selected) {
    return (
      <div className="page">
        <button type="button" className="btn-link-back" onClick={() => setSelected(null)}>
          ← Volver al historial
        </button>
        <h1>{formatDateDisplay(selected.date)}</h1>
        <DateFixtureView matchDate={selected} allowAvailabilityEdits={false} />
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Historial</h1>
      {isLoading && <p className="loading">Cargando...</p>}
      {!isLoading && (dates ?? []).length === 0 && (
        <p className="empty-state">Todavía no hay fechas jugadas.</p>
      )}
      <ul className="history-list">
        {(dates ?? []).map((d) => (
          <li key={d.id}>
            <button type="button" className="history-item" onClick={() => setSelected(d)}>
              {formatDateDisplay(d.date)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
