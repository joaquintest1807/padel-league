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
3. Ir a **Database → Replication** y confirmar que las tablas `availability`, `pairs` y `matches` están agregadas a la publicación `supabase_realtime` (el script `schema.sql` ya las agrega por SQL, esto es solo para confirmar).
4. Ir a **Project Settings → API** y copiar:
   - **Project URL**
   - **anon public key**

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
- En "Esta Semana" cada uno marca "Voy" / "No voy". Cuando ya está la cantidad correcta, cualquiera aprieta **Armar fixture**: la app sortea las parejas y genera los partidos:
  - **8 jugadores**: 3 rondas, 2 canchas, cada pareja juega contra las otras 3.
  - **6 jugadores**: 3 sets en 1 cancha, cada pareja contra las otras 2.
  - **4 jugadores**: 1 solo set.
- Al terminar cada set, se cargan los games de cada pareja. Puntaje individual de ese set: **diferencia de games + 1 punto extra si ganaste el set** (se acredita a ambos integrantes de la pareja).
- "Tabla General" acumula esos puntos fecha a fecha. "Mejores Parejas" junta el historial de cada combinación de 2 jugadores que jugó junta. "Rachas" muestra la racha actual y la mejor racha de fechas consecutivas con saldo positivo.

## Estructura del proyecto

```
supabase/schema.sql        Esquema completo de la base de datos (correr una vez en Supabase)
src/lib/                   Cliente de Supabase y tipos TypeScript
src/utils/                 Lógica de puntaje (espejo de la fórmula SQL) y fechas
src/hooks/                 Hooks de datos sobre Supabase (disponibilidad, fixture, ranking, etc.)
src/components/            Piezas de UI reutilizables
src/pages/                 Las 6 pantallas de la app
```
