"use client";

import dynamic from "next/dynamic";
import { RoutePageLoading } from "@/components/app/route-page-loading";

const FacturationPage = dynamic(
  () =>
    import("@/features/facturation/facturation-page").then((m) => ({
      default: m.FacturationPage,
    })),
  { loading: () => <RoutePageLoading /> }
);

export default function FacturationRoutePage() {
  return <FacturationPage />;
}
