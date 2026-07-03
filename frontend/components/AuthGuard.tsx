"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {

  const router = useRouter();

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    const unsubscribe =
      auth.onAuthStateChanged(
        (user) => {

          if (!user) {

            router.replace(
              "/auth/login"
            );

          } else {

            setLoading(false);

          }

        }
      );

    return () =>
      unsubscribe();

  }, [router]);

  if (loading) {

    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-950 text-white">
        Loading...
      </div>
    );

  }

  return <>{children}</>;
}