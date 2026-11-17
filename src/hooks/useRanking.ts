import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import { useRealtimeTable } from "./useRealtimeTable";
import type { SeasonRankingRow } from "../lib/types";

export function useRanking() {
  const queryKey = ["season_ranking"];
  useRealtimeTable("matches", [queryKey]);

  return useQuery({
    queryKey,
    queryFn: async (): Promise<SeasonRankingRow[]> => {
      const { data, error } = await supabase
        .from("season_ranking")
        .select("*")
        .order("total_points", { ascending: false });
      if (error) throw error;
      return data as SeasonRankingRow[];
    },
  });
}
