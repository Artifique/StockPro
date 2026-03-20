import type { ReactNode } from "react";
import { AppShellLayout } from "@/features/app-shell/app-shell-layout";

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return <AppShellLayout>{children}</AppShellLayout>;
}
