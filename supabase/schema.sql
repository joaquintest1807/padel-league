-- ============================================================================
-- Liga de Padel - Esquema completo para Supabase (Postgres)
-- Correr este archivo entero en el SQL Editor de Supabase, una sola vez.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- TABLAS
-- ----------------------------------------------------------------------------

create table players (
  id   bigint generated always as identity primary key,
  name text not null unique
);

insert into players (name) values
  ('Lauti'), ('Joaco'), ('Negro'), ('Rayo'), ('Nono'),
  ('Tiqui'), ('Lanfran'), ('Chancha'), ('Nicky');

create table match_dates (
  id   bigint generated always as identity primary key,
  date date not null unique
);

create table availability (
  id             bigint generated always as identity primary key,
  match_date_id  bigint not null references match_dates(id) on delete cascade,
  player_id      bigint not null references players(id),
  is_available   boolean not null default false,
  updated_at     timestamptz not null default now(),
  unique (match_date_id, player_id)
);

create table pairs (
  id             bigint generated always as identity primary key,
  match_date_id  bigint not null references match_dates(id) on delete cascade,
  pair_order     smallint not null check (pair_order between 1 and 4), -- 1=A,2=B,3=C,4=D
  player_1_id    bigint not null references players(id),
  player_2_id    bigint not null references players(id),
  unique (match_date_id, pair_order),
  check (player_1_id <> player_2_id)
);

create table matches (
  id             bigint generated always as identity primary key,
  match_date_id  bigint not null references match_dates(id) on delete cascade,
  round          smallint not null,
  court          smallint not null,
  pair_1_id      bigint not null references pairs(id),
  pair_2_id      bigint not null references pairs(id),
  games_pair_1   smallint,
  games_pair_2   smallint,
  points_pair_1  smallint generated always as (
    case when games_pair_1 is null or games_pair_2 is null then null
         else (games_pair_1 - games_pair_2)
              + case when games_pair_1 > games_pair_2 then 1 else 0 end
    end
  ) stored,
  points_pair_2  smallint generated always as (
    case when games_pair_1 is null or games_pair_2 is null then null
         else (games_pair_2 - games_pair_1)
              + case when games_pair_2 > games_pair_1 then 1 else 0 end
    end
  ) stored,
  unique (match_date_id, round, court)
);

-- ----------------------------------------------------------------------------
-- VISTAS (se recalculan solas a partir de los datos crudos)
-- ----------------------------------------------------------------------------

-- Cada set jugado, desplegado en 2 filas (una por jugador de cada pareja)
create view player_set_points as
  select m.id as match_id, m.match_date_id, pr.player_1_id as player_id, m.points_pair_1 as points
    from matches m join pairs pr on pr.id = m.pair_1_id
   where m.points_pair_1 is not null
  union all
  select m.id, m.match_date_id, pr.player_2_id, m.points_pair_1
    from matches m join pairs pr on pr.id = m.pair_1_id
   where m.points_pair_1 is not null
  union all
  select m.id, m.match_date_id, pr.player_1_id, m.points_pair_2
    from matches m join pairs pr on pr.id = m.pair_2_id
   where m.points_pair_2 is not null
  union all
  select m.id, m.match_date_id, pr.player_2_id, m.points_pair_2
    from matches m join pairs pr on pr.id = m.pair_2_id
   where m.points_pair_2 is not null;

-- Tabla General: ranking acumulado de temporada
create view season_ranking as
  select p.id as player_id, p.name,
         coalesce(sum(psp.points), 0) as total_points,
         count(psp.points) as sets_played,
         count(distinct psp.match_date_id) as dates_played
    from players p
    left join player_set_points psp on psp.player_id = p.id
   group by p.id, p.name;

-- Puntos por jugador y por fecha (insumo del calculo de rachas, que corre en el cliente)
create view player_date_points as
  select player_id, match_date_id, sum(points) as date_points
    from player_set_points
   group by player_id, match_date_id;

-- Mejores Parejas: estadisticas historicas por combinacion de 2 jugadores
-- (misma pareja en semanas distintas = una sola fila, gracias a least/greatest)
create view best_pairs as
  select least(pr.player_1_id, pr.player_2_id) as player_a_id,
         greatest(pr.player_1_id, pr.player_2_id) as player_b_id,
         count(*) as sets_played,
         sum(case when m.pair_1_id = pr.id then (m.games_pair_1 > m.games_pair_2)::int
                  else (m.games_pair_2 > m.games_pair_1)::int end) as sets_won,
         sum(case when m.pair_1_id = pr.id then (m.games_pair_1 - m.games_pair_2)
                  else (m.games_pair_2 - m.games_pair_1) end) as total_game_diff
    from pairs pr
    join matches m on m.pair_1_id = pr.id or m.pair_2_id = pr.id
   where m.games_pair_1 is not null and m.games_pair_2 is not null
   group by least(pr.player_1_id, pr.player_2_id), greatest(pr.player_1_id, pr.player_2_id);

-- ----------------------------------------------------------------------------
-- FUNCION: generate_fixture
-- Sortea parejas entre los confirmados de una fecha y genera los partidos
-- segun el formato correspondiente (4, 6 u 8 jugadores). Es la UNICA forma
-- de crear filas en pairs/matches (ver políticas RLS mas abajo).
-- ----------------------------------------------------------------------------

create or replace function generate_fixture(p_match_date_id bigint)
returns void language plpgsql security definer as $$
declare
  confirmed_ids bigint[];
  p_count int;
  pair_ids bigint[];
begin
  if exists (select 1 from pairs where match_date_id = p_match_date_id) then
    raise exception 'Ya existe un fixture para esta fecha';
  end if;

  select array_agg(player_id order by random()) into confirmed_ids
    from availability
   where match_date_id = p_match_date_id and is_available = true;

  p_count := coalesce(array_length(confirmed_ids, 1), 0);
  if p_count not in (4, 6, 8) then
    raise exception 'La cantidad de confirmados debe ser 4, 6 u 8 (hay %)', p_count;
  end if;

  insert into pairs (match_date_id, pair_order, player_1_id, player_2_id)
  select p_match_date_id, (i + 1) / 2, confirmed_ids[i], confirmed_ids[i + 1]
    from generate_series(1, p_count, 2) as i;

  select array_agg(id order by pair_order) into pair_ids
    from pairs where match_date_id = p_match_date_id;

  if p_count = 4 then
    insert into matches (match_date_id, round, court, pair_1_id, pair_2_id) values
      (p_match_date_id, 1, 1, pair_ids[1], pair_ids[2]);
  elsif p_count = 6 then
    insert into matches (match_date_id, round, court, pair_1_id, pair_2_id) values
      (p_match_date_id, 1, 1, pair_ids[1], pair_ids[2]),
      (p_match_date_id, 2, 1, pair_ids[1], pair_ids[3]),
      (p_match_date_id, 3, 1, pair_ids[2], pair_ids[3]);
  elsif p_count = 8 then
    insert into matches (match_date_id, round, court, pair_1_id, pair_2_id) values
      (p_match_date_id, 1, 1, pair_ids[1], pair_ids[2]),
      (p_match_date_id, 1, 2, pair_ids[3], pair_ids[4]),
      (p_match_date_id, 2, 1, pair_ids[1], pair_ids[3]),
      (p_match_date_id, 2, 2, pair_ids[2], pair_ids[4]),
      (p_match_date_id, 3, 1, pair_ids[1], pair_ids[4]),
      (p_match_date_id, 3, 2, pair_ids[2], pair_ids[3]);
  end if;
end;
$$;

-- ----------------------------------------------------------------------------
-- RLS: habilitado en todas las tablas, acotado a los flujos reales de la app.
-- Sin login real, pero pairs/matches solo se crean via generate_fixture
-- (security definer), nunca por insert directo del cliente.
-- ----------------------------------------------------------------------------

alter table players enable row level security;
alter table match_dates enable row level security;
alter table availability enable row level security;
alter table pairs enable row level security;
alter table matches enable row level security;

create policy "players_select" on players for select using (true);

create policy "match_dates_select" on match_dates for select using (true);
create policy "match_dates_insert" on match_dates for insert with check (true);

create policy "availability_select" on availability for select using (true);
create policy "availability_insert" on availability for insert with check (true);
create policy "availability_update" on availability for update using (true);

create policy "pairs_select" on pairs for select using (true);

create policy "matches_select" on matches for select using (true);
create policy "matches_update" on matches for update using (true);

-- ----------------------------------------------------------------------------
-- REALTIME: habilitar para que la app se actualice sola en todos los celulares.
-- (Alternativa a hacerlo por el dashboard: Database > Replication > supabase_realtime)
-- ----------------------------------------------------------------------------

alter publication supabase_realtime add table availability;
alter publication supabase_realtime add table pairs;
alter publication supabase_realtime add table matches;
