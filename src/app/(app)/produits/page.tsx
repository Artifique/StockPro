"use client";

import dynamic from "next/dynamic";
import { RoutePageLoading } from "@/components/app/route-page-loading";
import { useAppShellSession } from "@/features/app-shell/app-shell-context";

const ProduitsPage = dynamic(
  () =>
    import("@/features/produits/produits-page").then((m) => ({
      default: m.ProduitsPage,
    })),
  { loading: () => <RoutePageLoading /> }
);

export default function ProduitsRoutePage() {
  const { favoriteProducts, toggleFavorite, addToRecentlyViewed } = useAppShellSession();
  return (
    <ProduitsPage
      favoriteProducts={favoriteProducts}
      onToggleFavorite={toggleFavorite}
      onViewProduct={addToRecentlyViewed}
    />
  );
}
