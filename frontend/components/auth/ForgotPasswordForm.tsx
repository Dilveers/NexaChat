"use client";


import { notify } from "@/lib/toast";
import { useState } from "react";

import {
  sendPasswordResetEmail,
} from "firebase/auth";

import { auth } from "@/lib/firebase";

import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  FaEnvelope,
  FaArrowLeft,
} from "react-icons/fa";

export default function ForgotPasswordForm() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleForgotPassword(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);

    try {
      await sendPasswordResetEmail(
        auth,
        email
      );

      notify.success(
        "Password reset email sent successfully. Please check your inbox."
      );

      router.push("/auth/login");
    } catch (error: any) {
      console.error(error);

      notify.error(
        error.message ||
          "Failed to send reset email"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 p-6 sm:p-10 shadow-2xl">

      {/* Header */}
      <div className="text-center mb-8">

        <h1 className="text-4xl font-bold text-white">
          Forgot Password
        </h1>

        <p className="mt-3 text-white/70">
          Enter your email to receive a password reset link
        </p>

      </div>

      {/* Form */}
      <form
        onSubmit={handleForgotPassword}
        className="space-y-5"
      >

        <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4">

          <FaEnvelope className="text-white text-xl" />

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="flex-1 bg-transparent outline-none text-white placeholder:text-white/60"
            required
          />

        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-white py-4 font-semibold text-indigo-900 transition hover:scale-[1.02] disabled:opacity-50"
        >
          {loading
            ? "Sending..."
            : "Send Reset Email"}
        </button>

      </form>

      {/* Footer */}
      <div className="mt-6 text-center">

        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-sky-300 hover:text-sky-200"
        >
          <FaArrowLeft />
          Back to Login
        </Link>

      </div>

    </div>
  );
}