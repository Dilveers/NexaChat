"use client";


import { notify } from "@/lib/toast";
import { isValidGroupName, sanitizeText } from "@/lib/validation";
import { FaUsers, FaCamera } from "react-icons/fa";
import {
  useState,
  useEffect
} from "react";
import {
  addDoc,
  collection,
   query,
  where,
    getDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";


export default function CreateGroup() {
  
  const [groupName, setGroupName] =
    useState("");

  const [groupImage, setGroupImage] =
    useState("");
const [friends, setFriends] =
  useState<any[]>([]);
  const [selectedMembers, setSelectedMembers] =
    useState<string[]>([]);

function handleImageChange(
  e: React.ChangeEvent<HTMLInputElement>
) {
  const file = e.target.files?.[0];

  if (!file) return;

  // Max 500 KB
  if (file.size > 500000) {
    notify.error("Please select image under 500 KB");
    return;
  }

  const reader = new FileReader();

  reader.onloadend = () => {
    setGroupImage(reader.result as string);
  };

  reader.readAsDataURL(file);
}

  function toggleMember(id: string) {
    if (selectedMembers.includes(id)) {
      setSelectedMembers((prev) =>
        prev.filter((member) => member !== id)
      );
    } else {
      setSelectedMembers((prev) => [
        ...prev,
        id,
      ]);
    }
  }

async function createGroup() {

  const currentUser =
    auth.currentUser;

  if (!currentUser) {
    notify.error("Please sign in again");
    return;
  }

  const cleanGroupName = sanitizeText(groupName, 60);

  if (
    !isValidGroupName(cleanGroupName) ||
    selectedMembers.length === 0
  ) {
    notify.error(
      "Please enter group name and select members"
    );
    return;
  }

  try {

    await addDoc(
      collection(db, "groups"),
      {
        name: cleanGroupName,
        image: groupImage,
        members: [
          currentUser.uid,
          ...selectedMembers,
        ],
        adminId:
          currentUser.uid,
        isGroup: true,
        createdAt:
          serverTimestamp(),
      }
    );

    notify.success(
      "Group created successfully!"
    );

  } catch (error) {

    console.log(error);

    notify.error(
      "Failed to create group"
    );
  }
}
useEffect(() => {

  const currentUser =
    auth.currentUser;

  if (!currentUser) return;

  const q = query(
    collection(db, "friends"),
    where(
      "users",
      "array-contains",
      currentUser.uid
    )
  );

const unsubscribe =
  onSnapshot(q, async (snapshot) => {

    const data = await Promise.all(
      snapshot.docs.map(async (friendDoc) => {

        const friendId =
          friendDoc
            .data()
            .users.find(
              (id: string) =>
                id !== currentUser.uid
            );

        const userSnap =
          await getDoc(
            doc(
              db,
              "users",
              friendId
            )
          );

        return {
          id: friendId,

          name: userSnap.exists()
            ? userSnap.data().name
            : "Unknown User",
        };
      })
    );

    setFriends(data);

  });

  return () => unsubscribe();

}, []);
  return (
    <div className="rounded-3xl bg-white/10 p-6 backdrop-blur-xl">

      <h2 className="mb-6 text-2xl font-bold text-white">
        Create Group
      </h2>

      {/* Group Photo */}
      <div className="mb-6 flex justify-center">

        <div className="relative">

          <img
            src={
              groupImage ||
              "https://ui-avatars.com/api/?name=Group"
            }
            alt="group"
            className="h-28 w-28 rounded-full object-cover"
          />

          <label className="absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-indigo-600">

            <FaCamera className="text-white" />

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

          </label>

        </div>

      </div>

      {/* Group Name */}
      <input
        type="text"
        placeholder="Group Name"
        value={groupName}
        onChange={(e) =>
          setGroupName(e.target.value)
        }
        className="mb-6 w-full rounded-2xl bg-white/10 p-4 text-white outline-none placeholder:text-white/50"
      />

      {/* Members */}
      <div>

        <h3 className="mb-4 flex items-center gap-2 text-lg text-white">
          <FaUsers />
          Select Members
        </h3>

        <div className="space-y-3">

          {friends.map((friend) => (
            <button
              key={friend.id}
              onClick={() =>
                toggleMember(friend.id)
              }
              className={`flex w-full items-center justify-between rounded-2xl p-4 transition ${
                selectedMembers.includes(
                  friend.id
                )
                  ? "bg-indigo-600"
                  : "bg-white/10"
              }`}
            >
              <span className="text-white">
                {friend.name}
              </span>

              {selectedMembers.includes(
                friend.id
              ) && (
                <span className="text-white">
                  ✓
                </span>
              )}

            </button>
          ))}

        </div>

      </div>

      {/* Create Button */}
      <button
        onClick={createGroup}
        className="mt-8 w-full rounded-2xl bg-indigo-600 py-4 font-semibold text-white hover:bg-indigo-500"
      >
        Create Group
      </button>

    </div>
  );
}
