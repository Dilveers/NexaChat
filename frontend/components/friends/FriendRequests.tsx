"use client";


import { notify } from "@/lib/toast";
import { useEffect, useState } from "react";

import Link from "next/link";

import {
  FaArrowLeft,
  FaCheck,
  FaTimes,
} from "react-icons/fa";

import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

export default function FriendRequests() {
  const [requests, setRequests] =
    useState<any[]>([]);
useEffect(() => {
  const unsubscribeAuth =
    auth.onAuthStateChanged((user) => {

      if (!user) return;

      const q = query(
        collection(db, "friendRequests"),
        where(
          "toUserId",
          "==",
          user.uid
        ),
        where(
          "status",
          "==",
          "pending"
        )
      );

      const unsubscribeRequests =
        onSnapshot(q, (snapshot) => {

          const data = snapshot.docs.map(
            (doc) => ({
              id: doc.id,
              ...doc.data(),
            })
          );

          setRequests(data);
        });

      return () =>
        unsubscribeRequests();
    });

  return () => unsubscribeAuth();
}, []);

  async function acceptRequest(
    request: any
  ) {
    try {
      // Create friendship
    await addDoc(
  collection(db, "friends"),
  {
    users: [
      request.fromUserId,
      request.toUserId,
    ],

    members: [
      {
        uid: request.fromUserId,
        name: request.fromUserName,
      },
      {
        uid: request.toUserId,
        name: request.toUserName,
      },
    ],

    createdAt: new Date(),
  }
);
await addDoc(
  collection(db, "chats"),
  {
    participants: [
      request.fromUserId,
      request.toUserId,
    ],

    lastMessage: "Start chatting 👋",

    updatedAt: serverTimestamp(),
  }
);

      // Update request status
      await updateDoc(
        doc(
          db,
          "friendRequests",
          request.id
        ),
        {
          status: "accepted",
        }
      );

      notify.success("Friend added 🎉");
    } catch (error) {
      console.log(error);
    }
  }

  async function rejectRequest(
    requestId: string
  ) {
    try {
      await deleteDoc(
        doc(
          db,
          "friendRequests",
          requestId
        )
      );
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-900 to-indigo-950 p-5">

      <div className="max-w-md mx-auto">

        <div className="flex items-center gap-4 mb-8">

          <Link href="/chats">
            <FaArrowLeft className="text-white text-2xl" />
          </Link>

          <h1 className="text-3xl font-bold text-white">
            Friend Requests
          </h1>

        </div>

        {requests.length === 0 ? (
          <div className="rounded-3xl bg-white/10 p-8 text-center text-white">
            No Friend Requests
          </div>
        ) : (
          <div className="space-y-4">

            {requests.map(
              (request: any) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between rounded-3xl bg-white/10 p-4"
                >

                  <div>

                    <h3 className="text-white font-semibold">
                      {
                        request.fromUserName
                      }
                    </h3>

                    <p className="text-white/60">
                      wants to be your friend
                    </p>

                  </div>

                  <div className="flex gap-2">

                    <button
                      onClick={() =>
                        acceptRequest(
                          request
                        )
                      }
                      className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center"
                    >
                      <FaCheck />
                    </button>

                    <button
                      onClick={() =>
                        rejectRequest(
                          request.id
                        )
                      }
                      className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center"
                    >
                      <FaTimes />
                    </button>

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </div>

    </main>
  );
}