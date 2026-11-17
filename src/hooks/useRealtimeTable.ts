import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";

/**
 * Se suscribe a cambios Postgres en una tabla via Supabase Realtime, e
 * invalida las queryKeys indicadas para que React Query vuelva a pedir los
 * datos frescos. Asi, si alguien carga un resultado desde otro celular,
 * el resto ve la actualizacion sin refrescar la pagina.
 */
export function useRealtimeTable(table: string, queryKeys: readonly unknown[][]) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel(`realtime:${table}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          for (const key of queryKeys) {
            queryClient.invalidateQueries({ queryKey: key });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, JSON.stringify(queryKeys)]);
}
