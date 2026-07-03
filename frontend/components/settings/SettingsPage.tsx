"use client";




import { notify } from "@/lib/toast";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";

import {
  FaArrowLeft,
  FaMoon,
  FaBell,
  FaUserEdit,
  FaLock,
  FaSignOutAlt,
  FaBan,
} from "react-icons/fa";
import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";



export default function SettingsPage() {
  const router = useRouter();

  const { theme, setTheme } = useTheme();

const [notifications, setNotifications] =
  useState(true);

useEffect(() => {

  const unsubscribe =
    auth.onAuthStateChanged(
      async (user) => {

        if (!user) return;

        const userDoc =
          await getDoc(
            doc(
              db,
              "users",
              user.uid
            )
          );

        if (
          userDoc.exists()
        ) {

          setNotifications(
            userDoc.data()
              .notificationsEnabled ??
              true
          );
        }
      }
    );

  return () =>
    unsubscribe();

}, []);

async function handleLogout() {
  try {
    await signOut(auth);

    notify.success("Logged out successfully!");

    router.push("/auth/login");

  } catch (error: any) {

    console.error(error);

    notify.error(
      error.message || "Logout failed"
    );
  }
}

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-900 to-indigo-950 p-5">

      <div className="max-w-md mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">

          <Link href="/profile">
            <FaArrowLeft className="text-white text-2xl cursor-pointer" />
          </Link>

          <h1 className="text-3xl font-bold text-white">
            Settings
          </h1>

        </div>

        {/* Card */}
        <div className="rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl bg-white border border-gray-200 dark:bg-white/10 dark:border-white/10">

          <div className="space-y-5">

            {/* Dark Mode */}
            <div className="flex items-center justify-between rounded-2xl bg-gray-100 dark:bg-white/10 p-4">

              <div className="flex items-center gap-3 text-gray-900 dark:text-white">
                <FaMoon />
                <span>Dark Mode</span>
              </div>

        <input
  type="checkbox"
checked={theme === "dark"}
onChange={() =>
  setTheme(
    theme === "dark"
      ? "light"
      : "dark"
  )
}
  className="w-5 h-5"
/>

            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between rounded-2xl bg-gray-100 dark:bg-white/10 p-4">

              <div className="flex items-center gap-3 text-gray-900 dark:text-white">
                <FaBell />
                <span>Notifications</span>
              </div>

              <input
  type="checkbox"
  checked={notifications}
  onChange={async () => {

    const user =
      auth.currentUser;

    if (!user) return;

    const newValue =
      !notifications;

    setNotifications(
      newValue
    );

    await updateDoc(
      doc(
        db,
        "users",
        user.uid
      ),
      {
        notificationsEnabled:
          newValue,
      }
    );

  }}
  className="w-5 h-5"
/>

            </div>
<Link
  href="/settings/blocked"
  className="w-full flex items-center gap-4 rounded-2xl bg-white/10 p-4 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition"
>
  <FaBan />

  <span>Blocked Users</span>
</Link>
            

            {/* Edit Profile */}


            {/* Change Password */}
           <Link href="/settings/change-password">
  <button className="w-full flex items-center gap-3 rounded-2xl bg-gray-100 dark:bg-white/10 p-4 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition">
    <FaLock />
    Change Password
  </button>
</Link>
            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full mt-4 flex items-center justify-center gap-3 rounded-2xl bg-red-500 py-4 text-white font-semibold hover:bg-red-600 transition"
            >

              <FaSignOutAlt />

              Logout

            </button>

          </div>

        </div>

      </div>

    </main>
  );
}