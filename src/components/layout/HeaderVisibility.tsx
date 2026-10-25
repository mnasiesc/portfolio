"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function HeaderVisibility({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Hide the global site header completely when in /terminal mode
  if (pathname === "/terminal") {
    return null;
  }

  return <>{children}</>;
}
