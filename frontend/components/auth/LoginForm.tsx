"use client";


import { notify } from "@/lib/toast";
import { useState } from "react";

import {
  signInWithEmailAndPassword,
} from "firebase/auth";

import {
  doc,
  updateDoc,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword,
    setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  async function handleLogin(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);

    try {
      const result =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

      // Update user online status
      await updateDoc(
        doc(
          db,
          "users",
          result.user.uid
        ),
        {
          online: true,
        }
      );

      notify.success(
        "Login successful!"
      );

      router.push("/chats");

    } catch (error: any) {

      console.error(error);

      notify.error(
        error.message ||
        "Login failed"
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
          NexaChat
        </h1>

        <p className="mt-3 text-white/70">
          Welcome Back 👋
        </p>

      </div>

      {/* Form */}
      <form
        onSubmit={handleLogin}
        className="space-y-5"
      >

        {/* Email */}
        <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4">

          <FaEnvelope className="text-white text-xl" />

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
            className="flex-1 bg-transparent outline-none text-white placeholder:text-white/60"
            required
          />

        </div>

        {/* Password */}
        <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4">

          <FaLock className="text-white text-xl" />

          <input
            type={
              showPassword
                ? "text"
                : "password"
            }
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            className="flex-1 bg-transparent outline-none text-white placeholder:text-white/60"
            required
          />

          {showPassword ? (
            <FaEyeSlash
              className="text-white cursor-pointer"
              onClick={() =>
                setShowPassword(false)
              }
            />
          ) : (
            <FaEye
              className="text-white cursor-pointer"
              onClick={() =>
                setShowPassword(true)
              }
            />
          )}

        </div>

        {/* Forgot Password */}
        <div className="text-right">

          <Link
            href="/auth/forgot-password"
            className="text-sm text-sky-300 hover:text-sky-200"
          >
            Forgot Password?
          </Link>

        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-white py-4 font-semibold text-indigo-900 transition hover:scale-[1.02] disabled:opacity-50"
        >
          {loading
            ? "Logging in..."
            : "Login"}
        </button>

      </form>

      {/* Footer */}
      <div className="mt-6 text-center text-white">

        Don't have an account?{" "}

        <Link
          href="/auth/register"
          className="text-sky-300 hover:text-sky-200"
        >
          Register
        </Link>

      </div>

    </div>
  );
}