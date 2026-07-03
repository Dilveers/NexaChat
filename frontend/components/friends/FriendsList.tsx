"use client";


import { confirmToast, notify } from "@/lib/toast";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  FaArrowLeft,
  FaSearch,
  FaComments,
  FaTrash,
} from "react-icons/fa";

import {
  collection,
  query,
  where,
  onSnapshot,
  getDoc,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

export default function FriendsListPage() {
  const [search, setSearch] =
    useState("");

  const [friends, setFriends] =
    useState<any[]>([]);

useEffect(() => {

  const unsubscribeAuth =
    auth.onAuthStateChanged(
      (user) => {

        if (!user) return;

        const q = query(
          collection(db, "friends"),
          where(
            "users",
            "array-contains",
            user.uid
          )
        );

        const unsubscribeFriends =
          onSnapshot(
            q,
            async (snapshot) => {

              const data =
                await Promise.all(
                  snapshot.docs.map(
                    async (
                      friendship
                    ) => {

                      const users =
                        friendship.data()
                          .users;

                      const friendId =
                        users.find(
                          (
                            id: string
                          ) =>
                            id !==
                            user.uid
                        );

                      const userDoc =
                        await getDoc(
                          doc(
                            db,
                            "users",
                            friendId
                          )
                        );

                      const chatsSnapshot =
                        await getDocs(
                          query(
                            collection(
                              db,
                              "chats"
                            ),
                            where(
                              "participants",
                              "array-contains",
                              user.uid
                            )
                          )
                        );

                      let chatId = "";

                      chatsSnapshot.forEach(
                        (
                          chatDoc
                        ) => {

                          const chatData: any =
                            chatDoc.data();

                          if (
                            chatData.participants.includes(
                              friendId
                            )
                          ) {

                            chatId =
                              chatDoc.id;
                          }
                        }
                      );

                  const presenceDoc =
  await getDoc(
    doc(
      db,
      "presence",
      friendId
    )
  );

return {
  friendshipId:
    friendship.id,

  chatId,

  ...userDoc.data(),

  online:
    presenceDoc.exists()
      ? presenceDoc.data().online
      : false,

  lastSeen:
    presenceDoc.exists()
      ? presenceDoc.data().lastSeen
      : null,
};
                    }
                  )
                );

              setFriends(data);
            }
          );

        return () =>
          unsubscribeFriends();
      }
    );

  return () =>
    unsubscribeAuth();

}, []);

async function removeFriend(
  friendshipId: string,
  friendUid: string,
  chatId: string
) {

  const confirmDelete = await confirmToast({
    title: "Remove this friend?",
    description: "This removes the friendship and related chat entry.",
    confirmText: "Remove",
    danger: true,
  });

  if (!confirmDelete) return;

  try {

    // Delete friendship
    await deleteDoc(
      doc(
        db,
        "friends",
        friendshipId
      )
    );

    // Delete chat document
    if (chatId) {
      await deleteDoc(
        doc(
          db,
          "chats",
          chatId
        )
      );
    }

    // Delete friend requests
    const requestSnapshot =
      await getDocs(
        collection(
          db,
          "friendRequests"
        )
      );

    for (const requestDoc of requestSnapshot.docs) {

      const data: any =
        requestDoc.data();

      if (
        (
          data.fromUserId ===
            auth.currentUser?.uid &&
          data.toUserId ===
            friendUid
        ) ||
        (
          data.fromUserId ===
            friendUid &&
          data.toUserId ===
            auth.currentUser?.uid
        )
      ) {

        await deleteDoc(
          doc(
            db,
            "friendRequests",
            requestDoc.id
          )
        );
      }
    }

    notify.success("Friend removed");

  } catch (error) {

    console.log(error);

    notify.error(
      "Failed to remove friend"
    );
  }
}

  const filteredFriends =
    friends.filter((friend) =>
      friend.name
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-900 to-indigo-950 p-5">

      <div className="max-w-md mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">

          <Link href="/chats">
            <FaArrowLeft className="text-white text-2xl" />
          </Link>

          <h1 className="text-3xl font-bold text-white">
            Friends
          </h1>

        </div>

        {/* Search */}
        <div className="flex items-center gap-3 rounded-3xl bg-white/10 p-4 mb-6">

          <FaSearch className="text-white/60" />

          <input
            type="text"
            placeholder="Search friends..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="flex-1 bg-transparent outline-none text-white placeholder:text-white/60"
          />

        </div>

        {/* Friends */}
        <div className="space-y-4">

          {filteredFriends.map(
            (friend: any) => (
              <div
                key={friend.uid}
                className="flex items-center justify-between rounded-3xl bg-white/10 p-4"
              >

                <div className="flex items-center gap-4">

                  <div className="relative">

                    <img
                      src={
                        friend.image ||
                        `https://ui-avatars.com/api/?name=${friend.name}`
                      }
                      className="w-14 h-14 rounded-full"
                    />

                    {friend.online && (
                      <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-green-400 border-2 border-indigo-900"></span>
                    )}

                  </div>

                  <div>

                    <h3 className="text-white font-semibold">
                      {friend.name}
                    </h3>

             <p className="text-white/60 text-sm">
  {friend.online
    ? " Online"
    : friend.lastSeen
    ? `Last seen ${new Date(
        friend.lastSeen.seconds *
          1000
      ).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`
    : " Offline"}
</p>

                  </div>

                </div>

                <div className="flex gap-2">

                  <Link
  href={`/chats/${friend.chatId}`}
>
                    <button className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
                      <FaComments className="text-white" />
                    </button>
                  </Link>

                  <button
                 onClick={() =>
  removeFriend(
    friend.friendshipId,
    friend.uid,
    friend.chatId
  )
}
                    className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center"
                  >
                    <FaTrash className="text-white" />
                  </button>

                </div>

              </div>
            )
          )}

        </div>

      </div>

    </main>
  );
}
