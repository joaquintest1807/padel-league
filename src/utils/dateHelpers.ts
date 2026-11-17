import { supabase } from "../lib/supabaseClient";
import type { MatchDate } from "../lib/types";

/** Devuelve la fecha (yyyy-mm-dd) del proximo miercoles. Si hoy es miercoles, devuelve hoy. */
export function nextWednesdayISO(from: Date = new Date()): string {
  const d = new Date(from);
  const day = d.getDay(); // 0=domingo ... 3=miercoles ... 6=sabado
  const diff = (3 - day + 7) % 7;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

export function formatDateDisplay(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/** Busca el match_date del proximo miercoles; si no existe, lo crea. */
export async function getOrCreateThisWeekMatchDate(): Promise<MatchDate> {
  const iso = nextWednesdayISO();

  const { data: existing, error: selectError } = await supabase
    .from("match_dates")
    .select("*")
    .eq("date", iso)
    .maybeSingle();

  if (selectError) throw selectError;
  if (existing) return existing as MatchDate;

  const { data: created, error: insertError } = await supabase
    .from("match_dates")
    .insert({ date: iso })
    .select("*")
    .single();

  if (insertError) throw insertError;
  return created as MatchDate;
}
