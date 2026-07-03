"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FaArrowLeft,
  FaBoxOpen,
} from "react-icons/fa";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

export default function ArchivedChats() {
  const [archivedChats, setArchivedChats] =
    useState<any[]>([]);

useEffect(() => {

  const currentUser =
    auth.currentUser;

  if (!currentUser) return;

  const q = query(
    collection(db, "archivedChats"),
    where(
      "userId",
      "==",
      currentUser.uid
    )
  );

  const unsubscribe =
    onSnapshot(q, (snapshot) => {

      const chats =
        snapshot.docs.map((doc) => ({
          id: doc.data().chatId,
          firestoreId: doc.id,
          name:
            doc.data().chatName,
        }));

      setArchivedChats(chats);
    });

  return () => unsubscribe();

}, []);
async function unarchiveChat(
  chat: any
) {

  try {

    await deleteDoc(
      doc(
        db,
        "archivedChats",
        chat.firestoreId
      )
    );

  } catch (error) {

    console.log(error);
  }
}
  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-900 to-indigo-950 p-5">

      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">

          <Link href="/chats">
            <FaArrowLeft className="text-white text-2xl cursor-pointer" />
          </Link>

          <h1 className="text-3xl font-bold text-white">
            Archived Chats
          </h1>

        </div>

        {/* Empty State */}
        {archivedChats.length === 0 ? (
          <div className="rounded-3xl bg-white/10 p-10 text-center">

            <FaBoxOpen className="mx-auto text-6xl text-white/50 mb-4" />

            <h2 className="text-white text-2xl font-bold">
              No Archived Chats
            </h2>

            <p className="text-white/60 mt-3">
              Archived chats will appear here.
            </p>

          </div>
        ) : (
          <div className="space-y-4">

            {archivedChats.map((chat) => (
              <div
                key={chat.id}
                className="rounded-3xl bg-white/10 p-4 flex items-center justify-between"
              >

                <div className="flex items-center gap-4">

                  <img
                    src={`https://ui-avatars.com/api/?name=${chat.name}`}
                    alt={chat.name}
                    className="w-14 h-14 rounded-full"
                  />

                  <div>

                    <h2 className="text-white font-semibold">
                      {chat.name}
                    </h2>

                    <p className="text-white/60 text-sm">
                      {chat.lastMessage}
                    </p>

                  </div>

                </div>

                <button
                  onClick={() =>
                    unarchiveChat(chat)
                  }
                  className="rounded-2xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500 transition"
                >
                  Unarchive
                </button>

              </div>
            ))}

          </div>
        )}

      </div>

    </main>
  );
}