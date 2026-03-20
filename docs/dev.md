# Développement local

## Erreur `EADDRINUSE: address already in use :::3000`

Cette erreur signifie que le **port 3000 est déjà utilisé** (souvent par une autre instance de `next dev` laissée ouverte dans un autre terminal).

### Option A — Libérer le port 3000 (Windows, PowerShell)

1. Lister le processus qui écoute sur le port 3000 :

   ```powershell
   Get-NetTCPConnection -LocalPort 3000 | Where-Object State -eq Listen
   ```

   Noter la valeur **OwningProcess** (PID).

2. Vérifier quel programme c’est :

   ```powershell
   Get-Process -Id <PID>
   ```

3. Arrêter le processus (ou fermer simplement l’ancien terminal où `pnpm dev` tournait encore) :

   ```powershell
   Stop-Process -Id <PID> -Force
   ```

4. Relancer le serveur :

   ```bash
   pnpm dev
   ```

### Option B — Utiliser un autre port sans tuer le processus existant

Le script `dev:3001` démarre Next sur le **port 3001** :

```bash
pnpm run dev:3001
```

Ouvrir l’app sur **http://localhost:3001**.

> Éviter d’exécuter automatiquement un `kill-port` au démarrage : un autre outil légitime pourrait utiliser le port 3000.
