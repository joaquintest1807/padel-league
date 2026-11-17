import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import type { Player } from "../lib/types";

export function usePlayers() {
  return useQuery({
    queryKey: ["players"],
    queryFn: async (): Promise<Player[]> => {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .order("id", { ascending: true });
      if (error) throw error;
      return data as Player[];
    },
    staleTime: Infinity, // el roster de 9 jugadores es fijo
  });
}
