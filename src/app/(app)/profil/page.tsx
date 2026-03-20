"use client";

import dynamic from "next/dynamic";
import { RoutePageLoading } from "@/components/app/route-page-loading";
import { useAppShellSession } from "@/features/app-shell/app-shell-context";

const ProfilePage = dynamic(
  () =>
    import("@/features/profile/profile-page").then((m) => ({
      default: m.ProfilePage,
    })),
  { loading: () => <RoutePageLoading /> }
);

export default function ProfilRoutePage() {
  const { user, handleLogout } = useAppShellSession();
  if (!user) return null;
  return <ProfilePage user={user} onLogout={handleLogout} />;
}
