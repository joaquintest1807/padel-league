export interface SetInput {
  gamesPair1: number | null;
  gamesPair2: number | null;
}

export interface MatchPointsResult {
  pointsPair1: number;
  pointsPair2: number;
  setsWonPair1: number;
  setsWonPair2: number;
  isStarted: boolean;
  isDecided: boolean;
}

/**
 * Espejo exacto de la vista match_points en Postgres (ver supabase/schema.sql).
 * Puntaje por PARTIDO (no por set): gana (2 sets) -> 3, pierde pero gano
 * algun set -> 1, pierde sin ganar ninguno -> 0, sin decidir -> 0 provisorio.
 * Se usa en el cliente para el preview en vivo antes de guardar.
 */
export function computeMatchPoints(sets: SetInput[]): MatchPointsResult {
  let setsWonPair1 = 0;
  let setsWonPair2 = 0;
  let setsPlayed = 0;

  for (const s of sets) {
    if (s.gamesPair1 === null || s.gamesPair2 === null) continue;
    setsPlayed += 1;
    if (s.gamesPair1 > s.gamesPair2) setsWonPair1 += 1;
    else if (s.gamesPair2 > s.gamesPair1) setsWonPair2 += 1;
  }

  const isStarted = setsPlayed >= 1;
  const isDecided = setsWonPair1 >= 2 || setsWonPair2 >= 2;

  let pointsPair1 = 0;
  let pointsPair2 = 0;

  if (setsWonPair1 >= 2) {
    pointsPair1 = 3;
    pointsPair2 = setsWonPair2 >= 1 ? 1 : 0;
  } else if (setsWonPair2 >= 2) {
    pointsPair2 = 3;
    pointsPair1 = setsWonPair1 >= 1 ? 1 : 0;
  }

  return { pointsPair1, pointsPair2, setsWonPair1, setsWonPair2, isStarted, isDecided };
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
