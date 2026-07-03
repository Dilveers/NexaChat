"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "aws-amplify/auth";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      setTimeout(async () => {
        try {
          await getCurrentUser();

          // User logged in
          router.push("/chats");
        } catch {
          // User not logged in
          router.push("/auth/login");
        }
      }, 3000);
    }

    checkAuth();
  }, [router]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950">

      <div className="text-center animate-pulse">

        <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
          <span className="text-5xl font-bold text-white">
            N
          </span>
        </div>

        <h1 className="text-5xl font-extrabold text-white">
          NexaChat
        </h1>

        <p className="mt-4 text-white/70 text-lg">
          Connect Instantly 🚀
        </p>

        <div className="mt-8 flex justify-center gap-2">
          <div className="h-3 w-3 rounded-full bg-white animate-bounce"></div>
          <div className="h-3 w-3 rounded-full bg-white animate-bounce delay-100"></div>
          <div className="h-3 w-3 rounded-full bg-white animate-bounce delay-200"></div>
        </div>

      </div>

    </div>
  );
}