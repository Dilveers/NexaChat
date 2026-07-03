"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "@/lib/firebase";
export default function BlockedUsers() {
  const [users, setUsers] = useState<any[]>([]);

useEffect(() => {

  const currentUser =
    auth.currentUser;

  if (!currentUser) return;

  const q = query(
    collection(db, "blockedUsers"),
    where(
      "blockedBy",
      "==",
      currentUser.uid
    )
  );

  const unsubscribe =
    onSnapshot(q, (snapshot) => {

      const data =
        snapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        );

      setUsers(data);
    });

  return () => unsubscribe();

}, []);
async function unblockUser(
  id: string
) {

  try {

    await deleteDoc(
      doc(
        db,
        "blockedUsers",
        id
      )
    );

  } catch (error) {

    console.log(error);
  }
}

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-900 to-indigo-950 p-5">

      <div className="max-w-md mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">

          <Link href="/settings">
            <FaArrowLeft className="text-white text-2xl" />
          </Link>

          <h1 className="text-3xl font-bold text-white">
            Blocked Users
          </h1>

        </div>

        {/* Users */}
        <div className="space-y-4">

          {users.length === 0 ? (
            <div className="rounded-3xl bg-white/10 p-8 text-center text-white/70">
              No blocked users
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between rounded-3xl bg-white/10 p-4"
              >

                <div className="flex items-center gap-4">

                  <img
                    src={`https://ui-avatars.com/api/?name=${user.name}`}
                    alt={user.name}
                    className="w-14 h-14 rounded-full"
                  />

                  <div>
                    <h2 className="text-white font-semibold">
                      {user.name}
                    </h2>

                    <p className="text-white/60 text-sm">
                      Blocked
                    </p>
                  </div>

                </div>

                <button
                  onClick={() =>
                    unblockUser(user.id)
                  }
                  className="rounded-2xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500 transition"
                >
                  Unblock
                </button>

              </div>
            ))
          )}

        </div>

      </div>

    </main>
  );
}