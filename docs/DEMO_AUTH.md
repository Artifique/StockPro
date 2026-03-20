# Authentification démo (Stock Pro)

- Les **mots de passe** ne sont plus dans le bundle client. Ils sont définis uniquement dans [`src/server/demo-auth.ts`](../src/server/demo-auth.ts) (module `server-only`).
- La session navigateur utilise un cookie **httpOnly** `stockpro_demo_uid` (identifiant utilisateur), posé par les routes sous `/api/auth/*`.
- Les routes applicatives (hors `/login`) sont protégées par [`src/middleware.ts`](../src/middleware.ts) : sans cookie valide, redirection vers `/login`.
- `localStorage` ne stocke que le **profil public** (`stockpro_user`, sans mot de passe) si l’option « Se souvenir de moi » est cochée.

Pour une mise en production : remplacer la vérification démo par une base de données, hasher les mots de passe (argon2/bcrypt), et utiliser des sessions signées ou des JWT côté serveur.
