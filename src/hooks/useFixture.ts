import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import { useRealtimeTable } from "./useRealtimeTable";
import type { Match, Pair } from "../lib/types";

export function useFixture(matchDateId: number | undefined) {
  const queryClient = useQueryClient();
  const pairsKey = ["pairs", matchDateId];
  const matchesKey = ["matches", matchDateId];

  useRealtimeTable("pairs", [pairsKey]);
  useRealtimeTable("matches", [matchesKey]);

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

  const generateFixture = useMutation({
    mutationFn: async () => {
      if (matchDateId === undefined) throw new Error("Falta la fecha");
      const { error } = await supabase.rpc("generate_fixture", {
        p_match_date_id: matchDateId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pairsKey });
      queryClient.invalidateQueries({ queryKey: matchesKey });
    },
  });

  const saveScore = useMutation({
    mutationFn: async ({
      matchId,
      gamesPair1,
      gamesPair2,
    }: {
      matchId: number;
      gamesPair1: number;
      gamesPair2: number;
    }) => {
      const { error } = await supabase
        .from("matches")
        .update({ games_pair_1: gamesPair1, games_pair_2: gamesPair2 })
        .eq("id", matchId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchesKey });
      queryClient.invalidateQueries({ queryKey: ["season_ranking"] });
      queryClient.invalidateQueries({ queryKey: ["best_pairs"] });
      queryClient.invalidateQueries({ queryKey: ["player_date_points"] });
    },
  });

  return {
    pairs: pairsQuery.data ?? [],
    matches: matchesQuery.data ?? [],
    isLoading: pairsQuery.isLoading || matchesQuery.isLoading,
    generateFixture,
    saveScore,
  };
}
