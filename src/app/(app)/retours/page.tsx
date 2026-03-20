"use client";

import dynamic from "next/dynamic";
import { RoutePageLoading } from "@/components/app/route-page-loading";

const RetoursPage = dynamic(
  () =>
    import("@/features/retours/retours-page").then((m) => ({
      default: m.RetoursPage,
    })),
  { loading: () => <RoutePageLoading /> }
);

export default function RetoursRoutePage() {
  return <RetoursPage />;
}
