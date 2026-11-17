# Liga de Pádel

App para llevar el ranking de la liga semanal de pádel entre amigos: confirmar
disponibilidad, armar el fixture (sorteo de parejas), cargar resultados, y ver
la tabla general, mejores parejas y rachas — todo desde el celular, sin login.

## Stack

- **Frontend**: React + Vite + React Router + TanStack Query
- **Datos**: Supabase (Postgres + Realtime)
- **Hosting**: Vercel

## Puesta en marcha (una sola vez)

### 1. Supabase

1. Crear una cuenta gratis en [supabase.com](https://supabase.com) y un proyecto nuevo.
2. En el proyecto, ir a **SQL Editor** → pegar y correr **todo** el contenido de [`supabase/schema.sql`](supabase/schema.sql). Esto crea las tablas, las vistas, la función de sorteo, las políticas de seguridad, y carga a los 9 jugadores.
   - El script es **idempotente**: si en el futuro se actualiza (por ejemplo, para agregar una funcionalidad nueva), se puede volver a correr tal cual — borra y recrea todo. **Ojo**: eso borra las fechas/resultados ya cargados, no el roster de jugadores.
3. Ir a **Database → Replication** y confirmar que las tablas `availability`, `pairs`, `matches` y `sets` están agregadas a la publicación `supabase_realtime` (el script `schema.sql` ya las agrega por SQL, esto es solo para confirmar).
4. Ir a **Project Settings → API Keys** y copiar:
   - **Project URL**
   - **Publishable key** (antes llamada "anon key")

### 2. Variables de entorno

Copiar `.env.example` a `.env.local` y completar con los valores de Supabase:

```bash
cp .env.example .env.local
```

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-publica
```

### 3. Correr localmente

```bash
npm install
npm run dev
```

Abrir la URL que muestra la terminal (normalmente `http://localhost:5173`).

### 4. Desplegar en Vercel

1. Crear una cuenta gratis en [vercel.com](https://vercel.com) (podés entrar con tu cuenta de GitHub).
2. **Add New → Project** → importar el repositorio de GitHub de esta app.
3. Vercel detecta Vite automáticamente (build command `npm run build`, output `dist`). No cambiar nada ahí.
4. En **Environment Variables**, agregar las mismas 2 variables que en `.env.local`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy. Cada vez que se haga `git push` a la rama principal, Vercel vuelve a desplegar solo.

## Cómo se juega (reglas que la app implementa)

- Cada miércoles, antes de reservar las canchas, el grupo decide quién juega — siempre un número par: 4, 6 u 8.
- En "Esta Semana" cada uno marca "Voy" / "No voy". Cuando ya está la cantidad correcta, se elige si se juega a **4 o 6 games por set** (normalmente 6 con 4 jugadores, 4 con 6 u 8 jugadores, para poder rotar) y se aprieta **Armar fixture**: la app sortea las parejas y genera los cruces:
  - **8 jugadores**: 3 rondas, 2 canchas, cada pareja juega contra las otras 3.
  - **6 jugadores**: round robin de 3 parejas en 1 cancha, cada pareja contra las otras 2.
  - **4 jugadores**: 1 solo cruce.
- Cada cruce entre 2 parejas se juega **al mejor de 3 sets**. Se cargan los games de cada set que se jugó (el tercero puede quedar vacío si el cruce se definió 2-0).
- Puntaje por **partido** (no por set): la pareja que gana el partido suma **3 puntos** cada integrante; si pierde pero ganó al menos 1 set, suma **1 punto**; si pierde sin ganar ningún set, suma **0 puntos** (nunca negativo). Mientras el partido no está decidido (ej. 1 set a 1, falta el tercero), se muestra 0-0 de forma provisoria.
- "Tabla General" acumula esos puntos fecha a fecha, y cuenta cuántos **partidos** jugó cada uno. "Mejores Parejas" junta el historial de partidos jugados/ganados y puntos totales de cada combinación de 2 jugadores. "Rachas" muestra la racha actual y la mejor racha de fechas consecutivas con saldo positivo.

## Estructura del proyecto

```
supabase/schema.sql        Esquema completo de la base de datos (correr una vez en Supabase)
src/lib/                   Cliente de Supabase y tipos TypeScript
src/utils/                 Lógica de puntaje (espejo de la fórmula SQL) y fechas
src/hooks/                 Hooks de datos sobre Supabase (disponibilidad, fixture, ranking, etc.)
src/components/            Piezas de UI reutilizables
src/pages/                 Las 6 pantallas de la app
```
