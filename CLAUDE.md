# CLAUDE.md — visitas-v2

## Stack
- Next.js 14 App Router + TypeScript + Tailwind
- Prisma 5 + PostgreSQL
- next-auth v5 (beta.25) — credentials provider
- Deploy: Docker multi-stage + EasyPanel (Hetzner)

## Estrutura relevante
- `src/app/(auth)/` — login e registro (rotas públicas)
- `src/app/(app)/` — rotas protegidas (escolas, detalhe)
- `src/app/api/` — register, visitas CRUD, nextauth
- `src/components/EscolasClient.tsx` — mapa + lista (client component)
- `src/components/EscolaDetail.tsx` — detalhe + formulário de visita
- `src/lib/auth.config.ts` — config Edge-safe (sem bcrypt, usada no middleware)
- `src/lib/auth.ts` — config completa com Credentials + bcrypt
- `src/middleware.ts` — protege todas as rotas exceto api/_next/favicon/schools.json
- `public/schools.json` — 1.569 escolas geocodificadas com id_setor

## Banco de dados
- Modelos: `User` e `Visita` (1 visita por escola — sigla única)
- Status possíveis: `pendente | visitado | tentativa | reagendado`
- Migration inicial em `prisma/migrations/20260526000000_init/`

## Variáveis de ambiente
```
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://prefeitura.sitecnologia.tec.br
NEXTAUTH_SECRET=...
NEXT_PUBLIC_GOOGLE_MAPS_KEY=...  # build arg — deve ser passado no EasyPanel como Build Arg
```

## Deploy (EasyPanel)
- Projeto: `sintel` / serviço `visitasrj`
- Banco: `sintel_visitasrj-db` (Postgres 16 Alpine, volume `visitas-pgdata`)
- `NEXT_PUBLIC_GOOGLE_MAPS_KEY` precisa ser **Build Arg** (não só env var de runtime) — Next.js embute no bundle no build
- `PRISMA_QUERY_ENGINE_LIBRARY` está fixo no Dockerfile apontando pro engine `linux-musl-openssl-3.0.x`
- Boot roda `prisma migrate deploy` antes de `node server.js`
- GitHub: `FelipeOlli/visitas-escolas-v2` branch `main`

## Decisões técnicas importantes
- `auth.config.ts` separado de `auth.ts` para evitar erro de Edge Runtime com bcrypt no middleware
- `binaryTargets = ["native", "linux-musl-openssl-3.0.x"]` no schema — Alpine usa OpenSSL 3
- `PRISMA_QUERY_ENGINE_LIBRARY` forçado no Dockerfile porque Prisma não detecta OpenSSL automaticamente no Alpine
- Marcadores do mapa usam evento `gmp-click` (não `click`) — AdvancedMarkerElement deprecou o antigo

## Histórico de sessões

### 2026-05-26
- Projeto criado do zero (Next.js 14 + Auth + Tailwind + Prisma)
- Resolvidos: Edge Runtime bcrypt, Prisma OpenSSL 3 no Alpine, NEXT_PUBLIC build arg, gmp-click deprecation
- App em produção em `prefeitura.sitecnologia.tec.br`
- Commits principais: `379e2be` (impl), `5551f9f` (migration), `dbad737` (prisma engines), `fb9964c` (build arg), `489db05` (gmp-click)
