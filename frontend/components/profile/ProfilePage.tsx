"use client";




import { notify } from "@/lib/toast";
import Link from "next/link";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";

import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import {
  signOut
} from "firebase/auth";
import {
  FaArrowLeft,
  FaUserEdit,
  FaEnvelope,
  FaSignOutAlt,
  FaCog,
  FaAt,
  FaCamera,
} from "react-icons/fa";

export default function ProfilePage() {
  const [profileImage, setProfileImage] =
    useState("");

  const [name, setName] =
    useState("Nexa User");

  const [username, setUsername] =
    useState("nexauser");

  const [email, setEmail] =
    useState("user@example.com");

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
            data.name ||
              "Nexa User"
          );

          setUsername(
            data.username ||
              "nexauser"
          );

          setEmail(
            data.email ||
              currentUser.email ||
              ""
          );

          setProfileImage(
            data.image || ""
          );
        }
      }
    );

  return () =>
    unsubscribe();

}, []);

 async function handleImageChange(
  e: React.ChangeEvent<HTMLInputElement>
) {

  const file =
    e.target.files?.[0];

  if (!file) return;

  const reader =
    new FileReader();

  reader.onloadend =
    async () => {

      const image =
        reader.result as string;

      setProfileImage(
        image
      );

      const currentUser =
        auth.currentUser;

      if (!currentUser)
        return;

      try {

        await updateDoc(
          doc(
            db,
            "users",
            currentUser.uid
          ),
          {
            image: image,
          }
        );

      } catch (error) {

        console.log(error);

        notify.error(
          "Failed to save image"
        );
      }
    };

  reader.readAsDataURL(
    file
  );
}

async function handleLogout() {
  try {

    await signOut(auth);

    window.location.href =
      "/auth/login";

  } catch (error) {

    console.error(error);

    notify.error("Logout failed");
  }
}

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-900 to-indigo-950 p-5">

      <div className="max-w-md mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">

          <Link href="/chats">
            <FaArrowLeft className="text-white text-2xl cursor-pointer" />
          </Link>

          <h1 className="text-3xl font-bold text-white">
            Profile
          </h1>

        </div>

        {/* Card */}
        <div className="rounded-3xl bg-white/10 backdrop-blur-xl p-8 shadow-2xl">

          {/* Avatar */}
          <div className="flex flex-col items-center">

            <div className="relative">

              <img
                src={
                  profileImage ||
                  `https://ui-avatars.com/api/?name=${name}&size=200`
                }
                alt="profile"
                className="w-36 h-36 rounded-full object-cover"
              />

              <label className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center cursor-pointer border-4 border-indigo-900 transition">

                <FaCamera className="text-white text-lg" />

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />

              </label>

            </div>

            <h2 className="mt-5 text-2xl font-bold text-white">
              {name}
            </h2>

            <p className="text-white/60 text-lg">
              @{username}
            </p>

          </div>

          {/* Details */}
          <div className="mt-8 flex flex-col gap-4">

            {/* Email */}
            <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4">

              <FaEnvelope className="text-white text-xl" />

              <div>
                <p className="text-white/60 text-sm">
                  Email
                </p>

                <p className="text-white">
                  {email}
                </p>
              </div>

            </div>

            {/* Username */}
            <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4">

              <FaAt className="text-white text-xl" />

              <div>
                <p className="text-white/60 text-sm">
                  Username
                </p>

                <p className="text-white">
                  @{username}
                </p>
              </div>

            </div>

            {/* Edit Profile */}
            <Link
              href="/profile/edit"
              className="w-full flex items-center justify-center gap-3 font-semibold rounded-2xl bg-indigo-600 py-4 text-white hover:bg-indigo-500 transition"
            >
              <FaUserEdit />
              Edit Profile
            </Link>

            {/* Settings */}
            <Link
              href="/settings"
              className="w-full flex items-center justify-center gap-3 font-semibold rounded-2xl bg-white/10 py-4 text-white hover:bg-white/20 transition"
            >
              <FaCog />
              Settings
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 font-semibold rounded-2xl bg-red-600 py-4 text-white hover:bg-red-500 transition"
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