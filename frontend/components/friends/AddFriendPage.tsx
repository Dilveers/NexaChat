"use client";


import { notify } from "@/lib/toast";
import Link from "next/link";
import { useState, useEffect } from "react";

import {
  FaArrowLeft,
  FaSearch,
  FaUserPlus,
} from "react-icons/fa";

import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

export default function AddFriendPage() {
  const [search, setSearch] =
    useState("");
const [friendIds, setFriendIds] =
  useState<string[]>([]);
  const [users, setUsers] =
    useState<any[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);
useEffect(() => {
  const unsubscribe =
    auth.onAuthStateChanged(async (user) => {

      if (!user) return;

      const snapshot = await getDocs(
        collection(db, "friends")
      );

      const ids = snapshot.docs
        .map((doc) => doc.data())
        .filter((friend: any) =>
          friend.users.includes(user.uid)
        )
        .map((friend: any) => {

          const otherUser =
            friend.users.find(
              (uid: string) =>
                uid !== user.uid
            );

          return otherUser;
        });

      setFriendIds(ids);
    });

  return () => unsubscribe();
}, []);

  async function loadUsers() {
    try {
      const snapshot =
        await getDocs(
          collection(db, "users")
        );

      const allUsers =
        snapshot.docs.map((doc) => ({
          ...doc.data(),
        }));

      // Hide current user
      const filtered =
        allUsers.filter(
          (user: any) =>
            user.uid !==
            auth.currentUser?.uid
        );

      setUsers(filtered);
    } catch (error) {
      console.log(error);
    }
  }

const filteredUsers =
  users.filter((user: any) => {

    const matchesSearch =
      user.name
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        ) ||
      user.username
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        );

    const isCurrentUser =
      user.uid ===
      auth.currentUser?.uid;

    const alreadyFriend =
      friendIds.includes(user.uid);

    return (
      matchesSearch &&
      !isCurrentUser &&
      !alreadyFriend
    );
  });

  async function sendFriendRequest(
    user: any
  ) {
    try {
      const currentUser =
        auth.currentUser;

      if (!currentUser) return;

      // Check existing request
      const q = query(
        collection(
          db,
          "friendRequests"
        ),
        where(
          "fromUserId",
          "==",
          currentUser.uid
        ),
        where(
          "toUserId",
          "==",
          user.uid
        )
      );

      const existing =
        await getDocs(q);

      if (!existing.empty) {
        notify.info(
          "Friend request already sent"
        );
        return;
      }

      await addDoc(
        collection(
          db,
          "friendRequests"
        ),
        {
          fromUserId:
            currentUser.uid,

          fromUserName:
            currentUser.displayName,

          toUserId: user.uid,

          toUserName: user.name,

          status: "pending",

          createdAt:
            serverTimestamp(),
        }
      );

      notify.success(
        `Friend request sent to ${user.name} 🎉`
      );
    } catch (error) {
      console.log(error);
      notify.error(
        "Failed to send request"
      );
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
            Add Friend
          </h1>

        </div>

        {/* Search */}
        <div className="flex items-center gap-3 rounded-3xl bg-white/10 p-4 mb-6">

          <FaSearch className="text-white/60" />

          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="flex-1 bg-transparent outline-none text-white placeholder:text-white/60"
          />

        </div>

        {/* Users */}
        <div className="space-y-4">

          {filteredUsers.map(
            (user: any) => (
              <div
                key={user.uid}
                className="flex items-center justify-between rounded-3xl bg-white/10 p-4"
              >

                <div className="flex items-center gap-4">

                  <img
                    src={
                      user.image ||
                      `https://ui-avatars.com/api/?name=${user.name}`
                    }
                    alt={user.name}
                    className="w-14 h-14 rounded-full"
                  />

                  <div>

                    <h3 className="text-white font-semibold">
                      {user.name}
                    </h3>

                    <p className="text-white/60 text-sm">
                      @{user.username}
                    </p>

                  </div>

                </div>

                <button
                  onClick={() =>
                    sendFriendRequest(
                      user
                    )
                  }
                  className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center hover:bg-indigo-500 transition"
                >

                  <FaUserPlus className="text-white" />

                </button>

              </div>
            )
          )}

        </div>

      </div>

    </main>
  );
}