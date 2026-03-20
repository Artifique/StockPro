"use client";

import dynamic from "next/dynamic";
import { RoutePageLoading } from "@/components/app/route-page-loading";
import { useAppShellSession } from "@/features/app-shell/app-shell-context";

const ParametresPage = dynamic(
  () =>
    import("@/features/parametres/parametres-page").then((m) => ({
      default: m.ParametresPage,
    })),
  { loading: () => <RoutePageLoading /> }
);

export default function ParametresRoutePage() {
  const { user } = useAppShellSession();
  if (!user) return null;
  return <ParametresPage currentUser={user} />;
}
