"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaArrowLeft, FaEdit, FaUsers } from "react-icons/fa";
import {
  doc,
  onSnapshot,
  collection,
} from "firebase/firestore";
import { auth } from "@/lib/firebase";
import { db } from "@/lib/firebase";

interface GroupInfoProps {
  groupId: string;
}

export default function GroupInfo({
  groupId,
}: GroupInfoProps) {
  const [friends, setFriends] =
  useState<any[]>([]);
  const [group, setGroup] =
    useState<any>(null);

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

          setGroup({
            id: docSnap.id,
            ...docSnap.data(),
          });
        }
      }
    );

  return () => unsubscribe();

}, [groupId]);
useEffect(() => {

  const unsubscribe =
    onSnapshot(
      collection(db, "users"),
      (snapshot) => {

        const users =
          snapshot.docs.map(
            (doc) => ({
              id: doc.id,
              ...doc.data(),
            })
          );

        setFriends(users);
      }
    );

  return () => unsubscribe();

}, []);
  if (!group) {
    return (
      <div className="rounded-3xl bg-white/10 p-6 text-center text-white">
        Group not found
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white/10 p-6 backdrop-blur-xl">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">

        <Link href="/chats">
          <FaArrowLeft className="text-white text-xl cursor-pointer" />
        </Link>

        <h1 className="text-3xl font-bold text-white">
          Group Info
        </h1>

      </div>

      {/* Group Photo */}
      <div className="flex flex-col items-center">

        <img
          src={
            group.image ||
            "https://ui-avatars.com/api/?name=Group"
          }
          alt={group.name}
          className="w-36 h-36 rounded-full object-cover"
        />

        <h2 className="mt-5 text-3xl font-bold text-white">
          {group.name}
        </h2>

        <p className="mt-2 text-white/60">
          {group.members?.length || 0} Members
        </p>

      </div>

      {/* Members */}
      <div className="mt-8">

        <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
          <FaUsers />
          Members
        </h3>

        <div className="space-y-3">

{group.members?.map(
  (memberId: string, index: number) => {

const member = friends.find(
  (friend) =>
    friend.uid === memberId
);
    const memberName =
      member?.name || memberId;

    return (
      <div
        key={index}
        className="flex items-center justify-between rounded-2xl bg-white/10 p-4 text-white"
      >
        <span>{memberName}</span>

        {memberId === group.adminId && (
          <span className="rounded-full bg-yellow-500 px-3 py-1 text-xs font-semibold text-black">
            👑 Admin
          </span>
        )}
      </div>
    );
  }
)}

        </div>

      </div>

      {/* Edit Button */}
      {group.adminId ===
  auth.currentUser?.uid && (
  <Link
    href={`/groups/edit/${group.id}`}
    className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-indigo-600 py-4 font-semibold text-white hover:bg-indigo-500"
  >
    <FaEdit />
    Edit Group
  </Link>
)}

    </div>
  );
}