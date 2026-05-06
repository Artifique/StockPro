"use client";

import dynamic from "next/dynamic";
import { RoutePageLoading } from "@/components/app/route-page-loading";

const AdminSettingsPage = dynamic(
  () =>
    import("@/features/admin/settings/admin-settings-page").then((m) => ({
      default: m.AdminSettingsPage,
    })),
  { loading: () => <RoutePageLoading /> }
);

export default function AdminSettingsRoutePage() {
  return <AdminSettingsPage />;
}
