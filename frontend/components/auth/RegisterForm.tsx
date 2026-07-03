"use client";


import { notify } from "@/lib/toast";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

export default function RegisterForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  async function handleRegister(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (password !== confirmPassword) {
      notify.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const result =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      // Update Firebase Auth Profile
      await updateProfile(result.user, {
        displayName: name,
      });

      // Save User to Firestore
      await setDoc(
        doc(db, "users", result.user.uid),
        {
          uid: result.user.uid,
          name,
          username,
          email,
          image: "",
          online: true,
          createdAt: serverTimestamp(),
        }
      );

      notify.success(
        "Registration successful! Please login."
      );

      router.push("/auth/login");
    } catch (error: any) {
      console.error(error);

      notify.error(
        error.message ||
          "Registration failed"
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
          Create Account
        </h1>

        <p className="mt-3 text-white/70">
          Join NexaChat today 🚀
        </p>
      </div>

      {/* Form */}

      <form
        onSubmit={handleRegister}
        className="space-y-5"
      >
        {/* Full Name */}

        <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4">
          <FaUser className="text-white text-xl" />

          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            className="flex-1 bg-transparent outline-none text-white placeholder:text-white/60"
            required
          />
        </div>

        {/* Username */}

        <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4">
          <FaUser className="text-white text-xl" />

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            className="flex-1 bg-transparent outline-none text-white placeholder:text-white/60"
            required
          />
        </div>

        {/* Email */}

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
              setPassword(e.target.value)
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

        {/* Confirm Password */}

        <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4">
          <FaLock className="text-white text-xl" />

          <input
            type={
              showConfirmPassword
                ? "text"
                : "password"
            }
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(
                e.target.value
              )
            }
            className="flex-1 bg-transparent outline-none text-white placeholder:text-white/60"
            required
          />

          {showConfirmPassword ? (
            <FaEyeSlash
              className="text-white cursor-pointer"
              onClick={() =>
                setShowConfirmPassword(
                  false
                )
              }
            />
          ) : (
            <FaEye
              className="text-white cursor-pointer"
              onClick={() =>
                setShowConfirmPassword(
                  true
                )
              }
            />
          )}
        </div>

        {/* Button */}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-white py-4 font-semibold text-indigo-900 transition hover:scale-[1.02] disabled:opacity-50"
        >
          {loading
            ? "Creating Account..."
            : "Create Account"}
        </button>
      </form>

      {/* Footer */}

      <div className="mt-6 text-center text-white">
        Already have an account?{" "}

        <Link
          href="/auth/login"
          className="text-sky-300 hover:text-sky-200"
        >
          Login
        </Link>
      </div>
    </div>
  );
}