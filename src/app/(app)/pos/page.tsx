"use client";

import dynamic from "next/dynamic";
import { RoutePageLoading } from "@/components/app/route-page-loading";

const POSPage = dynamic(
  () => import("@/features/pos/pos-page").then((m) => ({ default: m.POSPage })),
  { loading: () => <RoutePageLoading /> }
);

export default function PosRoutePage() {
  return <POSPage />;
}
