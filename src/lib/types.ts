export interface Player {
  id: number;
  name: string;
}

export interface MatchDate {
  id: number;
  date: string; // ISO yyyy-mm-dd
  games_per_set: 4 | 6 | null;
}

export interface Availability {
  id: number;
  match_date_id: number;
  player_id: number;
  is_available: boolean;
  updated_at: string;
}

export interface Pair {
  id: number;
  match_date_id: number;
  pair_order: 1 | 2 | 3 | 4;
  player_1_id: number;
  player_2_id: number;
}

export interface Match {
  id: number;
  match_date_id: number;
  round: number;
  court: number;
  pair_1_id: number;
  pair_2_id: number;
}

export interface MatchSet {
  id: number;
  match_id: number;
  set_number: 1 | 2 | 3;
  games_pair_1: number | null;
  games_pair_2: number | null;
}

export interface SeasonRankingRow {
  player_id: number;
  name: string;
  total_points: number;
  matches_played: number;
  dates_played: number;
}

export interface PlayerDatePointsRow {
  player_id: number;
  match_date_id: number;
  date_points: number;
}

export interface BestPairsRow {
  player_a_id: number;
  player_b_id: number;
  matches_played: number;
  matches_won: number;
  total_points: number;
}

export const PAIR_LETTERS: Record<number, string> = {
  1: "A",
  2: "B",
  3: "C",
  4: "D",
};
