# STOCK Pro

Application Next.js (gestion de stock).

**Dépôt :** [github.com/Artifique/StockPro](https://github.com/Artifique/StockPro)

## Démarrage

```bash
pnpm install
pnpm dev
```

L’app est servie sur **http://localhost:3000**.

### Port 3000 déjà occupé (`EADDRINUSE`)

Voir **[docs/dev.md](docs/dev.md)** : libérer le port sous Windows ou lancer `pnpm run dev:3001`.

## Scripts utiles

| Commande | Description |
|----------|-------------|
| `pnpm dev` | Serveur de dev sur le port 3000 |
| `pnpm run dev:3001` | Serveur de dev sur le port 3001 |
| `pnpm run build` | Build production |
| `pnpm run lint` | ESLint |
| `pnpm run typecheck` | Vérification TypeScript |
