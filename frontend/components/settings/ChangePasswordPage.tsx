"use client";


import { notify } from "@/lib/toast";
import Link from "next/link";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { updatePassword } from "firebase/auth";
import {
  FaArrowLeft,
  FaLock,
  FaSave,
} from "react-icons/fa";

export default function ChangePasswordPage() {
  const [oldPassword, setOldPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");



async function handleChangePassword() {

  if (newPassword !== confirmPassword) {
    notify.error("Passwords do not match");
    return;
  }

  try {

    const user = auth.currentUser;

    if (!user) return;

    await updatePassword(
      user,
      newPassword
    );

    notify.success(
      "Password changed successfully 🎉"
    );

  } catch (error: any) {

    console.log(error);

    notify.error(
      error.message ||
      "Failed to change password"
    );
  }
}

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-900 to-indigo-950 p-5">

      <div className="max-w-md mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">

          <Link href="/settings">
            <FaArrowLeft className="text-white text-2xl cursor-pointer" />
          </Link>

          <h1 className="text-3xl font-bold text-white">
            Change Password
          </h1>

        </div>

        <div className="rounded-3xl bg-white/10 backdrop-blur-xl p-8 space-y-5">

          <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4">

            <FaLock className="text-white" />

            <input
              type="password"
              placeholder="Current Password"
              value={oldPassword}
              onChange={(e) =>
                setOldPassword(e.target.value)
              }
              className="flex-1 bg-transparent outline-none text-white"
            />

          </div>

          <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4">

            <FaLock className="text-white" />

            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
              className="flex-1 bg-transparent outline-none text-white"
            />

          </div>

          <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4">

            <FaLock className="text-white" />

            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              className="flex-1 bg-transparent outline-none text-white"
            />

          </div>

          <button
            onClick={handleChangePassword}
            className="w-full flex items-center justify-center gap-3 rounded-2xl bg-indigo-600 py-4 text-white hover:bg-indigo-500 transition"
          >

            <FaSave />

            Update Password

          </button>

        </div>

      </div>

    </main>
  );
}