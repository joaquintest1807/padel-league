import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import { useRealtimeTable } from "./useRealtimeTable";
import { usePlayers } from "./usePlayers";
import { computeStreaks } from "../utils/scoring";
import type { PlayerDatePointsRow } from "../lib/types";

export interface StreakDisplay {
  playerId: number;
  name: string;
  current: number;
  best: number;
}

interface MatchDateRow {
  id: number;
  date: string;
}

export function useStreaks() {
  const queryKey = ["player_date_points"];
  useRealtimeTable("matches", [queryKey]);
  const { data: players } = usePlayers();

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const [pointsRes, datesRes] = await Promise.all([
        supabase.from("player_date_points").select("*"),
        supabase.from("match_dates").select("id, date"),
      ]);
      if (pointsRes.error) throw pointsRes.error;
      if (datesRes.error) throw datesRes.error;
      return {
        points: pointsRes.data as PlayerDatePointsRow[],
        dates: datesRes.data as MatchDateRow[],
      };
    },
  });

  const streaks: StreakDisplay[] = [];
  if (query.data && players) {
    const dateById = new Map(query.data.dates.map((d) => [d.id, d.date]));
    const byPlayer = new Map<number, { date: string; points: number }[]>();

    for (const row of query.data.points) {
      const date = dateById.get(row.match_date_id);
      if (!date) continue;
      const list = byPlayer.get(row.player_id) ?? [];
      list.push({ date, points: row.date_points });
      byPlayer.set(row.player_id, list);
    }

    for (const player of players) {
      const entries = (byPlayer.get(player.id) ?? []).sort((a, b) =>
        a.date.localeCompare(b.date)
      );
      const { current, best } = computeStreaks(entries.map((e) => e.points));
      streaks.push({ playerId: player.id, name: player.name, current, best });
    }
  }

  return { ...query, streaks };
}
