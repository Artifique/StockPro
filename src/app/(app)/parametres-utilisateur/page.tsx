"use client";

import dynamic from "next/dynamic";
import { RoutePageLoading } from "@/components/app/route-page-loading";
import { useAppShellSession } from "@/features/app-shell/app-shell-context";

const ParametresUtilisateurPage = dynamic(
  () =>
    import("@/features/parametres-utilisateur/parametres-utilisateur-page").then((m) => ({
      default: m.ParametresUtilisateurPage,
    })),
  { loading: () => <RoutePageLoading /> }
);

export default function ParametresUtilisateurRoutePage() {
  const { user } = useAppShellSession();
  if (!user) return null;
  return <ParametresUtilisateurPage currentUser={user} />;
}
