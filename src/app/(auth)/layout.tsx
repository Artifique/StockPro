import type { ReactNode } from "react";
import { ToastHost } from "./toast-host";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ToastHost />
    </>
  );
}
