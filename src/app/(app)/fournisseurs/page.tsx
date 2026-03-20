"use client";

import dynamic from "next/dynamic";
import { RoutePageLoading } from "@/components/app/route-page-loading";
import { useAppShellSession } from "@/features/app-shell/app-shell-context";

const FournisseursPage = dynamic(
  () =>
    import("@/features/fournisseurs/fournisseurs-page").then((m) => ({
      default: m.FournisseursPage,
    })),
  { loading: () => <RoutePageLoading /> }
);

export default function FournisseursRoutePage() {
  const { navigate } = useAppShellSession();
  return <FournisseursPage onNavigate={navigate} />;
}
