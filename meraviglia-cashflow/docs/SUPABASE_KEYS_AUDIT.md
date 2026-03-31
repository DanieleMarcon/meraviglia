# Audit mirato: utilizzo chiavi Supabase

Data audit: 2026-03-31
Aggiornamento migrazione chiavi: 2026-03-31

## Metodo
Ricerca testuale nel repository per:
- Creazione client: `createClient(`, `createBrowserClient`, `createServerClient`
- Import Supabase: `@supabase/supabase-js`, `@supabase/ssr`
- Env sensibili: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SECRET_KEY`
- Marker credenziali privilegiate: `service_role`, `sb_secret`

## Punti di creazione client trovati
1. `src/lib/supabaseClient.ts`
   - import `createClient` da `@supabase/supabase-js`
   - istanziazione singleton modulo: `export const supabase = createClient(supabaseUrl, supabasePublishableKey)`
   - env usate: `import.meta.env.VITE_SUPABASE_URL`, `import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY`
   - classificazione runtime: **browser/client** (pattern Vite `import.meta.env` + uso in repository frontend)

## Tabella sintetica
| file | client/server | env usate | rischio |
|---|---|---|---|
| `src/lib/supabaseClient.ts` | client (browser) | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` | basso (chiavi client pubbliche/publishable) |

## Ricerca env richieste
- `VITE_SUPABASE_URL`: trovata in `src/lib/supabaseClient.ts`
- `VITE_SUPABASE_ANON_KEY`: **non trovata** (riferimento legacy rimosso dal codice applicativo)
- `VITE_SUPABASE_PUBLISHABLE_KEY`: trovata in `src/lib/supabaseClient.ts`
- `SUPABASE_SERVICE_ROLE_KEY`: **non trovata**
- `SUPABASE_SECRET_KEY`: **non trovata**

## Edge Functions, API routes, server actions, cron jobs, script server-side
- Nessuna Edge Function Supabase trovata nel repository.
- Nessuna API route / server action / cron job che usa Supabase trovata.
- Nessuno script in `scripts/` con import/uso Supabase trovato.

## Uso diretto credenziali privilegiate
- Nessun uso diretto di `service_role` trovato.
- Nessun uso diretto di `sb_secret` trovato.

## Conclusione
**nessun uso server privilegiato trovato**
