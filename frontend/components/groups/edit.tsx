"use client";


import { confirmToast, notify } from "@/lib/toast";
import { isValidGroupName, sanitizeText } from "@/lib/validation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaCamera } from "react-icons/fa";
import {
  doc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  collection,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
interface EditGroupProps {
  groupId: string;
}

export default function EditGroup({
  groupId,
}: EditGroupProps) {
  const router = useRouter();

  const [groupName, setGroupName] =
    useState("");

  const [groupImage, setGroupImage] =
    useState("");
const [members, setMembers] =
  useState<any[]>([]);

const [group, setGroup] =
  useState<any>(null);
  
  const [selectedMembers, setSelectedMembers] =
    useState<string[]>([]);

useEffect(() => {

  if (!group?.members)
    return;

  const unsubscribe =
    onSnapshot(
      collection(db, "users"),
      (snapshot) => {

        const users =
          snapshot.docs.map(
            (doc) => ({
              uid: doc.data().uid,
              name:
                doc.data().name,
            })
          );

        setMembers(users);
      }
    );

  return () => unsubscribe();

}, [group]);
useEffect(() => {

  const unsubscribe =
    onSnapshot(
      doc(
        db,
        "groups",
        groupId
      ),
      (docSnap) => {

        if (
          docSnap.exists()
        ) {

          const data: any =
            docSnap.data();

          setGroup(data);

          setGroupName(
            data.name
          );

          setGroupImage(
            data.image || ""
          );

          setSelectedMembers(
            data.members || []
          );
        }
      }
    );

  return () => unsubscribe();

}, [groupId]);
  function handleImageChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > 500000) {
      notify.error(
        "Please select image under 500 KB"
      );
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setGroupImage(
        reader.result as string
      );
    };

    reader.readAsDataURL(file);
  }

  function toggleMember(id: string) {
    if (selectedMembers.includes(id)) {
      setSelectedMembers((prev) =>
        prev.filter((m) => m !== id)
      );
    } else {
      setSelectedMembers((prev) => [
        ...prev,
        id,
      ]);
    }
  }

async function saveGroup() {

  try {
    const cleanGroupName = sanitizeText(groupName, 60);

    if (!isValidGroupName(cleanGroupName)) {
      notify.error("Please enter a valid group name");
      return;
    }

    await updateDoc(
      doc(
        db,
        "groups",
        groupId
      ),
      {
        name: cleanGroupName,
        image: groupImage,
members: selectedMembers,
      }
    );

    notify.success(
      "Group updated successfully!"
    );

    router.push("/chats");

  } catch (error) {

    console.log(error);
    notify.error(error, "Failed to update group");
  }
}

async function deleteGroup() {

  const confirmDelete =
    await confirmToast({
      title: "Delete this group?",
      description: "This removes the group for all members.",
      confirmText: "Delete",
      danger: true,
    });

  if (!confirmDelete)
    return;

  try {

    await deleteDoc(
      doc(
        db,
        "groups",
        groupId
      )
    );

    notify.success(
      "Group deleted"
    );

    router.push("/chats");

  } catch (error) {

    console.log(error);
  }
}

  return (
    <div className="rounded-3xl bg-white/10 p-6 backdrop-blur-xl">

      <h2 className="mb-6 text-2xl font-bold text-white">
        Edit Group
      </h2>

      {/* Photo */}
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

      {/* Name */}
      <input
        type="text"
        value={groupName}
        onChange={(e) =>
          setGroupName(
            e.target.value
          )
        }
        placeholder="Group Name"
        className="mb-6 w-full rounded-2xl bg-white/10 p-4 text-white outline-none"
      />

      {/* Members */}
      <h3 className="mb-3 text-white font-semibold">
  Current Members
</h3>

<div className="space-y-3 mb-6">
  {[...new Set(selectedMembers)].map(
    (memberId: string) => {

      const member =
        members.find(
          (m) =>
            m.uid === memberId
        );

      return (
        <div
          key={memberId}
          className="flex items-center justify-between rounded-2xl bg-white/10 p-4 text-white"
        >
          <span>
            {member?.name ||
              memberId}
          </span>

          {/* Don't allow removing yourself */}
          {memberId !== group.adminId && (
            <button
              onClick={() =>
                setSelectedMembers(
                  (prev) =>
                    prev.filter(
                      (id) =>
                        id !== memberId
                    )
                )
              }
              className="rounded-full bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-400"
            >
              Remove
            </button>
          )}
        </div>
      );
    }
  )}
</div>

<h3 className="mb-3 text-white font-semibold">
  Add New Members
</h3>
      <div className="space-y-3">

        {members
  .filter(
    (friend) =>
      !group?.members?.includes(
        friend.uid
      )
  )
  .map((friend) => (
          <button
             key={friend.uid}
  onClick={() =>
    toggleMember(friend.uid)
  }
  className={`flex w-full items-center justify-between rounded-2xl p-4 transition ${
    selectedMembers.includes(
      friend.uid
    )
      ? "bg-indigo-600"
      : "bg-white/10"
  }`}
>
            <span className="text-white">
              {friend.name}
            </span>

            {selectedMembers.includes(
  friend.uid
) && (
              <span className="text-white">
                ✓
              </span>
            )}

          </button>
        ))}

      </div>

      {/* Buttons */}
      <button
        onClick={saveGroup}
        className="mt-8 w-full rounded-2xl bg-green-600 py-4 font-semibold text-white hover:bg-green-500"
      >
        Save Changes
      </button>

      <button
        onClick={deleteGroup}
        className="mt-4 w-full rounded-2xl bg-red-600 py-4 font-semibold text-white hover:bg-red-500"
      >
        Delete Group
      </button>

    </div>
  );
}
