import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import { useRealtimeTable } from "./useRealtimeTable";
import type { Availability } from "../lib/types";

export function useAvailability(matchDateId: number | undefined) {
  const queryClient = useQueryClient();
  const queryKey = ["availability", matchDateId];

  useRealtimeTable("availability", [queryKey]);

  const query = useQuery({
    queryKey,
    enabled: matchDateId !== undefined,
    queryFn: async (): Promise<Availability[]> => {
      const { data, error } = await supabase
        .from("availability")
        .select("*")
        .eq("match_date_id", matchDateId);
      if (error) throw error;
      return data as Availability[];
    },
  });

  const setAvailability = useMutation({
    mutationFn: async ({
      playerId,
      isAvailable,
    }: {
      playerId: number;
      isAvailable: boolean;
    }) => {
      if (matchDateId === undefined) throw new Error("Falta la fecha");
      const { error } = await supabase.from("availability").upsert(
        {
          match_date_id: matchDateId,
          player_id: playerId,
          is_available: isAvailable,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "match_date_id,player_id" }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return { ...query, setAvailability };
}
