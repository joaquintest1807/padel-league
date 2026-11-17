import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import { useRealtimeTable } from "./useRealtimeTable";
import type { Match, MatchSet, Pair } from "../lib/types";

export function useFixture(matchDateId: number | undefined) {
  const queryClient = useQueryClient();
  const pairsKey = ["pairs", matchDateId];
  const matchesKey = ["matches", matchDateId];
  const setsKey = ["sets", matchDateId];

  useRealtimeTable("pairs", [pairsKey]);
  useRealtimeTable("matches", [matchesKey]);
  useRealtimeTable("sets", [setsKey]);

  const pairsQuery = useQuery({
    queryKey: pairsKey,
    enabled: matchDateId !== undefined,
    queryFn: async (): Promise<Pair[]> => {
      const { data, error } = await supabase
        .from("pairs")
        .select("*")
        .eq("match_date_id", matchDateId)
        .order("pair_order", { ascending: true });
      if (error) throw error;
      return data as Pair[];
    },
  });

  const matchesQuery = useQuery({
    queryKey: matchesKey,
    enabled: matchDateId !== undefined,
    queryFn: async (): Promise<Match[]> => {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .eq("match_date_id", matchDateId)
        .order("round", { ascending: true })
        .order("court", { ascending: true });
      if (error) throw error;
      return data as Match[];
    },
  });

  const matchIds = (matchesQuery.data ?? []).map((m) => m.id);

  const setsQuery = useQuery({
    queryKey: setsKey,
    enabled: matchIds.length > 0,
    queryFn: async (): Promise<MatchSet[]> => {
      const { data, error } = await supabase
        .from("sets")
        .select("*")
        .in("match_id", matchIds)
        .order("set_number", { ascending: true });
      if (error) throw error;
      return data as MatchSet[];
    },
  });

  const generateFixture = useMutation({
    mutationFn: async (gamesPerSet: 4 | 6) => {
      if (matchDateId === undefined) throw new Error("Falta la fecha");
      const { error } = await supabase.rpc("generate_fixture", {
        p_match_date_id: matchDateId,
        p_games_per_set: gamesPerSet,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pairsKey });
      queryClient.invalidateQueries({ queryKey: matchesKey });
      queryClient.invalidateQueries({ queryKey: setsKey });
      queryClient.invalidateQueries({ queryKey: ["this-week-match-date"] });
    },
  });

  const saveSets = useMutation({
    mutationFn: async (
      updates: { setId: number; gamesPair1: number; gamesPair2: number }[]
    ) => {
      await Promise.all(
        updates.map(({ setId, gamesPair1, gamesPair2 }) =>
          supabase
            .from("sets")
            .update({ games_pair_1: gamesPair1, games_pair_2: gamesPair2 })
            .eq("id", setId)
            .then(({ error }) => {
              if (error) throw error;
            })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: setsKey });
      queryClient.invalidateQueries({ queryKey: ["season_ranking"] });
      queryClient.invalidateQueries({ queryKey: ["best_pairs"] });
      queryClient.invalidateQueries({ queryKey: ["player_date_points"] });
    },
  });

  return {
    pairs: pairsQuery.data ?? [],
    matches: matchesQuery.data ?? [],
    sets: setsQuery.data ?? [],
    isLoading: pairsQuery.isLoading || matchesQuery.isLoading,
    generateFixture,
    saveSets,
  };
}
