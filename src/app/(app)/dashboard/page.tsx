"use client";

import dynamic from "next/dynamic";
import { RoutePageLoading } from "@/components/app/route-page-loading";
import { useAppShellSession } from "@/features/app-shell/app-shell-context";

const DashboardPage = dynamic(
  () =>
    import("@/features/dashboard/dashboard-page").then((m) => ({
      default: m.DashboardPage,
    })),
  { loading: () => <RoutePageLoading /> }
);

export default function DashboardRoutePage() {
  const ctx = useAppShellSession();
  return (
    <DashboardPage
      onNavigate={ctx.navigate}
      favoriteProducts={ctx.favoriteProducts}
      recentlyViewedProducts={ctx.recentlyViewedProducts}
      onToggleFavorite={ctx.toggleFavorite}
      onViewProduct={ctx.addToRecentlyViewed}
    />
  );
}
