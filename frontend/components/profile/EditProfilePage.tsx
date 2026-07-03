"use client";


import { notify } from "@/lib/toast";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { auth, db } from "@/lib/firebase";

import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import {
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaAt,
  FaSave,
} from "react-icons/fa";

export default function EditProfilePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] =
    useState("");

  const [email, setEmail] =
    useState("");

useEffect(() => {

  const unsubscribe =
    auth.onAuthStateChanged(
      async (currentUser) => {

        if (!currentUser) return;

        const userDoc =
          await getDoc(
            doc(
              db,
              "users",
              currentUser.uid
            )
          );

        if (userDoc.exists()) {

          const data: any =
            userDoc.data();

          setName(
            data.name || ""
          );

          setUsername(
            data.username || ""
          );

          setEmail(
            data.email || ""
          );
        }
      }
    );

  return () =>
    unsubscribe();

}, []);
async function handleSave() {
  try {

    const currentUser =
      auth.currentUser;

    if (!currentUser) return;

    await updateDoc(
      doc(
        db,
        "users",
        currentUser.uid
      ),
      {
        name,
        username,
      }
    );

    notify.success(
      "Profile updated successfully 🎉"
    );

    router.push("/profile");

  } catch (error) {

    console.log(error);

    notify.error(
      "Failed to update profile"
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
            Edit Profile
          </h1>

        </div>

        {/* Card */}
        <div className="rounded-3xl bg-white/10 backdrop-blur-xl p-8 shadow-2xl space-y-5">

          {/* Avatar */}
          <div className="flex justify-center">

            <img
              src={`https://ui-avatars.com/api/?name=${name}&size=200`}
              alt="profile"
              className="w-32 h-32 rounded-full"
            />

          </div>

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
            />

          </div>

          {/* Username */}
          <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4">

            <FaAt className="text-white text-xl" />

            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              className="flex-1 bg-transparent outline-none text-white placeholder:text-white/60"
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
            />

          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-3 rounded-2xl bg-indigo-600 py-4 text-white font-semibold hover:bg-indigo-500 transition"
          >

            <FaSave />

            Save Changes

          </button>

        </div>

      </div>

    </main>
  );
}