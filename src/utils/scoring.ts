/**
 * Espejo exacto de la columna generada points_pair_1/points_pair_2 en Postgres
 * (ver supabase/schema.sql). Se usa en el cliente para mostrar un preview
 * instantaneo mientras se cargan los games, antes de guardar.
 */
export function computeSetPoints(
  gamesWon: number | null,
  gamesLost: number | null
): number | null {
  if (gamesWon === null || gamesLost === null) return null;
  const bonus = gamesWon > gamesLost ? 1 : 0;
  return gamesWon - gamesLost + bonus;
}

export interface Streak {
  current: number;
  best: number;
}

/**
 * datePointsAsc: puntos totales de un jugador por fecha, ordenados de la
 * fecha mas vieja a la mas nueva. Devuelve la racha actual (tramo final de
 * fechas consecutivas con saldo positivo) y la mejor racha historica.
 */
export function computeStreaks(datePointsAsc: number[]): Streak {
  let current = 0;
  let best = 0;
  for (const points of datePointsAsc) {
    current = points > 0 ? current + 1 : 0;
    best = Math.max(best, current);
  }
  return { current, best };
}
