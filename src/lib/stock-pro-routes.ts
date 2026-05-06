export const APP_ROUTE_IDS = [
  "dashboard",
  "pos",
  "produits",
  "stock",
  "clients",
  "fournisseurs",
  "achats",
  "facturation",
  "retours",
  "rapports",
  "parametres-utilisateur",
  "admin-settings", // Nouvelle entrée
  "profil",
] as const;

export type AppRouteId = (typeof APP_ROUTE_IDS)[number];

const ROUTE_PATHS: Record<AppRouteId, string> = {
  dashboard: "/dashboard",
  pos: "/pos",
  produits: "/produits",
  stock: "/stock",
  clients: "/clients",
  fournisseurs: "/fournisseurs",
  achats: "/achats",
  facturation: "/facturation",
  retours: "/retours",
  rapports: "/rapports",
  "parametres-utilisateur": "/parametres-utilisateur",
  "admin-settings": "/admin/settings", // Nouvelle entrée
  profil: "/profil",
};

export function routePath(id: AppRouteId): string {
  return ROUTE_PATHS[id];
}

/** Premier segment de chemin -> id de route app (hors /login). */
export function pathnameToRouteId(pathname: string): AppRouteId {
  const seg = pathname.replace(/^\//, "").split("/")[0] || "dashboard";
  if ((APP_ROUTE_IDS as readonly string[]).includes(seg)) {
    return seg as AppRouteId;
  }
  return "dashboard";
}

export const PAGE_TITLES: Record<AppRouteId, string> = {
  dashboard: "Dashboard",
  pos: "Point de Vente",
  produits: "Produits",
  stock: "Gestion du Stock",
  clients: "Clients",
  fournisseurs: "Fournisseurs",
  achats: "Achats & Commandes",
  facturation: "Facturation",
  retours: "Retours & Échanges",
  rapports: "Rapports",
  "parametres-utilisateur": "Paramètres Utilisateur",
  "admin-settings": "Paramètres Admin", // Nouvelle entrée
  profil: "Mon profil",
};
