"use client";

import dynamic from "next/dynamic";
import { RoutePageLoading } from "@/components/app/route-page-loading";

const ClientsPage = dynamic(
  () =>
    import("@/features/clients/clients-page").then((m) => ({
      default: m.ClientsPage,
    })),
  { loading: () => <RoutePageLoading /> }
);

export default function ClientsRoutePage() {
  return <ClientsPage />;
}
