"use client";

import dynamic from "next/dynamic";
import { RoutePageLoading } from "@/components/app/route-page-loading";

const RapportsPage = dynamic(
  () =>
    import("@/features/rapports/rapports-page").then((m) => ({
      default: m.RapportsPage,
    })),
  { loading: () => <RoutePageLoading /> }
);

export default function RapportsRoutePage() {
  return <RapportsPage />;
}
