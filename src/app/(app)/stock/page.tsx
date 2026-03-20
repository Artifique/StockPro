"use client";

import dynamic from "next/dynamic";
import { RoutePageLoading } from "@/components/app/route-page-loading";

const StockPage = dynamic(
  () =>
    import("@/features/stock/stock-page").then((m) => ({
      default: m.StockPage,
    })),
  { loading: () => <RoutePageLoading /> }
);

export default function StockRoutePage() {
  return <StockPage />;
}
