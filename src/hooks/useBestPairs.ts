import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import { useRealtimeTable } from "./useRealtimeTable";
import { usePlayers } from "./usePlayers";
import type { BestPairsRow } from "../lib/types";

export interface BestPairDisplay extends BestPairsRow {
  playerAName: string;
  playerBName: string;
  winPct: number;
}

export function useBestPairs() {
  const queryKey = ["best_pairs"];
  useRealtimeTable("matches", [queryKey]);
  const { data: players } = usePlayers();

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<BestPairsRow[]> => {
      const { data, error } = await supabase.from("best_pairs").select("*");
      if (error) throw error;
      return data as BestPairsRow[];
    },
  });

  const nameById = new Map((players ?? []).map((p) => [p.id, p.name]));

  const rows: BestPairDisplay[] = (query.data ?? []).map((row) => ({
    ...row,
    playerAName: nameById.get(row.player_a_id) ?? "?",
    playerBName: nameById.get(row.player_b_id) ?? "?",
    winPct: row.matches_played > 0 ? row.matches_won / row.matches_played : 0,
  }));

  return { ...query, rows };
}
