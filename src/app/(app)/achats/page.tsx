"use client";

import dynamic from "next/dynamic";
import { RoutePageLoading } from "@/components/app/route-page-loading";

const AchatsPage = dynamic(
  () =>
    import("@/features/achats/achats-page").then((m) => ({
      default: m.AchatsPage,
    })),
  { loading: () => <RoutePageLoading /> }
);

export default function AchatsRoutePage() {
  return <AchatsPage />;
}
