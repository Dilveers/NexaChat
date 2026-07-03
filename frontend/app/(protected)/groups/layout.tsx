import type { ReactNode } from "react";
import AuthGuard from "@/components/AuthGuard";

export default function GroupsLayout({ children }: { children: ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}

